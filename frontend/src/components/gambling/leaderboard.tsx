import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import api from "../../api/api";
import { useUserAvatar } from "../../api/getUserAvatar";

type Player = {
    user_id: string;
    username: string;
    profile_picture: string;
    final_score: number;
};

type ScoreCardProps = {
    player: Player;
    classement: number;
    color: string;
};

function ScoreCard({
    player,
    classement,
    color,
}: ScoreCardProps) {
    const avatarUrl = useUserAvatar(player.user_id);

    return (
        <div
            className={`flex w-full h-full items-center gap-x-2 p-1 px-2 text-lg rounded-2xl balatro ${color} outline-1 shadow-md shadow-black/50`}
        >
            <p>{classement}.</p>

            <div className="h-full aspect-square flex-shrink-0 overflow-hidden rounded-full balatro hover:outline-3">
                <Link to={`/profil/${player.user_id}`}>
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={player.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-500 animate-pulse" />
                    )}
                </Link>
            </div>

            <p className="hidden md:block flex-1 text-center truncate">
                {player.username}
            </p>

            <p className="hidden md:block w-16 text-end">
                {player.final_score}
            </p>
        </div>
    );
}

export default function Leaderboard() {
    const { t } = useTranslation();
    const [leaderboard, setLeaderboard] = useState<Player[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get("/leaderboard");
                setLeaderboard(response.data);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération du leaderboard :",
                    error
                );
            }
        };

        fetchLeaderboard();
    }, []);

    const topColors = [
        "bg-[#FFD700]",
        "bg-[#C0C0C0]",
        "bg-[#CD7F32]",
    ];

    const colors = [
        "bg-bblue",
        "bg-byellow",
        "bg-bred",
        "bg-bgreen",
    ];

    return (
        <div className="flex flex-col gap-y-3 w-full h-full">
            <div className="h-1/20 flex flex-col justify-center">
                <div className="w-full h-2/3 font-extrabold">
                    {t("leaderboard.title")}
                </div>

                <div className="flex w-full h-1/3 px-5 text-sm text-white/50">
                    <p className="flex-1 text-center translate-x-5">
                        {t("leaderboard.name")}
                    </p>

                    <p className="text-end">
                        {t("leaderboard.score")}
                    </p>
                </div>
            </div>

            <div className="flex flex-col w-full h-3/10 gap-y-2 p-2 bg-black/25 rounded-2xl border-3">
                {leaderboard.slice(0, 3).map((player, index) => (
                    <div
                        key={player.user_id}
                        className="flex-1 min-h-0"
                    >
                        <ScoreCard
                            player={player}
                            classement={index + 1}
                            color={topColors[index]}
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-col w-full h-6/10 gap-y-1 p-2 bg-black/25 rounded-2xl border-3">
                {leaderboard.slice(3, 15).map((player, index) => (
                    <div
                        key={player.user_id}
                        className="flex-1 min-h-0"
                    >
                        <ScoreCard
                            player={player}
                            classement={index + 4}
                            color={colors[index % colors.length]}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}