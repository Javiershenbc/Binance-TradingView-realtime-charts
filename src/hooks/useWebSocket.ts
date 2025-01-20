import { useEffect, useRef, useState } from "react";
import { CandlestickData, Time } from "lightweight-charts";
import { BINANCE_WS_BASE_URL } from "../config";

export const useWebSocket = (pair: string, interval: string) => {
  const [latestData, setLatestData] = useState<CandlestickData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const activePairRef = useRef(pair);
  const retryAttemptsRef = useRef(0);
  const maxRetries = 5;
  const retryDelay = 5000;
  const connectionStateRef = useRef<
    "connected" | "connecting" | "reconnecting" | "closed"
  >("closed");

  const connectWebSocket = () => {
    if (connectionStateRef.current === "connected") {
      console.log(`WebSocket is already connected for ${pair}.`);
      return;
    }

    connectionStateRef.current = "connecting";
    console.log(`Connecting WebSocket for ${pair}...`);

    const ws = new WebSocket(
      `${BINANCE_WS_BASE_URL}/${pair.toLowerCase()}@kline_${interval}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected for ${pair}`);
      connectionStateRef.current = "connected";
      retryAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.k && activePairRef.current === pair) {
        const kline = message.k;
        setLatestData({
          time: (kline.t / 1000) as Time,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.warn(`WebSocket closed for ${pair} with code ${event.code}.`);
      connectionStateRef.current = "closed";

      // Only retry if not manually closed (e.g., due to component unmount)
      if (event.code !== 1000 && retryAttemptsRef.current < maxRetries) {
        retryAttemptsRef.current += 1;
        console.log(
          `Retrying connection for ${pair} (${
            retryAttemptsRef.current
          }/${maxRetries}) in ${retryDelay / 1000} seconds...`
        );
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, retryDelay);
      } else if (retryAttemptsRef.current >= maxRetries) {
        console.error(`Max retry attempts reached for ${pair}.`);
      }
    };
  };

  useEffect(() => {
    activePairRef.current = pair;
    connectWebSocket();

    return () => {
      console.log(`Cleaning up WebSocket for pair: ${pair}`);
      clearTimeout(reconnectTimeoutRef.current!);
      wsRef.current?.close(1000); // Close with a normal closure code
      wsRef.current = null;
      connectionStateRef.current = "closed";
    };
  }, [pair, interval]);

  return latestData;
};
