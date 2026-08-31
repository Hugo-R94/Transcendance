import { useEffect, useRef, useState } from "react";
import api from "../api/api";

import {
    type Player,
    type Ticket,
    type Bet,
    type Result,
    type ServerMessage,
    type JsonLog,
   	type PlayerBet,
} from "../api/gambling";
export function useGambling() {
    const socketRef = useRef<WebSocket | null>(null);


    const playerIdRef = useRef("");
    const playerNumberRef = useRef(0);

    const logIdRef = useRef(0);

    const phaseCountdownIntervalRef =
        useRef<ReturnType<typeof setInterval> | null>(null);

    const [connected, setConnected] = useState(false);
    const [joined, setJoined] = useState(false);

    const [roomId, setRoomId] = useState("room-123");

    const [playerId, setPlayerId] = useState("");
    const [playerNumber, setPlayerNumber] = useState(0);
    const [username, setUsername] = useState("");

    const [players, setPlayers] = useState<Player[]>([]);
    const [ready, setReady] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    const [gameStarted, setGameStarted] = useState(false);
    const [turn, setTurn] = useState<number>(0);
    const [state, setState] = useState("waiting");
    const [phaseCountdown, setPhaseCountdown] =
        useState<number | null>(null);

    const [rotationDegree, setRotationDegree] =
        useState<number | null>(null);

    const [balance, setBalance] = useState(1000);
    const [balanceBefore, setBalanceBefore] = useState(1000);
    const [betAmount, setBetAmount] = useState(50);
    const [target, setTarget] = useState("red");
    const [currentBet, setCurrentBet] = useState<Bet | null>(null);
    const [hasBet, setHasBet] = useState(false);
    const [playerBets, setPlayerBets] = useState<PlayerBet[]>([]);

    const [ticket, setTicket] = useState<Ticket | null>(null);

    const [winningNumber, setWinningNumber] =
        useState<number | null>(null);

    const [myResult, setMyResult] = useState<Result | null>(null);
    const [results, setResults] = useState<Result[]>([]);

    const [error, setError] = useState("");
    const [jsonLogs, setJsonLogs] = useState<JsonLog[]>([]);

    const stopPhaseCountdown = () => {
        if (phaseCountdownIntervalRef.current) {
            clearInterval(
                phaseCountdownIntervalRef.current
            );

            phaseCountdownIntervalRef.current = null;
        }

        setPhaseCountdown(null);
    };

    const startPhaseCountdown = (seconds: number) => {
        stopPhaseCountdown();

        if (!Number.isFinite(seconds) || seconds <= 0) {
            setPhaseCountdown(null);
            return;
        }

        let remaining = Math.ceil(seconds);

        setPhaseCountdown(remaining);

        phaseCountdownIntervalRef.current = setInterval(() => {
            remaining--;

            if (remaining <= 0) {
                setPhaseCountdown(0);

                if (phaseCountdownIntervalRef.current) {
                    clearInterval(
                        phaseCountdownIntervalRef.current
                    );

                    phaseCountdownIntervalRef.current = null;
                }

                return;
            }

            setPhaseCountdown(remaining);
        }, 1000);
    };

    const addJsonLog = (
        direction: JsonLog["direction"],
        data: any
    ) => {
        const log: JsonLog = {
            id: ++logIdRef.current,
            direction,
            data,
            timestamp: new Date().toLocaleTimeString(),
        };

        console.log(`[WS ${direction}]`, data);

        setJsonLogs((current) => [
            log,
            ...current,
        ]);
    };

    const send = (message: object) => {
        const socket = socketRef.current;

        if (
            !socket ||
            socket.readyState !== WebSocket.OPEN
        ) {
            setError("WebSocket non connecté");

            addJsonLog("system", {
                type: "send_error",
                message: "WebSocket non connecté",
            });

            return false;
        }

        addJsonLog("sent", message);

        socket.send(
            JSON.stringify(message)
        );

        return true;
    };

    const handleServerMessage = (
        data: ServerMessage
    ) => {
        switch (data.type) {
            case "connected": {
                const id = data.playerId ?? "";

                setPlayerId(id);
                playerIdRef.current = id;

                break;
            }

            case "room_joined": {
                const id = data.playerId ?? "";

                setJoined(true);
                setPlayerId(id);
                playerIdRef.current = id;

                setUsername(
                    data.username ?? ""
                );

                if (
                    typeof data.playerNumber ===
                    "number"
                ) {
                    setPlayerNumber(
                        data.playerNumber
                    );

                    playerNumberRef.current =
                        data.playerNumber;
                }

                if (
                    typeof data.balance ===
                    "number"
                ) {
                    setBalance(data.balance);
                    setBalanceBefore(data.balance);
                }

                break;
            }

            case "room_state": {
                if (
                    Array.isArray(data.players)
                ) {
                    setPlayers(data.players);

                    const me =
                        data.players.find(
                            (p: Player) =>
                                p.playerId ===
                                playerIdRef.current
                        );

                    if (me) {
                        setReady(me.ready);
                        setBalance(me.balance);

                        if (
                            typeof me.playerNumber ===
                            "number"
                        ) {
                            setPlayerNumber(
                                me.playerNumber
                            );

                            playerNumberRef.current =
                                me.playerNumber;
                        }
                    }
                }

                break;
            }

            case "player_joined": {
                setPlayers((current) => {
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
                                data.playerId ?? "",

                            playerNumber:
                                typeof data.playerNumber ===
                                "number"
                                    ? data.playerNumber
                                    : 0,

                            username:
                                data.username ??
                                data.playerId ??
                                "Player",

                            balance:
                                typeof data.balance ===
                                "number"
                                    ? data.balance
                                    : 1000,

                            ready:
                                data.ready ?? false,
                        },
                    ];
                });

                break;
            }

            case "player_left": {
                setPlayers((current) =>
                    current.filter(
                        (p) =>
                            p.playerId !==
                            data.playerId
                    )
                );

                setPlayerBets((current) =>
                    current.filter(
                        (bet) =>
                            bet.playerId !==
                            data.playerId
                    )
                );

                break;
            }

            case "player_ready": {
                setPlayers((current) =>
                    current.map((player) =>
                        player.playerId ===
                        data.playerId
                            ? {
                                ...player,
                                ready:
                                    data.ready ??
                                    false,
                            }
                            : player
                    )
                );

                if (
                    data.playerId ===
                    playerIdRef.current
                ) {
                    setReady(
                        data.ready ?? false
                    );
                }

                break;
            }

            case "game_starting": {
                setCountdown(
                    typeof data.countdown ===
                    "number"
                        ? data.countdown
                        : null
                );

                break;
            }

            case "game_started": {
                setGameStarted(true);
                setCountdown(null);
                setState("betting");
                setResults([]);
                setMyResult(null);
                setWinningNumber(null);
                setCurrentBet(null);
                setHasBet(false);
                setTicket(null);
                setPlayerBets([]);

                startPhaseCountdown(
                    typeof data.countdown ===
                    "number"
                        ? data.countdown
                        : 15
                );

                break;
            }

            case "turn_started": {
                setGameStarted(true);

                if (
                    typeof data.turn ===
                    "number"
                ) {
                    setTurn(data.turn);
                }

                setState("betting");
                setHasBet(false);
                setCurrentBet(null);
                setTicket(null);
                setWinningNumber(null);
                setMyResult(null);
                setResults([]);
                setBetAmount(100);
                setTarget("0");
                setPlayerBets([]);

                startPhaseCountdown(
                    typeof data.countdown ===
                    "number"
                        ? data.countdown
                        : 15
                );

                break;
            }

            case "betting_started": {
                setGameStarted(true);
                setState("betting");

                startPhaseCountdown(
                    typeof data.countdown ===
                    "number"
                        ? data.countdown
                        : 15
                );

                break;
            }

            case "betting_ended": {
                setState("scratch");

                startPhaseCountdown(
                    typeof data.countdown ===
                    "number"
                        ? data.countdown
                        : 10
                );

                break;
            }

            case "bet_placed": {
                const newBet: PlayerBet = {
                    playerId:
                        data.playerId ?? "",

                    playerNumber:
                        typeof data.playerNumber ===
                        "number"
                            ? data.playerNumber
                            : 0,

                    chipValue:
                        typeof data.chipValue ===
                        "number"
                            ? data.chipValue
                            : 0,

                    target:
                        data.target ?? "",
                };

                setPlayerBets((current) => [
                    ...current.filter(
                        (bet) =>
                            bet.playerId !==
                            data.playerId
                    ),
                    newBet,
                ]);

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
                    setPlayers((current) =>
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

            case "scratch_result": {
                if (
                    data.playerId ===
                    playerIdRef.current
                ) {
                    setTicket(data.ticket);
                }

                break;
            }

            case "spinning_started": {
                setState("spinning");

                setWinningNumber(
                    typeof data.winning_number ===
                    "number"
                        ? data.winning_number
                        : null
                );

                setRotationDegree(
                    typeof data.rotation_degree ===
                    "number"
                        ? data.rotation_degree
                        : null
                );

                startPhaseCountdown(
                    typeof data.duration ===
                    "number"
                        ? data.duration
                        : 3
                );

                break;
            }

            case "turn_resolved": {
                stopPhaseCountdown();

                setState("resolving");

                const serverResults: Result[] =
                    Array.isArray(data.players)
                        ? data.players
                        : [];

                setResults(serverResults);

                const me =
                    serverResults.find(
                        (result) =>
                            result.playerId ===
                            playerIdRef.current
                    );

                if (me) {
                    setMyResult(me);
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

            case "game_finished": {
                stopPhaseCountdown();

                setGameStarted(false);
                setReady(false);
                setState("finished");
                setCountdown(null);
                setPlayerBets([]);

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

            case "error": {
                setError(
                    data.message ??
                    "Erreur serveur"
                );

                break;
            }

            default: {
                console.warn(
                    "Message serveur inconnu :",
                    data
                );

                break;
            }
        }
    };

    const fetchWebSocketToken =
        async (): Promise<string | null> => {
            try {
                const res =
                    await api.get("/wstoken");

                const token =
                    res.data?.token;

                if (!token) {
                    console.error(
                        "[GAMBLING] Aucun token WebSocket reçu."
                    );

                    return null;
                }

                return String(token);
            } catch (err: any) {
                console.error(
                    "[GAMBLING] Erreur récupération token WebSocket :",
                    err.response?.data ||
                        err.message
                );

                return null;
            }
        };

    const getWebSocketUrl = (
        wsToken: string
    ) => {
        const baseURL =
            api.defaults.baseURL;

        if (!baseURL) {
            return null;
        }

        try {
            const base = new URL(
                baseURL,
                window.location.origin
            );

            const wsProtocol =
                base.protocol === "https:"
                    ? "wss:"
                    : "ws:";

            const url = new URL(
                `${wsProtocol}//${base.host}/gamble/ws`
            );

            url.searchParams.set(
                "token",
                wsToken
            );

            return url.toString();
        } catch (err) {
            console.error(
                "[GAMBLING] Erreur URL WebSocket :",
                err
            );

            return null;
        }
    };

    const connect = async () => {
        if (
            socketRef.current &&
            socketRef.current.readyState !==
                WebSocket.CLOSED
        ) {
            return;
        }

        setError("");

        const jwt =
            localStorage.getItem("token");

        if (!jwt) {
            setError(
                "Token JWT manquant"
            );

            addJsonLog("system", {
                type: "connection_error",
                message:
                    "Token JWT manquant",
            });

            return;
        }

        const wsToken =
            await fetchWebSocketToken();

        if (!wsToken) {
            setError(
                "Impossible d'obtenir le token WebSocket"
            );

            addJsonLog("system", {
                type: "connection_error",
                message:
                    "Impossible d'obtenir le token WebSocket",
            });

            return;
        }

        const url =
            getWebSocketUrl(wsToken);

        if (!url) {
            setError(
                "Impossible de construire l'URL WebSocket"
            );

            addJsonLog("system", {
                type: "connection_error",
                message:
                    "URL WebSocket invalide",
            });

            return;
        }

        const socket =
            new WebSocket(url);

        socketRef.current =
            socket;

        socket.onopen = () => {
            setConnected(true);

            addJsonLog("system", {
                type: "connection_open",
            });
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
            } catch (parseError) {
                console.error(
                    "JSON invalide :",
                    event.data,
                    parseError
                );

                addJsonLog(
                    "system",
                    {
                        type: "invalid_json",
                        raw: event.data,
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
                    type: "connection_error",
                }
            );

            setError(
                "Erreur WebSocket"
            );
        };

        socket.onclose = (
            event
        ) => {
            addJsonLog(
                "system",
                {
                    type: "connection_closed",
                    code: event.code,
                    reason: event.reason,
                }
            );

            setConnected(false);
            setJoined(false);
            setGameStarted(false);
            setPlayerBets([]);

            stopPhaseCountdown();

            socketRef.current =
                null;
        };
    };

    const disconnect = () => {
        const socket =
            socketRef.current;

        if (!socket) {
            return;
        }

        socket.close();
        socketRef.current = null;
    };

    const joinRoom = () => {
        if (!roomId.trim()) {
            setError(
                "Room ID obligatoire"
            );

            return;
        }

        send({
            type: "join_room",
            roomId: roomId.trim(),
        });
    };

    const joinRoomByID = (
        roomIdToJoin: string
    ) => {
        if (!roomIdToJoin.trim()) {
            setError(
                "Room ID obligatoire"
            );

            return;
        }

        const waitForConnection =
            setInterval(() => {
                if (connected) {
                    clearInterval(
                        waitForConnection
                    );

                    send({
                        type: "join_room",
                        roomId:
                            roomIdToJoin.trim(),
                    });
                }
            }, 50);
    };

    const toggleReady = () => {
        if (!joined) {
            return;
        }

        const next = !ready;

        setReady(next);

        send({
            type: "player_ready",
            ready: next,
        });
    };

    const leaveRoom = () => {
        send({
            type: "leave_room",
        });

        setJoined(false);
        setPlayers([]);
        setReady(false);
    };

    const placeBet = (
        newTarget?: string,
        amount?: number
    ) => {
        const finalTarget =
            newTarget ?? target;

        const finalAmount =
            amount ?? betAmount;

        if (state !== "betting") {
            setError(
                "Les paris sont fermés"
            );

            return;
        }

        if (finalAmount <= 0) {
            setError(
                "Montant invalide"
            );

            return;
        }

        const alreadyBetAmount =
            currentBet?.chipValue ?? 0;

        const effectiveBalance =
            balance + alreadyBetAmount;

        if (
            finalAmount >
            effectiveBalance
        ) {
            setError(
                "Solde insuffisant"
            );

            return;
        }

        setTarget(
            finalTarget
        );

        setBetAmount(
            finalAmount
        );

        send({
            type: "place_bet",
            chipValue:
                finalAmount,
            target:
                finalTarget,
        });
    };

    const scratch = () => {
        if (state !== "scratch") {
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
            type: "scratch",
        });
    };

    const clearLogs = () => {
        setJsonLogs([]);
    };

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

    return {
        connected,
        joined,

        roomId,
        setRoomId,

        playerId,
        playerNumber,
        username,
        leaveRoom,
        connect,
        disconnect,
        joinRoom,
        joinRoomByID,

        players,

        ready,
        toggleReady,

        countdown,

        gameStarted,
        turn,
        state,
        rotationDegree,

        phaseCountdown,

        balance,
        balanceBefore,

        betAmount,
        setBetAmount,

        target,
        setTarget,

        currentBet,
        hasBet,

        placeBet,

        playerBets,

        ticket,
        scratch,

        winningNumber,

        myResult,
        results,

        error,

        jsonLogs,
        clearLogs,
    };
}
