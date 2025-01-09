import React from "react";

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
    return <p style={{ textAlign: "center" }}>Loading Order Book...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      {/* Bids Table */}
      <div>
        <h3 style={{ textAlign: "center" }}>Bids</h3>
        <table style={{ borderCollapse: "collapse", width: "300px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "5px" }}>
                Price
              </th>
              <th style={{ border: "1px solid #ccc", padding: "5px" }}>
                Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px",
                    color: "green",
                  }}
                >
                  {bid.price}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                  {bid.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asks Table */}
      <div>
        <h3 style={{ textAlign: "center" }}>Asks</h3>
        <table style={{ borderCollapse: "collapse", width: "300px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "5px" }}>
                Price
              </th>
              <th style={{ border: "1px solid #ccc", padding: "5px" }}>
                Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {asks.map((ask, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px",
                    color: "red",
                  }}
                >
                  {ask.price}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                  {ask.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderBook;
