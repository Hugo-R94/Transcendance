
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
}