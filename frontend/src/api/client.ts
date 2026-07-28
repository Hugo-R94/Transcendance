
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
}); 


export interface GameInfo {
  appid: number;
  name: string;
  description: string;
  header_image: string;
  background_image: string;
  release_date: string;
  steam_score: number;
  genres:	string[];
  developers:	string[];
  publishers:	string[];
  total_review: number;
}

export interface GameListItem {
  appid: number;
  name: string;
  header_image: string;
}

export interface GamesPageResponse {
  games: GameListItem[];
  total_pages: number;
}
