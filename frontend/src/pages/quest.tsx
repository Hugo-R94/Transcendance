import { useTranslation } from "react-i18next";
import api from "../api/api";
import { useEffect, useState } from "react";
import { useUserAvatar } from "../api/getUserAvatar";
import { Link } from "react-router-dom";

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

interface questType{
  is_finished: boolean;
  quest_type: number;
  quest_requirement: number;
  quest_count:  number;
  is_collected: boolean;
}

interface leaderboardUser{
    user_id: string;
    username: string;
    profile_picture: string;
    level: number;
}

interface userCardProps{  
    username: string;
    level: number;
    user_id: string;
    color: string;
}

function UserCard({ username, level, user_id, color }: userCardProps) {
    const avatar = useUserAvatar(user_id);
    const { t } = useTranslation();

    return (
        <div
            className={`${color} w-full h-full flex items-center justify-between rounded-2xl p-1 hover:scale-105 hover:outline-3 px-5`}
        >
            <div className="h-full aspect-square rounded-full overflow-hidden balatro">
            <Link to={`/profil/${user_id}`}>
                <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                />
            </Link>
            </div>

            <p className="font-extrabold text-xl">
                {username}
            </p>

            <p className="font-bold">
                {t("Quest.level")} <span className=" ml-3 font-extrabold text-xl "> {level}</span>
            </p>
        </div>
    );
}


export default function Quest(){
    const { t } = useTranslation();
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [questType, setQuestType] = useState<number>(-1);
    const [isCollected, setIsCollected] = useState<boolean>(false);
    const [questCount, setQuestCount] = useState<number>(-1);
    const [questRequirement, setQuestRequirement] = useState<number>(-1);
    const [leaderboard, setLeaderboard] = useState<leaderboardUser[]>([]);
    const [usersAvatar, setUsersAvatars] = useState<string[]>([]);

// recuperation de la quest et de son etat avec le back + leaderboard
    const state = true;
    // const quest = t("Quest.dailyQuest1")
    useEffect(() => {
        const loadQuest = async () => {
            const response = await api.get<questType>("/quest");
            const data = response.data;

            setIsFinished(data.is_finished);
            setQuestType(data.quest_type);
            setIsCollected(data.is_collected);
            setQuestCount(data.quest_count);
            // setQuestCount(data.quest_count);
            setQuestRequirement(data.quest_requirement);

            const resp = await api.get<leaderboardUser[]>("/questLeaderboard");
            setLeaderboard(resp.data);
            
        };

        loadQuest();
    }, []);
    console.log("quest type = %d | quest is finish = %v", questType, isFinished);
    const questTitle = t(`questTitle.${questType}`);
    const isFinish = isFinished ? "quest is finished" : "quest is not finished";
    console.log("quest count = ", questCount, "quest requirement = ", questRequirement);
    const completion = questCount / questRequirement;
    const rest = 1 - (questCount / questRequirement);
    return(
    <div className="relative min-h-screen items-center justify-center">
        <div className="w-[90vw] h-[85vh] mt-30 mx-auto flex sm:flex-row flex-col gap-x-2 ">

            <div className="sm:w-1/2 sm:h-full w-full h-1/3 flex flex-col gap-y-2">
                <div className="bg- w-full h-[88%] rounded-2xl p-3 flex flex-col justify-center items-center gap-y-3">
                     <div className="bg-byellow w-full h-20 flex justify-center items-center rounded-2xl ">
                    <p className=" text-2x1 font-extrabold">	{t("Quest.dailyQuestTitle")}</p>
                </div>
                    <div className="bg-bdarkgreen w-full h-fit rounded-2xl p-2 py-5 flex flex-col items-center gap-y-3">
                        {/* <p className="p-2 bg-byellow rounded-3xl w-[80%] top-0">{quest}</p> */}
                        <p className="p-2 bg-byellow rounded-3xl w-[80%] top-0">{questTitle}</p>
                        <div className="w-full h-20 flex flex-col gap-y-3">
                            <p>{questCount}/{questRequirement}</p>
                            <div className="bg-white w-[90%] mx-auto h-5 flex rounded-2xl overflow-hidden outline-3 ">
                                <div
                                    style={{ width: `${completion * 100}%` }}
                                    className="bg-bgreen h-full"
                                ></div>
                                                                <div
                                    style={{ width: `${rest * 100}%` }}
                                    className="bg-bred h-full"
                                ></div>
                            </div>
                        </div>
                        {/* <p className={`font-semibold ${state ? "bg-bgreen" : "bg-bred"} p-3 rounded-2xl shadow-black/50 shadow-md`}>
                            {isFinish}
                        </p> */}
                    </div>
                </div>
            </div>

            <div className="sm:w-1/2 sm:h-full w-full h-2/3 rounded-2xl flex flex-col gap-y-2">
                <div className="bg-byellow w-full h-15 rounded-2xl flex justify-center items-center ">
                    <p className="text-2xl font-extrabold">{t("Quest.leaderboard")}</p>
                </div>
				
                <div className="bg-bdarkgreen flex flex-col h-[90%] w-full rounded-2xl p-3 gap-y-2">

                    {/* TOP 3 */}
                <div className="bg-bdarkgreen flex flex-col h-[90%] w-full rounded-2xl p-3 gap-y-2">

                    {/* TOP 3 : TOUJOURS 3 CASES */}
                    <div className="bg-black/50 w-full h-1/3 rounded-2xl p-2 flex flex-col gap-y-2">
                        {Array.from({ length: 3 }).map((_, index) => {
                            const player = leaderboard[index];

                            return (
                                <div
                                    key={player?.user_id ?? `top-${index}`}
                                    className="flex-1 min-h-0"
                                >
                                    {player && (
                                        <UserCard
                                            user_id={player.user_id}
                                            username={player.username}
                                            level={player.level}
                                            color={topColors[index]}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* PLACES 4-15 : TOUJOURS 12 CASES */}
                    <div className="bg-black/50 w-full h-2/3 rounded-2xl p-2 flex flex-col gap-y-2">
                        {Array.from({ length: 12 }).map((_, index) => {
                            const player = leaderboard[index + 3];

                            return (
                                <div
                                    key={player?.user_id ?? `player-${index + 3}`}
                                    className="flex-1 min-h-0"
                                >
                                    {player && (
                                        <UserCard
                                            user_id={player.user_id}
                                            username={player.username}
                                            level={player.level}
                                            color={colors[index % 4]}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>


                </div>

            </div>

        </div>
    </div>
    );
}