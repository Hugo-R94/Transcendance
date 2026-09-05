package gambling

import (
	"sync"
	"time"

	"gorm.io/gorm"	
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// ============================================================
// GAME CONFIG
// ============================================================

const (
	// MinPlayers      = 2
	// MaxTurns        = 5
	// GameStartDelay  = 10 * time.Second
	// BettingDuration = 15 * time.Second
	// ScratchDuration = 10 * time.Second
	// SpinningDuration = 4 * time.Second
	// ResultDuration = 6 * time.Second 
	// FastMode
	MinPlayers      = 2
	MaxTurns        = 5
	GameStartDelay  = 1 * time.Second /2
	BettingDuration = 1 * time.Second /2
	ScratchDuration = 1 * time.Second /2
	SpinningDuration = 1 * time.Second /2
	ResultDuration = 1 * time.Second  /2
)

// ============================================================
// GAME STATE
// ============================================================

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



type Room struct {
	ID string

	Players map[uuid.UUID]*Player

	CurrentTurn int
	State       GameState
	WinningNum  int

	BettingStartedAt time.Time

	Hub *Hub

	mu sync.RWMutex

	GameStarted  bool
	StartPending bool
	Manager *RoomManager
}

// ============================================================
// PLAYER
// ============================================================

type Player struct {
	ID         uuid.UUID
	PlayerNumber int
	Username   string
	Balance    int
	Ready      bool

	CurrentBet    *Chip
	ScratchResult *Ticket
}

// ============================================================
// CHIP
// ============================================================

type Chip struct {
	PlayerID  string `json:"playerId"`
	ChipValue int    `json:"chipValue"`
	Target    string `json:"target"`
}

// ============================================================
// TICKET
// ============================================================

type Ticket struct {
	Type  string  `json:"type"`
	Value float64 `json:"value"`
}

// ============================================================
// WEBSOCKET CLIENT
// ============================================================

type Client struct {
	Conn     *websocket.Conn
	PlayerID uuid.UUID
	Send     chan []byte
	Username   string

	Hub  *Hub
	Room *Room
}

// ============================================================
// HUB
// ============================================================

type Hub struct {
	Clients map[uuid.UUID]*Client

	mu sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Clients: make(map[uuid.UUID]*Client),
	}
}

// ============================================================
// ROOM MANAGER
// ============================================================

type RoomManager struct {
    mu    sync.RWMutex
    Rooms map[string]*Room
    DB    *gorm.DB // nouveau
}

func NewRoomManager(db *gorm.DB) *RoomManager {
    return &RoomManager{
        Rooms: make(map[string]*Room),
        DB:    db,
    }
}

var roomManager *RoomManager

func InitRoomManager(db *gorm.DB) {
	roomManager = NewRoomManager(db)
}

// ============================================================
// CLIENT -> SERVER
// ============================================================

type JoinRoomMessage struct {
	Type   string `json:"type"`
	RoomID string `json:"roomId"`
}

type PlayerReadyMessage struct {
	Type  string `json:"type"`
	Ready bool   `json:"ready"`
}

type PlaceBetMessage struct {
	Type      string `json:"type"`
	ChipValue int    `json:"chipValue"`
	Target    string `json:"target"`
}

// ============================================================
// SERVER -> CLIENT
// ============================================================

type ErrorMessage struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type RoomJoinedMessage struct {
	Type     string `json:"type"`
	RoomID   string `json:"roomId"`
	PlayerID string `json:"playerId"`
	Username string `json:"username"`
	Balance  int    `json:"balance"`
}

type PlayerJoinedMessage struct {
	Type     string `json:"type"`
	PlayerID string `json:"playerId"`
	Username string `json:"username"`
	Balance  int    `json:"balance"`
}

type PlayerLeftMessage struct {
	Type     string `json:"type"`
	PlayerID string `json:"playerId"`
	Username string `json:"username"`
}

type PlayerReadyMessageResponse struct {
	Type     string `json:"type"`
	PlayerID string `json:"playerId"`
	Username string `json:"username"`
	Ready    bool   `json:"ready"`
}

type PlayerInfo struct {
	PlayerID string `json:"playerId"`
	Username string `json:"username"`
	PlayerNumber int `json:"playerNumber"`
	Balance  int    `json:"balance"`
	Ready    bool   `json:"ready"`
}

type RoomStateMessage struct {
	Type      string       `json:"type"`
	Players   []PlayerInfo `json:"players"`
	Ready     int          `json:"ready"`
	Total     int          `json:"total"`
	AllReady  bool         `json:"allReady"`
}

type GameStartingMessage struct {
	Type      string `json:"type"`
	Countdown int    `json:"countdown"`
}

type GameStartedMessage struct {
	Type string `json:"type"`
	Turn int    `json:"turn"`
}

type TurnStartedMessage struct {
	Type string `json:"type"`
	Turn int    `json:"turn"`
}

type BettingStartedMessage struct {
	Type     string `json:"type"`
	Turn     int    `json:"turn"`
	Duration int    `json:"duration"`
}

type BettingEndedMessage struct {
	Type string `json:"type"`
	Turn int    `json:"turn"`
}

type BetPlacedMessage struct {
	Type         string `json:"type"`
	PlayerID     string `json:"playerId"`
	PlayerNumber int    `json:"playerNumber"`
	ChipValue    int    `json:"chipValue"`
	Target       string `json:"target"`
	Balance      int    `json:"balance"`
}

type ScratchResultMessage struct {
	Type     string `json:"type"`
	Turn     int    `json:"turn"`
	PlayerID string `json:"playerId"`
	Ticket   Ticket `json:"ticket"`
}

type SpinningStartedMessage struct {
	Type     string `json:"type"`
	WinningNumber int `json:"winning_number"`
	RotationDegree		int		`json:"rotation_degree"`
	Turn     int    `json:"turn"`
	Duration int    `json:"duration"`
}

type TurnResolvedMessage struct {
	Type          string         `json:"type"`
	Turn          int            `json:"turn"`
	WinningNumber int            `json:"winningNumber"`
	Players       []PlayerResult `json:"players"`
}

type PlayerResult struct {
	PlayerID      string `json:"playerId"`
	Username      string `json:"username"`
	Result        string `json:"result"`
	BalanceBefore int    `json:"balanceBefore"`
	Gain          int    `json:"gain"`
	BalanceAfter  int    `json:"balanceAfter"`
}

type QuestCompletedMessage struct{
	Type     string `json:"type"`
	UserID 	 string `json:"user_id,omitempty"`
}

type GameFinishedMessage struct {
	Type     string `json:"type"`
	Turn     int    `json:"turn"`
	WinnerID string `json:"winnerId,omitempty"`
}

type winningNumberMessage struct{
	Type				string  `json:"type"`
	Turn    			int     `json:"turn"`
	WinningNumber 		int		`json:"winning_number"`
}