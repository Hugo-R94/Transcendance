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

func timeParser(timeString string) (time.Time, error) {
	layout := "2 Jan, 2006"
	return time.Parse(layout, timeString)
}

func fetchSteamData(ctx context.Context, appID uint64, steamLang string) (models.GameData, error) {
	client := &http.Client{Timeout: 5 * time.Second}
	urlString := fmt.Sprintf("https://store.steampowered.com/api/appdetails?appids=%v&l=%s", appID, steamLang)

	req, err := http.NewRequestWithContext(ctx, "GET", urlString, nil)
	if err != nil {
		return models.GameData{}, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := client.Do(req)
	if err != nil {
		return models.GameData{}, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return models.GameData{}, fmt.Errorf("error reading response body: %w", err)
	}

	var response map[string]models.SteamAppdetails
	if err := json.Unmarshal(body, &response); err != nil {
		return models.GameData{}, fmt.Errorf("error unmarshaling JSON: %w", err)
	}

	appIDstr := fmt.Sprintf("%v", appID)
	steamGame, exists := response[appIDstr]
	if !exists || !steamGame.Success {
		return models.GameData{}, fmt.Errorf("no data for AppID %d in language %s", appID, steamLang)
	}

	return steamGame.Data, nil
}

func fetchAndUpdate(ctx context.Context, game *models.Game, tx *gorm.DB) error {
	if game == nil {
		return errors.New("game is nil")
	}

	languages := []string{"english", "french", "spanish", "arabic"}

	for _, lang := range languages {
		data, err := fetchSteamData(ctx, game.AppID, lang)
		if err != nil {
			continue
		}

		switch lang {
		case "english":
			releaseDate, _ := timeParser(data.ReleaseDate.Date)

			game.Name = data.Name
			game.Description = data.Description
			game.Header_image_link = data.Header
			game.Background_image_link = data.Background
			game.ComingSoon = data.ReleaseDate.ComingSoon
			game.Date = releaseDate

			for _, steamGenre := range data.Genres {
				genre := models.Genre{ID: steamGenre.ID, Name: steamGenre.Name}
				if err := tx.FirstOrCreate(&genre, models.Genre{ID: steamGenre.ID}).Error; err != nil {
					return err
				}
				game.Genres = append(game.Genres, genre)
			}

			for _, steamDev := range data.Developers {
				developer := models.Developer{Name: steamDev}
				if err := tx.FirstOrCreate(&developer, models.Developer{Name: steamDev}).Error; err != nil {
					return err
				}
				game.Developers = append(game.Developers, developer)
			}

			for _, steamPub := range data.Publishers {
				publisher := models.Publisher{Name: steamPub}
				if err := tx.FirstOrCreate(&publisher, models.Publisher{Name: steamPub}).Error; err != nil {
					return err
				}
				game.Publishers = append(game.Publishers, publisher)
			}

		case "french":
			game.DescriptionFr = data.Description
		    for _, steamGenre := range data.Genres {
        		var genre models.Genre
        		if err := tx.First(&genre, "id = ?", steamGenre.ID).Error; err == nil {
        		    genre.NameFr = steamGenre.Name
        			tx.Save(&genre)
        		}
			}
		case "spanish":
			game.DescriptionEs = data.Description
			for _, steamGenre := range data.Genres {
        		var genre models.Genre
        		if err := tx.First(&genre, "id = ?", steamGenre.ID).Error; err == nil {
        		    genre.NameEs = steamGenre.Name
        			tx.Save(&genre)
        		}
			}
		case "arabic":
			game.DescriptionAr = data.Description
			for _, steamGenre := range data.Genres {
        		var genre models.Genre
        		if err := tx.First(&genre, "id = ?", steamGenre.ID).Error; err == nil {
					genre.NameAr = steamGenre.Name
        			tx.Save(&genre)
        		}
			}
		}
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
