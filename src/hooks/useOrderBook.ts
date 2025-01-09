import { useEffect, useRef, useState } from "react";

interface Order {
  price: string;
  quantity: string;
}

interface OrderBookData {
  bids: Order[]; // Ofertas de compra
  asks: Order[]; // Ofertas de venta
}

export const useOrderBook = (symbol: string, levels: number = 10) => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
  });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth${levels}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Mapeo correcto de bids y asks
      const bids = message.bids.map(([price, quantity]: [string, string]) => ({
        price,
        quantity,
      }));

      const asks = message.asks.map(([price, quantity]: [string, string]) => ({
        price,
        quantity,
      }));

      setOrderBook({ bids, asks });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [symbol, levels]);

  return orderBook;
};
