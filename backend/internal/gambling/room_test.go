package gambling

import (
	"testing"
	"time"
	"github.com/google/uuid"
)

func TestNewRoom(t *testing.T) {
	room := NewRoom("AB12")

	if room.ID != "AB12" {
		t.Errorf("ID attendu AB12, obtenu %s", room.ID)
	}

	if room.CurrentTurn != 1 {
		t.Errorf("tour attendu 1, obtenu %d", room.CurrentTurn)
	}

	if room.State != GameStateWaiting {
		t.Errorf("état attendu waiting, obtenu %s", room.State)
	}

	if room.WinningNum != -1 {
		t.Errorf("WinningNum attendu -1, obtenu %d", room.WinningNum)
	}

	if room.Players == nil {
		t.Error("Players ne doit pas être nil")
	}
}

func TestAddPlayer(t *testing.T) {
	room := NewRoom("AB12")

	player := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  1000,
	}

	room.AddPlayer(player)

	if len(room.Players) != 1 {
		t.Errorf("1 joueur attendu, obtenu %d", len(room.Players))
	}

	if room.Players[player.ID] != player {
		t.Error("le joueur n'a pas été correctement ajouté")
	}
}

func TestPlaceBet(t *testing.T) {
	room := NewRoom("AB12")

	player := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  100,
	}

	room.AddPlayer(player)
	room.StartBetting()
	bet := &Chip{
		PlayerID:  player.ID.String(),
		ChipValue: 10,
		Target:    "red",
	}

	err := room.PlaceBet(player.ID, bet)

	if err != nil {
		t.Fatalf("la mise devrait être acceptée : %v", err)
	}

	if player.CurrentBet != bet {
		t.Error("la mise n'a pas été enregistrée")
	}

	if player.Balance != 90 {
		t.Errorf("solde attendu 90, obtenu %d", player.Balance)
	}
}

func TestPlaceBetAfterTimeout(t *testing.T) {
	room := NewRoom("AB12")

	player := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  100,
	}

	room.AddPlayer(player)
	room.StartBetting()

	// Simule une phase de betting commencée il y a 11 secondes.
	room.BettingStartedAt = time.Now().Add(-11 * time.Second)

	bet := &Chip{
		PlayerID:  player.ID.String(),
		ChipValue: 10,
		Target:    "red",
	}

	err := room.PlaceBet(player.ID, bet)

	if err == nil {
		t.Error("la mise aurait dû être refusée après 10 secondes")
	}
}

func TestResetBets(t *testing.T) {
	room := NewRoom("AB12")

	player := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  100,
		CurrentBet: &Chip{
			PlayerID:  uuid.New().String(),
			ChipValue: 10,
			Target:    "red",
		},
		ScratchResult: &Ticket{
			Type:  "bonus",
			Value: 1.5,
		},
	}

	room.AddPlayer(player)
	room.WinningNum = 17

	room.ResetBets()

	if player.CurrentBet != nil {
		t.Error("CurrentBet devrait être nil")
	}

	if player.ScratchResult != nil {
		t.Error("ScratchResult devrait être nil")
	}

	if room.WinningNum != -1 {
		t.Errorf("WinningNum devrait être -1, obtenu %d", room.WinningNum)
	}
}

func TestStartTurn(t *testing.T) {
	room := NewRoom("AB12")

	player := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  100,
		CurrentBet: &Chip{
			PlayerID:  uuid.New().String(),
			ChipValue: 10,
			Target:    "red",
		},
		ScratchResult: &Ticket{
			Type:  "bonus",
			Value: 1.5,
		},
	}

	room.AddPlayer(player)
	room.WinningNum = 17

	room.StartTurn()

	if room.State != GameStateBetting {
		t.Errorf("état attendu betting, obtenu %s", room.State)
	}

	if player.CurrentBet != nil {
		t.Error("CurrentBet devrait être réinitialisé")
	}

	if player.ScratchResult != nil {
		t.Error("ScratchResult devrait être réinitialisé")
	}

	if room.WinningNum != -1 {
		t.Errorf("WinningNum devrait être -1, obtenu %d", room.WinningNum)
	}

	if room.BettingStartedAt.IsZero() {
		t.Error("BettingStartedAt devrait être initialisé")
	}
}

func TestScratchPlayer(t *testing.T) {
	room := NewRoom("AB12")

	player := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  100,
	}

	room.AddPlayer(player)

	// Le joueur ne doit pas pouvoir gratter pendant BETTING.
	room.StartBetting()

	err := room.ScratchPlayer(player.ID)

	if err == nil {
		t.Error("le scratch devrait être refusé pendant BETTING")
	}

	// On passe manuellement en phase SCRATCH.
	room.State = GameStateScratch

	err = room.ScratchPlayer(player.ID)

	if err != nil {
		t.Fatalf("le scratch devrait être accepté : %v", err)
	}

	if player.ScratchResult == nil {
		t.Fatal("un ticket devrait avoir été attribué")
	}

	if player.ScratchResult.Type != "bonus" &&
		player.ScratchResult.Type != "malus" {
		t.Errorf("type de ticket invalide : %s", player.ScratchResult.Type)
	}
}

