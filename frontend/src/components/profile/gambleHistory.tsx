import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../utils/paginationController";
import api from "../../api/api";

type HistoryComponentProps = {
    rank: string;
    time: string;
    final_score: number;
};

type GambleHistoryProps = {
    userID?: string;
    className?: string;
};

type History = {
    rank: string;
    time: string;
    final_score: number;
    total: number;
};

function isRankInSecondHalf(rankStr: string): boolean {
    if (!rankStr || !rankStr.includes("/")) return false;

    const parts = rankStr.split("/");
    if (parts.length !== 2) return false;

    const rank = parseInt(parts[0], 10);
    const nbPlayers = parseInt(parts[1], 10);

    if (isNaN(rank) || isNaN(nbPlayers) || nbPlayers === 0) {
        return false;
    }

    return rank <= nbPlayers / 2;
}

function HistoryComponent({
    rank,
    time,
    final_score,
}: HistoryComponentProps) {
    const { t } = useTranslation();
    const scoreColor =
        final_score > 1000 ? "text-bgreen" : "text-bred";

    const rankColor =
        isRankInSecondHalf(rank) ? "text-bgreen" : "text-bred";

    return (
        <div className="bg-byellow w-full h-15 shrink-0 font-extrabold md:text-2xl text-lg flex items-center border-t border-l border-8 border-black/25 rounded-2xl hover:scale-101 hover:z-50 shadow-md shadow-black/75 hover:shadow-lg">
            <div className="w-1/3 h-full flex items-center justify-center">
                <p>
                    {t("gambleHistory.score")}{" "}
                    <span className={scoreColor}>{final_score}</span>
                </p>
            </div>

            <div className="w-1/3 h-full flex items-center justify-center">
                <p>
                    {t("gambleHistory.rank")} <span className={rankColor}>{rank}</span>
                </p>
            </div>

            <div className="w-1/3 h-full flex items-center justify-center">
                <p className="text-black/50">{time}</p>
            </div>
        </div>
    );
}

export default function GambleHistory({
    userID,
    className = "",
}: GambleHistoryProps) {
    const { t } = useTranslation();
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

            const data: History[] = Array.isArray(response.data)
                ? response.data
                : [];

            setHistory(data);

            const totalGame = data[0]?.total ?? 0;
            setTotalPages(Math.ceil(totalGame / 15));
        } catch (err: any) {
            console.error(
                "Détail complet de l'erreur API :",
                err.response || err
            );

            setError(
                err.response?.data?.error ||
                    t("gambleHistory.loadError")
            );

            setHistory([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [userID, page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className={`flex flex-col flex-1 w-full min-h-0 ${className}`}>
            <div className="bg-bdarkgreen w-full h-15 shrink-0 rounded-2xl font-extrabold flex justify-center items-center gap-x-3 text-2xl text-white">
                {t("gambleHistory.gamble")} <span className="text-bred">{t("gambleHistory.history")}</span>
            </div>

            <div className="w-full flex-1 min-h-0 overflow-y-auto flex flex-col gap-y-2 p-3">
                {loading ? (
                    <div className="text-white flex justify-center items-center h-full">
                        {t("common.loading")}
                    </div>
                ) : error ? (
                    <div className="text-bred flex justify-center items-center h-full text-center p-4">
                        {error}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-white flex justify-center items-center h-full">
                        {t("gambleHistory.noGames")}
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