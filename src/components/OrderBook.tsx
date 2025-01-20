import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

interface Order {
  price: string;
  quantity: string;
}

interface OrderBookProps {
  bids: Order[];
  asks: Order[];
  loading: boolean;
  error: string | null;
}

const OrderBook: React.FC<OrderBookProps> = ({
  bids,
  asks,
  loading,
  error,
}) => {
  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 4,
        mt: 4,
      }}
    >
      {/* Bids Section */}
      <TableContainer component={Paper} sx={{ width: "50%", p: 2 }}>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Bids
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bids.map((bid, index) => (
              <TableRow key={index}>
                <TableCell sx={{ color: "green" }}>{bid.price}</TableCell>
                <TableCell>{bid.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Asks Section */}
      <TableContainer component={Paper} sx={{ width: "50%", p: 2 }}>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Asks
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asks.map((ask, index) => (
              <TableRow key={index}>
                <TableCell sx={{ color: "red" }}>{ask.price}</TableCell>
                <TableCell>{ask.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderBook;
