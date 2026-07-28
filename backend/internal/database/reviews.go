package database

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
)

func updateReviews(ctx context.Context, game *models.Game) error {

	if game == nil {
		return errors.New("game is nil")
	}

	client := &http.Client{Timeout: 5 * time.Second}
	urlString := fmt.Sprintf("https://store.steampowered.com/appreviews/%v?json=1&language=all&purchase_type=all", game.AppID)
	req, err := http.NewRequestWithContext(ctx, "GET", urlString, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error reading response body: %w", err)
	}

	var response models.SteamAppreview
	err = json.Unmarshal(body, &response)
	if err != nil {
		return fmt.Errorf("error unmarshaling JSON: %w", err)
	}
	if response.Success == 0 {
		return fmt.Errorf("Failed to update reviews for the game %d", game.AppID)
	}
	game.TotalReviews = response.Query.Total
	game.SteamScore = float64(response.Query.Positive) / float64(response.Query.Total) * 100
	return nil
}
