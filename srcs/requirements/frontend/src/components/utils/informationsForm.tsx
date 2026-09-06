import { useState } from "react";
import api from "../../api/api";
import Notification from "../utils/notification";
import { useTranslation } from "react-i18next";

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
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
	const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = newUsername.trim();
    const trimmedMail = newMail.trim();

    /*
     * Vérifications générales
     */
    if (!trimmedUsername || !trimmedMail) {
      setNotificationMessage(t("editProfile.UsernameAndEmailRequiered"));
      return;
    }

    if (trimmedUsername.length > 100) {
      setNotificationMessage(t("editProfile.UsernameLengthLimitErr"));
      return;
    }

    if (trimmedMail.length > 100) {
      setNotificationMessage(t("editProfile.EmailLengthLimitErr"));
      return;
    }

    /*
     * Si un des deux mots de passe est rempli,
     * les deux doivent obligatoirement l'être.
     */
    const hasOldPassword = oldPassword.trim().length > 0;
    const hasNewPassword = password.trim().length > 0;

    if (hasOldPassword !== hasNewPassword) {
      setNotificationMessage(t("editProfile.NeedTwoPassword"));
      return;
    }

    /*
     * Si un nouveau mot de passe est fourni,
     * vérifier sa longueur minimale.
     */
    if (hasNewPassword && password.length < 8) {
      setNotificationMessage(t("editProfile.PasswordMinLength"));
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

      setNotificationMessage(t("editProfile.informationsUpdated"));

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
           {t("editProfile.ModifyMyInformations")}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form name="submitform" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-white mb-1">
             {t("editProfile.username")}
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
                {t("editProfile.email")}
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
                {t("editProfile.oldpass")}
            </label>

            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder= {t("editProfile.placeholderOldpass")}
              className="w-full bg-white/10 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-bblue"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-1">
              {t("editProfile.newpass")}
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder= {t("editProfile.placeholderNewpass")}
              className="w-full bg-white/10 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-bblue"
            />
          </div>

          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors"
            >
              {t("editProfile.cancel")}
            </button>

            <button	
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-bblue hover:bg-bblue/80 text-white font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? t("editProfile.saving") : t("editProfile.saved")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InformationForm;
