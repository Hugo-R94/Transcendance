import { useEffect, useState } from "react";
import api from "../../api/api";
import { useUserAvatar } from "../../api/getUserAvatar";
import { Link } from "react-router-dom";

interface LeaderboardResponse {
    user_id: string;
    username: string;
    profile_picture: string;
    final_score: number;
}

interface ScoreCardProps {
    user_id: string;
    username: string;
    final_score: number;
    classement: number;
    color: string;
}

function ScoreCard({
    user_id,
    username,
    final_score,
    classement,
    color,
}: ScoreCardProps) {
    const avatarUrl = useUserAvatar(user_id);
    const userUrl = `/profil/${user_id}`;

    return (
        <div
            className={`flex w-full h-full rounded-2xl items-center p-1 px-2 text-lg gap-x-2 balatro ${color} outline-1 shadow-black/50 shadow-md`}
        >
            {/* Classement */}
            <p>{classement}.</p>

            {/* PP à gauche */}
            <div className="h-full aspect-square rounded-full balatro hover:outline-3 overflow-hidden flex-shrink-0">
                <Link to={userUrl}>
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-500 animate-pulse" />
                    )}
                </Link>
            </div>

            {/* Nom au centre */}
            <p className="flex-1 text-center truncate">
                {username}
            </p>

            {/* Score à droite */}
            <p className="text-right">
                {final_score}
            </p>
        </div>
    );
}

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse[]>([]);

    useEffect(() => {
        const getLeaderboard = async () => {
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

        getLeaderboard();
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
        <div className="flex flex-col gap-y-3 h-full w-full">
            {/* HEADER */}
            <div className="h-1/20 flex flex-col justify-center">
                <div className="w-full h-2/3 font-extrabold">
                    LEADERBOARD
                </div>

                <div className="flex w-full h-1/3 rounded-2xl text-sm text-white/50 px-5">
                    <p className="flex-1 text-center translate-x-5">
                        name
                    </p>

                    <p className="text-right">
                        score
                    </p>
                </div>
            </div>

            {/* TOP 3 */}
            <div className="flex flex-col bg-black/25 w-full h-3/10 rounded-2xl border-3 gap-y-2 p-2">
                {leaderboard.slice(0, 3).map((player, index) => (
                    <div
                        key={`top-${index}-${player.user_id}`}
                        className="flex-1 min-h-0"
                    >
                        <ScoreCard
                            color={topColors[index]}
                            classement={index + 1}
                            user_id={player.user_id}
                            username={player.username}
                            final_score={player.final_score}
                        />
                    </div>
                ))}
            </div>

            {/* RESTE DU TOP 15 */}
            <div className="flex flex-col bg-black/25 w-full h-6/10 rounded-2xl border-3 gap-y-1 p-2">
                {leaderboard.slice(3, 15).map((player, index) => (
                    <div
                        key={`rest-${index + 3}-${player.user_id}`}
                        className="flex-1 min-h-0"
                    >
                        <ScoreCard
                            color={colors[index % colors.length]}
                            classement={index + 4}
                            user_id={player.user_id}
                            username={player.username}
                            final_score={player.final_score}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
