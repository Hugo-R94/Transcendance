import React, { useState, useEffect, useCallback } from "react";
import Pagination from "./paginationController";
import DropdownMenu from "./dropdownFilter";
import { genres, orderOptions } from "../pages/GameList";
import api from "../api/api";
import GameList from "./gameList";

export const listOptions = [
  { label: "Likes", value: "likes" },
  { label: "Dislikes", value: "dislikes" },
  { label: "Wishlist", value: "wishlist" },
];

export interface Game {
  appid: number;
  name: string;
  header_image: string;
}

interface UserGameListProps {
  userId?: string;
  className?: string;
}

function UserGameList({ userId, className = "" }: UserGameListProps) {
  const [selectedList, setSelectedList] = useState<string>("likes");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedOrderBy, setSelectedOrderBy] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserGames = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        list: selectedList,
        page: page,
        genre: selectedGenre,
        orderBy: selectedOrderBy,
      };

      if (userId) {
        params.userid = userId;
      }

      const response = await api.get("/GameList", { params });

      setGames(response.data.games || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error("Erreur lors de la récupération des jeux :", error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedList, page, selectedGenre, selectedOrderBy]);

  useEffect(() => {
    fetchUserGames();
  }, [fetchUserGames]);

  const handleListChange = (val: string) => {
    setSelectedList(val);
    setPage(1);
  };

  const handleGenreChange = (val: string) => {
    setSelectedGenre(val);
    setPage(1);
  };

  const handleOrderByChange = (val: string) => {
    setSelectedOrderBy(val);
    setPage(1);
  };

  return (
    <>
      {/* ==================== VERSION DESKTOP ==================== */}
      {/* Utilisation de overflow-y-auto pour la liste et overflow-visible sur le footer pour les dropdowns */}
      <div
        className={`hidden sm:flex w-full h-[calc(100vh-280px)] min-h-[400px] flex-col rounded-2xl relative ${className}`}
      >
        {/* Zone d'affichage des jeux avec scroll interne */}
        <div className="w-full flex justify-center items-center h-[85%] overflow-y-auto p-2 rounded-t-2xl">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-gray-400">Chargement...</span>
            </div>
          ) : games.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-gray-400">Aucun jeu dans cette liste</span>
            </div>
          ) : (
            <GameList games={games} />
          )}
        </div>

        {/* Footer PC : overflow-visible indispensable pour que les menus déroulants ne soient pas coupés */}
        <div className="relative z-50 flex h-[15%] min-h-[65px] w-full items-center justify-center gap-4 rounded-b-2xl bg-byellow px-4 overflow-visible backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 py-1 sm:gap-4 overflow-visible">
            <DropdownMenu
              pos={-1}
              items={listOptions}
              value={selectedList}
              onChange={handleListChange}
              color="bg-bgreen"
            />
            <DropdownMenu
              Name="Genre"
              pos={-1}
              items={genres}
              value={selectedGenre}
              onChange={handleGenreChange}
              color="bg-bblue"
            />
            <DropdownMenu
              Name="Tri"
              items={orderOptions}
              pos={-1}
              value={selectedOrderBy}
              onChange={handleOrderByChange}
              color="bg-bred"
            />
          </div>

          <div className="flex shrink-0 items-center justify-center">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      </div>

      {/* ==================== VERSION MOBILE ==================== */}
      <div className={`sm:hidden flex flex-col w-full rounded-2xl relative ${className}`}>
        {/* 1. Filtres en HAUT sur mobile avec overflow-visible pour les dropdowns */}
        <div className="relative z-50 flex flex-wrap items-center justify-center gap-2 p-2 bg-byellow rounded-t-2xl mb-2 overflow-visible">
          <DropdownMenu
            pos={-1}
            items={listOptions}
            value={selectedList}
            onChange={handleListChange}
            color="bg-bgreen"
          />
          <DropdownMenu
            Name="Genre"
            pos={-1}
            items={genres}
            value={selectedGenre}
            onChange={handleGenreChange}
            color="bg-bblue"
          />
          <DropdownMenu
            Name="Tri"
            items={orderOptions}
            pos={-1}
            items-pos={-1}
            value={selectedOrderBy}
            onChange={handleOrderByChange}
            color="bg-bred"
          />
        </div>

        {/* 2. Liste des jeux */}
        <div className="w-full flex justify-center items-center py-2 px-2 max-h-[55vh] overflow-y-auto">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center">
              <span className="text-gray-400">Chargement...</span>
            </div>
          ) : games.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center">
              <span className="text-gray-400">Aucun jeu dans cette liste</span>
            </div>
          ) : (
            <GameList games={games} />
          )}
        </div>

        {/* 3. Pagination en BAS sur mobile */}
        <div className="relative z-10 flex h-auto min-h-[55px] w-full items-center justify-center rounded-b-2xl bg-byellow px-4 py-2 mt-2 backdrop-blur-md">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </>
  );
}

export default UserGameList;