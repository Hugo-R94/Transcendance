import { useEffect, useState } from "react";
import { useConversations } from "./useConversations";
import { useChatWebSocket} from "./useChatwebsocket";
import { useNotification} from "./useNotification";
import { useFriendActions } from "./useFriendactions";
import { deriveFriendsAndRequests } from "./usechatHelpers";

export type Tab = "friends" | "requests";

export function useChat() {
    const [activeTab, setActiveTab] = useState<Tab>("friends");
    const [isOpen, setIsOpen] = useState(true);
    const [openConvIds, setOpenConvIds] = useState<string[]>([]);
    const [unreadUserIds, setUnreadUserIds] = useState<string[]>([]);

    const { notification, setNotification, showNotification } =
        useNotification();

    const {
        currentUserId,
        setCurrentUserId,
        convs,
        setConvs,
        fetchMyProfile,
        fetchConversations,
    } = useConversations();

		const {
			wsConnected,
			wsRef,
			sendWebSocketMessage,
			sendIsTyping,
			typingConversations,
			readConversations,
			setReadConversations,
			markAsRead,
			markAsUnread,
		} = useChatWebSocket({

		setConvs,
		fetchConversations,
		showNotification,
		setUnreadUserIds,
	});


    const {
        targetUsername,
        setTargetUsername,
        handleFriendClick,
        handleSendFriendRequest,
        handleAccept,
        handleReject,
        invite,
        handleUnfriend,
        handleBlock,
    } = useFriendActions({
        convs,
        openConvIds,
        setOpenConvIds,
        setUnreadUserIds,
        sendWebSocketMessage,
        fetchConversations,
        showNotification,
    });

    useEffect(() => {
        const storedId = localStorage.getItem("userID");

        if (storedId) {
            setCurrentUserId(storedId);
        }

        fetchMyProfile();
        fetchConversations();
    }, []);

    const { friends, requests } = deriveFriendsAndRequests(convs);

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
		sendIsTyping,
		typingConversations,
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
		readConversations,
		setReadConversations,
		markAsRead,
		markAsUnread,
    };
}