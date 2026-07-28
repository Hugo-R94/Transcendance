import type { GameInfo } from "./client";
import type { client } from "./client"
import api from "./api";

export async function getGameInfo(appid: string | number): Promise<GameInfo> {
  const res = await api.get<GameInfo>(`/game/${appid}`);
  return res.data;
}

export interface GameRatingStats {
  average_rating: number;
  total_reviews: number;
}

// src/api/game.ts

export interface GameRatingStats {
  average_rating: number;
  total_reviews: number;
}

export async function getGameRatingStats(appid: string): Promise<GameRatingStats> {
  const response = await api.get<GameRatingStats>(`/game/${appid}/rating`);
  return response.data;
}