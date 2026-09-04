package gambling

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"sort"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/user"
	"github.com/google/uuid"
)

// ============================================================
// ROOM MANAGER
// ============================================================

func (rm *RoomManager) CreateRoom(roomID string) (*Room, error) {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	if _, exists := rm.Rooms[roomID]; exists {
		return nil, errors.New("room already exists")
	}

	room := NewRoom(roomID)

	room.Manager = rm

	rm.Rooms[roomID] = room

	return room, nil
}

func (rm *RoomManager) GetRoom(roomID string) *Room {
	rm.mu.RLock()
	defer rm.mu.RUnlock()

	return rm.Rooms[roomID]
}

// ============================================================
// DELETE ROOM
// ============================================================

func (rm *RoomManager) DeleteRoom(roomID string) {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	delete(rm.Rooms, roomID)
}

// ============================================================
// ROOM
// ============================================================

func NewRoom(id string) *Room {
	return &Room{
		ID:          id,
		Players:     make(map[uuid.UUID]*Player),
		CurrentTurn: 0,
		State:       GameStateWaiting,
		WinningNum:  -1,
		Hub:         NewHub(),
	}
}

func (r *Room) AddPlayer(player *Player) {
	r.mu.Lock()
	defer r.mu.Unlock()

	used := make(map[int]bool)

	for _, p := range r.Players {
		used[p.PlayerNumber] = true
	}

	for i := 0; i <= 4; i++ {
		if !used[i] {
			player.PlayerNumber = i
			break
		}
	}

	r.Players[player.ID] = player
}

func (r *Room) RemovePlayer(playerID uuid.UUID) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.Players, playerID)
}

func (r *Room) GetPlayer(playerID uuid.UUID) *Player {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return r.Players[playerID]
}

// ============================================================
// ROOM STATE
// ============================================================

func (r *Room) GetRoomState() RoomStateMessage {
	r.mu.RLock()
	defer r.mu.RUnlock()

	players := make([]PlayerInfo, 0, len(r.Players))
	ready := 0

	for _, player := range r.Players {
		if player.Ready {
			ready++
		}

		players = append(players, PlayerInfo{
			PlayerID: player.ID.String(),
			Username: player.Username,
			PlayerNumber: player.PlayerNumber,
			Balance:  player.Balance,
			Ready:    player.Ready,
		})
	}

	sort.Slice(players, func(i, j int) bool {
		return players[i].Username < players[j].Username
	})

	return RoomStateMessage{
		Type:     "room_state",
		Players:  players,
		Ready:    ready,
		Total:    len(players),
		AllReady: ready >= MinPlayers,
	}
}

func (r *Room) ReadyCount() int {
	r.mu.RLock()
	defer r.mu.RUnlock()

	count := 0

	for _, player := range r.Players {
		if player.Ready {
			count++
		}
	}

	return count
}

func (r *Room) CanStartGame() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if r.GameStarted {
		return false
	}

	ready := 0

	for _, player := range r.Players {
		if player.Ready {
			ready++
		}
	}

	return ready >= MinPlayers
}

func (r *Room) IsGameOver() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return r.CurrentTurn >= MaxTurns
}

// ============================================================
// READY
// ============================================================

func (r *Room) SetPlayerReady(
	playerID uuid.UUID,
	ready bool,
) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.GameStarted {
		return errors.New("game already started")
	}

	player, exists := r.Players[playerID]

	if !exists {
		return errors.New("player not found")
	}

	player.Ready = ready

	return nil
}

// ============================================================
// START GAME
// ============================================================

func (r *Room) StartGame() {
	r.mu.Lock()

	if r.GameStarted {
		r.mu.Unlock()
		return
	}

	r.GameStarted = true
	r.StartPending = false
	r.CurrentTurn = 1
	r.State = GameStateWaiting

	r.mu.Unlock()

	r.Hub.BroadcastJSON(GameStartedMessage{
		Type: "game_started",
		Turn: 1,
	})

	go r.RunGame()
}

// ============================================================
// TURN
// ============================================================

func (r *Room) StartTurn() {
	r.mu.Lock()

	r.ResetBetsUnsafe()

	r.State = GameStateBetting
	r.BettingStartedAt = time.Now()

	turn := r.CurrentTurn

	r.mu.Unlock()

	r.Hub.BroadcastJSON(TurnStartedMessage{
		Type: "turn_started",
		Turn: turn,
	})

	r.Hub.BroadcastJSON(BettingStartedMessage{
		Type:     "betting_started",
		Turn:     turn,
		Duration: int(BettingDuration.Seconds()),
	})
}

// ============================================================
// RESET BETS
// ============================================================

