import { useState } from "react";
import type { Conversation, Friend, FriendRequest } from "../api/chat";
import { getOtherUser } from "./usechatHelpers";
import api from "../api/api";

interface UseFriendActionsParams {
    convs: Conversation[];
    openConvIds: string[];
    setOpenConvIds: React.Dispatch<React.SetStateAction<string[]>>;
    setUnreadUserIds: React.Dispatch<React.SetStateAction<string[]>>;
    sendWebSocketMessage: (
        conversationId: string,
        type: string,
        text?: string
    ) => boolean;
    fetchConversations: () => Promise<void>;
    showNotification: (message: string, timeoffset?: number) => void;
}

export function useFriendActions({
    convs,
    openConvIds,
    setOpenConvIds,
    setUnreadUserIds,
    sendWebSocketMessage,
    fetchConversations,
    showNotification,
}: UseFriendActionsParams) {
    const [targetUsername, setTargetUsername] = useState("");

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

        sendWebSocketMessage(String(conversation.id), "read");
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
        targetUsername,
        setTargetUsername,
        handleFriendClick,
        handleSendFriendRequest,
        handleAccept,
        handleReject,
        invite,
        handleUnfriend,
        handleBlock,
    };
}