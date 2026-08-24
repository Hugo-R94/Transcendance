package main

import (
	"context"
	"log"
	"net/http"
	_ "net/http/pprof"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/chat"
)

func main() {
	//pprof
	go func() {
		log.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	envCheck()

	db, sqldb := dbSetup()
	defer sqldb.Close()

	go dbUpdate(db, ctx)

	var hub chat.Hub
	hub.HubInit(db)
	go hub.Run(ctx)

	go chat.Cleaner(db, ctx)

	router := setupRouter(db, &hub)

	server := &http.Server{
		Addr:              os.Getenv("ADDR"),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		<-quit
		cancel()
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("[ERROR] Shutting down error: %v", err)
		}
	}()

	log.Println("[INFO] Starting server ...")

	if err := server.ListenAndServe(); err != nil {
		if err == http.ErrServerClosed {
			log.Println("[INFO] Shutting down server ...")
		} else {
			log.Fatalf("[ERROR] Fatal error on server: %v", err)
		}
	}
}
