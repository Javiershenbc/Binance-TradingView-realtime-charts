import axios from "axios";
import { BINANCE_REST_BASE_URL } from "./config";

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Function to fetch historical data
export const fetchHistoricalData = async (
  pair: string,
  interval: string,
  limit: number = 100
): Promise<OHLCV[]> => {
  const response = await axios.get(`${BINANCE_REST_BASE_URL}/klines`, {
    params: {
      symbol: pair.toUpperCase(),
      interval,
      limit,
    },
  });

  // Map the data to match the OHLCV interface
  return response.data.map((d: any) => ({
    time: d[0] / 1000, // Convert to seconds
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
    volume: parseFloat(d[5]),
  }));
};
