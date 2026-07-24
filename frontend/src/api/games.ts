import type { GamesPageResponse } from "./client";
import api from "./api";
import type { GameListItem } from "../api/client";

export async function getGamesList(
  page: number
): Promise<GamesPageResponse> {
  const res = await api.get<GamesPageResponse>("/game/games", {
    params: {
      page,
    },
  });

  return res.data;
}


export interface GameSearchResponse {
  games: GameListItem[];
}

export async function searchGames(
  query: string,
  limit: number = 15
): Promise<GameSearchResponse> {
  const res = await api.get<GameSearchResponse>("/game/search", {
    params: {
      q: query,
      limit,
    },
  });

  return res.data;
}