func TestSpin(t *testing.T) {
	room := NewRoom("AB12")

	// Impossible de tourner avant la phase SPINNING.
	err := room.Spin()

	if err == nil {
		t.Error("Spin devrait être refusé hors de la phase SPINNING")
	}

	room.State = GameStateSpinning

	err = room.Spin()

	if err != nil {
		t.Fatalf("Spin devrait fonctionner : %v", err)
	}

	if room.WinningNum < 0 || room.WinningNum > MaxRouletteNumber {
		t.Errorf(
			"numéro gagnant invalide : %d",
			room.WinningNum,
		)
	}
}

func TestCalculateBetWin(t *testing.T) {
	chip := &Chip{
		ChipValue: 10,
		Target:    "17",
	}

	win := calculateBetWin(chip, 17)

	if win != 210 {
		t.Errorf("gain attendu 210, obtenu %d", win)
	}

	loss := calculateBetWin(chip, 18)

	if loss != 0 {
		t.Errorf("gain attendu 0, obtenu %d", loss)
	}
}

func TestResolveTurn(t *testing.T) {
	room := NewRoom("AB12")

	player := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  90,
		CurrentBet: &Chip{
			PlayerID:  uuid.New().String(),
			ChipValue: 10,
			Target:    "17",
		},
		ScratchResult: &Ticket{
			Type:  "bonus",
			Value: 0.5,
		},
	}

	room.AddPlayer(player)

	room.State = GameStateResolving
	room.WinningNum = 17

	room.ResolveTurn()

	// 10 × 21 = 210
	// Bonus +50 % → 315
	// Solde initial : 90
	// Solde final : 405
	if player.Balance != 405 {
		t.Errorf("solde attendu 615, obtenu %d", player.Balance)
	}

	if room.State != GameStateResolving {
		t.Errorf("état attendu resolving, obtenu %s", room.State)
	}
}

func TestRunSpinningPhase(t *testing.T) {
	room := NewRoom("AB12")

	err := room.RunSpinningPhase()

	if err != nil {
		t.Fatalf("RunSpinningPhase a échoué : %v", err)
	}

	if room.WinningNum < 0 || room.WinningNum > MaxRouletteNumber {
		t.Errorf("numéro gagnant invalide : %d", room.WinningNum)
	}

	if room.State != GameStateResolving {
		t.Errorf(
			"état attendu resolving, obtenu %s",
			room.State,
		)
	}
}

func TestIsGameOver(t *testing.T) {
	room := NewRoom("AB12")

	if room.IsGameOver() {
		t.Error("la partie ne devrait pas être terminée au tour 1")
	}

	room.CurrentTurn = 5

	if room.IsGameOver() {
		t.Error("la partie ne devrait pas être terminée au tour 5")
	}

	room.CurrentTurn = 6

	if !room.IsGameOver() {
		t.Error("la partie devrait être terminée au tour 6")
	}
}

func TestGetWinner(t *testing.T) {
	room := NewRoom("AB12")

	player1 := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  150,
	}

	player2 := &Player{
		ID:       uuid.New(),
		Username: "Alex",
		Balance:  250,
	}

	player3 := &Player{
		ID:       uuid.New(),
		Username: "Tom",
		Balance:  100,
	}

	room.AddPlayer(player1)
	room.AddPlayer(player2)
	room.AddPlayer(player3)

	winner := room.GetWinner()

	if winner == nil {
		t.Fatal("un gagnant devrait être trouvé")
	}

	if winner.ID != player2.ID {
		t.Errorf(
			"gagnant attendu %s, obtenu %s",
			player2.Username,
			winner.Username,
		)
	}
}

func TestRunTurn(t *testing.T) {
	room := NewRoom("AB12")

	player := &Player{
		ID:       uuid.New(),
		Username: "Hugo",
		Balance:  100,
	}

	room.AddPlayer(player)

	err := room.RunTurn()

	if err != nil {
		t.Fatalf("RunTurn a échoué : %v", err)
	}

	if room.State != GameStateResolving {
		t.Errorf(
			"état attendu resolving, obtenu %s",
			room.State,
		)
	}

	if room.WinningNum < 0 || room.WinningNum > MaxRouletteNumber {
		t.Errorf(
			"numéro gagnant invalide : %d",
			room.WinningNum,
		)
	}
}