export default function NotificationSignal() {
  return (
    <div className="relative flex justify-center items-center ml-2 overflow-visible">
      <div className="absolute bg-bred w-2 h-2 rounded-2xl" />
      <div className="absolute bg-bred w-3 h-3 rounded-2xl animate-notification-pulse" />

      <div className="absolute h-8 w-8 rounded-full bg-radial from-red-500 to-transparent animate-notification-pulse" />
    </div>
  );
}