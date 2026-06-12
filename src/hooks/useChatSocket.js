import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL || "/ws";

/**
 * STOMP over SockJS 채팅 훅
 * @param {number|null} chatRoomId  - 현재 열려 있는 채팅방 ID
 * @param {(msg: object) => void} onMessage - 새 메시지 수신 콜백
 */
export function useChatSocket(chatRoomId, onMessage) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  // 콜백이 바뀌어도 항상 최신 버전 참조
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // STOMP 클라이언트 초기화 (마운트 1회)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      reconnectDelay: 5000,
      onStompError: (frame) => {
        console.error("[STOMP] error", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  // 채팅방이 바뀔 때마다 구독 교체
  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    // 이전 구독 해제
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (!chatRoomId) return;

    // CONNECTED 상태이면 바로 구독, 아니면 연결 후 구독
    const subscribe = () => {
      subscriptionRef.current = client.subscribe(
        `/topic/chat/${chatRoomId}`,
        (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            onMessageRef.current(msg);
          } catch (e) {
            console.error("[STOMP] parse error", e);
          }
        }
      );
    };

    if (client.connected) {
      subscribe();
    } else {
      client.onConnect = () => subscribe();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [chatRoomId]);

  // 메시지 전송 함수
  const sendMessage = useCallback(
    (content) => {
      const client = clientRef.current;
      if (!client || !client.connected || !chatRoomId) return false;

      client.publish({
        destination: `/app/chat/${chatRoomId}/send`,
        body: JSON.stringify({ content }),
      });
      return true;
    },
    [chatRoomId]
  );

  return { sendMessage };
}
