# Real-Time Trading Dashboard

This project is a **real-time trading dashboard** that displays cryptocurrency market data using the **Binance API**. It includes:

1. A **price chart** for visualizing candlestick data (OHLCV) in real-time.
2. An **order book** to display live bids and asks.
3. A **dropdown** for selecting trading pairs.

The application uses:

- **Binance WebSocket API** for real-time updates.
- **Binance REST API** for fetching historical data.
- **React** with **TypeScript** for a robust and scalable architecture.
- **React Query** for managing data fetching and caching.

---

## Features

1. **Real-Time Chart**:

   - Displays candlestick (OHLCV) data for the selected trading pair.
   - Updates dynamically using the WebSocket API.

2. **Order Book**:

   - Shows live bids and asks for the selected trading pair.
   - Displays 10 top bids and 10 top asks.
   - Updates in real-time.

3. **Dropdown for Trading Pairs**:

   - Allows users to select a trading pair (e.g., BTC/USDT, ETH/USDT).

4. **High-Frequency Updates**:
   - Handles real-time updates efficiently with batching mechanisms for improved performance.

---

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- **Node.js** (version 16.x or higher)
- **npm** or **yarn**

### Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### Install Dependencies

Run the following command to install all necessary dependencies:

```bash
npm install
```

### Configure the environment

The project uses the Binance REST and WebSocket APIs for fetching historical and real-time data. Update the API configuration in the src/config.ts file:

```bash
export const BINANCE_REST_BASE_URL = "https://api.binance.com/api/v3";
export const BINANCE_WS_BASE_URL = "wss://stream.binance.com:9443/ws";
export const CRYPTO_PAIRS = ["btcusdt", "ethusdt", "solusdt", "maticusdt"];
```

## Start the development server

Start the local development server:

```bash
npm run dev
```
