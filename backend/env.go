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
	if os.Getenv("DB_NAME") == "" {
		log.Fatal("[ERROR] DB_NAME not found in env")
	}
	if os.Getenv("DB_SSL") == "" {
		log.Fatal("[ERROR] DB_SSL not found in env")
	}
	if os.Getenv("DB_ROOTCA") == "" {
		log.Fatal("[ERROR] DB_ROOTCA not found in env")
	}
	if os.Getenv("DB_CRT") == "" {
		log.Fatal("[ERROR] DB_CRT not found in env")
	}
	if os.Getenv("DB_KEY") == "" {
		log.Fatal("[ERROR] DB_KEY not found in env")
	}
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("[ERROR] JWT_SECRET not found in env")
	}
	if os.Getenv("REFRESH_SECRET") == "" {
		log.Fatal("[ERROR] REFRESH_SECRET not found in env")
	}
}
