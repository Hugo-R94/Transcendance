import { useState, useEffect } from "react";
import FriendList from "./friendList";
import FriendRequestList from "./friendRequestList";
import Notification from "./notification";
import { ChatMenuHeader } from "./chatMenuHeader";
import { ChatWindowContainer } from "./chatWindowContainer";
import { useChat } from "../use/useChat";

export default function ChatMenu() {
  // On initialise isOpen directement depuis le localStorage
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    return localStorage.getItem("chatOpen") !== "false"; // Par défaut ouvert sauf si "false" explicite
  });

  // On sauvegarde dans le localStorage dès que isOpen change
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
    wsRef,
    targetUsername,
    setTargetUsername,
    notification,
    setNotification,
    friends,
    requests,
    handleFriendClick,
	handleUnfriend,
    handleSendFriendRequest,
    handleAccept,
    handleReject,
    handleBlock,
  } = useChat();

  return (
    <div className="fixed bottom-4 right-4 hidden sm:flex flex-row items-end gap-3 z-[9999]">
      {/* 1. FENÊTRES DE CHAT MULTIPLES (Placées à gauche du menu principal) */}
      {isOpen && (
        <ChatWindowContainer
          openConvIds={openConvIds}
          convs={convs}
          currentUserId={currentUserId}
          ws={wsRef.current}
          wsConnected={wsConnected}
          onCloseConv={(convId) => setOpenConvIds((prev) => prev.filter((id) => String(id) !== String(convId)))}
        />
      )}

      {/* 2. MENU PRINCIPAL À DROITE */}
      <div
        className={`bg-bdarkgreen rounded-2xl shadow-lg shadow-black p-2 overflow-hidden flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${
          isOpen
            ? "w-80 h-[30rem] scale-100 opacity-100 translate-y-0"
            : "w-40 h-11 scale-95 opacity-90 translate-y-1 cursor-pointer hover:opacity-100 flex justify-center items-center p-1"
        }`}
        onClick={() => {
          if (!isOpen) setIsOpen(true);
        }}
      >
        <ChatMenuHeader 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onClose={() => setIsOpen(!isOpen)} 
          isOpen={isOpen}
        />

        {/* Le contenu du menu s'efface en douceur quand il est fermé */}
        <div className={`flex flex-col flex-1 min-h-0 transition-opacity duration-500 ${isOpen ? "opacity-150 delay-100" : "opacity-0 pointer-events-none"}`}>
          <div className="flex items-center justify-between px-2 mt-3 mb-1 shrink-0">
            <p className="text-white font-bold text-lg">{activeTab === "friends" ? "Mes amis" : "Demandes d'amis"}</p>
            <p className="text-white/60 text-sm">{activeTab === "friends" ? friends.length : requests.length}</p>
          </div>

          {activeTab === "requests" && (
            <form onSubmit={(e) => { e.preventDefault(); handleSendFriendRequest(); }} className="flex gap-1 mb-2 shrink-0">
              <input 
                type="text" 
                value={targetUsername} 
                onChange={(e) => setTargetUsername(e.target.value)} 
                placeholder="Nom d'utilisateur..." 
                className="min-w-0 flex-1 h-10 px-3 rounded-xl bg-white/90 text-black text-sm outline-none focus:ring-2 focus:ring-white" 
              />
              <button type="submit" className="bg-bblue px-3 h-10 rounded-xl text-white font-bold balatro hover:outline-2 hover:outline-white active:scale-90">+</button>
            </form>
          )}

          <div className="flex-1 bg-white/20 rounded-2xl p-1 overflow-y-auto min-h-0">
            {activeTab === "friends" ? (
              <FriendList friends={friends} onFriendClick={handleFriendClick} onUnfriend={handleUnfriend}  onBlock={handleBlock}/>
            ) : (
              <FriendRequestList requests={requests} onAccept={handleAccept} onReject={handleReject} onBlock={handleBlock} />
            )}
          </div>

          <div className="flex items-center gap-2 px-2 pt-2 shrink-0">
          </div>
        </div>
      </div>

      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
    </div>
  );
}