package database

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"gorm.io/gorm"
)

func ParseAndFormatDate(input string) (string, error) {
	const inputLayout = "02 Jan, 2006"

	t, err := time.Parse(inputLayout, input)
	if err != nil {
		return "", fmt.Errorf("erreur de conversion: %w", err)
	}

	return t.Format(time.DateOnly), nil
}

func fetchAndUpdate(ctx context.Context, game *models.Game, tx *gorm.DB) error {

	if game == nil {
		return errors.New("game is nil")
	}

	client := &http.Client{Timeout: 5 * time.Second}
	urlString := fmt.Sprintf("https://store.steampowered.com/api/appdetails?appids=%v&l=english", game.AppID)
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

	var response map[string]models.SteamAppdetails
	err = json.Unmarshal(body, &response)
	if err != nil {
		return fmt.Errorf("error unmarshaling JSON: %w", err)
	}

	appIDstr := fmt.Sprintf("%v", game.AppID)
	steamGame, exists := response[appIDstr]
	if !exists || !steamGame.Success {
		game.Name = "%"
		return fmt.Errorf("Failed to find the game with AppID %d", game.AppID)
	}
	game.Name = steamGame.Data.Name
	game.Description = steamGame.Data.Description
	game.Header_image_link = steamGame.Data.Header
	game.Background_image_link = steamGame.Data.Background
	game.ComingSoon = steamGame.Data.ReleaseDate.ComingSoon
	game.Date = steamGame.Data.ReleaseDate.Date
	for _, steamGenre := range steamGame.Data.Genres {
		genre := models.Genre{
			ID:   steamGenre.ID,
			Name: steamGenre.Name,
		}
		if err := tx.FirstOrCreate(&genre, models.Genre{ID: steamGenre.ID}).Error; err != nil {
			return err
		}
		game.Genres = append(game.Genres, genre)
	}
	for _, steamDev := range steamGame.Data.Developers {
		developer := models.Developer{
			Name: steamDev,
		}
		if err := tx.FirstOrCreate(&developer, models.Developer{Name: steamDev}).Error; err != nil {
			return err
		}
		game.Developers = append(game.Developers, developer)
	}
	for _, steamPub := range steamGame.Data.Publishers {
		publisher := models.Publisher{
			Name: steamPub,
		}
		if err := tx.FirstOrCreate(&publisher, models.Publisher{Name: steamPub}).Error; err != nil {
			return err
		}
		game.Publishers = append(game.Publishers, publisher)
	}
	return nil
}

func CompleteDB(db *gorm.DB, ctx context.Context) error {

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		var games []models.Game

		if err := db.WithContext(ctx).
			Where("name = ?", "").
			Limit(100).
			Find(&games).
			Error; err != nil {
			log.Printf("[ERROR] Query failed: %v", err)
			return err
		}

		if len(games) == 0 {
			log.Printf("[INFO] Database update complete")
			return nil
		}

		err := db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			for i := range games {
				select {
				case <-ctx.Done():
					return ctx.Err()
				case <-ticker.C:
					if err := fetchAndUpdate(ctx, &games[i], tx); err != nil {
						log.Printf("[WARNING] Update failed for AppID %v: %v", games[i].AppID, err)
					}
					if err := updateReviews(ctx, &games[i]); err != nil {
						log.Printf("[WARNING] Update review failed for AppID %v: %v", games[i].AppID, err)
					}
				}
			}
			return tx.Save(games).Error
		})
		if err != nil {
			log.Printf("[ERROR] DB transaction failed: %v", err)
			return err
		}
	}
}
