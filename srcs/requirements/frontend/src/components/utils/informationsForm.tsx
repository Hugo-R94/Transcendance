import { useState } from "react";
import api from "../../api/api";
import Notification from "../utils/notification";

interface InformationFormProps {
  username: string;
  mail: string;
  onClose: () => void;
}

function InformationForm({
  username,
  mail,
  onClose,
}: InformationFormProps) {
  const [newUsername, setNewUsername] = useState(username);
  const [newMail, setNewMail] = useState(mail);
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = newUsername.trim();
    const trimmedMail = newMail.trim();

    /*
     * Vérifications générales
     */
    if (!trimmedUsername || !trimmedMail) {
      setNotificationMessage(
        "Le nom d'utilisateur et l'adresse e-mail sont obligatoires."
      );
      return;
    }

    if (trimmedUsername.length > 100) {
      setNotificationMessage(
        "Le nom d'utilisateur ne peut pas dépasser 100 caractères."
      );
      return;
    }

    if (trimmedMail.length > 100) {
      setNotificationMessage(
        "L'adresse e-mail ne peut pas dépasser 100 caractères."
      );
      return;
    }

    /*
     * Si un des deux mots de passe est rempli,
     * les deux doivent obligatoirement l'être.
     */
    const hasOldPassword = oldPassword.trim().length > 0;
    const hasNewPassword = password.trim().length > 0;

    if (hasOldPassword !== hasNewPassword) {
      setNotificationMessage(
        "Pour modifier votre mot de passe, vous devez renseigner l'ancien et le nouveau mot de passe."
      );
      return;
    }

    /*
     * Si un nouveau mot de passe est fourni,
     * vérifier sa longueur minimale.
     */
    if (hasNewPassword && password.length < 8) {
      setNotificationMessage(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    setIsSaving(true);

    try {
      await api.put("/updateInformation", {
        username: trimmedUsername,
        mail: trimmedMail,
        old_password: hasOldPassword ? oldPassword : null,
        password: hasNewPassword ? password : null,
      });

      setNotificationMessage("Informations mises à jour.");

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      setNotificationMessage(
        error.response?.data?.error ||
          "Impossible de modifier les informations."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {notificationMessage && (
        <Notification
          message={notificationMessage}
          onClose={() => setNotificationMessage(null)}
        />
      )}

      <div className="w-full max-w-md bg-black/80 rounded-2xl shadow-xl shadow-black p-6 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Modifier mes informations
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Nom d'utilisateur
            </label>

            <input
              type="text"
              value={newUsername}
              maxLength={100}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-white/10 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-bblue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Adresse e-mail
            </label>

            <input
              type="email"
              value={newMail}
              maxLength={100}
              onChange={(e) => setNewMail(e.target.value)}
              className="w-full bg-white/10 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-bblue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Ancien mot de passe
            </label>

            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Obligatoire pour changer le mot de passe"
              className="w-full bg-white/10 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-bblue"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Nouveau mot de passe
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Laisser vide pour conserver le mot de passe"
              className="w-full bg-white/10 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-bblue"
            />
          </div>

          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-bblue hover:bg-bblue/80 text-white font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InformationForm;
