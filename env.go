package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func envCheck() {
	err_env := godotenv.Load(".env")
	if err_env != nil {
		log.Printf("[WARNING] Error while trying to load .env: %v", err_env)
	}
	if os.Getenv("ADDR") == "" {
		log.Fatal("[ERROR] ADDR not found in env")
	}
	if os.Getenv("DB_HOST") == "" {
		log.Fatal("[ERROR] DB_HOST not found in env")
	}
	if os.Getenv("DB_USER") == "" {
		log.Fatal("[ERROR] DB_USER not found in env")
	}
	if os.Getenv("DB_PASSWORD") == "" {
		log.Fatal("[ERROR] DB_PASSWORD not found in env")
	}
	if os.Getenv("DB_NAME") == "" {
		log.Fatal("[ERROR] DB_NAME not found in env")
	}
	if os.Getenv("DB_PORT") == "" {
		log.Fatal("[ERROR] DB_PORT not found in env")
	}
	if os.Getenv("DB_SSL") == "" {
		log.Fatal("[ERROR] DB_SSL not found in env")
	}
	if os.Getenv("DB_TZ") == "" {
		log.Fatal("[ERROR] DB_TZ not found in env")
	}
	if os.Getenv("DB_CERT") == "" {
		log.Fatal("[ERROR] DB_CERT not found in env")
	}
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("[ERROR] JWT_SECRET not found in env")
	}
}
