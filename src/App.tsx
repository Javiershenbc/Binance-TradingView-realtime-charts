import React, { useState, useEffect } from "react";
import Dropdown from "./components/Dropdown";
import Chart from "./components/Chart";
import { useHistoricalData } from "./hooks/useHistoricalData";
import { useWebSocket } from "./hooks/useWebSocket";
import { CRYPTO_PAIRS } from "./config";
import { CandlestickData } from "lightweight-charts";

const App: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState(CRYPTO_PAIRS[0]);
  const {
    data: historicalData,
    isLoading,
    isError,
  } = useHistoricalData(selectedPair);
  const latestData = useWebSocket(selectedPair, "1m");
  const [combinedData, setCombinedData] = useState<CandlestickData[]>([]);

  useEffect(() => {
    if (historicalData) {
      setCombinedData(historicalData);
    }
  }, [historicalData]);

  useEffect(() => {
    if (latestData) {
      setCombinedData((prevData) => {
        const updatedData = [...prevData];
        const lastIndex = updatedData.length - 1;

        // If the latest candlestick is part of the same interval, update it
        if (updatedData[lastIndex]?.time === latestData.time) {
          updatedData[lastIndex] = latestData;
        } else {
          // Otherwise, append the new candlestick
          updatedData.push(latestData);
        }

        return updatedData;
      });
    }
  }, [latestData]);

  if (isError) {
    return <p>Error fetching historical data...</p>;
  }

  return (
    <div>
      <Dropdown
        pairs={CRYPTO_PAIRS}
        selectedPair={selectedPair}
        onChange={setSelectedPair}
      />
      {isLoading ? <p>Loading...</p> : <Chart data={combinedData} />}
    </div>
  );
};

export default App;