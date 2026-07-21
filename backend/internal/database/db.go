package database

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	//"gorm.io/gorm"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"gorm.io/gorm"
)

func getSteamSpyPage(index int) (map[string]models.SteamSpyGameResp, error) {
	urlString := fmt.Sprintf("https://www.steamspy.com/api.php?request=all&page=%v", index)
	resp, err_req := http.Get(urlString)
	if err_req != nil {
		log.Printf("Get request failed: %v", err_req)
		return nil, err_req
	}
	defer resp.Body.Close()
	body, err_body := io.ReadAll(resp.Body)
	if err_body != nil {
		log.Printf("Error while reading body: %v", err_body)
		return nil, err_body
	}
	var games map[string]models.SteamSpyGameResp
	err_um := json.Unmarshal(body, &games)
	if err_um != nil {
		log.Printf("Error while unmarshal: %v", err_um)
		return nil, err_um
	}
	return games, nil
}

func GetAllGames(db *gorm.DB) {
	resp, err := getSteamSpyPage(0)
	if err != nil {
		return
	}
	var existingGame models.Game
	for _, data := range resp {
		err_exist := db.Where("app_id = ?", data.AppID).First(&existingGame).Error
		if err_exist == nil {
			continue
		} else if err_exist != gorm.ErrRecordNotFound {
			log.Printf("Error while parsing db: %v", err_exist)
			return
		} else {
			newGame := models.Game{
				AppID:         data.AppID,
				Owners_string: data.Owners,
			}
			err_create := db.Create(&newGame).Error
			if err_create != nil {
				log.Printf("Error while creating Game: %v", err_create)
				return
			}
			fmt.Printf("New game id: %v was added to the db\n", data.AppID)
		}
	}
}
