import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/api";
import Notification from "../utils/notification";

function SupportContact() {
	const { t } = useTranslation();
	const [message, setMessage] = useState("");
	const [notification, setNotification] = useState(null);

	const showNotification = (message: string) => {
		setNotification(null);
		window.setTimeout(() => {
			setNotification(message);
		}, 10);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!message.trim()) {
			showNotification(t("supportContact.emptyMessage"));
			return;
		}
		try {
			await api.post("/support", { message: message.trim() });
			showNotification(t("supportContact.complaintReceived"));
		} catch {
			showNotification(t("supportContact.serverError"));
		}
	};
	return (
		<div className="bg-bdarkgreen w-full h-full rounded-2xl shadow-lg shadow-black/75 p-3">
			<p className="text-white font-bold mt-1">{t("supportContact.heading")}</p>

			<textarea onChange={(e) => setMessage(e.target.value)}
			className="flex text-white bg-black/50 w-[95%]  mx-auto h-[75%] my-4 rounded-2xl p-3 resize-none overflow-y-auto focus:outline-none" placeholder={t("supportContact.commentPlaceholder")} />

			<button
				onClick={handleSubmit}
				className="bg-byellow w-35 h-[10%] rounded-2xl balatro hover:outline-3 hover:outline-white active:scale-90 sm:mt-1 mt-3">
				<p className="font-bold text-2xl text-white ">{t("postComment.submit")}</p>
			</button>
			{notification &&(
				<Notification message={notification}/>
			)}
		</div>
	);
}

export default SupportContact 	 