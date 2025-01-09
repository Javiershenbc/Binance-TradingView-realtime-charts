import { useEffect, useRef, useState } from "react";
import { CandlestickData, Time } from "lightweight-charts";

const BINANCE_WS_BASE_URL = "wss://stream.binance.com:9443/ws";

export const useWebSocket = (pair: string, interval: string) => {
  const [latestData, setLatestData] = useState<CandlestickData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let retryTimeout: number;

    const connectWebSocket = () => {
      const ws = new WebSocket(
        `${BINANCE_WS_BASE_URL}/${pair.toLowerCase()}@kline_${interval}`
      );
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.k) {
          const kline = message.k;
          setLatestData({
            time: (kline.t / 1000) as Time, // Convert to seconds
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

      ws.onclose = () => {
        console.log("WebSocket closed. Reconnecting...");
        retryTimeout = window.setTimeout(() => {
          console.log("Retrying...");
        }, 5000);
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(retryTimeout);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [pair, interval]);

  return latestData;
};
