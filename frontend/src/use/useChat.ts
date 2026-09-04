import { useEffect, useRef, useState } from "react";
import api from "../api/api";
import type { Conversation, Friend, FriendRequest } from "../api/chat";

export type Tab = "friends" | "requests";

export function useChat() {
    const [activeTab, setActiveTab] = useState<Tab>("friends");
    const [isOpen, setIsOpen] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(
        () => localStorage.getItem("userID")
    );
    const [convs, setConvs] = useState<Conversation[]>([]);
    const [openConvIds, setOpenConvIds] = useState<string[]>([]);
    const [wsConnected, setWsConnected] = useState(false);
    const [targetUsername, setTargetUsername] = useState("");
    const [notification, setNotification] = useState<string | null>(null);
    const [unreadUserIds, setUnreadUserIds] = useState<string[]>([]);

    const wsRef = useRef<WebSocket | null>(null);

    const showNotification = (message: string, timeoffset?: number) => {
        setNotification(null);
        window.setTimeout(() => setNotification(message), timeoffset);
    };

    const fetchMyProfile = async () => {
        try {
            const res = await api.get("/profil");

            if (res.data?.id) {
                const id = String(res.data.id);

                setCurrentUserId(id);
                localStorage.setItem("userID", id);
            }
        } catch (err: any) {
            console.error(
                "[CHAT] Erreur profil :",
                err.response?.data || err.message
            );
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await api.get("/convs");

            if (!Array.isArray(res.data?.conversations)) {
                setConvs([]);
                return;
            }

            setConvs(res.data.conversations as Conversation[]);
        } catch (err: any) {
            console.error(
                "[CHAT] Erreur conversations :",
                err.response?.data || err.message
            );
        }
    };

    const fetchWebSocketToken = async (): Promise<string | null> => {
        try {
            const res = await api.get("/wstoken");
            const token = res.data?.token;

            if (!token) {
                console.error("[CHAT] Aucun token WebSocket reçu.");
                return null;
            }

            return String(token);
        } catch (err: any) {
            console.error(
                "[CHAT] Erreur récupération token WebSocket :",
                err.response?.data || err.message
            );

            return null;
        }
    };

    const getWebSocketUrl = (wsToken: string) => {
        const baseURL = api.defaults.baseURL;

        if (!baseURL) return null;

        try {
            const base = new URL(baseURL, window.location.origin);

            const wsProtocol =
                base.protocol === "https:" ? "wss:" : "ws:";

            const url = new URL(
                `${wsProtocol}//${base.host}/chat/ws`
            );

            url.searchParams.set("token", wsToken);

            return url.toString();
        } catch (err) {
            console.error("[CHAT] Erreur URL WebSocket :", err);
            return null;
        }
    };

    const sendWebSocketMessage = (
        conversationId: string,
        type: string,
        text = ""
    ): boolean => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("[CHAT] WebSocket non connecté.");
            return false;
        }

        const message = {
            conversation_id: conversationId,
            text,
            type,
        };

        ws.send(JSON.stringify(message));

        return true;
    };

    useEffect(() => {
        let cancelled = false;

        const connectWebSocket = async () => {
            if (cancelled) return;

            const jwt = localStorage.getItem("token");

            if (!jwt) {
                setWsConnected(false);
                return;
            }

            if (
                wsRef.current &&
                (
                    wsRef.current.readyState === WebSocket.OPEN ||
                    wsRef.current.readyState === WebSocket.CONNECTING
                )
            ) {
                return;
            }

            const wsToken = await fetchWebSocketToken();

            if (cancelled || !wsToken) {
                setWsConnected(false);
                return;
            }

            const url = getWebSocketUrl(wsToken);

            if (!url) {
                setWsConnected(false);
                return;
            }

            const ws = new WebSocket(url);

            wsRef.current = ws;

            ws.onopen = () => {
                if (!cancelled) {
                    console.log("[CHAT] WebSocket connecté");
                    setWsConnected(true);
                }
            };

            ws.onmessage = (event) => {
                if (cancelled) return;

                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "message") {
                        setConvs((prev) =>
                            prev.map((conv) =>
                                String(conv.id) !==
                                String(data.conversation_id)
                                    ? conv
                                    : {
                                        ...conv,
                                        messages: [
                                            data,
                                            ...(conv.messages || []),
                                        ],
                                    }
                            )
                        );

                        fetchConversations();
                    } else if (data.type === "friend_req") {
                        fetchConversations();
                        showNotification("Nouvelle demande d'ami !");
                    }else if (data.type === "quest_completed"){
						showNotification("felicitation quest completed youre so good!", 3000)
					} else if (data.type === "friend_accept") {
                        fetchConversations();
                        showNotification("Demande d'ami acceptée !");
                    } else if (data.type === "friend_remove") {
                        fetchConversations();
                        showNotification(
                            "Quelqu'un vous a retirer de sa liste d'ami."
                        );
                    } else if (data.type === "blocked") {
                        fetchConversations();
                        showNotification(
                            "Quelqu'un vous a bloquer."
                        );
                    } else if (data.type === "game_invit") {
                        fetchConversations();

                        showNotification(
                            `Invitation pour rejoindre la room ${data.text}`
                        );
                    } else if (
                        data.type === "chat_notification" &&
                        String(data.sender_id) !==
                            String(localStorage.getItem("userID"))
                    ) {
                        setUnreadUserIds((prev) => {
                            const senderId = String(data.sender_id);

                            if (prev.includes(senderId)) {
                                return prev;
                            }

                            return [...prev, senderId];
                        });
                    }
                } catch (err) {
                    console.error("[CHAT] JSON invalide :", err);
                }
            };

            ws.onerror = (err) => {
                console.error("[CHAT] WebSocket error :", err);
                setWsConnected(false);
            };

            ws.onclose = (event) => {
                console.warn(
                    "[CHAT] WebSocket fermé :",
                    event.code,
                    event.reason
                );

                setWsConnected(false);

                if (wsRef.current === ws) {
                    wsRef.current = null;
                }
            };
        };

        const storedId = localStorage.getItem("userID");

        if (storedId) {
            setCurrentUserId(storedId);
        }

        fetchMyProfile();
        fetchConversations();
        connectWebSocket();

        return () => {
            cancelled = true;

            const ws = wsRef.current;
            wsRef.current = null;

            if (
                ws &&
                (
                    ws.readyState === WebSocket.OPEN ||
                    ws.readyState === WebSocket.CONNECTING
                )
            ) {
                ws.close(1000, "unmounted");
            }

            setWsConnected(false);
        };
    }, []);

    const getOtherUser = (conv: Conversation) => {
        const myUserId = localStorage.getItem("userID");

        if (!myUserId) return null;

        if (String(conv.user1_id) === String(myUserId)) {
            return conv.user2;
        }

        if (String(conv.user2_id) === String(myUserId)) {
            return conv.user1;
        }

        return null;
    };

    const getAcceptance = (conv: Conversation) => {
        const myUserId = localStorage.getItem("userID");

        if (String(conv.user1_id) === String(myUserId)) {
            return {
                myAccepted: conv.accepted_1,
                otherAccepted: conv.accepted_2,
            };
        }

        return {
            myAccepted: conv.accepted_2,
            otherAccepted: conv.accepted_1,
        };
    };

    const friends: Friend[] = convs
        .filter((conv) => {
            const { myAccepted, otherAccepted } =
                getAcceptance(conv);

            return myAccepted === true && otherAccepted === true;
        })
        .map((conv) => {
            const user = getOtherUser(conv);

            if (!user) return null;

            return {
                id: user.id,
                username: user.username,
                profilePic: user.profile_pic,
            };
        })
        .filter((f): f is Friend => f !== null);

    const requests: FriendRequest[] = convs
        .filter((conv) => {
            const { myAccepted, otherAccepted } =
                getAcceptance(conv);

            return myAccepted === false && otherAccepted === true;
        })
        .map((conv) => {
            const user = getOtherUser(conv);

            if (!user) return null;

            return {
                id: user.id,
                username: user.username,
                profilePic: user.profile_pic,
            };
        })
        .filter((r): r is FriendRequest => r !== null);

    const markAsRead = (conversationId: string) => {
        return sendWebSocketMessage(conversationId, "read");
    };

    const handleFriendClick = async (friend: Friend) => {
        setUnreadUserIds((prev) =>
            prev.filter(
                (id) => String(id) !== String(friend.id)
            )
        );

        const conversation = convs.find((conv) => {
            const other = getOtherUser(conv);

            return (
                other &&
                String(other.id) === String(friend.id)
            );
        });

        if (!conversation) {
            showNotification("Conversation introuvable.");
            return;
        }

        if (!openConvIds.includes(String(conversation.id))) {
            setOpenConvIds((prev) => [
                ...prev,
                String(conversation.id),
            ]);
        }

        const myUserId = localStorage.getItem("userID");

        const isUser1 =
            String(conversation.user1_id) === String(myUserId);

        const isUser2 =
            String(conversation.user2_id) === String(myUserId);

        if (!isUser1 && !isUser2) return;

        markAsRead(String(conversation.id));
    };

    const handleSendFriendRequest = async () => {
        const username = targetUsername.trim();

        if (!username) {
            showNotification("Entrez un nom d'utilisateur.");
            return;
        }

        try {
            await api.post("/friend_request", { username });

            setTargetUsername("");
            await fetchConversations();

            showNotification("Invitation envoyée !");
        } catch (err: any) {
            showNotification(
                err.response?.data?.error ||
                    "Utilisateur inconnu."
            );
        }
    };

    const handleAccept = async (req: FriendRequest) => {
        try {
            await api.put("/friend_accept", {
                id: String(req.id),
                accept: true,
            });

            await fetchConversations();

            showNotification(
                `${req.username} est maintenant votre ami !`
            );
        } catch (err: any) {
            showNotification(
                err.response?.data?.error || "Erreur."
            );
        }
    };

    const handleReject = async (req: FriendRequest) => {
        try {
            await api.put("/friend_accept", {
                id: String(req.id),
                accept: false,
            });

            await fetchConversations();

            showNotification(
                `${req.username} a refuser votre demande d'ami !`
            );
        } catch (err: any) {
            showNotification(
                err.response?.data?.error || "Erreur."
            );
        }
    };

    const invite = (friendId: string, roomId: string) => {
        const conversation = convs.find((conv) => {
            const other = getOtherUser(conv);

            return (
                other &&
                String(other.id) === String(friendId)
            );
        });

        if (!conversation) {
            console.error(
                "[GAME INVITE] Conversation introuvable"
            );
            return;
        }

        sendWebSocketMessage(
            conversation.id,
            "game_invit",
            roomId
        );
    };

    const handleUnfriend = async (
        friend: Friend,
        convID: Conversation.ID
    ) => {
        try {
            sendWebSocketMessage(
                convID,
                "friend_remove",
                ""
            );

            await api.delete("/unfriend", {
                data: {
                    id: String(friend.id),
                },
            });

            await fetchConversations();

            showNotification(
                `${friend.username} supprimé de vos amis.`
            );
        } catch (err: any) {
            console.error(
                "[UNFRIEND] CATCH",
                err.response?.data || err.message
            );
        }
    };

    const handleBlock = async (friend: Friend) => {
        try {
            await api.post("/block", {
                username: friend.username,
            });

            await fetchConversations();

            showNotification(
                `${friend.username} a été bloqué.`
            );
        } catch (err: any) {
            console.error(
                "[BLOCK] CATCH",
                err.response?.data || err.message
            );

            showNotification(
                err.response?.data?.error ||
                    "Impossible de bloquer cet utilisateur."
            );
        }
    };

    return {
        activeTab,
        setActiveTab,
        isOpen,
        setIsOpen,
        currentUserId,
        convs,
        openConvIds,
        setOpenConvIds,
        wsConnected,
        wsRef,
        targetUsername,
        setTargetUsername,
        notification,
        setNotification,
        friends,
        requests,
        unreadUserIds,
        setUnreadUserIds,
        handleFriendClick,
        invite,
        handleSendFriendRequest,
        handleAccept,
        handleReject,
        handleBlock,
        handleUnfriend,
    };
}
