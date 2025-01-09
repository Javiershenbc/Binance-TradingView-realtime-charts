import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalData, OHLCV } from "../binanceApi";
import { CandlestickData, Time } from "lightweight-charts";

// Function to convert data to Candlesticks data
const mapToCandlestickData = (data: OHLCV[]): CandlestickData[] => {
  return data.map((item) => ({
    time: item.time as Time,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }));
};

export const useHistoricalData = (pair: string) => {
  return useQuery<CandlestickData[], Error>({
    queryKey: ["historicalData", pair],
    queryFn: async () => {
      const rawData = await fetchHistoricalData(pair, "1m");
      return mapToCandlestickData(rawData);
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
