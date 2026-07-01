package database

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/Hugo-R94/Transcendance/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func fetchAndUpdate(g *models.Game) error {
	urlString := fmt.Sprintf("https://store.steampowered.com/api/appdetails?appids=%v", g.AppID)
	resp, err_req := http.Get(urlString)
	if err_req != nil {
		log.Printf("Get request failed: %v", err_req)
		return err_req
	}
	defer resp.Body.Close()
	body, err_body := io.ReadAll(resp.Body)
	if err_body != nil {
		log.Printf("Error while reading body: %v", err_body)
		return err_body
	}
	var response map[string]models.SteamAppdetails
	err_um := json.Unmarshal(body, &response)
	if err_um != nil {
		log.Printf("Error while unmarshal: %v", err_um)
		return err_um
	}
	appIDstr := fmt.Sprintf("%v", g.AppID)
	steamGame := response[appIDstr]
	if steamGame.Success != true {
		g.Name = "%"
		return fmt.Errorf("Failed to find the game with AppID")
	}
	g.Name = steamGame.Data.Name
	g.Description = steamGame.Data.Description
	g.Header_image_link = steamGame.Data.Header
	g.Background_image_link = steamGame.Data.Background
	return nil
}

func CompleteDB(db *gorm.DB) {
	ticker := time.NewTicker(1500 * time.Millisecond)
	defer ticker.Stop()
	done := make(chan bool, 1)

	for {
		select {
		case <-done:
			return
		default:
			log.Print("[INFO] Updating games info")
			db.Transaction(func(tx *gorm.DB) error {
				var games []models.Game
				err_lock := db.Clauses(clause.Locking{Strength: "UPDATE"}).
					Where("name = ?", "").
					Limit(100).
					Find(&games).
					Error
				if err_lock != nil {
					log.Printf("[ERROR] Error while locking the DB: %v", err_lock)
					done <- true
					return err_lock
				}
				if len(games) == 0 {
					log.Print("[INFO] The database finished updating")
					done <- true
					return nil
				}
				for i := range games {
					err := fetchAndUpdate(&games[i])
					if err != nil {
						log.Printf("[WARNING] Updating failed for game AppID %v: %v", games[i].AppID, err)
					}
					<-ticker.C
				}
				err_save := tx.Save(games).Error
				if err_save != nil {
					done <- true
					log.Printf("[ERROR] Save failed while updating DB: %v", err_save)
				}
				return err_save
			})
		}
	}
}
