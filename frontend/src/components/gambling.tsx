import { useState } from "react";
import { useGambling } from "../use/useGambling";
import { useChat } from "../use/useChat";

import { Roulette } from "./gambling/roulette";
import { PhaseTimer } from "./gambling/phaseTimer";
import { BettingPanel } from "./gambling/bettingPanel";
import { MyResult } from "./gambling/Result";
import { ResultsTable } from "./gambling/resultTable";
import { ScratchTicket } from "./gambling/scratchTicket";
import Lobby from "./gambling/Lobby";

type JsonLog = {
  id: number;
  direction: "sent" | "received" | "system";
  data: any;
  timestamp: string;
};

export default function Gambling() {
  const game = useGambling();
  const chat = useChat();

  const [showLogs, setShowLogs] = useState(true);

  const jsonLogs: JsonLog[] = game.jsonLogs ?? [];

  if (!game.gameStarted) {
    return (
      <>
        <Lobby
          connected={game.connected}
          joined={game.joined}
          roomId={game.roomId}
          setRoomId={game.setRoomId}
          players={game.players}
          playerId={game.playerId}
          ready={game.ready}
          countdown={game.countdown}
          error={game.error}
          friends={chat.friends}
          invite={chat.invite}
          connect={game.connect}
          disconnect={game.disconnect}
          joinRoom={game.joinRoom}
          toggleReady={game.toggleReady}
          leaveRoom={game.leaveRoom}
          joinRoomByID={game.joinRoomByID}
        />

        <JsonDebugger
          logs={jsonLogs}
          show={showLogs}
          setShow={setShowLogs}
          clearLogs={game.clearLogs}
        />
      </>
    );
  }

  return (
    <>
      <main
        className="
          relative
          flex
          h-full
          min-h-0
          w-full
          flex-col
          overflow-hidden
          rounded-4xl
        "
      >
        {/* ========================= */}
        {/* TIMER                      */}
        {/* ========================= */}

        <div className="mx-auto mt-3 shrink-0">
          <PhaseTimer
            state={game.state}
            countdown={game.phaseCountdown}
			turn={game.turn}
          />
        </div>

        {/* ========================= */}
        {/* ROULETTE                   */}
        {/* ========================= */}

        <div
          className="
            mx-auto
            my-2
            flex
            aspect-square
			w-60
            shrink-0
            items-center
            justify-center
            overflow-visible
          "
        >
          <Roulette
            winningNumber={game.winningNumber}
            rotationDegree={game.rotationDegree}
            state={game.state}
            turn={game.turn}
          />
        </div>

        {/* ========================= */}
        {/* BETTING                    */}
        {/* ========================= */}

        <div
          className="
            min-h-0
            flex-1
            w-full
            mx-auto
            overflow-hidden
            flex
            justify-center
          "
        >
          <div
            className="
              h-full
              min-h-0
              w-fit
              max-w-[min(100%,1000px)]
			  
            "
          >
            <BettingPanel
              state={game.state}
              balance={game.balance}
              betAmount={game.betAmount}
              setBetAmount={game.setBetAmount}
              target={game.target}
              setTarget={game.setTarget}
              currentBet={game.currentBet}
              hasBet={game.hasBet}
              phaseCountdown={game.phaseCountdown}
              placeBet={game.placeBet}
              userID={localStorage.getItem("userID") ?? ""}
              playerNumber={game.playerNumber ?? 0}
              playerBets={game.playerBets}
            />
          </div>
        </div>

        {/* ========================= */}
        {/* TICKET / RESULTATS        */}
        {/* ========================= */}

        <div className="">
          <ScratchTicket
            state={game.state}
            hasBet={game.hasBet}
            ticket={game.ticket}
            countdown={game.phaseCountdown}
            scratch={game.scratch}
          />

          {/* <MyResult result={game.myResult} /> */}

			<ResultsTable
			results={game.results}
			playerId={game.playerId}
			players={game.players}
			/>

        </div>
      </main>

      {/* ========================= */}
      {/* DEBUGGER                   */}
      {/* ========================= */}

      <JsonDebugger
        logs={jsonLogs}
        show={showLogs}
        setShow={setShowLogs}
        clearLogs={game.clearLogs}
      />
    </>
  );
}

function JsonDebugger({
  logs,
  show,
  setShow,
  clearLogs,
}: {
  logs: JsonLog[];
  show: boolean;
  setShow: (value: boolean) => void;
  clearLogs: () => void;
}) {
  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="
          fixed
          bottom-5
          right-5
          z-[9999]
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          px-4
          py-3
          text-sm
          font-black
          text-white
          shadow-2xl
          hover:bg-slate-800
        "
      >
        WebSocket JSON
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <div
        className="
          flex
          h-[420px]
          w-[400px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-700
          bg-slate-950
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-800
            bg-slate-900
            px-4
            py-3
          "
        >
          <div>
            <div className="font-black text-white">
              WebSocket
            </div>

            <div className="text-xs text-slate-500">
              {logs.length} message{logs.length > 1 ? "s" : ""}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearLogs}
              className="
                rounded-lg
                bg-slate-800
                px-3
                py-1
                text-xs
                font-bold
                text-slate-300
                hover:bg-slate-700
              "
            >
              Vider
            </button>

            <button
              onClick={() => setShow(false)}
              className="
                rounded-lg
                bg-red-950
                px-3
                py-1
                text-sm
                font-black
                text-red-400
                hover:bg-red-900
              "
            >
              ×
            </button>
          </div>
        </div>

        {/* LOGS */}
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {logs.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              Aucun message WebSocket
            </div>
          )}

          {logs.map((log) => {
            const sent = log.direction === "sent";
            const received = log.direction === "received";

            return (
              <div
                key={log.id}
                className={`
                  rounded-xl
                  border
                  p-3
                  ${
                    sent
                      ? "border-green-800 bg-green-950/40"
                      : received
                        ? "border-blue-800 bg-blue-950/40"
                        : "border-slate-800 bg-slate-900"
                  }
                `}
              >
                {/* LOG HEADER */}
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`
                      text-[10px]
                      font-black
                      ${
                        sent
                          ? "text-green-400"
                          : received
                            ? "text-blue-400"
                            : "text-slate-500"
                      }
                    `}
                  >
                    {sent
                      ? "↑ ENVOYÉ"
                      : received
                        ? "↓ REÇU"
                        : "SYSTEM"}
                  </span>

                  <span className="text-[10px] text-slate-600">
                    #{log.id} · {log.timestamp}
                  </span>
                </div>

                {/* JSON */}
                <pre
                  className={`
                    max-h-40
                    overflow-auto
                    whitespace-pre-wrap
                    break-all
                    text-xs
                    ${
                      sent
                        ? "text-green-300"
                        : received
                          ? "text-blue-300"
                          : "text-slate-400"
                    }
                  `}
                >
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
