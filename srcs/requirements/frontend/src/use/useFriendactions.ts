import { useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
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
            showNotification(t("chatNotifications.conversationNotFound"));
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
            showNotification(t("chatNotifications.enterUsername"));
            return;
        }

        try {
            await api.post("/friend_request", { username });

            setTargetUsername("");
            await fetchConversations();

            showNotification(t("chatNotifications.invitationSent"));
        } catch (err: any) {

            showNotification(
                err.response?.data?.error ||
                t("chatNotifications.unknownUser")
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
                t("chatNotifications.nowFriends", { username: req.username })
            );
        } catch (err: any) {
            showNotification(
                err.response?.data?.error || t("chatNotifications.genericError")
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
                t("chatNotifications.friendRequestRejected", { username: req.username })
            );
        } catch (err: any) {
            showNotification(
                err.response?.data?.error || t("chatNotifications.genericError")
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
                t("chatNotifications.friendRemoved", { username: friend.username })
            );
        } catch (err: any) {
        }
    };

    const handleBlock = async (friend: Friend) => {
        try {
            await api.post("/block", {
                username: friend.username,
            });

            await fetchConversations();

            showNotification(
                t("chatNotifications.userBlocked", { username: friend.username })
            );
        } catch (err: any) {
            showNotification(
                err.response?.data?.error ||
                t("chatNotifications.blockFailed")
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
