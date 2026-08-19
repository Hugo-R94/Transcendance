import { useState, useEffect } from "react";
import LikeGameButton from "./likeGameButton";
import WishlistGameButton from "./wishlistGameButton";
import DislikeGameButton from "./dislikeGameButton";
import api from "../api/api";

type ListState = 0 | 1 | 2 | 3;

interface GameInteractionBarProps {
  className?: string;
  gameId: number;
  initialState?: ListState; // 0: Aucune, 1: Like, 2: Wishlist, 3: Dislike
}

const STATE_TO_LIST_PARAM: Record<Exclude<ListState, 0>, string> = {
  1: "likes",
  2: "wishlist",
  3: "dislikes",
};

function GameInteractionBar({
  className = "",
  gameId,
  initialState = 0,
}: GameInteractionBarProps) {
  const [listState, setListState] = useState<ListState>(initialState);

  // Synchronisation si la prop initialState change depuis le composant parent
  useEffect(() => {
    setListState(initialState);
  }, [initialState]);

  const handleListChange = (targetState: Exclude<ListState, 0>) => {
    const previousState = listState;
    const nextState: ListState = listState === targetState ? 0 : targetState;

    setListState(nextState);

    const listName = STATE_TO_LIST_PARAM[targetState];
    
    api.post(`/addToList?appID=${gameId}&list=${listName}`)
      .catch((error) => {
        console.error("Erreur lors de l'ajout à la liste :", error);
        // Rollback visuel uniquement en cas d'erreur de la requête
        setListState(previousState);
      });
  };

  const buttonStyle =
    "flex relative group p-2 h-full aspect-square active:scale-90 overflow-visible mx-auto justify-center items-center transition-transform";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 1: LIKE */}
      <LikeGameButton
        isActive={listState === 1}
        onClick={() => handleListChange(1)}
        className={buttonStyle}
      />

      {/* 2: WISHLIST */}
      <WishlistGameButton
        isActive={listState === 2}
        onClick={() => handleListChange(2)}
        className={buttonStyle}
      />

      {/* 3: DISLIKE */}
      <DislikeGameButton
        isActive={listState === 3}
        onClick={() => handleListChange(3)}
        className={buttonStyle}
      />
    </div>
  );
}

export default GameInteractionBar;          