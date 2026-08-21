type LobbyCountdownProps = {
  countdown: number | null;
};

export default function LobbyCountdown({
  countdown,
}: LobbyCountdownProps) {
  if (countdown === null) {
    return null;
  }

  return (
    <section className="lobby-countdown">

      <div>
        Partie en préparation
      </div>

      <strong>
        {countdown}
      </strong>

      <div>
        secondes
      </div>

    </section>
  );
}