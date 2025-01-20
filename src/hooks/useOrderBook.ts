import { useEffect, useRef, useState } from "react";
import { SPOT_API_BASE_URL, BINANCE_WS_BASE_URL } from "../config";

export interface Order {
  price: string;
  quantity: string;
}

export const useOrderBook = (pair: string) => {
  const [orderBook, setOrderBook] = useState<{ bids: Order[]; asks: Order[] }>({
    bids: [],
    asks: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const updateTimeoutRef = useRef<number | null>(null);
  const retryAttemptsRef = useRef(0);
  const maxRetries = 5;
  const activePairRef = useRef(pair);
  const updateQueueRef = useRef<{
    b: [string, string][];
    a: [string, string][];
  }>({
    b: [],
    a: [],
  });

  const fetchInitialOrderBook = async (pair: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${SPOT_API_BASE_URL}depth?symbol=${pair.toUpperCase()}&limit=1000`
      );
      const data = await response.json();

      setOrderBook({
        bids: data.bids.map(([price, quantity]: [string, string]) => ({
          price,
          quantity,
        })),
        asks: data.asks.map(([price, quantity]: [string, string]) => ({
          price,
          quantity,
        })),
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch initial order book.");
      setLoading(false);
    }
  };

  const applyDepthUpdate = (
    existingOrderBook: { bids: Order[]; asks: Order[] },
    updates: { b: [string, string][]; a: [string, string][] }
  ) => {
    const updateSide = (
      side: Order[],
      updates: [string, string][]
    ): Order[] => {
      const updatedSide = [...side];
      updates.forEach(([price, quantity]) => {
        const index = updatedSide.findIndex((item) => item.price === price);
        if (parseFloat(quantity) === 0) {
          if (index !== -1) updatedSide.splice(index, 1);
        } else {
          if (index !== -1) {
            updatedSide[index].quantity = quantity;
          } else {
            updatedSide.push({ price, quantity });
          }
        }
      });
      return updatedSide.sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
    };

    return {
      bids: updateSide(existingOrderBook.bids, updates.b),
      asks: updateSide(existingOrderBook.asks, updates.a),
    };
  };

  const connectWebSocket = () => {
    // Check if WebSocket is already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already connected.");
      return;
    }

    setConnectionStatus("connecting");
    const ws = new WebSocket(
      `${BINANCE_WS_BASE_URL}/${pair.toLowerCase()}@depth@100ms`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket OrderBook connected for ${pair}`);
      setConnectionStatus("connected");
      retryAttemptsRef.current = 0; // Reset retries
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.e === "depthUpdate" && activePairRef.current === pair) {
        updateQueueRef.current.b.push(...message.b);
        updateQueueRef.current.a.push(...message.a);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket OrderBook error for ${pair}:`, error);
      setError("WebSocket OrderBook error occurred.");
    };

    ws.onclose = () => {
      console.warn(`WebSocket OrderBook closed for ${pair}`);
      setConnectionStatus("disconnected");

      // Attempt reconnection if retries are available
      if (
        activePairRef.current === pair &&
        retryAttemptsRef.current < maxRetries
      ) {
        retryAttemptsRef.current += 1;
        const delay = Math.min(retryAttemptsRef.current * 2000, 10000); // Exponential backoff
        console.log(`Reconnecting in ${delay / 1000}s...`);
        reconnectTimeoutRef.current = window.setTimeout(
          connectWebSocket,
          delay
        );
      } else if (retryAttemptsRef.current >= maxRetries) {
        console.error("Max retry attempts reached. Connection not restored.");
        setError("Max retries reached. WebSocket connection failed.");
      }
    };
  };

  useEffect(() => {
    activePairRef.current = pair;

    // Reset state for the new pair
    setOrderBook({ bids: [], asks: [] });
    updateQueueRef.current = { b: [], a: [] };
    fetchInitialOrderBook(pair);

    connectWebSocket();

    // Process updates every 10 seconds
    updateTimeoutRef.current = window.setInterval(() => {
      setOrderBook((prev) =>
        applyDepthUpdate(prev, {
          b: updateQueueRef.current.b,
          a: updateQueueRef.current.a,
        })
      );
      updateQueueRef.current = { b: [], a: [] }; // Clear the queue
    }, 10000);

    return () => {
      // Cleanup on unmount or pair switch
      if (updateTimeoutRef.current) {
        clearInterval(updateTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [pair]);

  return { orderBook, loading, error, connectionStatus };
};
