import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Player,
  Ticket,
  Bet,
  Result,
  ServerMessage,
  JsonLog,
} from "../types/gambling";

export function useGambling() {
  // ==========================================================
  // WEBSOCKET
  // ==========================================================

  const socketRef =
    useRef<WebSocket | null>(null);

  const playerIdRef =
    useRef("");

  const logIdRef =
    useRef(0);

  const phaseCountdownIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  // ==========================================================
  // CONNECTION
  // ==========================================================

  const [connected, setConnected] =
    useState(false);

  const [joined, setJoined] =
    useState(false);

  const [roomId, setRoomId] =
    useState("room-123");

  const [playerId, setPlayerId] =
    useState("");

  const [username, setUsername] =
    useState("");

  // ==========================================================
  // LOBBY
  // ==========================================================

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [ready, setReady] =
    useState(false);

  const [countdown, setCountdown] =
    useState<number | null>(null);

  // ==========================================================
  // GAME
  // ==========================================================

  const [gameStarted, setGameStarted] =
    useState(false);

  const [turn, setTurn] =
    useState(0);

  const [state, setState] =
    useState("waiting");

  const [phaseCountdown, setPhaseCountdown] =
    useState<number | null>(null);

  // ==========================================================
  // BET
  // ==========================================================

  const [balance, setBalance] =
    useState(1000);

  const [balanceBefore, setBalanceBefore] =
    useState(1000);

  const [betAmount, setBetAmount] =
    useState(50);

  const [target, setTarget] =
    useState("red");

  const [currentBet, setCurrentBet] =
    useState<Bet | null>(null);

  const [hasBet, setHasBet] =
    useState(false);

  // ==========================================================
  // SCRATCH
  // ==========================================================

  const [ticket, setTicket] =
    useState<Ticket | null>(null);

  // ==========================================================
  // ROULETTE
  // ==========================================================

  const [winningNumber, setWinningNumber] =
    useState<number | null>(null);

  // ==========================================================
  // RESULTS
  // ==========================================================

  const [myResult, setMyResult] =
    useState<Result | null>(null);

  const [results, setResults] =
    useState<Result[]>([]);

  // ==========================================================
  // ERROR / LOGS
  // ==========================================================

  const [error, setError] =
    useState("");

  const [jsonLogs, setJsonLogs] =
    useState<JsonLog[]>([]);

  // ==========================================================
  // COUNTDOWN
  // ==========================================================

  const stopPhaseCountdown = () => {
    if (
      phaseCountdownIntervalRef.current
    ) {
      clearInterval(
        phaseCountdownIntervalRef.current
      );

      phaseCountdownIntervalRef.current =
        null;
    }

    setPhaseCountdown(null);
  };

  const startPhaseCountdown = (
    seconds: number
  ) => {
    stopPhaseCountdown();

    if (
      !Number.isFinite(seconds) ||
      seconds <= 0
    ) {
      setPhaseCountdown(null);
      return;
    }

    let remaining =
      Math.ceil(seconds);

    setPhaseCountdown(
      remaining
    );

    phaseCountdownIntervalRef.current =
      setInterval(() => {
        remaining--;

        if (remaining <= 0) {
          setPhaseCountdown(0);

          if (
            phaseCountdownIntervalRef.current
          ) {
            clearInterval(
              phaseCountdownIntervalRef.current
            );

            phaseCountdownIntervalRef.current =
              null;
          }

          return;
        }

        setPhaseCountdown(
          remaining
        );
      }, 1000);
  };

  // ==========================================================
  // JSON LOG
  // ==========================================================

  const addJsonLog = (
    direction: JsonLog["direction"],
    data: any
  ) => {
    const log: JsonLog = {
      id: ++logIdRef.current,
      direction,
      data,
      timestamp:
        new Date().toLocaleTimeString(),
    };

    console.log(
      `[WS ${direction}]`,
      data
    );

    setJsonLogs((current) => [
      log,
      ...current,
    ]);
  };

  // ==========================================================
  // SEND
  // ==========================================================

  const send = (
    message: object
  ) => {
    const socket =
      socketRef.current;

    if (
      !socket ||
      socket.readyState !==
        WebSocket.OPEN
    ) {
      setError(
        "WebSocket non connecté"
      );

      addJsonLog("system", {
        type: "send_error",
        message:
          "WebSocket non connecté",
      });

      return false;
    }

    addJsonLog(
      "sent",
      message
    );

    socket.send(
      JSON.stringify(message)
    );

    return true;
  };

  // ==========================================================
  // SERVER MESSAGE
  // ==========================================================

  const handleServerMessage = (
    data: ServerMessage
  ) => {
    console.log(
      "SERVER MESSAGE:",
      data
    );

    switch (data.type) {
      // ======================================================
      // CONNECTED
      // ======================================================

      case "connected": {
        const id =
          data.playerId ?? "";

        setPlayerId(id);

        playerIdRef.current =
          id;

        break;
      }

      // ======================================================
      // ROOM JOINED
      // ======================================================

      case "room_joined": {
        const id =
          data.playerId ?? "";

        setJoined(true);

        setPlayerId(id);

        playerIdRef.current =
          id;

        setUsername(
          data.username ?? ""
        );

        if (
          typeof data.balance ===
          "number"
        ) {
          setBalance(
            data.balance
          );

          setBalanceBefore(
            data.balance
          );
        }

        break;
      }

      // ======================================================
      // ROOM STATE
      // ======================================================

      case "room_state": {
        if (
          Array.isArray(
            data.players
          )
        ) {
          setPlayers(
            data.players
          );

          const me =
            data.players.find(
              (p: Player) =>
                p.playerId ===
                playerIdRef.current
            );

          if (me) {
            setReady(
              me.ready
            );

            setBalance(
              me.balance
            );
          }
        }

        break;
      }

      // ======================================================
      // PLAYER JOINED
      // ======================================================

      case "player_joined": {
        setPlayers(
          (current) => {
            if (
              current.some(
                (p) =>
                  p.playerId ===
                  data.playerId
              )
            ) {
              return current;
            }

            return [
              ...current,
              {
                playerId:
                  data.playerId,
                username:
                  data.username ??
                  data.playerId,
                balance:
                  data.balance ??
                  1000,
                ready:
                  data.ready ??
                  false,
              },
            ];
          }
        );

        break;
      }

      // ======================================================
      // PLAYER LEFT
      // ======================================================

      case "player_left": {
        setPlayers(
          (current) =>
            current.filter(
              (p) =>
                p.playerId !==
                data.playerId
            )
        );

        break;
      }

      // ======================================================
      // PLAYER READY
      // ======================================================

      case "player_ready": {
        setPlayers(
          (current) =>
            current.map(
              (player) =>
                player.playerId ===
                data.playerId
                  ? {
                      ...player,
                      ready:
                        data.ready,
                    }
                  : player
            )
        );

        if (
          data.playerId ===
          playerIdRef.current
        ) {
          setReady(
            data.ready
          );
        }

        break;
      }

      // ======================================================
      // GAME STARTING
      // ======================================================

      case "game_starting": {
        setCountdown(
          typeof data.countdown ===
            "number"
            ? data.countdown
            : null
        );

        break;
      }

      // ======================================================
      // GAME STARTED
      // ======================================================

      case "game_started": {
        console.log(
          "GAME STARTED !",
          data
        );

        setGameStarted(
          true
        );

        setCountdown(
          null
        );

        setTurn(
          typeof data.turn ===
            "number"
            ? data.turn
            : 1
        );

        setState(
          "betting"
        );

        setResults([]);

        setMyResult(
          null
        );

        setWinningNumber(
          null
        );

        setCurrentBet(
          null
        );

        setHasBet(
          false
        );

        setTicket(
          null
        );

        startPhaseCountdown(
          typeof data.countdown ===
            "number"
            ? data.countdown
            : 15
        );

        break;
      }

      // ======================================================
      // TURN STARTED
      // ======================================================

      case "turn_started": {
        setGameStarted(
          true
        );

        setTurn(
          typeof data.turn ===
            "number"
            ? data.turn
            : 1
        );

        setState(
          "betting"
        );

        setHasBet(
          false
        );

        setCurrentBet(
          null
        );

        setTicket(
          null
        );

        setWinningNumber(
          null
        );

        setMyResult(
          null
        );

        setResults([]);

        startPhaseCountdown(
          typeof data.countdown ===
            "number"
            ? data.countdown
            : 15
        );

        break;
      }

      // ======================================================
      // BETTING STARTED
      // ======================================================

      case "betting_started": {
        setGameStarted(
          true
        );

        setState(
          "betting"
        );

        if (
          typeof data.turn ===
          "number"
        ) {
          setTurn(
            data.turn
          );
        }

        startPhaseCountdown(
          typeof data.countdown ===
            "number"
            ? data.countdown
            : 15
        );

        break;
      }

      // ======================================================
      // BETTING ENDED
      // ======================================================

      case "betting_ended": {
        setState(
          "scratch"
        );

        startPhaseCountdown(
          typeof data.countdown ===
            "number"
            ? data.countdown
            : 10
        );

        break;
      }

      // ======================================================
      // BET PLACED
      // ======================================================

      case "bet_placed": {
        if (
          data.playerId ===
          playerIdRef.current
        ) {
          setHasBet(
            true
          );

          setCurrentBet({
            chipValue:
              data.chipValue,
            target:
              data.target,
          });

          if (
            typeof data.balance ===
            "number"
          ) {
            setBalance(
              data.balance
            );
          }
        }

        if (
          typeof data.balance ===
          "number"
        ) {
          setPlayers(
            (current) =>
              current.map(
                (player) =>
                  player.playerId ===
                  data.playerId
                    ? {
                        ...player,
                        balance:
                          data.balance,
                      }
                    : player
              )
          );
        }

        break;
      }

      // ======================================================
      // SCRATCH RESULT
      // ======================================================

      case "scratch_result": {
        if (
          data.playerId ===
          playerIdRef.current
        ) {
          setTicket(
            data.ticket
          );
        }

        break;
      }

      // ======================================================
      // SPINNING
      // ======================================================

      case "spinning_started": {
        setState(
          "spinning"
        );

        startPhaseCountdown(
          typeof data.countdown ===
            "number"
            ? data.countdown
            : 5
        );

        break;
      }

      // ======================================================
      // TURN RESOLVED
      // ======================================================

      case "turn_resolved": {
        stopPhaseCountdown();

        setState(
          "resolving"
        );

        if (
          typeof data.turn ===
          "number"
        ) {
          setTurn(
            data.turn
          );
        }

        if (
          typeof data.winningNumber ===
          "number"
        ) {
          setWinningNumber(
            data.winningNumber
          );
        }

        const serverResults: Result[] =
          Array.isArray(
            data.players
          )
            ? data.players
            : [];

        setResults(
          serverResults
        );

        const me =
          serverResults.find(
            (result) =>
              result.playerId ===
              playerIdRef.current
          );

        if (me) {
          setMyResult(
            me
          );

          setBalanceBefore(
            me.balanceBefore
          );

          setBalance(
            me.balanceAfter
          );
        }

        setPlayers(
          (currentPlayers) =>
            currentPlayers.map(
              (player) => {
                const result =
                  serverResults.find(
                    (r) =>
                      r.playerId ===
                      player.playerId
                  );

                if (!result) {
                  return player;
                }

                return {
                  ...player,
                  username:
                    result.username ??
                    player.username,
                  balance:
                    result.balanceAfter,
                };
              }
            )
        );

        break;
      }

      // ======================================================
      // GAME FINISHED
      // ======================================================

      case "game_finished": {
        stopPhaseCountdown();

        setGameStarted(
          false
        );

        setState(
          "finished"
        );

        setCountdown(
          null
        );

        if (
          typeof data.balance ===
          "number"
        ) {
          setBalance(
            data.balance
          );
        }

        break;
      }

      // ======================================================
      // ERROR
      // ======================================================

      case "error": {
        setError(
          data.message ??
            "Erreur serveur"
        );

        break;
      }

      // ======================================================
      // UNKNOWN
      // ======================================================

      default: {
        console.warn(
          "Message serveur inconnu :",
          data
        );

        break;
      }
    }
  };

  // ==========================================================
  // CONNECT
  // ==========================================================

  const connect = () => {
    if (
      socketRef.current &&
      socketRef.current.readyState !==
        WebSocket.CLOSED
    ) {
      return;
    }

    setError("");

    const socket =
      new WebSocket(
        "ws://localhost:8080/ws"
      );

    socket.onopen = () => {
      console.log(
        "WebSocket connecté"
      );

      setConnected(
        true
      );

      addJsonLog(
        "system",
        {
          type:
            "connection_open",
        }
      );
    };

    socket.onmessage = (
      event
    ) => {
      try {
        const data =
          JSON.parse(
            event.data
          );

        addJsonLog(
          "received",
          data
        );

        handleServerMessage(
          data
        );
      } catch (
        parseError
      ) {
        console.error(
          "JSON invalide :",
          event.data,
          parseError
        );

        addJsonLog(
          "system",
          {
            type:
              "invalid_json",
            raw:
              event.data,
          }
        );

        setError(
          "JSON invalide reçu du serveur"
        );
      }
    };

    socket.onerror = (
      event
    ) => {
      console.error(
        "WebSocket error :",
        event
      );

      addJsonLog(
        "system",
        {
          type:
            "connection_error",
        }
      );

      setError(
        "Erreur WebSocket"
      );
    };

    socket.onclose = (
      event
    ) => {
      console.log(
        "WebSocket fermé",
        event.code,
        event.reason
      );

      addJsonLog(
        "system",
        {
          type:
            "connection_closed",
          code:
            event.code,
          reason:
            event.reason,
        }
      );

      setConnected(
        false
      );

      setJoined(
        false
      );

      setGameStarted(
        false
      );

      stopPhaseCountdown();

      socketRef.current =
        null;
    };

    socketRef.current =
      socket;
  };

  // ==========================================================
  // DISCONNECT
  // ==========================================================

  const disconnect = () => {
    const socket =
      socketRef.current;

    if (!socket) {
      return;
    }

    socket.close();

    socketRef.current =
      null;
  };

  // ==========================================================
  // JOIN ROOM
  // ==========================================================

  const joinRoom = () => {
    if (!roomId.trim()) {
      setError(
        "Room ID obligatoire"
      );

      return;
    }

    send({
      type: "join_room",
      roomId:
        roomId.trim(),
    });
  };

  // ==========================================================
  // READY
  // ==========================================================

  const toggleReady = () => {
    if (!joined) {
      return;
    }

    const next =
      !ready;

    // Optimistic UI
    setReady(
      next
    );

    send({
      type:
        "player_ready",
      ready:
        next,
    });
  };

  // ==========================================================
  // BET
  // ==========================================================

  const placeBet = () => {
    if (
      state !==
      "betting"
    ) {
      setError(
        "Les paris sont fermés"
      );

      return;
    }

    if (hasBet) {
      setError(
        "Tu as déjà parié"
      );

      return;
    }

    if (betAmount <= 0) {
      setError(
        "Montant invalide"
      );

      return;
    }

    if (
      betAmount >
      balance
    ) {
      setError(
        "Solde insuffisant"
      );

      return;
    }

    send({
      type:
        "place_bet",
      chipValue:
        betAmount,
      target,
    });
  };

  // ==========================================================
  // SCRATCH
  // ==========================================================

  const scratch = () => {
    if (
      state !==
      "scratch"
    ) {
      setError(
        "Le scratch n'est pas disponible"
      );

      return;
    }

    if (!hasBet) {
      setError(
        "Tu dois d'abord miser"
      );

      return;
    }

    if (ticket) {
      return;
    }

    send({
      type:
        "scratch",
    });
  };

  // ==========================================================
  // CLEAR LOGS
  // ==========================================================

  const clearLogs = () => {
    setJsonLogs([]);
  };

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      socketRef.current?.close();

      if (
        phaseCountdownIntervalRef.current
      ) {
        clearInterval(
          phaseCountdownIntervalRef.current
        );
      }
    };
  }, []);

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    // connection
    connected,
    joined,
    roomId,
    setRoomId,
    playerId,
    username,

    connect,
    disconnect,
    joinRoom,

    // lobby
    players,
    ready,
    toggleReady,
    countdown,

    // game
    gameStarted,
    turn,
    state,

    // timer
    phaseCountdown,

    // money
    balance,
    balanceBefore,

    // betting
    betAmount,
    setBetAmount,
    target,
    setTarget,
    currentBet,
    hasBet,
    placeBet,

    // scratch
    ticket,
    scratch,

    // roulette
    winningNumber,

    // results
    myResult,
    results,

    // misc
    error,

    // websocket debug
    jsonLogs,
    clearLogs,
  };
}