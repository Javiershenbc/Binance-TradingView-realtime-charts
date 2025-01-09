import React, { useEffect, useRef } from "react";
import { createChart, ISeriesApi, CandlestickData } from "lightweight-charts";

interface ChartProps {
  data: CandlestickData[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ReturnType<typeof createChart>>();
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick">>();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize the chart once
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          textColor: "#000000",
        },
        grid: {
          vertLines: {
            color: "#ebebeb",
          },
          horzLines: {
            color: "#ebebeb",
          },
        },
        rightPriceScale: {
          borderColor: "#d1d4dc",
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: "#d1d4dc",
          timeVisible: true,
          rightOffset: 2,
          barSpacing: 6,
          fixLeftEdge: true,
        },
      });

      candlestickSeriesRef.current =
        chartInstanceRef.current.addCandlestickSeries({
          upColor: "#26a69a",
          downColor: "#ef5350",
          borderUpColor: "#26a69a",
          borderDownColor: "#ef5350",
          wickUpColor: "#26a69a",
          wickDownColor: "#ef5350",
        });
    }

    // Initial Data config
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(data);
    }

    return () => {
      chartInstanceRef.current?.remove();
      chartInstanceRef.current = undefined;
      candlestickSeriesRef.current = undefined;
    };
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: "80%",
        height: "400px",
        margin: "0 auto",
        border: "1px solid #d1d4dc",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
};

export default Chart;
