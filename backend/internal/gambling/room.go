package gambling

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

const BettingDuration = 10 * time.Second
const ScratchDuration = 10 * time.Second
const SpinningDuration = 4 * time.Second
const MaxTurns = 6

// ====================
// Utility functions
// ====================

func (r *Room) IsGameOver() bool {
	return r.CurrentTurn >= MaxTurns
}

func calculateBetWin(chip *Chip, winningNumber int) int {
	if chip == nil {
		return 0
	}

	if !isWinningBet(chip.Target, winningNumber) {
		return 0
	}

	multiplier := getNumberMultiplier(chip.Target)

	return chip.ChipValue * multiplier
}

func calculateFinalWin(chip *Chip, ticket *Ticket, winningNumber int) int {
	baseWin := calculateBetWin(chip, winningNumber)

	if baseWin == 0 {
		return 0
	}

	if ticket == nil {
		return baseWin
	}

	return int(float64(baseWin) * (1 + ticket.Value))
}

// ====================
// Room
// ====================

func NewRoom(id string) *Room {
	return &Room{
		ID:          id,
		Players:     make(map[uuid.UUID]*Player),
		CurrentTurn: 1,
		State:       GameStateWaiting,
		WinningNum:  -1,
	}
}

func (r *Room) AddPlayer(player *Player) {
	r.Players[player.ID] = player
}

func (r *Room) ResetBets() {
	for _, player := range r.Players {
		player.CurrentBet = nil
		player.ScratchResult = nil
	}

	r.WinningNum = -1
}

func (r *Room) StartTurn() {
	r.ResetBets()
	r.StartBetting()
}

func (r *Room) StartBetting() {
	r.State = GameStateBetting
	r.BettingStartedAt = time.Now()
}

func (r *Room) RunScratchPhase() {
	r.State = GameStateScratch

	time.Sleep(ScratchDuration)

	r.State = GameStateSpinning
}

func (r *Room) RunBettingPhase() {
	r.StartBetting()

	time.Sleep(BettingDuration)

	r.State = GameStateScratch
}

func (r *Room) RunSpinningPhase() error {
	r.State = GameStateSpinning

	if err := r.Spin(); err != nil {
		return err
	}

	time.Sleep(SpinningDuration)

	r.State = GameStateResolving

	return nil
}

func (r *Room) PlaceBet(playerID uuid.UUID, chip *Chip) error {
	player, exists := r.Players[playerID]
	if !exists {
		return errors.New("player not found")
	}

	if r.State != GameStateBetting {
		return errors.New("betting is closed")
	}

	if time.Since(r.BettingStartedAt) > BettingDuration {
		return errors.New("betting time expired")
	}

	if player.CurrentBet != nil {
		return errors.New("player already has a bet")
	}

	if chip.ChipValue > player.Balance {
		return errors.New("insufficient balance")
	}

	player.CurrentBet = chip
	player.Balance -= chip.ChipValue

	return nil
}

func (r *Room) GetWinner() *Player {
	var winner *Player

	for _, player := range r.Players {
		if winner == nil || player.Balance > winner.Balance {
			winner = player
		}
	}

	return winner
}

func (r *Room) ScratchPlayer(playerID uuid.UUID) error {
	player, exists := r.Players[playerID]
	if !exists {
		return errors.New("player not found")
	}

	if r.State != GameStateScratch {
		return errors.New("scratch phase is not active")
	}

	player.ScratchResult = generateScratchTicket()

	return nil
}

func (r *Room) Spin() error {
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

func (r *Room) ResolveTurn() {
	for _, player := range r.Players {
		if player.CurrentBet == nil {
			continue
		}

		win := calculateFinalWin(
			player.CurrentBet,
			player.ScratchResult,
			r.WinningNum,
		)

		player.Balance += win
	}

	r.State = GameStateResolving
}

func (r *Room) RunTurn() error {
	r.StartTurn()

	r.RunBettingPhase()
	r.RunScratchPhase()

	if err := r.RunSpinningPhase(); err != nil {
		return err
	}

	r.ResolveTurn()

	return nil
}
func (r *Room) RunGame() error {
	for !r.IsGameOver() {
		if err := r.RunTurn(); err != nil {
			return err
		}

		if !r.IsGameOver() {
			r.CurrentTurn++
		}
	}

	r.State = GameStateFinished

	return nil
}