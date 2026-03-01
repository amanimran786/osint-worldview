import { useEffect, useRef, useCallback } from 'react';
import type { WSMessage } from '../types';

/**
 * Hook to connect to the real-time signal WebSocket.
 * Gracefully degrades when no backend is available (Vercel/static deploy).
 * Reconnects with exponential backoff, max 3 attempts then stops.
 */
export function useWebSocket(onMessage: (msg: WSMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;
  const maxRetries = 3; // Stop retrying quickly in serverless mode

  const connect = useCallback(() => {
    // Don't attempt WebSocket on Vercel or static deploys
    if (retriesRef.current >= maxRetries) return;

    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws/signals`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        retriesRef.current = 0;
        const interval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 30000);
        ws.addEventListener('close', () => clearInterval(interval));
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          callbackRef.current(msg);
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
          retriesRef.current += 1;
          setTimeout(connect, delay);
        }
      };

      ws.onerror = () => { ws.close(); };

      wsRef.current = ws;
    } catch {
      // WebSocket not available — running in serverless mode
    }
  }, []);

  useEffect(() => {
    connect();
    return () => { wsRef.current?.close(); };
  }, [connect]);

  return wsRef;
}
