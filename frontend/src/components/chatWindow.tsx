import { useState } from "react";
import { Link } from "react-router-dom";
import type { Conversation, Message } from "../api/chat";
import { useUserAvatar } from "../api/getUserAvatar"; // Ajuste le chemin selon ton arborescence

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string | null;
  ws: WebSocket | null;
  wsConnected: boolean;
  onClose: () => void;
}

export default function ChatWindow({ conversation, currentUserId, ws, wsConnected, onClose }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Sécurité : récupère l'ID depuis les props ou directement du localStorage si besoin
  const effectiveUserId = currentUserId || localStorage.getItem("userID");
  
  const otherUser = String(conversation.user1_id) === String(effectiveUserId) ? conversation.user2 : conversation.user1;

  // Utilisation de l'ID effectif pour les deux avatars
  const otherUserAvatar = useUserAvatar(otherUser?.id ? String(otherUser.id) : undefined);
  const myAvatar = useUserAvatar(effectiveUserId ? String(effectiveUserId) : undefined);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ type: "message", conversation_id: conversation.id, text }));
    setNewMessage("");
  };

  return (
    <div 
      className={`bg-bdarkgreen rounded-2xl shadow-lg shadow-black overflow-hidden flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${
        isMinimized 
          ? "w-48 h-11 scale-95 opacity-90 translate-y-1 cursor-pointer p-1 justify-center" 
          : "w-80 h-[30rem] scale-100 opacity-100 translate-y-0 p-3"
      }`}
      onClick={() => {
        if (isMinimized) setIsMinimized(false);
      }}
    >
      {isMinimized ? (
        /* État réduit de la fenêtre de chat */
        <div className="w-full h-full flex flex-row items-center justify-between cursor-pointer text-white px-2">
          <div className="flex items-center gap-2 min-w-0">
            {otherUser?.id && (
              <div className="w-6 h-6 rounded-full bg-byellow overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                {otherUserAvatar ? (
                  <img src={otherUserAvatar} alt={otherUser.username} className="w-full h-full object-cover" />
                ) : (
                  <span>{otherUser?.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            )}
            <span className="font-bold text-xs tracking-wider truncate max-w-[90px]">{otherUser?.username || "Chat"}</span>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
            className="text-xs transform transition-transform duration-500 rotate-180"
          >
            ▼
          </button>
        </div>
      ) : (
        /* État ouvert complet */
        <div className="absolute inset-0 flex flex-col p-3 bg-bdarkgreen rounded-2xl">
          {/* HEADER */}
          <div className="flex items-center gap-2 h-15 px-2 bg-white/10 shrink-0 rounded-xl">
            {otherUser?.id && (
              <Link to={`/profil/${otherUser.id}`} className="bg-byellow w-10 h-10 rounded-full balatro font-bold overflow-hidden shrink-0 hover:outline-2 hover:outline-white transition-all flex items-center justify-center text-white">
                {otherUserAvatar ? (
                  <img src={otherUserAvatar} alt={otherUser.username} className="w-full h-full object-cover" />
                ) : (
                  <span>{otherUser?.username?.charAt(0).toUpperCase()}</span>
                )}
              </Link>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <Link to={`/profil/${otherUser?.id}`} className="text-white font-bold truncate hover:underline">
                {otherUser?.username || "Utilisateur"}
              </Link>
            </div>

            {/* Bouton pour réduire */}
            <button 
              type="button" 
              onClick={() => setIsMinimized(true)} 
              className="bg-byellow w-8 h-8 rounded-xl balatro font-bold text-white flex items-center justify-center hover:outline-2 hover:outline-white active:scale-90 transition-all"
            >
              <span className="transform transition-transform duration-500">▼</span>
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-byellow flex justify-center items-center w-8 h-8 text-white balatro rounded-xl font-bold hover:outline-2 hover:outline-white active:scale-90 transition-all"
            >
              <span className="balatro text-xl leading-none text-3xl -translate-y-[2px]">×</span>
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col-reverse gap-3 my-2 ">
            {conversation.messages?.length > 0 ? (
              conversation.messages.map((msg: Message) => {
                const isMine = String(msg.sender_id) === String(effectiveUserId);
                
                const messageAvatar = isMine ? myAvatar : otherUserAvatar;
                const bubbleColor = isMine ? "bg-bred" : "bg-bblue";

                // Détermination de la cible du lien
                const profileTarget = isMine ? (effectiveUserId ? `/profil/${effectiveUserId}` : "#") : (otherUser?.id ? `/profil/${otherUser.id}` : "#");

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"} justify-end`}>
                    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[75%] `}>
                      <div className={`p-3 rounded-2xl text-white ${bubbleColor} card`}>{msg.text}</div>
                    </div>
                    
                    {/* Avatar cliquable dans les messages avec effet balatro et taille harmonisée */}
                    <Link to={profileTarget} className="w-10 h-10 rounded-full balatro bg-byellow overflow-hidden shrink-0 mb-1 hover:outline-2 hover:outline-white transition-all flex items-center justify-center font-bold text-white text-xs">
                      {messageAvatar ? (
                        <img src={messageAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{isMine ? "M" : otherUser?.username?.charAt(0).toUpperCase()}</span>
                      )}
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full text-white/50 text-sm">Aucun message</div>
            )}
          </div>

          {/* INPUT */}
          <form onSubmit={handleSendMessage} className="flex gap-1 p-2 bg-white/10 shrink-0 rounded-2xl">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Message..." disabled={!wsConnected} className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white text-black outline-none disabled:opacity-50" />
            <button type="submit" disabled={!wsConnected} className="bg-bblue px-3 rounded-xl font-bold text-white hover:outline-2 hover:outline-white active:scale-90 disabled:opacity-50 transition-all">→</button>
          </form>
        </div>
      )}
    </div>
  );
}