func (r *Room) ResetBetsUnsafe() {
	for _, player := range r.Players {
		player.CurrentBet = nil
		player.ScratchResult = nil
	}

	r.WinningNum = -1
}

// ============================================================
// BETTING PHASE
// ============================================================

func (r *Room) RunBettingPhase() {
	r.mu.Lock()

	if r.State != GameStateBetting {
		r.mu.Unlock()
		return
	}

	r.BettingStartedAt = time.Now()

	turn := r.CurrentTurn

	for _, player := range r.Players {
		// On ne met rien si le joueur n'a pas assez.
		if player.Balance < 100 {
			continue
		}

		player.Balance -= 100

		player.CurrentBet = &Chip{
			PlayerID:  player.ID.String(),
			ChipValue: 100,
			Target:    "0",
		}
	}

	r.mu.Unlock()

	r.mu.RLock()

	for _, player := range r.Players {
		if player.CurrentBet == nil {
			continue
		}

		r.Hub.BroadcastJSON(BetPlacedMessage{
			Type:         "bet_placed",
			PlayerID:     player.ID.String(),
			PlayerNumber: player.PlayerNumber,
			ChipValue:    player.CurrentBet.ChipValue,
			Target:       player.CurrentBet.Target,
			Balance:      player.Balance,
		})
	}

	r.mu.RUnlock()

	time.Sleep(BettingDuration)

	r.mu.Lock()

	if r.State != GameStateBetting {
		r.mu.Unlock()
		return
	}

	r.State = GameStateScratch

	r.mu.Unlock()

	r.Hub.BroadcastJSON(BettingEndedMessage{
		Type: "betting_ended",
		Turn: turn,
	})
}


// ============================================================
// DRAW WINNING NUMBER
// ============================================================
//
// Le serveur tire le numéro gagnant avant le scratch.
//
// IMPORTANT :
// Le numéro n'est PAS encore envoyé au frontend ici.
//
// Il sera envoyé uniquement lorsque le spinning commence.
//

func (r *Room) DrawWinningNumber() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.State != GameStateScratch {
		return errors.New("scratch phase is not active")
	}

	number, err := winningNumberGenerator()

	if err != nil {
		return err
	}

	r.WinningNum = number

	return nil
}

// ============================================================
// SCRATCH PHASE
// ============================================================

func (r *Room) RunScratchPhase() {
	time.Sleep(ScratchDuration)

	r.mu.Lock()

	if r.State != GameStateScratch {
		r.mu.Unlock()
		return
	}

	/*
	 * Le numéro a déjà été tiré avant le scratch.
	 */
	if r.WinningNum < 0 {
		r.mu.Unlock()
		return
	}

	r.State = GameStateSpinning

	turn := r.CurrentTurn
	winningNumber := r.WinningNum

	r.mu.Unlock()

	// ========================================================
	// POSITION FINALE DE LA BILLE
	// ========================================================
	//
	// Angle compris entre 0 et 359 degrés.
	//
	// Le frontend utilisera cet angle comme position finale
	// de la bille et placera le winningNumber au même endroit.
	//

	rotationDegree := rand.Intn(360)

	// ========================================================
	// SPINNING STARTED
	// ========================================================

	r.Hub.BroadcastJSON(SpinningStartedMessage{
		Type:           "spinning_started",
		Turn:           turn,
		WinningNumber:  winningNumber,
		RotationDegree: rotationDegree,
		Duration:       int(SpinningDuration.Seconds()),
	})
}

// ============================================================
// BET
// ============================================================

