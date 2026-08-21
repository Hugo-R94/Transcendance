import { useUserAvatar } from "../api/getUserAvatar"; // Ajuste le chemin selon ton arborescence

function RequestAvatar({ userId, username }: { userId: string; username: string }) {
  const avatarUrl = useUserAvatar(userId);

  return (
    <div className="w-10 h-10 rounded-full bg-byellow overflow-hidden shrink-0 border border-white/30 flex items-center justify-center font-bold text-white text-sm">
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        <span>{username?.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

export default function FriendRequestList({ requests, onAccept, onReject, onBlock }: { requests: any[]; onAccept: (req: any) => void; onReject: (req: any) => void; onBlock: (req: any) => void }) {
  if (!requests || requests.length === 0) {
    return <div className="flex items-center justify-center h-full text-white/50 text-sm">Aucune demande</div>;
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto h-full p-1">
      {requests.map((req) => {
        // On utilise explicitement le bon ID pour chaque besoin
        const keyId = req.id; 
        const avatarUserId = req.userId; 
        const username = req.username || "Utilisateur";

        return (
          <div key={keyId} className="flex items-center justify-between p-2 rounded-xl bg-white/10 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <RequestAvatar userId={avatarUserId} username={username} />
              <span className="text-white font-bold text-sm truncate">{username}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => onAccept(req)} 
                className="bg-green-600 w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center hover:scale-95 transition-transform"
                title="Accepter"
              >
                ✓
              </button>
              <button 
                onClick={() => onReject(req)} 
                className="bg-red-600 w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center hover:scale-95 transition-transform"
                title="Refuser"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}