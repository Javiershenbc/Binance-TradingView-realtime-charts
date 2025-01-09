import { useEffect, useRef, useState } from "react";
import { BINANCE_WS_BASE_URL } from "../config";

interface Order {
  price: string;
  quantity: string;
}

interface OrderBookData {
  bids: Order[];
  asks: Order[];
}

export const useOrderBook = (symbol: string, levels: number = 20) => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  let updateQueue: Order[] = [];

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = `${BINANCE_WS_BASE_URL}/${symbol.toLowerCase()}@depth${levels}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    // Set loading to true when connecting to a new pair
    setLoading(true);
    setError(null);

    ws.onopen = () => {
      console.log(`WebSocket connected for ${symbol}`);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Map bids and asks
        const bids = message.bids
          .slice(0, levels)
          .map(([price, quantity]: [string, string]) => ({
            price,
            quantity,
          }));

        const asks = message.asks
          .slice(0, levels)
          .map(([price, quantity]: [string, string]) => ({
            price,
            quantity,
          }));

        updateQueue = [...bids, ...asks];
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
        setError("Error processing data. Please refresh the page.");
        setLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error. Please refresh the page.");
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      if (!error) {
        setError("Connection lost. Retrying conection.");
      }
      setLoading(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [symbol, levels]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (updateQueue.length > 0) {
        setOrderBook({
          bids: updateQueue.slice(0, 20),
          asks: updateQueue.slice(20, 40),
        });
        updateQueue = [];
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return { orderBook, loading, error };
};
