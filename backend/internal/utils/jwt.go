package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var JwtSecret = []byte(os.Getenv("JWT_SECRET"))
var WSSecret = []byte(os.Getenv("WS_SECRET"))
var RefreshSecret = []byte(os.Getenv("REFRESH_SECRET"))

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func HashReToken(token string) (string, error) {
	hash := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(hash[:])
	bytes, err := bcrypt.GenerateFromPassword([]byte(tokenHash), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func CheckTokenHash(token, hash string) bool {
	if hash == "" {
		return false
	}
	hashSum := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(hashSum[:])
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(tokenHash))
	return err == nil
}

func GenerateJWT(id string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  id,
		"exp": time.Now().Add(time.Hour * 1).Unix(),
	})
	return token.SignedString(JwtSecret)
}

func GenerateRefreshToken(id string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  id,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(),
	})
	return token.SignedString(RefreshSecret)
}

func GenerateWSToken(id string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  id,
		"exp": time.Now().Add(time.Minute * 1).UnixMicro(),
	})
	return token.SignedString(WSSecret)
}
