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

    // Initialize the chart instance only once
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
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

    // Set the candlestick data when provided
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
      className="chart-container"
      style={{
        width: "80%", // Ocupa el 80% del contenedor principal
        height: "400px", // Altura fija más razonable
        margin: "0 auto", // Centra horizontalmente
      }}
    />
  );
};

export default Chart;
