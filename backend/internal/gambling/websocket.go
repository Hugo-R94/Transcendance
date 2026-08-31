package gambling

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)
// ============================================================
// WEBSOCKET
// ============================================================

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,

	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// ============================================================
// HUB
// ============================================================

func (h *Hub) AddClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.Clients[client.PlayerID] = client
}

func (h *Hub) RemoveClient(playerID uuid.UUID) {
	h.mu.Lock()
	defer h.mu.Unlock()

	client, exists := h.Clients[playerID]

	if !exists {
		return
	}

	delete(h.Clients, playerID)

	close(client.Send)
}

func (h *Hub) BroadcastJSON(message interface{}) {
	data, err := json.Marshal(message)

	if err != nil {
		log.Printf("broadcast json error: %v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.Clients {
		select {
		case client.Send <- data:
		default:
			log.Printf(
				"client %s send buffer full",
				client.PlayerID,
			)
		}
	}
}

func (c *Client) SendJSON(message interface{}) {
	data, err := json.Marshal(message)

	if err != nil {
		log.Printf("json error: %v", err)
		return
	}

	select {
	case c.Send <- data:
	default:
		log.Printf(
			"send buffer full for player %s",
			c.PlayerID,
		)
	}
}

// ============================================================
// JOIN ROOM
// ============================================================

func (c *Client) handleJoinRoom(data []byte) {
	var message JoinRoomMessage

	if err := json.Unmarshal(data, &message); err != nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "invalid join_room message",
		})

		return
	}

	if message.RoomID == "" {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "roomId is required",
		})

		return
	}

	if c.Room != nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "you are already in a room",
		})

		return
	}

	room := roomManager.GetRoom(message.RoomID)

	if room == nil {
		var err error

		room, err = roomManager.CreateRoom(message.RoomID)

		if err != nil {
			c.SendJSON(ErrorMessage{
				Type:    "error",
				Message: err.Error(),
			})

			return
		}
	}

	room.mu.RLock()

	if room.GameStarted {
		room.mu.RUnlock()

		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "game already started",
		})

		return
	}

	room.mu.RUnlock()

	player := &Player{
		ID:       c.PlayerID,
		Username: c.Username,
		Balance:  1000,
		Ready:    false,
	}
	
	room.AddPlayer(player)

	c.Room = room
	c.Hub = room.Hub

	room.Hub.AddClient(c)

	// Confirmation personnelle.
	c.SendJSON(RoomJoinedMessage{
		Type:     "room_joined",
		RoomID:   room.ID,
		PlayerID: player.ID.String(),
		Username: player.Username,
		Balance:  player.Balance,
	})

	// Informe tout le monde du nouveau joueur.
	room.Hub.BroadcastJSON(PlayerJoinedMessage{
		Type:     "player_joined",
		PlayerID: player.ID.String(),
		Username: player.Username,
		Balance:  player.Balance,
	})

	// Envoie l'état complet de la room.
	room.Hub.BroadcastJSON(room.GetRoomState())
}

func (r *Room) IsEmpty() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return len(r.Players) == 0
}


func (c *Client) handleLeaveRoom(data []byte) {
	if c.Room == nil {
		return
	}

	room := c.Room
	hub := c.Hub

	room.RemovePlayer(c.PlayerID)

	// Le client quitte la room, mais PAS le WebSocket.
	c.Room = nil
	c.Hub = nil

	hub.BroadcastJSON(PlayerLeftMessage{
		Type:     "player_left",
		PlayerID:  c.PlayerID.String(),
		Username: c.Username,
	})

	// Vérifie si la room est maintenant vide.
	if room.IsEmpty() {
		log.Printf("[ROOM] destroying empty room %s", room.ID)
		room.DestroyRoom()
		return
	}

	hub.BroadcastJSON(room.GetRoomState())
}


// ============================================================
// READY
// ============================================================

func (c *Client) handlePlayerReady(data []byte) {
	if c.Room == nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "you are not in a room",
		})

		return
	}

	var message PlayerReadyMessage

	if err := json.Unmarshal(data, &message); err != nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "invalid player_ready message",
		})

		return
	}

	room := c.Room

	if err := room.SetPlayerReady(
		c.PlayerID,
		message.Ready,
	); err != nil {

		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: err.Error(),
		})

		return
	}

	player := room.GetPlayer(c.PlayerID)

	if player == nil {
		return
	}

	room.Hub.BroadcastJSON(
		PlayerReadyMessageResponse{
			Type:     "player_ready",
			PlayerID: player.ID.String(),
			Username: player.Username,
			Ready:    player.Ready,
		},
	)

	room.Hub.BroadcastJSON(
		room.GetRoomState(),
	)

	// Si au moins 2 joueurs sont ready,
	// on lance le compte à rebours.
	if room.CanStartGame() {
		room.StartCountdown()
	}
}

// ============================================================
// BET
// ============================================================

