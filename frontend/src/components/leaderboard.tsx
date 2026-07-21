function Leaderboard() {
  return (
    <div className="top-1/2 translate-y-1/2 left-1/2 bg-bdarkgreen w-full h-1/2 rounded-2xl flex flex-col justify-center items-center shadow-black/75 shadow-md">
      {/* En-tête / Titre */}
      <p className="pt-4">leaderboard</p>
      <div className="w-full p-4 border-b border-white/10 text-center">
        {/* Réservé au titre & onglets */}
      </div>

      {/* Corps du classement / Liste */}
      <div className="w-full flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
        {/* Réservé aux lignes de joueurs */}
      </div>
    </div>
  );
}

export default Leaderboard;