import { useTranslation } from "react-i18next";
import api from "../api/api";
import { useEffect, useState } from "react";
import { useUserAvatar } from "../api/getUserAvatar";
import { Link } from "react-router-dom";
import { LeaderboardSection } from "../components/utils/leaderBoardSection";
import type { LeaderboardCardProps } from "../components/utils/leaderBoardSection";

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

function UserCardWrapper({ player, color }: LeaderboardCardProps<leaderboardUser>) {
    return (
        <UserCard
            user_id={player.user_id}
            username={player.username}
            level={player.level}
            color={color}
        />
    );
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
    const [isCollected, setIsCollected] = useState<boolean>(true);
    const [questCount, setQuestCount] = useState<number>(-1);
    const [questRequirement, setQuestRequirement] = useState<number>(-1);
    const [leaderboard, setLeaderboard] = useState<leaderboardUser[]>([]);

    useEffect(() => {
        const loadQuest = async () => {
            const response = await api.get<questType>("/quest");
            const data = response.data;

            setIsFinished(data.is_finished);
            setQuestType(data.quest_type);
            setIsCollected(data.is_collected);
            setQuestCount(data.quest_count);
            setQuestRequirement(data.quest_requirement);

            const resp = await api.get<leaderboardUser[]>("/questLeaderboard");
            setLeaderboard(resp.data);
            
        };

		
		
        loadQuest();
    }, []);
	
	const claimReward = async () => {
			await api.get("/claimReward");	
		};
		
    const questTitle = t(`questTitle.${questType}`);	
    const completion = questCount / questRequirement;
    const rest = 1 - (questCount / questRequirement);
    return(
    <div className="sm:relative min-h-screen items-center justify-center">
        <div className="w-[90vw] h-[85vh] sm:mt-30 mt-35 mx-auto flex sm:flex-row flex-col gap-x-2 sm:gap-y-0 gap-y-10">

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
						{/* 1. Quête terminée mais PAS encore récupérée */}
						{isFinished && !isCollected && (
						<button 
							className="bg-bgreen px-2 w-40 h-15 balatro hover:outline-3 active:scale-90 rounded-2xl shadow-black/75 shadow-md hover:shadow-lg cursor-pointer"
							onClick={() => claimReward()}
						>
							<p className="font-extrabold">{t("Quest.claim")}</p>
						</button>
						)}

						{/* 2. Quête terminée ET déjà récupérée */}
						{isFinished && isCollected && (
						<button 
							disabled 
							className="bg-gray-400 px-2 opacity-60 w-40 h-15 balatro rounded-2xl cursor-not-allowed"
						>
							<p className="font-extrabold">{t("Quest.alreadyClaimed")}</p>
						</button>
						)}
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
					<div className="bg-black/50 w-full h-1/3 rounded-2xl p-2">
						<LeaderboardSection
							data={leaderboard}
							limit={3}
							offset={0}
							getColor={(i) => topColors[i]}
							CardComponent={UserCardWrapper}
						/>
					</div>

					<div className="bg-black/50 w-full h-2/3 rounded-2xl p-2">
						<LeaderboardSection
							data={leaderboard}
							limit={12}
							offset={3}
							getColor={(i) => colors[i % colors.length]}
							CardComponent={UserCardWrapper}
						/>
					</div>
                </div>
            </div>
        </div>
    </div>
    );
}