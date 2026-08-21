package gambling

import (
	"errors"
	"sort"
	"time"

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

	rm.Rooms[roomID] = room

	return room, nil
}

func (rm *RoomManager) GetRoom(roomID string) *Room {
	rm.mu.RLock()
	defer rm.mu.RUnlock()

	return rm.Rooms[roomID]
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

func (r *Room) SetPlayerReady(playerID uuid.UUID, ready bool) error {
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

func (r *Room) ResetBetsUnsafe() {
	for _, player := range r.Players {
		player.CurrentBet = nil
		player.ScratchResult = nil
	}

	r.WinningNum = -1
}

func (r *Room) RunBettingPhase() {
	time.Sleep(BettingDuration)

	r.mu.Lock()

	if r.State != GameStateBetting {
		r.mu.Unlock()
		return
	}

	r.State = GameStateScratch
	turn := r.CurrentTurn

	r.mu.Unlock()

	r.Hub.BroadcastJSON(BettingEndedMessage{
		Type: "betting_ended",
		Turn: turn,
	})
}

func (r *Room) RunScratchPhase() {
	time.Sleep(ScratchDuration)

	r.mu.Lock()

	if r.State != GameStateScratch {
		r.mu.Unlock()
		return
	}

	r.State = GameStateSpinning
	turn := r.CurrentTurn

	r.mu.Unlock()

	r.Hub.BroadcastJSON(SpinningStartedMessage{
		Type:     "spinning_started",
		Turn:     turn,
		Duration: int(SpinningDuration.Seconds()),
	})
}

// ============================================================
// BET
// ============================================================

func (r *Room) PlaceBet(playerID uuid.UUID, chip *Chip) error {
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

	if player.CurrentBet != nil {
		return errors.New("player already has a bet")
	}

	if chip.ChipValue > player.Balance {
		return errors.New("insufficient balance")
	}

	player.Balance -= chip.ChipValue

	chip.PlayerID = playerID.String()

	player.CurrentBet = chip

	return nil
}

// ============================================================
// SCRATCH
// ============================================================

func (r *Room) ScratchPlayer(playerID uuid.UUID) (*Ticket, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.State != GameStateScratch {
		return nil, errors.New("scratch phase is not active")
	}

	player, exists := r.Players[playerID]

	if !exists {
		return nil, errors.New("player not found")
	}

	if player.CurrentBet == nil {
		return nil, errors.New("you must place a bet first")
	}

	if player.ScratchResult != nil {
		return nil, errors.New("ticket already scratched")
	}

	ticket := generateScratchTicket()

	if ticket == nil {
		return nil, errors.New("unable to generate scratch ticket")
	}

	player.ScratchResult = ticket

	return ticket, nil
}

// ============================================================
// SPIN
// ============================================================

func (r *Room) Spin() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.State != GameStateSpinning {
		return errors.New("spinning phase is not active")
	}

	number, err := winningNumberGenerator()

	if err != nil {
		return err
	}

	r.WinningNum = number

	return nil
}

// ============================================================
// RESOLVE
// ============================================================

func (r *Room) ResolveTurn() TurnResolvedMessage {
	r.mu.Lock()
	defer r.mu.Unlock()

	results := make([]PlayerResult, 0, len(r.Players))

	for _, player := range r.Players {
		before := player.Balance

		// La mise a déjà été retirée du balance.
		bet := player.CurrentBet

		if bet == nil {
			results = append(results, PlayerResult{
				PlayerID:      player.ID.String(),
				Username:      player.Username,
				Result:        "tie",
				BalanceBefore: before,
				Gain:          0,
				BalanceAfter:  player.Balance,
			})

			continue
		}

		win := calculateFinalWin(
			bet,
			player.ScratchResult,
			r.WinningNum,
		)

		player.Balance += win

		// Gain net de la manche.
		netGain := win - bet.ChipValue

		result := "lose"

		if netGain > 0 {
			result = "win"
		} else if netGain == 0 {
			result = "tie"
		}

		// Pour afficher un gain net par rapport au solde
		// avant la mise, on utilise le solde avant pari.
		balanceBeforeBet := before + bet.ChipValue

		results = append(results, PlayerResult{
			PlayerID:      player.ID.String(),
			Username:      player.Username,
			Result:        result,
			BalanceBefore: balanceBeforeBet,
			Gain:          netGain,
			BalanceAfter:  player.Balance,
		})
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Gain > results[j].Gain
	})

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
	r.StartTurn()

	r.RunBettingPhase()

	r.RunScratchPhase()

	if err := r.Spin(); err != nil {
		return err
	}

	time.Sleep(SpinningDuration)

	result := r.ResolveTurn()

	r.Hub.BroadcastJSON(result)

	return nil
}

// ============================================================
// RUN GAME
// ============================================================

func (r *Room) RunGame() {
	for {
		if err := r.RunTurn(); err != nil {
			r.Hub.BroadcastJSON(ErrorMessage{
				Type:    "error",
				Message: err.Error(),
			})

			r.mu.Lock()
			r.State = GameStateFinished
			r.mu.Unlock()

			return
		}

		r.mu.Lock()

		if r.CurrentTurn >= MaxTurns {
			r.State = GameStateFinished
			turn := r.CurrentTurn

			var winnerID string
			var winnerBalance = -1

			for _, player := range r.Players {
				if player.Balance > winnerBalance {
					winnerBalance = player.Balance
					winnerID = player.ID.String()
				}
			}

			r.mu.Unlock()

			r.Hub.BroadcastJSON(GameFinishedMessage{
				Type:     "game_finished",
				Turn:     turn,
				WinnerID: winnerID,
			})

			return
		}

		r.CurrentTurn++

		r.mu.Unlock()

		// Petit délai entre deux tours.
		time.Sleep(1 * time.Second)
	}
}

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

			if gameStarted || ready < MinPlayers {
				r.mu.Lock()
				r.StartPending = false
				r.mu.Unlock()

				return
			}

			r.Hub.BroadcastJSON(GameStartingMessage{
				Type:      "game_starting",
				Countdown: remaining,
			})

			time.Sleep(time.Second)
		}

		if r.CanStartGame() {
			r.StartGame()
		} else {
			r.mu.Lock()
			r.StartPending = false
			r.mu.Unlock()
		}
	}()
}