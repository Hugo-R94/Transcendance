export default function NotificationSignal() {
  return (
    <div className="relative flex justify-center items-center ms-2 overflow-visible shadow-md shadow-black/75">
      <div className="absolute bg-byellow w-2 h-2 rounded-2xl animate-notfication-pulse shadow-md shadow-black/75" />
      <div className="absolute bg-bred w-3 h-3 rounded-2xl animate-notification-pulse shadow-md shadow-black/75" />

      <div className="absolute h-8 w-8 rounded-full bg-radial from-red-500 to-transparent animate-notification-pulse" />
    </div>
  );
}