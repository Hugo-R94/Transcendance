import { useEffect, useState, useCallback } from "react";
import Pagination from "./paginationController";
import api from "../api/api";

type HistoryComponentProps = {
    rank: string;
    time: string;
    final_score: number;
};

function isRankInSecondHalf(rankStr: string): boolean {
    if (!rankStr || !rankStr.includes("/")) return false;

    const parts = rankStr.split("/");
    if (parts.length !== 2) return false;

    const rank = parseInt(parts[0], 10);
    const nbPlayers = parseInt(parts[1], 10);

    if (isNaN(rank) || isNaN(nbPlayers) || nbPlayers === 0) return false;

    return rank <= nbPlayers / 2;
}

function HistoryComponent({ rank, time, final_score }: HistoryComponentProps) {
    const scoreColor = final_score > 1000 ? "text-bgreen" : "text-bred";
    const rankColor = isRankInSecondHalf(rank) ? "text-bgreen" : "text-bred";

    return (
        <div className="bg-byellow w-full h-15 shrink-0 font-extrabold flex items-center border-t border-l border-8 border-black/25 rounded-2xl hover:scale-101 hover:z-50 shadow-md shadow-black/75 hover:shadow-lg">
            <div className="w-1/3 h-full flex items-center justify-center">
                <p>
                    score : <span className={scoreColor}>{final_score}</span>
                </p>
            </div>

            <div className="w-1/3 h-full flex items-center justify-center">
                <p>
                    rank : <span className={rankColor}>{rank}</span>
                </p>
            </div>

            <div className="w-1/3 h-full flex items-center justify-center">
                <p className="text-black/50">{time}</p>
            </div>
        </div>
    );
}

type GambleHistoryProps = {
    userID?: string;
    className?: string;
};

type History = {
    rank: string;
    time: string;
    final_score: number;
};

export default function GambleHistory({ userID, className = "" }: GambleHistoryProps) {
    const [history, setHistory] = useState<History[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const baseUrl = userID ? `/history/${userID}` : "/history";
            const url = `${baseUrl}?page=${page}`;

            const response = await api.get(url);

            const data = Array.isArray(response.data) ? response.data : [];
            setHistory(data);

            // Gestion dynamique du nombre de pages (si l'API renvoie moins de 15 éléments, on bloque la pagination)
            if (data.length < 15 && page > 1) {
                setTotalPages(page);
            } else if (data.length === 15) {
                setTotalPages(page + 1);
            } else {
                setTotalPages(1);
            }
        } catch (err: any) {
            console.error("Détail complet de l'erreur API :", err.response || err);
            setError(
                err.response?.data?.error ||
                "Impossible de récupérer l'historique"
            );
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, [userID, page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className={`flex flex-col flex-1 w-full min-h-0 ${className}`}>
            {/* Header */}
            <div className="bg-bdarkgreen w-full h-15 shrink-0 rounded-2xl font-extrabold flex justify-center items-center gap-x-3 text-2xl text-white">
                GAMBLE <span className="text-bred">HISTORY</span>
            </div>

            {/* Historique (Contenu scrollable) */}
            <div className="w-full flex-1 min-h-0 overflow-y-auto flex flex-col gap-y-2 p-3">
                {loading ? (
                    <div className="text-white flex justify-center items-center h-full">
                        Chargement...
                    </div>
                ) : error ? (
                    <div className="text-bred flex justify-center items-center h-full text-center p-4">
                        {error}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-white flex justify-center items-center h-full">
                        Aucune partie jouée.
                    </div>
                ) : (
                    history.map((game, index) => (
                        <HistoryComponent
                            key={index}
                            rank={game.rank}
                            time={game.time}
                            final_score={game.final_score}
                        />
                    ))
                )}
            </div>

            {/* Footer avec Pagination */}
            <div className="bg-byellow w-full h-20 shrink-0 rounded-b-2xl flex items-center justify-center px-4">
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </div>
    );
}