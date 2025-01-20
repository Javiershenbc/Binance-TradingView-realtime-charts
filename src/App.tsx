import React, { useState, useEffect } from "react";
import Dropdown from "./components/Dropdown";
import Chart from "./components/Chart";
import { useHistoricalData } from "./hooks/useHistoricalData";
import { useWebSocket } from "./hooks/useWebSocket";
import { CRYPTO_PAIRS } from "./config";
import { CandlestickData } from "lightweight-charts";
import OrderBook from "./components/OrderBook";
import DepthChart from "./components/DepthChart";
import { useOrderBook } from "./hooks/useOrderBook";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";

const App: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState(CRYPTO_PAIRS[0]);
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
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Crypto Trading Dashboard
          </Typography>
          <Button color="inherit">Settings</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, boxShadow: "0px 4px 20px rgba(0,0,0,0.1)" }}
        >
          <Grid container spacing={4}>
            {/* Header Section */}
            <Grid item xs={12}>
              <Typography variant="h4" align="center" gutterBottom>
                Track Your Trades in Real-Time
              </Typography>
            </Grid>

            {/* Dropdown and Chart Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                <Dropdown
                  pairs={CRYPTO_PAIRS}
                  selectedPair={selectedPair}
                  onChange={setSelectedPair}
                />
              </Box>
              <Chart data={combinedData} loading={isLoading} />
            </Grid>

            {/* Depth Chart Section */}
            <Grid item xs={12}>
              <Typography variant="h4" align="center" gutterBottom>
                OrderBook Depth Chart
              </Typography>
              <DepthChart
                bids={orderBook.bids}
                asks={orderBook.asks}
                pair={selectedPair}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <Typography variant="h4" align="center" gutterBottom>
                Order Book
              </Typography>
              <OrderBook
                bids={orderBook.bids}
                asks={orderBook.asks}
                loading={loading}
                error={error}
              />
            </Grid> */}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default App;
