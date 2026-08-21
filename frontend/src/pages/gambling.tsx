import { useEffect, useRef, useState } from "react";

// ============================================================
// TYPES
// ============================================================

type Player = {
  playerId: string;
  username: string;
  balance: number;
  ready: boolean;
};

type Ticket = {
  type: "bonus" | "malus";
  value: number;
};

type Bet = {
  chipValue: number;
  target: string;
};

type Result = {
  playerId: string;
  username?: string;
  result: "win" | "lose" | "tie";
  balanceBefore: number;
  gain: number;
  balanceAfter: number;
};

type ServerMessage = {
  type: string;
  [key: string]: any;
};

type JsonLog = {
  id: number;
  direction: "sent" | "received" | "system";
  data: any;
  timestamp: string;
};

// ============================================================
// COMPONENT
// ============================================================

export default function Gambling() {
  const socketRef = useRef<WebSocket | null>(null);

  /*
   * IMPORTANT :
   *
   * Le WebSocket possède des callbacks qui peuvent conserver
   * une ancienne valeur de playerId.
   *
   * La ref permet d'avoir TOUJOURS le playerId courant.
   */
  const playerIdRef = useRef("");

  const logIdRef = useRef(0);

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

  // ==========================================================
  // GAME PHASE COUNTDOWN
  // ==========================================================

  const [phaseCountdown, setPhaseCountdown] =
    useState<number | null>(null);

  const phaseCountdownIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  // ==========================================================
  // PLAYER MONEY
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
  // ERRORS
  // ==========================================================

  const [error, setError] =
    useState("");

  // ==========================================================
  // JSON DEBUGGER
  // ==========================================================

  const [jsonLogs, setJsonLogs] =
    useState<JsonLog[]>([]);

  // ==========================================================
  // PHASE COUNTDOWN
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
        remaining -= 1;

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
  // LOG JSON
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

    setJsonLogs((current) => [
      log,
      ...current,
    ]);
  };

  // ==========================================================
  // CONNECT
  // ==========================================================

  const connect = () => {
    if (socketRef.current) {
      return;
    }

    setError("");

    const socket = new WebSocket(
      "ws://localhost:8080/ws"
    );

    socket.onopen = () => {
      setConnected(true);

      addJsonLog("system", {
        type:
          "connection_open",
        message:
          "WebSocket connecté",
      });
    };

    socket.onmessage = (event) => {
      try {
        const data: ServerMessage =
          JSON.parse(event.data);

        addJsonLog(
          "received",
          data
        );

        handleServerMessage(
          data
        );
      } catch {
        addJsonLog("system", {
          type:
            "invalid_json",
          raw: event.data,
        });

        setError(
          "JSON invalide reçu du serveur"
        );
      }
    };

    socket.onerror = () => {
      setError(
        "Erreur WebSocket"
      );

      addJsonLog("system", {
        type:
          "websocket_error",
      });
    };

    socket.onclose = () => {
      setConnected(false);
      setJoined(false);
      setGameStarted(false);

      stopPhaseCountdown();

      socketRef.current =
        null;

      addJsonLog("system", {
        type:
          "connection_closed",
        message:
          "WebSocket déconnecté",
      });
    };

    socketRef.current =
      socket;
  };

  // ==========================================================
  // DISCONNECT
  // ==========================================================

  const disconnect = () => {
    socketRef.current?.close();
  };

  // ==========================================================
  // SEND JSON
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
    switch (data.type) {
      // ======================================================
      // CONNECTED
      // ======================================================

      case "connected": {
        const newPlayerId =
          data.playerId ?? "";

        setPlayerId(
          newPlayerId
        );

        playerIdRef.current =
          newPlayerId;

        break;
      }

      // ======================================================
      // ROOM JOINED
      // ======================================================

      case "room_joined": {
        const newPlayerId =
          data.playerId ?? "";

        setJoined(true);

        setPlayerId(
          newPlayerId
        );

        playerIdRef.current =
          newPlayerId;

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
        const newPlayer: Player = {
          playerId:
            data.playerId,
          username:
            data.username,
          balance:
            typeof data.balance ===
            "number"
              ? data.balance
              : 1000,
          ready:
            data.ready ??
            false,
        };

        setPlayers(
          (current) => {
            const exists =
              current.some(
                (p) =>
                  p.playerId ===
                  newPlayer.playerId
              );

            if (exists) {
              return current;
            }

            return [
              ...current,
              newPlayer,
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
      // ROOM READY STATE
      // ======================================================

      case "room_ready_state": {
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
        setGameStarted(
          true
        );

        setCountdown(null);

        setTurn(
          data.turn ?? 1
        );

        setState(
          "betting"
        );

        setResults([]);

        setMyResult(null);

        setWinningNumber(
          null
        );

        setCurrentBet(
          null
        );

        setHasBet(false);

        setTicket(null);

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
          data.turn
        );

        setState(
          "betting"
        );

        setHasBet(false);

        setCurrentBet(
          null
        );

        setTicket(null);

        setWinningNumber(
          null
        );

        setMyResult(null);

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
        /*
         * IMPORTANT :
         *
         * On compare avec playerIdRef.current
         * et non avec playerId provenant de la
         * closure du WebSocket.
         */

        if (
          data.playerId ===
          playerIdRef.current
        ) {
          setHasBet(true);

          setCurrentBet({
            chipValue:
              data.chipValue,
            target:
              data.target,
          });

          /*
           * Le serveur est la source
           * de vérité du solde.
           */

          if (
            typeof data.balance ===
            "number"
          ) {
            setBalance(
              data.balance
            );
          }
        }

        /*
         * Mise à jour de la liste
         * des joueurs.
         */

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
      // PLAYER BET PLACED
      // ======================================================

      case "player_bet_placed": {
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
          const receivedTicket =
            data.ticket as Ticket;

          setTicket(
            receivedTicket
          );
        }

        break;
      }

      // ======================================================
      // SPINNING STARTED
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
      // ======================================================
      // TURN RESOLVED
      // ======================================================

      case "turn_resolved": {
        /*
         * La roulette vient de donner son résultat.
         *
         * Le serveur est la source de vérité.
         */

        stopPhaseCountdown();

        setState("resolving");

        // ----------------------------------------------------
        // TURN
        // ----------------------------------------------------

        if (typeof data.turn === "number") {
          setTurn(data.turn);
        }

        // ----------------------------------------------------
        // WINNING NUMBER
        // ----------------------------------------------------

        if (
          typeof data.winningNumber ===
          "number"
        ) {
          setWinningNumber(
            data.winningNumber
          );
        }

        // ----------------------------------------------------
        // RESULTS
        // ----------------------------------------------------

        const serverResults: Result[] =
          Array.isArray(data.players)
            ? data.players
            : [];

        setResults(
          serverResults
        );

        // ----------------------------------------------------
        // CURRENT PLAYER ID
        // ----------------------------------------------------

        const currentPlayerId =
          playerIdRef.current;

        /*
         * Recherche du joueur actuel.
         *
         * On utilise playerIdRef.current
         * plutôt que directement playerId,
         * afin d'éviter un problème de closure
         * avec les messages WebSocket.
         */

        const me =
          serverResults.find(
            (result: Result) =>
              result.playerId ===
              currentPlayerId
          );

        // ----------------------------------------------------
        // MY BALANCE
        // ----------------------------------------------------

        if (me) {
          /*
           * Résultat personnel.
           */

          setMyResult(me);

          /*
           * Solde AVANT le pari.
           */

          setBalanceBefore(
            me.balanceBefore
          );

          /*
           * IMPORTANT :
           *
           * C'est le solde FINAL fourni
           * par le serveur.
           *
           * Exemple :
           *
           * balanceBefore = 1000
           * gain          = +500
           * balanceAfter  = 1500
           *
           * Le frontend doit donc afficher 1500.
           */

          setBalance(
            me.balanceAfter
          );
        }

        // ----------------------------------------------------
        // PLAYERS BALANCES
        // ----------------------------------------------------

        /*
         * Une seule mise à jour de players.
         *
         * On synchronise chaque joueur
         * avec balanceAfter envoyé par le serveur.
         */

        setPlayers(
          (currentPlayers) => {
            /*
             * Si on possède déjà des joueurs
             * dans la room, on met simplement
             * leurs soldes à jour.
             */

            if (
              currentPlayers.length > 0
            ) {
              return currentPlayers.map(
                (player) => {
                  const result =
                    serverResults.find(
                      (r: Result) =>
                        r.playerId ===
                        player.playerId
                    );

                  if (!result) {
                    return player;
                  }

                  return {
                    ...player,

                    /*
                     * Le username du serveur
                     * est prioritaire.
                     */

                    username:
                      result.username ??
                      player.username,

                    /*
                     * IMPORTANT :
                     * solde définitif serveur.
                     */

                    balance:
                      result.balanceAfter,
                  };
                }
              );
            }

            /*
             * Si players est vide mais que
             * le serveur nous donne les résultats,
             * on peut reconstruire la liste.
             */

            return serverResults.map(
              (result) => ({
                playerId:
                  result.playerId,

                username:
                  result.username ??
                  result.playerId,

                balance:
                  result.balanceAfter,

                ready: false,
              })
            );
          }
        );

        // ----------------------------------------------------
        // DEBUG
        // ----------------------------------------------------

        addJsonLog(
          "system",
          {
            type:
              "balance_synchronized",

            playerId:
              currentPlayerId,

            found:
              !!me,

            balanceBefore:
              me?.balanceBefore ??
              null,

            gain:
              me?.gain ??
              null,

            balanceAfter:
              me?.balanceAfter ??
              null,
          }
        );

        /*
         * Si "found" vaut false dans les logs,
         * alors le problème vient du playerId :
         *
         * playerIdRef.current
         *
         * ne correspond pas au playerId
         * envoyé dans turn_resolved.
         */

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

        setCountdown(null);

        /*
         * Si le serveur envoie le solde
         * final directement, on le prend.
         */

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
          data.message ||
            "Erreur serveur"
        );

        break;
      }

      // ======================================================
      // DEFAULT
      // ======================================================

      default: {
        break;
      }
    }
  };

  // ==========================================================
  // JOIN
  // ==========================================================

  const joinRoom = () => {
    if (!roomId.trim()) {
      setError(
        "Room ID obligatoire"
      );

      return;
    }

    send({
      type:
        "join_room",
      roomId,
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

    setReady(next);

    send({
      type:
        "player_ready",
      ready: next,
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

    if (
      phaseCountdown ===
      0
    ) {
      setError(
        "Le temps des paris est terminé"
      );

      return;
    }

    if (
      betAmount <=
      0
    ) {
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

    const success =
      send({
        type:
          "place_bet",
        chipValue:
          betAmount,
        target,
      });

    if (!success) {
      return;
    }
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

    if (
      phaseCountdown ===
      0
    ) {
      setError(
        "Le temps du scratch est terminé"
      );

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
  // HELPERS
  // ==========================================================

  const getTargetLabel = (
    value: string
  ) => {
    switch (value) {
      case "red":
        return "🔴 Rouge";

      case "green":
        return "⚫ Noir";

      case "odd":
        return "Impair";

      case "even":
        return "Pair";

      default:
        return `🎯 ${value}`;
    }
  };

  const getTicketLabel = (
    currentTicket: Ticket
  ) => {
    if (
      currentTicket.type ===
      "bonus"
    ) {
      return "🎁 BONUS";
    }

    return "💀 MALUS";
  };

  const getPhaseLabel = () => {
    switch (state) {
      case "betting":
        return "🎰 PARIS";

      case "scratch":
        return "✨ TICKET À GRATTER";

      case "spinning":
        return "🎡 ROULETTE";

      case "resolving":
        return "🏆 RÉSULTAT";

      case "finished":
        return "🏁 PARTIE TERMINÉE";

      default:
        return state;
    }
  };

  // ==========================================================
  // LOBBY
  // ==========================================================

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">

        <div className="mx-auto max-w-6xl">

          {/* HEADER */}

          <div className="mb-8">

            <h1 className="text-4xl font-black">
              🎰 Roulette
            </h1>

            <p className="mt-1 text-slate-500">
              Lobby
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
              {error}
            </div>
          )}

          {/* CONNECTION */}

          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-xl font-black">
              Connexion
            </h2>

            <div className="flex flex-col gap-3 md:flex-row">

              <input
                value={roomId}
                onChange={(e) =>
                  setRoomId(
                    e.target.value
                  )
                }
                placeholder="Room ID"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />

              {!connected ? (
                <button
                  onClick={
                    connect
                  }
                  className="rounded-xl bg-green-600 px-6 py-3 font-black hover:bg-green-500"
                >
                  CONNECTER
                </button>
              ) : (
                <button
                  onClick={
                    disconnect
                  }
                  className="rounded-xl bg-red-600 px-6 py-3 font-black hover:bg-red-500"
                >
                  DÉCONNECTER
                </button>
              )}

              <button
                onClick={
                  joinRoom
                }
                disabled={
                  !connected ||
                  joined
                }
                className="rounded-xl bg-blue-600 px-6 py-3 font-black hover:bg-blue-500 disabled:opacity-30"
              >
                REJOINDRE
              </button>

            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">

              <span
                className={`h-3 w-3 rounded-full ${
                  connected
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />

              <span>
                {connected
                  ? "WebSocket connecté"
                  : "WebSocket déconnecté"}
              </span>

            </div>

          </div>

          {/* PLAYERS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <h2 className="text-2xl font-black">
                  Joueurs
                </h2>

                <p className="text-slate-500">

                  {
                    players.filter(
                      (p) =>
                        p.ready
                    ).length
                  }{" "}
                  /{" "}
                  {
                    players.length
                  }{" "}
                  prêts

                </p>

              </div>

              {joined && (
                <button
                  onClick={
                    toggleReady
                  }
                  className={`rounded-xl px-8 py-4 font-black transition ${
                    ready
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {ready
                    ? "✓ READY"
                    : "SE METTRE READY"}
                </button>
              )}

            </div>

            <div className="space-y-3">

              {players.length ===
                0 && (
                <div className="rounded-xl bg-slate-800 p-8 text-center text-slate-500">
                  Aucun joueur dans la room.
                </div>
              )}

              {players.map(
                (player) => (
                  <div
                    key={
                      player.playerId
                    }
                    className="flex items-center justify-between rounded-xl bg-slate-800 p-5"
                  >

                    <div>

                      <div className="font-black">

                        {
                          player.username
                        }

                        {player.playerId ===
                          playerIdRef.current && (
                          <span className="ml-2 text-blue-400">
                            (toi)
                          </span>
                        )}

                      </div>

                      <div className="mt-1 font-mono text-xs text-slate-500">
                        {
                          player.playerId
                        }
                      </div>

                    </div>

                    <div className="text-right">

                      <div
                        className={`font-black ${
                          player.ready
                            ? "text-green-400"
                            : "text-slate-500"
                        }`}
                      >
                        {player.ready
                          ? "✓ READY"
                          : "WAITING"}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {
                          player.balance
                        }{" "}
                        crédits
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

          {/* LOBBY COUNTDOWN */}

          {countdown !==
            null && (
            <div className="mt-6 rounded-2xl border border-yellow-700 bg-yellow-950 p-10 text-center">

              <div className="text-sm font-bold uppercase text-yellow-400">
                Partie en préparation
              </div>

              <div className="mt-2 text-7xl font-black text-yellow-300">
                {countdown}
              </div>

              <div className="mt-2 text-yellow-600">
                secondes
              </div>

            </div>
          )}

          {/* JSON DEBUG */}

          <JsonDebugger
            logs={jsonLogs}
            clearLogs={
              clearLogs
            }
          />

        </div>

      </div>
    );
  }

  // ==========================================================
  // GAME
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-4xl font-black">
              🎰 Roulette
            </h1>

            <div className="mt-1 text-slate-500">
              Tour{" "}
              {turn} / 5
            </div>

          </div>

          <div className="rounded-2xl border border-yellow-700 bg-yellow-950 px-8 py-4 text-right">

            <div className="text-xs uppercase text-yellow-600">
              Ton solde
            </div>

            <div className="text-4xl font-black text-yellow-400">
              {balance}
            </div>

            <div className="text-xs text-yellow-700">
              crédits
            </div>

          </div>

        </div>

        {/* =====================================================
            PHASE
        ====================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center">

          <div>

            <span className="text-slate-500">
              Phase :
            </span>

            <span className="ml-3 text-xl font-black text-blue-400">
              {
                getPhaseLabel()
              }
            </span>

          </div>

          {phaseCountdown !==
            null && (
            <div
              className={`mt-5 rounded-xl border p-5 transition-all ${
                phaseCountdown <=
                3
                  ? "border-red-700 bg-red-950"
                  : phaseCountdown <=
                    5
                  ? "border-orange-700 bg-orange-950"
                  : "border-yellow-700 bg-yellow-950"
              }`}
            >

              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                Temps restant
              </div>

              <div
                className={`mt-1 font-mono text-6xl font-black ${
                  phaseCountdown <=
                  3
                    ? "text-red-400"
                    : phaseCountdown <=
                      5
                    ? "text-orange-400"
                    : "text-yellow-400"
                }`}
              >
                {
                  phaseCountdown
                }

                <span className="ml-2 text-2xl">
                  s
                </span>

              </div>

            </div>
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* MAIN GAME */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ROULETTE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <h2 className="mb-8 text-2xl font-black">
              Roulette
            </h2>

            <div className="flex justify-center">

              <div
                className={`flex h-72 w-72 items-center justify-center rounded-full border-[16px] border-slate-700 transition-all ${
                  winningNumber ===
                  0
                    ? "bg-green-700"
                    : winningNumber !==
                        null &&
                      winningNumber %
                        2 !==
                        0
                    ? "bg-red-700"
                    : "bg-slate-950"
                }`}
              >

                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-slate-900 text-6xl font-black">

                  {
                    winningNumber ??
                    "?"
                  }

                </div>

              </div>

            </div>

            {state ===
              "spinning" && (
              <div className="mt-8 rounded-xl border border-purple-700 bg-purple-950 p-5 text-center">

                <div className="text-sm font-black uppercase text-purple-400">
                  🎡 Roulette en cours
                </div>

                {phaseCountdown !==
                  null && (
                  <div className="mt-2 text-4xl font-black text-purple-300">
                    {
                      phaseCountdown
                    }
                    s
                  </div>
                )}

              </div>
            )}

            {winningNumber !==
              null && (
              <div className="mt-8 rounded-xl bg-slate-800 p-6 text-center">

                <div className="text-sm text-slate-500">
                  NUMÉRO GAGNANT
                </div>

                <div className="mt-2 text-6xl font-black">
                  {
                    winningNumber
                  }
                </div>

              </div>
            )}

          </div>

          {/* BET */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <h2 className="mb-6 text-2xl font-black">
              Ton pari
            </h2>

            {/* BALANCE */}

            <div className="mb-5 rounded-xl bg-slate-950 p-5">

              <div className="text-sm text-slate-500">
                Solde disponible
              </div>

              <div className="text-3xl font-black text-yellow-400">
                {
                  balance
                }
              </div>

            </div>

            {/* AMOUNT */}

            <label className="mb-2 block text-sm text-slate-400">
              Montant
            </label>

            <input
              type="number"
              min={1}
              value={
                betAmount
              }
              onChange={(e) =>
                setBetAmount(
                  Number(
                    e.target.value
                  )
                )
              }
              disabled={
                hasBet ||
                state !==
                  "betting"
              }
              className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-2xl font-black outline-none disabled:opacity-50"
            />

            {/* TARGET */}

            <label className="mb-3 block text-sm text-slate-400">
              Pari
            </label>

            <div className="grid grid-cols-2 gap-3">

              {[
                [
                  "red",
                  "🔴 Rouge",
                ],
                [
                  "green",
                  "⚫ Noir",
                ],
                [
                  "odd",
                  "Impair",
                ],
                [
                  "even",
                  "Pair",
                ],
              ].map(
                ([value, label]) => (
                  <button
                    key={
                      value
                    }
                    disabled={
                      hasBet ||
                      state !==
                        "betting"
                    }
                    onClick={() =>
                      setTarget(
                        value
                      )
                    }
                    className={`rounded-xl p-4 font-black ${
                      target ===
                      value
                        ? "bg-blue-600"
                        : "bg-slate-800"
                    } disabled:opacity-40`}
                  >
                    {
                      label
                    }
                  </button>
                )
              )}

            </div>

            {/* NUMBERS */}

            <div className="mt-4 grid grid-cols-7 gap-2">

              {Array.from(
                {
                  length: 22,
                },
                (_, i) =>
                  i
              ).map(
                (number) => (
                  <button
                    key={
                      number
                    }
                    disabled={
                      hasBet ||
                      state !==
                        "betting"
                    }
                    onClick={() =>
                      setTarget(
                        String(
                          number
                        )
                      )
                    }
                    className={`rounded-lg p-2 text-sm font-black ${
                      target ===
                      String(
                        number
                      )
                        ? "bg-blue-600"
                        : number ===
                          0
                        ? "bg-green-700"
                        : number %
                            2 !==
                          0
                        ? "bg-red-700"
                        : "bg-slate-800"
                    } disabled:opacity-40`}
                  >
                    {
                      number
                    }
                  </button>
                )
              )}

            </div>

            {/* CURRENT BET */}

            <div className="mt-5 rounded-xl bg-slate-950 p-5">

              <div className="text-sm text-slate-500">
                Mise actuelle
              </div>

              <div className="mt-1 text-xl font-black">
                {currentBet
                  ? `${currentBet.chipValue} crédits`
                  : `${betAmount} crédits`}
              </div>

              <div className="mt-1 text-slate-400">

                sur{" "}

                <span className="font-black text-white">
                  {
                    getTargetLabel(
                      currentBet?.target ??
                        target
                    )
                  }
                </span>

              </div>

            </div>

            {/* BET BUTTON */}

            <button
              onClick={
                placeBet
              }
              disabled={
                state !==
                  "betting" ||
                hasBet ||
                betAmount <=
                  0 ||
                betAmount >
                  balance ||
                phaseCountdown ===
                  0
              }
              className="mt-4 w-full rounded-xl bg-purple-600 p-4 text-xl font-black hover:bg-purple-500 disabled:opacity-30"
            >
              {hasBet
                ? "✓ MISE PLACÉE"
                : `🎰 MISER ${betAmount}`}
            </button>

            {/* SCRATCH */}

            <button
              onClick={
                scratch
              }
              disabled={
                state !==
                  "scratch" ||
                !hasBet ||
                !!ticket ||
                phaseCountdown ===
                  0
              }
              className="mt-3 w-full rounded-xl border border-yellow-600 bg-yellow-950 p-4 font-black text-yellow-400 hover:bg-yellow-900 disabled:opacity-30"
            >
              {ticket
                ? "✓ TICKET GRATÉ"
                : "✨ GRATTER LE TICKET"}
            </button>

            {/* TICKET */}

            {ticket && (
              <div
                className={`mt-5 rounded-2xl border p-6 text-center ${
                  ticket.type ===
                  "bonus"
                    ? "border-green-700 bg-green-950"
                    : "border-red-700 bg-red-950"
                }`}
              >

                <div className="text-sm uppercase text-slate-400">
                  Ton ticket
                </div>

                <div className="mt-2 text-4xl font-black">
                  {
                    getTicketLabel(
                      ticket
                    )
                  }
                </div>

                <div className="mt-3 text-2xl font-black">

                  {ticket.value >=
                  0
                    ? "+"
                    : ""}

                  {(
                    ticket.value *
                    100
                  ).toFixed(0)}

                  %

                </div>

                <div className="mt-2 text-sm text-slate-400">
                  Ce bonus/malus sera
                  appliqué au gain du
                  pari.
                </div>

              </div>
            )}

          </div>

        </div>

        {/* =====================================================
            MY RESULT
        ====================================================== */}

        {myResult && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-2xl font-black">
              Mon résultat
            </h2>

            <div className="grid gap-4 md:grid-cols-4">

              <InfoCard
                label="Résultat"
                value={
                  myResult.result
                }
                color={
                  myResult.result ===
                  "win"
                    ? "text-green-400"
                    : myResult.result ===
                      "lose"
                    ? "text-red-400"
                    : "text-yellow-400"
                }
              />

              <InfoCard
                label="Solde avant"
                value={
                  myResult.balanceBefore
                }
              />

              <InfoCard
                label="Gain"
                value={`${
                  myResult.gain >=
                  0
                    ? "+"
                    : ""
                }${
                  myResult.gain
                }`}
                color={
                  myResult.gain >=
                  0
                    ? "text-green-400"
                    : "text-red-400"
                }
              />

              <InfoCard
                label="Solde après"
                value={
                  myResult.balanceAfter
                }
                color="text-yellow-400"
              />

            </div>

          </div>
        )}

        {/* =====================================================
            RESULTS
        ====================================================== */}

        {results.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-2xl font-black">
              🏆 Résultats du tour
            </h2>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-800">

                  <tr>

                    <th className="p-4 text-left">
                      Joueur
                    </th>

                    <th className="p-4">
                      Résultat
                    </th>

                    <th className="p-4">
                      Avant
                    </th>

                    <th className="p-4">
                      Gain
                    </th>

                    <th className="p-4">
                      Après
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {results.map(
                    (result) => (
                      <tr
                        key={
                          result.playerId
                        }
                        className="border-t border-slate-800"
                      >

                        <td className="p-4 font-black">

                          {
                            result.username ??
                            result.playerId
                          }

                          {result.playerId ===
                            playerIdRef.current && (
                            <span className="ml-2 text-blue-400">
                              (toi)
                            </span>
                          )}

                        </td>

                        <td
                          className={`p-4 text-center font-black ${
                            result.result ===
                            "win"
                              ? "text-green-400"
                              : result.result ===
                                "lose"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {
                            result.result
                          }
                        </td>

                        <td className="p-4 text-center">
                          {
                            result.balanceBefore
                          }
                        </td>

                        <td
                          className={`p-4 text-center font-black ${
                            result.gain >=
                            0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {result.gain >=
                          0
                            ? "+"
                            : ""}
                          {
                            result.gain
                          }
                        </td>

                        <td className="p-4 text-center font-black text-yellow-400">
                          {
                            result.balanceAfter
                          }
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {/* =====================================================
            JSON DEBUGGER
        ====================================================== */}

        <JsonDebugger
          logs={jsonLogs}
          clearLogs={
            clearLogs
          }
        />

      </div>

    </div>
  );
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-5">

      <div className="text-sm text-slate-500">
        {label}
      </div>

      <div
        className={`mt-2 text-2xl font-black ${color}`}
      >
        {value}
      </div>

    </div>
  );
}

// ============================================================
// JSON DEBUGGER
// ============================================================

function JsonDebugger({
  logs,
  clearLogs,
}: {
  logs: JsonLog[];
  clearLogs: () => void;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="mb-5 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-black">
            WebSocket JSON
          </h2>

          <p className="text-sm text-slate-500">
            Vert = envoyé · Bleu = reçu
          </p>

        </div>

        <button
          onClick={
            clearLogs
          }
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold hover:bg-slate-700"
        >
          Vider
        </button>

      </div>

      <div className="max-h-[600px] space-y-3 overflow-y-auto">

        {logs.length ===
          0 && (
          <div className="rounded-xl bg-slate-950 p-8 text-center text-slate-600">
            Aucun JSON
          </div>
        )}

        {logs.map(
          (log) => {
            const isSent =
              log.direction ===
              "sent";

            const isReceived =
              log.direction ===
              "received";

            return (
              <div
                key={
                  log.id
                }
                className={`rounded-xl border p-4 ${
                  isSent
                    ? "border-green-800 bg-green-950/40"
                    : isReceived
                    ? "border-blue-800 bg-blue-950/40"
                    : "border-slate-700 bg-slate-950"
                }`}
              >

                <div className="mb-2 flex items-center justify-between">

                  <div
                    className={`text-xs font-black uppercase ${
                      isSent
                        ? "text-green-400"
                        : isReceived
                        ? "text-blue-400"
                        : "text-slate-400"
                    }`}
                  >
                    {isSent
                      ? "↑ ENVOYÉ"
                      : isReceived
                      ? "↓ REÇU"
                      : "SYSTEM"}
                  </div>

                  <div className="text-xs text-slate-600">
                    #{log.id} ·{" "}
                    {
                      log.timestamp
                    }
                  </div>

                </div>

                <pre
                  className={`overflow-x-auto whitespace-pre-wrap break-words text-xs ${
                    isSent
                      ? "text-green-300"
                      : isReceived
                      ? "text-blue-300"
                      : "text-slate-400"
                  }`}
                >
                  {JSON.stringify(
                    log.data,
                    null,
                    2
                  )}
                </pre>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}