func (r *Room) PlaceBet(
	playerID uuid.UUID,
	chip *Chip,
) error {
	if chip == nil {
		return errors.New("invalid bet")
	}

	if chip.ChipValue <= 0 {
		return errors.New("invalid chip value")
	}

	if !isValidTarget(chip.Target) {
		return errors.New("invalid betting target")
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	if r.State != GameStateBetting {
		return errors.New("betting is not active")
	}

	if time.Since(r.BettingStartedAt) > BettingDuration {
		return errors.New("betting time expired")
	}

	player, exists := r.Players[playerID]

	if !exists {
		return errors.New("player not found")
	}

	// ========================================================
	// REMPLACEMENT DU PARI EXISTANT
	// ========================================================

	if player.CurrentBet != nil {
		// On rend l'ancien pari au joueur.
		player.Balance += player.CurrentBet.ChipValue

		// On supprime l'ancien pari.
		player.CurrentBet = nil
	}

	// ========================================================
	// VÉRIFICATION DU NOUVEAU PARI
	// ========================================================

	if chip.ChipValue > player.Balance {
		return errors.New("insufficient balance")
	}

	// ========================================================
	// NOUVEAU PARI
	// ========================================================

	player.Balance -= chip.ChipValue

	chip.PlayerID = playerID.String()

	player.CurrentBet = chip

	return nil
}

// ============================================================
// SCRATCH
// ============================================================

func (r *Room) ScratchPlayer(
	playerID uuid.UUID,
) (*Ticket, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.State != GameStateScratch {
		return nil, errors.New(
			"scratch phase is not active",
		)
	}

	player, exists := r.Players[playerID]

	if !exists {
		return nil, errors.New("player not found")
	}

	if player.CurrentBet == nil {
		return nil, errors.New(
			"you must place a bet first",
		)
	}

	if player.ScratchResult != nil {
		return nil, errors.New(
			"ticket already scratched",
		)
	}

	ticket := generateScratchTicket()

	if ticket == nil {
		return nil, errors.New(
			"unable to generate scratch ticket",
		)
	}

	player.ScratchResult = ticket

	return ticket, nil
}

// ============================================================
// RESOLVE
// ============================================================

func (r *Room) ResolveTurn() TurnResolvedMessage {
	r.mu.Lock()
	defer r.mu.Unlock()

	results := make(
		[]PlayerResult,
		0,
		len(r.Players),
	)

	for _, player := range r.Players {
		bet := player.CurrentBet

		// ====================================================
		// AUCUN PARI
		// ====================================================

		if bet == nil {
			results = append(
				results,
				PlayerResult{
					PlayerID: player.ID.String(),
					Username: player.Username,
					Result:   "tie",

					BalanceBefore: player.Balance,
					Gain:          0,
					BalanceAfter:  player.Balance,
				},
			)

			continue
		}

		// ====================================================
		// SOLDE APRÈS RETRAIT DE LA MISE
		// ====================================================

		balanceAfterBet := player.Balance

		// ====================================================
		// CALCUL DU GAIN
		// ====================================================

		win := calculateFinalWin(
			bet,
			player.ScratchResult,
			r.WinningNum,
		)

		// ====================================================
		// REVERSE LE GAIN
		// ====================================================

		player.Balance += win

		// ====================================================
		// SOLDE AVANT LE PARI
		// ====================================================

		balanceBeforeBet :=
			balanceAfterBet + bet.ChipValue

		// ====================================================
		// GAIN NET
		// ====================================================

		netGain :=
			player.Balance - balanceBeforeBet

		result := "lose"

		if netGain > 0 {
			result = "win"
		} else if netGain == 0 {
			result = "tie"
		}

		results = append(
			results,
			PlayerResult{
				PlayerID: player.ID.String(),
				Username: player.Username,

				Result: result,

				BalanceBefore: balanceBeforeBet,

				Gain: netGain,

				BalanceAfter: player.Balance,
			},
		)
	}

	// ========================================================
	// TRI DES RÉSULTATS
	// ========================================================

	sort.Slice(
		results,
		func(i, j int) bool {
			return results[i].Gain >
				results[j].Gain
		},
	)

	// ========================================================
	// STATE
	// ========================================================

	r.State = GameStateResolving

	return TurnResolvedMessage{
		Type:          "turn_resolved",
		Turn:          r.CurrentTurn,
		WinningNumber: r.WinningNum,
		Players:       results,
	}
}

// ============================================================
// RUN TURN
// ============================================================

func (r *Room) RunTurn() error {
	// ========================================================
	// BETTING
	// ========================================================

	r.StartTurn()

	r.RunBettingPhase()

	// ========================================================
	// DRAW WINNING NUMBER
	// ========================================================
	//
	// Le numéro est tiré AVANT le scratch.
	//
	// Il reste secret côté frontend.
	//

	if err := r.DrawWinningNumber(); err != nil {
		return err
	}

	// ========================================================
	// SCRATCH
	// ========================================================

	r.RunScratchPhase()

	// ========================================================
	// SPINNING
	// ========================================================
	//
	// RunScratchPhase() :
	//
	// 1. passe State -> GameStateSpinning
	// 2. génère RotationDegree
	// 3. envoie winningNumber + rotationDegree
	//
	// On laisse ensuite le frontend jouer son animation.
	//

	time.Sleep(SpinningDuration)

	// ========================================================
	// RESOLVE
	// ========================================================
	//
	// Maintenant seulement on calcule les gains.
	//
	// Les ScratchResult sont disponibles.
	//

	result := r.ResolveTurn()

	// ========================================================
	// RESULT
	// ========================================================

	r.Hub.BroadcastJSON(result)

	// Laisse le temps au frontend d'afficher le résultat.
	time.Sleep(ResultDuration)

	return nil
}

// ============================================================
// RUN GAME
// ============================================================

func (r *Room) RunGame() {
	for {
		// ======================================================
		// RUN TURN
		// ======================================================

		if err := r.RunTurn(); err != nil {
			r.Hub.BroadcastJSON(ErrorMessage{
				Type:    "error",
				Message: err.Error(),
			})

			r.mu.Lock()
			r.State = GameStateFinished
			r.mu.Unlock()

			// Même en cas d'erreur, on détruit la room.
			r.DestroyRoom()

			return
		}

		r.mu.Lock()

		// ======================================================
		// GAME OVER
		// ======================================================

		if r.CurrentTurn >= MaxTurns {
			r.State = GameStateFinished

			turn := r.CurrentTurn

			type result struct {
				ID      uuid.UUID
				Balance int
			}

			balances := make(
				[]result,
				0,
				len(r.Players),
			)

			var winnerID string
			winnerBalance := -1

			for _, player := range r.Players {
				balances = append(
					balances,
					result{
						ID:      player.ID,
						Balance: player.Balance,
					},
				)

				if player.Balance > winnerBalance {
					winnerBalance = player.Balance
					winnerID = player.ID.String()
				}
			}

			r.mu.Unlock()

			// ==================================================
			// SAVE RESULT
			// ==================================================

			sort.Slice(
				balances,
				func(i, j int) bool {
					return balances[i].Balance >
						balances[j].Balance
				},
			)

			scores := make(
				[]models.GameScore,
				0,
				len(balances),
			)

			now := time.Now()
			totalPlayers := len(balances)

			for i, b := range balances {
				scores = append(
					scores,
					models.GameScore{
						UserID:     b.ID,
						FinalScore: b.Balance,
						Rank: fmt.Sprintf(
							"%d/%d",
							i+1,
							totalPlayers,
						),
						Time: now,
					},
				)
			}

			if r.Manager != nil &&
				r.Manager.DB != nil {

				if err := r.Manager.DB.
					Create(&scores).Error; err != nil {

					log.Printf(
						"erreur sauvegarde scores room %s: %v",
						r.ID,
						err,
					)
				}
			}

			// ==================================================
			// GAME FINISHED
			// ==================================================
			for _, player := range r.Players {
				var u models.User

				if err := r.Manager.DB.First(&u, "id = ?", player.ID).Error; err != nil {
					log.Printf("erreur récupération user %s: %v", player.ID, err)
					continue
				}

				if err := user.ExecQuest(r.Manager.DB, &u, "gambleQuest"); err != nil {
					log.Printf("erreur quête user %s: %v", player.ID, err)
				}
			}


			r.Hub.BroadcastJSON(
				GameFinishedMessage{
					Type:     "game_finished",
					Turn:     turn,
					WinnerID: winnerID,
				},
			)

			time.Sleep(500 * time.Millisecond)
			
			r.GameStarted = false

			
			r.ResetGame()

			return
		}

		// ======================================================
		// NEXT TURN
		// ======================================================

		r.CurrentTurn++

		r.mu.Unlock()

		time.Sleep(1 * time.Second)
	}
}
func (r *Room) ResetGame() {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.GameStarted = false
	r.StartPending = false

	r.CurrentTurn = 0
	r.State = GameStateWaiting
	r.WinningNum = -1

	for _, player := range r.Players {
		player.Ready = false
		player.Balance = 1000
		player.CurrentBet = nil
		player.ScratchResult = nil
	}
}

// ============================================================
// DESTROY ROOM
// ============================================================

func (r *Room) DestroyRoom() {
	if r.Manager == nil {
		return
	}

	r.Manager.DeleteRoom(r.ID)
}

// ============================================================
// START COUNTDOWN
// ============================================================

func (r *Room) StartCountdown() {
	r.mu.Lock()

	if r.StartPending || r.GameStarted {
		r.mu.Unlock()
		return
	}

	r.StartPending = true

	r.mu.Unlock()

	go func() {
		for remaining := 5; remaining > 0; remaining-- {
			r.mu.RLock()

			ready := 0

			for _, player := range r.Players {
				if player.Ready {
					ready++
				}
			}

			gameStarted := r.GameStarted

			r.mu.RUnlock()

			// ==================================================
			// ANNULATION
			// ==================================================

			if gameStarted || ready < MinPlayers {
				r.mu.Lock()
				r.StartPending = false
				r.mu.Unlock()

				return
			}

			// ==================================================
			// COUNTDOWN
			// ==================================================

			r.Hub.BroadcastJSON(
				GameStartingMessage{
					Type:      "game_starting",
					Countdown: remaining,
				},
			)

			time.Sleep(time.Second)
		}

		// ======================================================
		// VÉRIFICATION FINALE
		// ======================================================

		if r.CanStartGame() {
			r.StartGame()
		} else {
			r.mu.Lock()
			r.StartPending = false
			r.mu.Unlock()
		}
	}()
}
