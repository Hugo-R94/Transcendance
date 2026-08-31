import NotificationSignal from "../utils/notificationSignal";

type Tab = "friends" | "requests";

interface ChatMenuHeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onClose: () => void;
  isOpen: boolean;
  hasRequest: boolean;
}

export function ChatMenuHeader({
  activeTab,
  setActiveTab,
  onClose,
  isOpen,
  hasRequest,
}: ChatMenuHeaderProps) {
  return (
    <div
      className={`flex flex-row justify-center items-center gap-x-2 transition-all duration-300 rounded-2xl shrink-0 p-1 ${
        isOpen ? "w-full h-15" : "w-full h-9 justify-between px-2"
      }`}
    >
      {isOpen ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("friends");
            }}
            className={`bg-bblue w-1/2 h-full rounded-2xl balatro transition-all font-extrabold ${
              activeTab === "friends" ? "outline-3 outline-white" : ""
            } active:scale-90`}
          >
            AMIS
          </button>

          {/* Wrapper relatif pour positionner le rond */}
          <div className="relative w-1/2 h-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("requests");
              }}
              className={`bg-bred w-full h-full rounded-2xl balatro transition-all font-extrabold ${
                activeTab === "requests" ? "outline-3 outline-white" : ""
              } active:scale-90`}
            >
              INVITATIONS
            </button>

            {hasRequest && (
				<div className="absolute right-1 top-1">
				<NotificationSignal />
				</div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="bg-byellow w-1/5 h-full rounded-2xl balatro font-bold active:scale-90 flex items-center justify-center transition-all text-white"
          >
            <span className="transform transition-transform duration-500 inline-block rotate-0">
              ▼
            </span>
          </button>
        </>
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-full h-full flex flex-row items-center justify-between cursor-pointer text-white px-1"
        >
          <span className="font-bold text-xs tracking-wider balatro">
            CHAT
          </span>

          <span className="transform transition-transform duration-500 inline-block rotate-180 text-xs">
            ▼
          </span>
        </div>
      )}
    </div>
  );
}