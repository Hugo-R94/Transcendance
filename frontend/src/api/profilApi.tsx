	import api from "./api";

	export interface UserProfileResponse {
	username: string;
	description: string;
	title_1: string;
	title_2: string;
	}

	// Pour charger le profil de l'utilisateur connecté via son Token (GET /api/v1/profil)
	export async function getMyProfile(): Promise<UserProfileResponse> {
	const res = await api.get<UserProfileResponse>("/profil");
	return res.data;
	}

	// Pour charger le profil d'un autre utilisateur via son UUID (GET /profil/:id)
	export async function getUserProfileByID(userID: string): Promise<UserProfileResponse> {
	const res = await api.get<UserProfileResponse>(`/profil/${userID}`);
	return res.data;
	}

	export async function setUserTitle(
	titleIndex: 1 | 2,
	titleID: number
	): Promise<void> {
	await api.post(`/profil/title?title${titleIndex}=${titleID}`);
	}