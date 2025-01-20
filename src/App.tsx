import React, { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Box, Container, Typography, Paper } from "@mui/material";
import Chart from "./components/Chart";
import DepthChart from "./components/DepthChart";
import { useHistoricalData } from "./hooks/useHistoricalData";
import { useWebSocket } from "./hooks/useWebSocket";
import { useOrderBook } from "./hooks/useOrderBook";
import { CRYPTO_PAIRS } from "./config";
import { CandlestickData } from "lightweight-charts";

const App: React.FC = () => {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const selectedPair = CRYPTO_PAIRS[selectedPairIndex];

  const {
    data: historicalData,
    isLoading,
    isError,
  } = useHistoricalData(selectedPair);
  const latestData = useWebSocket(selectedPair, "1m");
  const [combinedData, setCombinedData] = useState<CandlestickData[]>([]);
  const { orderBook, loading, error } = useOrderBook(selectedPair);

  useEffect(() => {
    console.log(`Switching to new pair: ${selectedPair}`);
    setCombinedData([]);
  }, [selectedPair]);

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

        if (updatedData[lastIndex]?.time === latestData.time) {
          updatedData[lastIndex] = latestData;
        } else {
          updatedData.push(latestData);
        }

        const uniqueData = Array.from(
          new Map(updatedData.map((candle) => [candle.time, candle])).values()
        ).sort((a, b) => Number(a.time) - Number(b.time));

        return uniqueData.slice(-100);
      });
    }
  }, [latestData]);

  if (isError) {
    return (
      <Typography color="error">Error fetching historical data...</Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Real-Time Trading Dashboard
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={selectedPairIndex}
            onChange={(e, newIndex) => setSelectedPairIndex(newIndex)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {CRYPTO_PAIRS.map((pair, index) => (
              <Tab key={pair} label={pair} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ mb: 4 }}>
          <Chart data={combinedData} loading={isLoading} />
        </Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            OrderBook Bids and Asks Depth Chart
          </Typography>
          <DepthChart
            bids={orderBook.bids}
            asks={orderBook.asks}
            pair={selectedPair}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default App;
