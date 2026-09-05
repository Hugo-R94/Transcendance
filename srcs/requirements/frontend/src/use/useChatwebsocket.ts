import { useEffect, useRef, useState } from "react";
import api from "../api/api";
import type { Conversation } from "../api/chat";

interface UseChatWebSocketParams {
    setConvs: React.Dispatch<React.SetStateAction<Conversation[]>>;
    fetchConversations: () => Promise<void>;
    showNotification: (message: string, timeoffset?: number) => void;
    setUnreadUserIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useChatWebSocket({
    setConvs,
    fetchConversations,
    showNotification,
    setUnreadUserIds,
}: UseChatWebSocketParams) {
    const [wsConnected, setWsConnected] = useState(false);
    const [typingConversations, setTypingConversations] = useState<string[]>(
        []
    );
	const [readConversations, setReadConversations] = useState<string[]>([]);

    const wsRef = useRef<WebSocket | null>(null);

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

	const markAsRead = (conversationId: string): boolean => {
		return sendWebSocketMessage(
			conversationId,
			"read",
			""
		);
	};

	const markAsUnread = (conversationId: string) => {
		setReadConversations((prev) =>
			prev.filter(
				(id) => String(id) !== String(conversationId)
			)
		);
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

    const sendIsTyping = (conversationId: string): boolean => {
        console.log("[CHAT] Sending is_typing", conversationId);

        return sendWebSocketMessage(
            conversationId,
            "is_typing",
            ""
        );
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
                    }
					
                    else if (data.type === "friend_req") {
                        fetchConversations();
                        showNotification("Nouvelle demande d'ami !");
                    }

                    else if (data.type === "quest_completed") {
                        showNotification(
                            "felicitation quest completed youre so good!",
                            3000
                        );
                    }

					else if (data.type === "quest_completed"){
						showNotification("felicitation quest completed youre so good!", 3000)
					}
					
                    else if (data.type === "friend_accept") {
                        fetchConversations();
                        showNotification("Demande d'ami acceptée !");
                    }

                    else if (data.type === "friend_remove") {
                        fetchConversations();
                        showNotification(
                            "Quelqu'un vous a retirer de sa liste d'ami."
                        );
                    }

                    else if (data.type === "blocked") {
                        fetchConversations();
                        showNotification(
                            "Quelqu'un vous a bloquer."
                        );
                    }

                    else if (data.type === "game_invit") {
                        fetchConversations();

                        showNotification(
                            `Invitation pour rejoindre la room ${data.text}`
                        );
                    }
					
					else if (data.type === "is_typing") {
						const senderId = String(data.sender_id);
						const myUserId = String(localStorage.getItem("userID"));
						const conversationId = String(data.conversation_id);

						if (senderId === myUserId) {
							return;
						}

						setTypingConversations((prev) => {
							if (prev.includes(conversationId)) {
								return prev;
							}

							return [...prev, conversationId];
						});

						window.setTimeout(() => {
							setTypingConversations((prev) =>
								prev.filter(
									(id) => id !== conversationId
								)
							);
						}, 2000);
					}
					
					else if (
						data.type === "read" &&
						String(data.sender_id) !==
							String(localStorage.getItem("userID"))
					) {
						const conversationId = String(data.conversation_id);

						setReadConversations((prev) => {
							if (prev.includes(conversationId)) {
								return prev;
							}

							return [...prev, conversationId];
						});
					}


                    else if (
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
            setTypingConversations([]);
        };

    }, []);

    return {
        wsConnected,
        wsRef,
        sendWebSocketMessage,
		markAsRead,
        sendIsTyping,
		markAsUnread,
		setReadConversations,
		readConversations,
        typingConversations,
    };
}
