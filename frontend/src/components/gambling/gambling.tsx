import { useState } from "react";
import { useGambling } from "../../use/useGambling";
import { useChat } from "../../use/useChat";
import { Roulette } from "./roulette";
import { PhaseTimer } from "./phaseTimer";
import { BettingPanel } from "./bettingPanel";
import { ResultsTable } from "./resultTable";
import { ScratchTicket } from "./scratchTicket";
import Lobby from "./Lobby";
import JsonDebugger from "./debug";
import type {JsonLog} from "../../api/gambling";

export default function Gambling() {
  const game = useGambling();
  const chat = useChat();

  //uncomment pour loption de debugg
  
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
        className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-4xl">

        <div className="mx-auto mt-3 shrink-0">
          <PhaseTimer state={game.state} countdown={game.phaseCountdown} turn={game.turn}/>
        </div>

        <div className="mx-auto my-2 flex aspect-square w-60 shrink-0 items-center justify-center overflow-visible">
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
          className="min-h-0 flex-1 w-full mx-auto overflow-hidden flex justify-center"
        >
          <div
            className="h-full min-h-0 w-fit max-w-[min(100%,1000px)]"
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
          <ScratchTicket state={game.state} hasBet={game.hasBet}
            ticket={game.ticket}  countdown={game.phaseCountdown}
            scratch={game.scratch}/>
			
			<ResultsTable results={game.results} playerId={game.playerId}
						players={game.players} turn={game.turn}/>

        </div>
      </main>

      {/* ========================= */}
      {/* DEBUGGER                   */}
      {/* ========================= */}

      {/* <JsonDebugger
        logs={jsonLogs}
        show={showLogs}
        setShow={setShowLogs}
        clearLogs={game.clearLogs}
      /> */}
    </>
  );
}
