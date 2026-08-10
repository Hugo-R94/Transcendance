package gambling

import (
	"time"

	"github.com/google/uuid"
)

// ============================================================
// GAME STATE
// ============================================================

// GameState représente la phase actuelle de la partie.
type GameState string

const (
	GameStateWaiting   GameState = "waiting"
	GameStateBetting   GameState = "betting"
	GameStateScratch   GameState = "scratch"
	GameStateSpinning  GameState = "spinning"
	GameStateResolving GameState = "resolving"
	GameStateFinished  GameState = "finished"
)

// ============================================================
// ROOM
// ============================================================

// Room représente un salon de jeu.
//
// Une Room correspond à un code de partie.
// Elle contient les joueurs et l'état actuel de la partie.
type Room struct {
	ID string

	Players map[uuid.UUID]*Player
	CurrentTurn int
	State GameState
	WinningNum int
	BettingStartedAt time.Time
}

// ============================================================
// PLAYER
// ============================================================

// Player représente un joueur dans une Room.
type Player struct {
	ID uuid.UUID
	Username string
	Balance int
	CurrentBet *Chip
	ScratchResult *Ticket
}

// ============================================================
// CHIP
// ============================================================

type Chip struct {
	PlayerID string `json:"playerId"`
	ChipValue int `json:"chipValue"`
	Target string `json:"target"`
}

// ============================================================
// TICKET
// ============================================================

type Ticket struct {
	Type string `json:"type"`
	Value float64 `json:"value"`
}
