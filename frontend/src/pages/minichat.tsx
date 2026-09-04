import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';


interface User {
  id: string;
  username: string;
  profile_pic?: string;
}

interface Message {
  id: string;
  sender_id: string;
  conversation_id: string;
  text: string;
  time: string;
  type: string;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  user1: User;
  user2: User;
  accepted: boolean | number | string;
  messages: Message[];
}

export default function MinimalChat() {
  const { t } = useTranslation();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedConv, setSelectedConv] =
    useState<Conversation | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const wsConnectingRef = useRef(false);

  const fetchMyProfile = async () => {
    try {
      const res = await api.get('/profil');

      if (res.data?.id) {
        setCurrentUserId(String(res.data.id));
      }
    } catch (err: any) {
      console.error(
        'Impossible de récupérer le profil courant :',
        err.response?.data || err.message
      );
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/convs');

      if (!res.data?.conversations) {
        return;
      }

      const conversations: Conversation[] =
        res.data.conversations;

      setConvs(conversations);

      setSelectedConv((previousSelected) => {
        if (!previousSelected) {
          return null;
        }

        const updatedConversation =
          conversations.find(
            (conversation) =>
              conversation.id === previousSelected.id
          );

        return updatedConversation || null;
      });
    } catch (err: any) {
      console.error(
        'Erreur de récupération des conversations :',
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    let ws: WebSocket | null = null;

    if (wsConnectingRef.current) {
      return;
    }

    wsConnectingRef.current = true;

    const setupChatConnection = () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error(
          'Impossible d’ouvrir le WebSocket : token absent.'
        );

        setWsConnected(false);
        wsConnectingRef.current = false;

        return;
      }

      const protocol =
        window.location.protocol === 'https:'
          ? 'wss:'
          : 'ws:';

      const wsUrl =
        `${protocol}//localhost:8080/api/v1/ws?token=${encodeURIComponent(
          token
        )}`;

      console.log(
        'Ouverture du WebSocket...'
      );

      ws = new WebSocket(wsUrl);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log(
          'Connecté au WebSocket 🔌'
        );

        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(
            event.data
          );

          console.log(
            'Message reçu du WebSocket :',
            data
          );

          switch (data.type) {

            case 'message': {
              setConvs((previousConvs) =>
                previousConvs.map((conv) => {
                  if (
                    conv.id !==
                    data.conversation_id
                  ) {
                    return conv;
                  }

                  return {
                    ...conv,
                    messages: [
                      data,
                      ...(conv.messages || []),
                    ],
                  };
                })
              );

              setSelectedConv((previousConv) => {
                if (
                  !previousConv ||
                  previousConv.id !==
                    data.conversation_id
                ) {
                  return previousConv;
                }

                return {
                  ...previousConv,
                  messages: [
                    data,
                    ...(previousConv.messages || []),
                  ],
                };
              });

              break;
            }

            case 'friend_req': {
              fetchConversations();
              break;
            }

            case 'friend_accept': {
              fetchConversations();
              break;
            }

            default:
              console.log(
                'Événement WebSocket inconnu :',
                data
              );
          }
        } catch (err) {
          console.error(
            'Erreur de parsing du message WebSocket :',
            err
          );
        }
      };

      ws.onerror = (event) => {
        console.error(
          'Erreur WebSocket :',
          event
        );

        setWsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(
          'WebSocket fermé.',
          'Code:',
          event.code,
          'Reason:',
          event.reason
        );

        setWsConnected(false);

        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      };
    };

    fetchMyProfile();
    fetchConversations();
    setupChatConnection();

    return () => {
      if (ws) {
        ws.close();
      }

      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      wsConnectingRef.current = false;
    };
  }, []);

  const handleSendFriendRequest = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const username =
      targetUsername.trim();

    if (!username) {
      return;
    }

    try {
      await api.post(
        '/friend_request',
        {
          username,
        }
      );

      alert(t('chat.alerts.friendRequestSent'));

      setTargetUsername('');

      await fetchConversations();
    } catch (err: any) {
      console.error(
        'Erreur demande d ami :',
        err.response?.data ||
          err.message
      );

      alert(
        err.response?.data?.error ||
          t('chat.alerts.friendRequestFailed')
      );
    }
  };

  const getOtherUserId = (
    conv: Conversation
  ): string | null => {

    if (!currentUserId) {
      return (
        conv.user2_id ||
        conv.user1_id ||
        null
      );
    }

    if (
      String(conv.user1_id) ===
        currentUserId ||
      String(conv.user1?.id) ===
        currentUserId
    ) {
      return (
        conv.user2_id || null
      );
    }

    if (
      String(conv.user2_id) ===
        currentUserId ||
      String(conv.user2?.id) ===
        currentUserId
    ) {
      return (
        conv.user1_id || null
      );
    }

    return (
      conv.user1_id ||
      conv.user2_id ||
      null
    );
  };

  const handleAcceptFriendRequest = async (
    conv: Conversation
  ) => {
    try {
      const otherUserId =
        getOtherUserId(conv);

      if (!otherUserId) {
        alert(t('chat.alerts.userNotFound'));

        return;
      }

      await api.put(
        '/friend_accept',
        {
          id: otherUserId,
          accept: true,
        }
      );

      alert(t('chat.alerts.friendRequestAccepted'));

      await fetchConversations();
    } catch (err: any) {
      console.error(
        'Erreur acceptation ami :',
        err.response?.data ||
          err.message
      );

      alert(
        err.response?.data?.error ||
          t('chat.alerts.friendAcceptFailed')
      );
    }
  };

  const handleSendMessage = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const text =
      newMessage.trim();

    if (!text) {
      return;
    }

    if (!selectedConv) {
      alert(t('chat.alerts.selectConversation'));

      return;
    }

    const ws =
      wsRef.current;

    if (!ws) {
      alert(t('chat.alerts.wsMissing'));

      return;
    }

    if (
      ws.readyState !==
      WebSocket.OPEN
    ) {
      alert(t('chat.alerts.wsNotActive'));

      return;
    }

    const payload = {
      type: 'message',
      conversation_id:
        selectedConv.id,
      text,
    };

    console.log(
      'Envoi du message :',
      payload
    );

    ws.send(
      JSON.stringify(payload)
    );

    setNewMessage('');
  };

  const isAccepted = (
    accepted:
      | boolean
      | number
      | string
  ) => {
    return (
      accepted === true ||
      accepted === 1 ||
      accepted === '1' ||
      accepted === 'true'
    );
  };

  const isPending = (
    accepted:
      | boolean
      | number
      | string
  ) => {
    return (
      accepted === false ||
      accepted === 0 ||
      accepted === '0' ||
      accepted === 'false'
    );
  };

  const activeConvs =
    convs.filter((conv) =>
      isAccepted(
        conv.accepted
      )
    );

  const pendingRequests =
    convs.filter((conv) =>
      isPending(
        conv.accepted
      )
    );

  const getOtherUser = (
    conv: Conversation
  ) => {

    if (!currentUserId) {
      return (
        conv.user2?.username ||
        conv.user1?.username ||
        t('chat.defaultUsername')
      );
    }

    if (
      String(conv.user1_id) ===
        currentUserId ||
      String(conv.user1?.id) ===
        currentUserId
    ) {
      return (
        conv.user2?.username ||
        t('chat.defaultUsername')
      );
    }

    return (
      conv.user1?.username ||
      t('chat.defaultUsername')
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">

      <div className="w-1/3 bg-white border-r flex flex-col mt-20">

        <div className="p-4 border-b">

          <h2 className="text-lg font-bold mb-2">
            {t('chat.addFriend')}
          </h2>

          <form
            onSubmit={
              handleSendFriendRequest
            }
            className="flex gap-2"
          >

            <input
              type="text"
              placeholder={t('chat.usernamePlaceholder')}
              value={targetUsername}
              onChange={(e) =>
                setTargetUsername(
                  e.target.value
                )
              }
              className="border rounded px-2 py-1 text-sm flex-1"
            />

            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              {t('chat.addButton')}
            </button>

          </form>

        </div>

        <div className="px-4 py-2 border-b bg-gray-50">

          <div className="flex items-center gap-2 text-xs">

            <span
              className={`w-2 h-2 rounded-full ${
                wsConnected
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />

            <span className="text-gray-500">
              {wsConnected
                ? t('chat.wsConnected')
                : t('chat.wsDisconnected')}
            </span>

          </div>

        </div>

        <div className="border-b bg-gray-50 p-4">

          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {t('chat.pendingRequests', { count: pendingRequests.length })}
          </h3>

          {pendingRequests.length ===
          0 ? (

            <p className="text-xs text-gray-400">
              {t('chat.noPendingRequests')}
            </p>

          ) : (

            pendingRequests.map(
              (req) => (

                <div
                  key={req.id}
                  className="flex items-center justify-between bg-white p-2 rounded border mb-2 text-sm shadow-sm"
                >

                  <span className="font-medium">
                    {getOtherUser(req)}
                  </span>

                  <button
                    onClick={() =>
                      handleAcceptFriendRequest(
                        req
                      )
                    }
                    className="bg-green-500 text-white px-2.5 py-1 rounded text-xs hover:bg-green-600"
                  >
                    {t('chat.accept')}
                  </button>

                </div>

              )
            )

          )}

        </div>

        <div className="flex-1 overflow-y-auto">

          <h3 className="text-xs font-semibold text-gray-400 uppercase px-4 py-2">
            {t('chat.discussions', { count: activeConvs.length })}
          </h3>

          {activeConvs.length ===
          0 ? (

            <p className="p-4 text-sm text-gray-500">
              {t('chat.noActiveDiscussions')}
            </p>

          ) : (

            activeConvs.map(
              (conv) => (

                <div
                  key={conv.id}
                  onClick={() =>
                    setSelectedConv(
                      conv
                    )
                  }
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConv?.id ===
                    conv.id
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >

                  <p className="font-semibold text-sm">
                    {getOtherUser(
                      conv
                    )}
                  </p>

                </div>

              )
            )

          )}

        </div>

      </div>

      <div className="flex-1 flex flex-col bg-white mt-20">

        {selectedConv ? (

          <>

            <div className="p-4 border-b font-bold flex items-center justify-between">

              <span>
                {t('chat.discussionWith', { name: getOtherUser(selectedConv) })}
              </span>

              <span
                className={`text-xs font-normal ${
                  wsConnected
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {wsConnected
                  ? t('chat.online')
                  : t('chat.offline')}
              </span>

            </div>

			<div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse gap-2">
						
			{selectedConv.messages &&
			selectedConv.messages.length > 0 ? (

				selectedConv.messages.map((msg) => {

				const isMyMessage =
					String(msg.sender_id) ===
					String(currentUserId);

				return (
					<div
					key={msg.id}
					className={`p-2 rounded max-w-xs text-sm ${
						isMyMessage
						? 'bg-gray-100 text-gray-800 self-start mr-auto'
						: 'bg-blue-500 text-white self-end ml-auto'
					}`}
					>
					{msg.text}
					</div>
				);
				})

			) : (

				<p className="text-center text-gray-400 text-sm mt-4">
				{t('chat.noMessages')}
				</p>

			)}

			</div>

            <form
              onSubmit={
                handleSendMessage
              }
              className="p-4 border-t flex gap-2"
            >

              <input
                type="text"
                placeholder={t('chat.messagePlaceholder')}
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(
                    e.target.value
                  )
                }
                className="border rounded px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={
                  !wsConnected
                }
                className={`text-white px-4 py-2 rounded text-sm ${
                  wsConnected
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {t('chat.send')}
              </button>

            </form>

          </>

        ) : (

          <div className="flex-1 flex items-center justify-center text-gray-400">
            {t('chat.selectDiscussion')}
          </div>

        )}

      </div>

    </div>
  );
}