func (c *Client) handlePlaceBet(data []byte) {
	if c.Room == nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "you are not in a room",
		})
		return
	}

	var message PlaceBetMessage

	if err := json.Unmarshal(data, &message); err != nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "invalid place_bet message",
		})
		return
	}

	chip := &Chip{
		PlayerID:  c.PlayerID.String(),
		ChipValue: message.ChipValue,
		Target:    message.Target,
	}

	if err := c.Room.PlaceBet(c.PlayerID, chip); err != nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: err.Error(),
		})
		return
	}

	player := c.Room.GetPlayer(c.PlayerID)
	if player == nil {
		return
	}

	c.Room.Hub.BroadcastJSON(BetPlacedMessage{
		Type:         "bet_placed",
		PlayerID:     c.PlayerID.String(),
		PlayerNumber: player.PlayerNumber,
		ChipValue:    message.ChipValue,
		Target:       message.Target,
		Balance:      player.Balance,
	})
}

// ============================================================
// SCRATCH
// ============================================================

func (c *Client) handleScratch() {
	if c.Room == nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: "you are not in a room",
		})

		return
	}

	ticket, err := c.Room.ScratchPlayer(c.PlayerID)

	if err != nil {
		c.SendJSON(ErrorMessage{
			Type:    "error",
			Message: err.Error(),
		})

		return
	}

	c.Room.Hub.BroadcastJSON(
		ScratchResultMessage{
			Type:     "scratch_result",
			Turn:     c.Room.CurrentTurn,
			PlayerID: c.PlayerID.String(),
			Ticket:   *ticket,
		},
	)
}

// ============================================================
// READ PUMP
// ============================================================

func (c *Client) ReadPump() {
	defer func() {
		c.disconnect()
	}()

	for {
		_, data, err := c.Conn.ReadMessage()

		if err != nil {
			log.Printf(
				"read error player=%s: %v",
				c.PlayerID,
				err,
			)

			return
		}

		var message struct {
			Type string `json:"type"`
		}

		if err := json.Unmarshal(data, &message); err != nil {
			c.SendJSON(ErrorMessage{
				Type:    "error",
				Message: "invalid JSON",
			})

			continue
		}

		switch message.Type {

		case "leave_room":
			c.handleLeaveRoom(data)
			
		case "game_invit":
			log.Printf("invitation\n")
			
		case "join_room":
			c.handleJoinRoom(data)

		case "player_ready":
			c.handlePlayerReady(data)

		case "place_bet":
			c.handlePlaceBet(data)

		case "scratch":
			c.handleScratch()

		default:
			c.SendJSON(ErrorMessage{
				Type: "error",
				Message: "unknown message type: " +
					message.Type,
			})
		}
	}
}

// ============================================================
// DISCONNECT
// ============================================================

func (c *Client) disconnect() {
	if c.Hub != nil {
		c.Hub.RemoveClient(c.PlayerID)
	}

	if c.Room != nil {
		player := c.Room.GetPlayer(c.PlayerID)

		if player != nil {
			c.Room.RemovePlayer(c.PlayerID)

			c.Room.Hub.BroadcastJSON(
				PlayerLeftMessage{
					Type:     "player_left",
					PlayerID: player.ID.String(),
					Username: player.Username,
				},
			)

			c.Room.Hub.BroadcastJSON(
				c.Room.GetRoomState(),
			)
		}
	}

	if c.Conn != nil {
		c.Conn.Close()
	}
}

// ============================================================
// WRITE PUMP
// ============================================================

func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Send

		if !ok {
			return
		}

		if err := c.Conn.WriteMessage(
			websocket.TextMessage,
			message,
		); err != nil {

			log.Printf(
				"write error player=%s: %v",
				c.PlayerID,
				err,
			)

			return
		}
	}
}

// ============================================================
// WEBSOCKET HANDLER
// ============================================================

func HandleWebSocket(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		// ============================================================
		// USER ID FOURNI PAR WSMiddleware
		// ============================================================

		userIDRaw, exists := c.Get("id")

		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "user id missing from context",
			})
			return
		}

		userID, ok := userIDRaw.(uuid.UUID)

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid user id in context",
			})
			return
		}

		// ============================================================
		// RÉCUPÉRATION DU USER
		// ============================================================

		var user models.User

		if err := db.First(
			&user,
			"id = ?",
			userID,
		).Error; err != nil {

			if errors.Is(
				err,
				gorm.ErrRecordNotFound,
			) {
				c.JSON(
					http.StatusUnauthorized,
					gin.H{
						"error": "user not found",
					},
				)

				return
			}

			log.Printf(
				"failed to find user %s: %v",
				userID,
				err,
			)

			c.JSON(
				http.StatusInternalServerError,
				gin.H{
					"error": "failed to find user",
				},
			)

			return
		}

		// ============================================================
		// WEBSOCKET UPGRADE
		// ============================================================

		conn, err := upgrader.Upgrade(
			c.Writer,
			c.Request,
			nil,
		)

		if err != nil {
			log.Printf(
				"websocket upgrade error: %v",
				err,
			)

			return
		}

		// ============================================================
		// CLIENT
		// ============================================================

		client := &Client{
			Conn:     conn,
			PlayerID: user.ID,
			Username: user.Username,
			Send:     make(chan []byte, 32),
		}

		// ============================================================
		// CONFIRMATION
		// ============================================================

		client.SendJSON(map[string]interface{}{
			"type":     "connected",
			"playerId": user.ID.String(),
			"username": user.Username,
		})

		// ============================================================
		// PUMPS
		// ============================================================

		go client.WritePump()

		client.ReadPump()
	}
}