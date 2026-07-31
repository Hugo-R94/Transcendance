import { useState, useEffect } from "react";
import LikeGameButton from "./likeGameButton";
import WishlistGameButton from "./wishlistGameButton";
import DislikeGameButton from "./dislikeGameButton";

type ListState = 0 | 1 | 2 | 3;

interface GameInteractionBarProps {
  className?: string;
  gameId: number;
  initialState?: ListState; // 0: Aucune, 1: Like, 2: Wishlist, 3: Dislike
}

function GameInteractionBar({
  className = "",
  gameId: _gameId,
  initialState = 0,
}: GameInteractionBarProps) {
  const [listState, setListState] = useState<ListState>(initialState);

  // Synchronisation si la prop initialState change depuis le composant parent
  useEffect(() => {
    setListState(initialState);
  }, [initialState]);

  const handleListChange = (targetState: ListState) => {
    // Si on clique sur le bouton déjà actif -> retour à 0
    // Si on clique sur un autre bouton -> passe directement à la nouvelle valeur (1, 2 ou 3)
    setListState((currentState) =>
      currentState === targetState ? 0 : targetState
    );
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