import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FriendList from "./friendList";
import FriendRequestList from "./friendRequestList";
import Notification from "../utils/notification";
import { ChatMenuHeader } from "./chatMenuHeader";
import { ChatWindowContainer } from "./chatWindowContainer";
import { useChat } from "../../use/useChat";
import NotificationSignal from "../utils/notificationSignal";

export default function ChatMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    return localStorage.getItem("chatOpen") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("chatOpen", String(isOpen));
  }, [isOpen]);

  const {
    activeTab,
    setActiveTab,
    currentUserId,
    convs,
    openConvIds,
    setOpenConvIds,
    wsConnected,
    markAsUnread,
    wsRef,
    sendIsTyping,
    readConversations,
    targetUsername,
    setTargetUsername,
    notification,
    typingConversations,
    setNotification,
    friends,
    requests,
    unreadUserIds,
    handleFriendClick,
    handleUnfriend,
    handleSendFriendRequest,
    handleAccept,
    handleReject,
    handleBlock,
  } = useChat();

  const hasRequest = requests.length > 0;
  const hasNotification = hasRequest || unreadUserIds.length > 0;

  return (
    <div
      className="
        fixed z-[9999] top-20 start-0 end-0 bottom-0 p-2 
        sm:top-auto sm:start-auto sm:end-4 sm:bottom-4 sm:p-0
        flex flex-row items-end justify-end gap-3 pointer-events-none"
    >
      {isOpen && (
        <div className="pointer-events-auto">
          <ChatWindowContainer
            openConvIds={openConvIds}
            setReadConversations={markAsUnread}
            readConversations={readConversations}
            typingConversations={typingConversations}
            sendIsTyping={sendIsTyping}
            convs={convs}
            currentUserId={currentUserId}
            ws={wsRef.current}
            wsConnected={wsConnected}
            unreadUserIds={unreadUserIds}
            onFriendClick={handleFriendClick}
            onCloseConv={(convId) =>
              setOpenConvIds((prev) =>
                prev.filter((id) => String(id) !== String(convId))
              )
            }
          />
        </div>
      )}

      <div
        className={`bg-bdarkgreen rounded-2xl shadow-lg
          shadow-black overflow-hidden flex flex-col transition-all
          duration-300 ease-in-out origin-bottom-right pointer-events-auto
          ${
            isOpen
              ? `w-full h-full sm:w-80 sm:h-[30rem]`
              : `w-40 h-11 scale-95 opacity-90 translate-y-1 cursor-pointer hover:opacity-100
                justify-center items-center p-1 sm:w-40 sm:h-11`
          }
          ${isOpen ? "p-2" : ""}`}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
          }
        }}
      >
        <div className="flex shrink-0">
          <ChatMenuHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onClose={() => setIsOpen(!isOpen)}
            isOpen={isOpen}
            hasRequest={hasRequest}
          />

          {!isOpen && hasNotification && <NotificationSignal />}
        </div>

        <div
          className={`flex flex-col flex-1 min-h-0 transition-opacity duration-500
            ${isOpen ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="flex items-center justify-between px-2 mt-3 mb-1 shrink-0">
            <p className="text-white font-bold text-lg">
              {activeTab === "friends"
                ? t("chatMenu.myFriends")
                : t("chatMenu.friendRequests")}
            </p>

            <p className="text-white/60 text-sm">
              {activeTab === "friends" ? friends.length : requests.length}
            </p>
          </div>

          {activeTab === "requests" && (
            <form
			  name="request_form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFriendRequest();
              }}
              className="flex gap-1 mb-2 shrink-0"
            >
              <input
                type="text"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                placeholder={t("chat.usernamePlaceholder")}
                className="min-w-0 flex-1 h-10 px-3 rounded-xl bg-white/90 text-black text-sm outline-none
                  focus:ring-2 focus:ring-white"
              />

              <button
                type="submit"
                className="bg-bblue px-3 h-10 rounded-xl text-white font-bold
                  balatro hover:outline-2 hover:outline-white active:scale-90"
              >
                +
              </button>
            </form>
          )}

          <div className="flex-1 bg-white/20 rounded-2xl p-1 overflow-y-auto min-h-0">
            {activeTab === "friends" ? (
              <FriendList
                friends={friends}
                onFriendClick={handleFriendClick}
                onUnfriend={handleUnfriend}
                onBlock={handleBlock}
                unreadUserIds={unreadUserIds}
              />
            ) : (
              <FriendRequestList
                requests={requests}
                onAccept={handleAccept}
                onReject={handleReject}
                onBlock={handleBlock}
              />
            )}
          </div>

          <div className="flex items-center gap-2 px-2 pt-2 shrink-0" />
        </div>
      </div>

      {notification && (
        <div className="pointer-events-auto">
          <Notification
            message={notification}
            onClose={() => setNotification(null)}
          />
        </div>
      )}
    </div>
  );
}