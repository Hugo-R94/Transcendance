import { useState } from "react";

export function useNotification() {
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (message: string, timeoffset?: number) => {
        setNotification(null);
        window.setTimeout(() => setNotification(message), timeoffset);
    };

    return { notification, setNotification, showNotification };
}