import { useState } from "react";
import api from "../api/api";
import type { Conversation } from "../api/chat";

export function useConversations() {
    const [currentUserId, setCurrentUserId] = useState<string | null>(
        () => localStorage.getItem("userID")
    );
    const [convs, setConvs] = useState<Conversation[]>([]);

    const fetchMyProfile = async () => {
        try {
            const res = await api.get("/profil");

            if (res.data?.id) {
                const id = String(res.data.id);

                setCurrentUserId(id);
                localStorage.setItem("userID", id);
            }
        } catch (err: any) {
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await api.get("/convs");

            if (!Array.isArray(res.data?.conversations)) {
                setConvs([]);
                return;
            }

            setConvs(res.data.conversations as Conversation[]);
        } catch (err: any) {
        }
    };

    return {
        currentUserId,
        setCurrentUserId,
        convs,
        setConvs,
        fetchMyProfile,
        fetchConversations,
    };
}