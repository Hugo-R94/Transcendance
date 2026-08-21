import { useEffect, useRef, useState } from "react";

export default function GamblingWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const connect = () => {
    if (socketRef.current) return;

    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      setConnected(true);
      setMessages((prev) => [...prev, "Connecté au serveur"]);
    };

    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, `Serveur : ${event.data}`]);
    };

    socket.onerror = () => {
      setMessages((prev) => [...prev, "Erreur WebSocket"]);
    };

    socket.onclose = () => {
      setConnected(false);
      socketRef.current = null;
      setMessages((prev) => [...prev, "Déconnecté"]);
    };

    socketRef.current = socket;
  };

  const disconnect = () => {
    socketRef.current?.close();
  };

  const sendMessage = () => {
    if (
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN ||
      !message.trim()
    ) {
      return;
    }

    socketRef.current.send(message);

    setMessages((prev) => [...prev, `Moi : ${message}`]);
    setMessage("");
  };

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Gambling WebSocket</h1>
            <p className="text-sm text-gray-400">
              Test de connexion au serveur
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <span className="text-sm text-gray-300">
              {connected ? "Connecté" : "Déconnecté"}
            </span>
          </div>
        </div>

        {/* Connection buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={connect}
            disabled={connected}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Connecter
          </button>

          <button
            onClick={disconnect}
            disabled={!connected}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Déconnecter
          </button>
        </div>

        {/* Messages */}
        <div className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-800 bg-gray-950 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun message...
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-800 px-3 py-2 text-sm"
                >
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send message */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Écrire un message..."
            disabled={!connected}
            className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white outline-none placeholder:text-gray-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            onClick={sendMessage}
            disabled={!connected || !message.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}