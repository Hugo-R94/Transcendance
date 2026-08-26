import { useEffect, useState } from "react";
import api from "../api/api";

type HistoryComponentProps = {
	rank: string;
	time: string;
	final_score: number;
};

function HistoryComponent({ rank, date, score }: HistoryComponentProps) {
	const scoreColor = score > 0 ? "text-bgreen" : "text-bred";

	return (
		<div className="bg-white w-full h-15 shrink-0 font-extrabold flex items-center">
			<div className="w-1/3 h-full flex items-center justify-center">
				<p>
					score : <span className={scoreColor}>{score}</span>
				</p>
			</div>

			<div className="w-1/3 h-full flex items-center justify-center">
				<p>
					rank : <span>{rank}</span>
				</p>
			</div>

			<div className="w-1/3 h-full flex items-center justify-center">
				<p className="text-black/50">{date}</p>
			</div>
		</div>
	);
}

type GambleHistoryProps = {
	userID?: string;
};

type History = {
	rank: string;
	date: string;
	score: number;
};

export default function GambleHistory({ userID }: GambleHistoryProps) {
	const [history, setHistory] = useState<History[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchHistory = async () => {
			setLoading(true);
			setError(null);

			try {
				const url = userID
					? `/history/${userID}`
					: "/history";

				const response = await api.get(url);

				// On garde maximum 15 résultats
				setHistory(response.data.slice(0, 15));
			} catch (err: any) {
				console.error("Erreur récupération historique :", err);

				setError(
					err.response?.data?.error ||
					"Impossible de récupérer l'historique"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchHistory();
	}, [userID]);

	return (
		<div className="flex flex-col flex-1 w-full min-h-0">
			{/* Header */}
			<div className="bg-bdarkgreen w-full h-15 shrink-0 rounded-2xl font-extrabold flex justify-center items-center gap-x-3 text-2xl">
				GAMBLE <span className="text-bred">HISTORY</span>
			</div>

			{/* Historique */}
			<div className="bg-black w-full flex-1 min-h-0 overflow-y-auto flex flex-col">
				{loading && (
					<div className="text-white flex justify-center items-center h-full">
						Chargement...
					</div>
				)}

				{error && (
					<div className="text-bred flex justify-center items-center h-full">
						{error}
					</div>
				)}

				{!loading && !error && history.length === 0 && (
					<div className="text-white flex justify-center items-center h-full">
						Aucune partie jouée.
					</div>
				)}

				{!loading &&
					!error &&
					history.map((game, index) => (
						<HistoryComponent
							key={index}
							rank={game.rank}
							date={game.date}
							score={game.score}
						/>
					))}
			</div>

			{/* Footer */}
			<div className="bg-byellow w-full h-20 shrink-0 rounded-b-2xl" />
		</div>
	);
}
