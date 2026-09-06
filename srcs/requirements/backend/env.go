package main

import (
	"log"
	"os"
)

func envCheck() {
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
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("[ERROR] JWT_SECRET not found in env")
	}
	if os.Getenv("REFRESH_SECRET") == "" {
		log.Fatal("[ERROR] REFRESH_SECRET not found in env")
	}
	if os.Getenv("WS_SECRET") == "" {
		log.Fatal("[ERROR] WS_SECRET not found in env")
	}
	if os.Getenv("SUPPORT_MAIL") == "" {
		log.Fatal("[ERROR] SUPPORT_MAIL not found in env")
	}
	if os.Getenv("SUPPORT_MAIL_PASWD") == "" {
		log.Fatal("[ERROR] SUPPORT_MAIL_PASWD not found in env")
	}
}
