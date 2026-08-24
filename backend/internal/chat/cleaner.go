package chat

import (
	"context"
	"log"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"gorm.io/gorm"
)

func Cleaner(db *gorm.DB, ctx context.Context) {
	ticker := time.NewTicker(time.Minute * 1)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := db.Where("created_at < ?", time.Now().Add(-2*time.Minute)).
				Unscoped().
				Delete(&models.WSToken{}).Error; err != nil {
				log.Printf("[ERROR] Coudn't delete wsToken: %v", err)
			}
		}
	}
}
