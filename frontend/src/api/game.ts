import { api } from "./client";
import type { GameInfo } from "./client";

export async function getGameInfo(appid: string | number): Promise<GameInfo> {
  const res = await api.get<GameInfo>(`/game/${appid}`);
  return res.data;
}