// src/components/Notification.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface NotificationProps {
  message: string;
  onClose?: () => void;
}

function Notification({ message, onClose }: NotificationProps) {
  // On commence invisible/décalé
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Force un tick pour laisser le navigateur poser l'élément au départ (translate-y-10)
    const timerEnter = setTimeout(() => {
      setVisible(true); // Déclenche le slide IN
    }, 10);

    // Déclenche le slide OUT
    const timerOut = setTimeout(() => {
      setVisible(false);
    }, 2700);

    // Nettoyage final
    const timerClose = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => {
      clearTimeout(timerEnter);
      clearTimeout(timerOut);
      clearTimeout(timerClose);
    };
  }, [onClose]);

  const notificationContent = (
	<div
	className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] backdrop-blur-md card text-white font-semibold px-5 py-3 rounded-2xl shadow-xl transition-all duration-300 ease-out transform ${
		visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
	}`}
	>
	{message}
	</div>
  );

  return createPortal(notificationContent, document.body);
}

export default Notification;