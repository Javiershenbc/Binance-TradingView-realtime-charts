import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DepthChartProps {
  bids: { price: string; quantity: string }[];
  asks: { price: string; quantity: string }[];
  pair: string;
}

const DepthChart: React.FC<DepthChartProps> = ({ bids, asks, pair }) => {
  const chartRef = useRef<am5.Root | null>(null);

  // Utility to format prices based on the pair
  const formatPrice = (price: number): string => {
    if (pair.toLowerCase() === "btcusdt") {
      return Math.round(price).toString(); // No decimals for btcusdt
    }
    return price.toFixed(2); // Default: two decimals
  };

  useEffect(() => {
    const root = am5.Root.new("depth-chart");
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "price",
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 70 }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    // Apply dynamic formatting for X-axis labels
    xAxis
      .get("renderer")
      .labels.template.adapters.add("text", (text, target) => {
        const dataItem =
          target.dataItem as am5.DataItem<am5xy.ICategoryAxisDataItem>;
        const price = parseFloat(dataItem?.get("category") || "0");
        return formatPrice(price); // Format price dynamically
      });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const bidSeries = chart.series.push(
      am5xy.StepLineSeries.new(root, {
        name: "Bids",
        xAxis,
        yAxis,
        valueYField: "cumulativeVolume",
        categoryXField: "price",
        stroke: am5.color(0x00ff00),
        fill: am5.color(0x00ff00),
      })
    );

    const askSeries = chart.series.push(
      am5xy.StepLineSeries.new(root, {
        name: "Asks",
        xAxis,
        yAxis,
        valueYField: "cumulativeVolume",
        categoryXField: "price",
        stroke: am5.color(0xff0000),
        fill: am5.color(0xff0000),
      })
    );

    chartRef.current = root;

    return () => {
      root.dispose();
      chartRef.current = null;
    };
  }, [pair]);

  useEffect(() => {
    if (!chartRef.current) return;

    const root = chartRef.current;
    const chart = root.container.children.getIndex(0) as am5xy.XYChart;

    const processedBids = processCumulativeData(bids, true);
    const processedAsks = processCumulativeData(asks, false);

    const bidSeries = chart.series.getIndex(0) as am5xy.StepLineSeries;
    const askSeries = chart.series.getIndex(1) as am5xy.StepLineSeries;

    bidSeries.data.setAll(processedBids);
    askSeries.data.setAll(processedAsks);

    const xAxis = chart.xAxes.getIndex(
      0
    ) as am5xy.CategoryAxis<am5xy.AxisRendererX>;
    xAxis.data.setAll([...processedBids, ...processedAsks]);
  }, [bids, asks]);

  const processCumulativeData = (
    list: { price: string; quantity: string }[],
    isBid: boolean
  ) => {
    const sortedList = [...list]
      .filter((item) => parseFloat(item.price) > 0) // Filter out invalid prices
      .map((item) => ({
        price: parseFloat(item.price),
        quantity: parseFloat(item.quantity),
      }))
      .sort((a, b) => (isBid ? b.price - a.price : a.price - b.price));

    let cumulativeVolume = 0;

    return sortedList.map((item) => {
      cumulativeVolume += item.quantity;
      return {
        price: item.price.toFixed(2),
        cumulativeVolume,
      };
    });
  };

  return <div id="depth-chart" style={{ width: "100%", height: "400px" }} />;
};

export default DepthChart;
