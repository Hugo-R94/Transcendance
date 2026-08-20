import { useState } from "react";
import { useUserAvatar } from "../api/getUserAvatar";
	import DropdownMenu from "./dropdownFilter";

function FriendAvatar({ friendId, username }: { friendId: string; username: string }) {
  const avatarUrl = useUserAvatar(friendId);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/20 flex items-center justify-center font-bold text-white text-sm bg-black/20 shadow-md">
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        <span>{username?.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

export default function FriendList({ friends, onFriendClick }: { friends: any[]; onFriendClick: (friend: any) => void }) {
  if (!friends || friends.length === 0) {
    return <div className="flex items-center justify-center h-full text-white/50 text-sm">Aucun ami</div>;
  }

  const colors = ["bg-byellow", "bg-bred", "bg-bblue", "bg-bgreen"];

  const handleMenuAction = (action: string, friend: any) => {
    if (action === "block") {
      console.log("Bloquer l'ami :", friend.id);
    } else if (action === "delete") {
      console.log("Supprimer l'ami :", friend.id);
    }
  };

  return (
    <div className="overflow-y-auto overflow-x-visible h-full">
      <div className="flex flex-col gap-3 p-3 overflow-x-visible">
        {friends.map((friend, index) => {
          const username = friend.username || "Utilisateur";
          const bgColor = colors[index % colors.length];

          const menuItems = [
            { label: "Bloquer", value: "block" },
            { label: "Supprimer", value: "delete" },
          ];

          return (
            <div
              key={friend.id}
              className={`flex items-center justify-between p-3 rounded-2xl ${bgColor} shadow-md transition-all group`}
            >
              {/* Infos de l'ami (cliquables) */}
              <div 
                onClick={() => onFriendClick(friend)}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
              >
                <FriendAvatar friendId={friend.id} username={username} />
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-bold text-md truncate">{username}</span>
                </div>
              </div>

              {/* Bouton Chat */}
              <button 
                onClick={() => onFriendClick(friend)}
                className="bg-black/20 px-3 py-1.5 rounded-lg text-white balatro hover:outline-2 active:scale-90 text-xs font-bold hover:bg-white/20 transition-colors mr-2 cursor-pointer shrink-0"
              >
                Chat
              </button>

              {/* Dropdown Menu configuré pour garder l'apparence du bouton "⋮" */}
				<DropdownMenu
				items={[
					{ label: "Bloquer", value: "block" },
					{ label: "Supprimer", value: "delete" }
				]}
				color="bg-black/20"
				className="h-full flex items-center"
				menuClassName="sm:w-44 sm:right-0"
				pos={index >= friends.length - 2 ? 1 : -1}
				isIconOnly={true}
				onChange={(value) => handleMenuAction(value, friend)}
				/>
            </div>
          );
        })}
      </div>
    </div>
  );
}