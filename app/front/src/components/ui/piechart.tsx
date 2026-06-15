"use client";

import * as React from "react";
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from "recharts";

interface DataItem {
  label: string;
  value: number;
}
type ChartType = "default" | "faturamento";
type ChartSize = "extra-small" | "small" | "medium" | "large";
type PieShapeProps = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  isActive: boolean;
  isPreview: boolean;
};

interface InteractivePieChartProps {
  data: DataItem[];
  type: ChartType;
  title: string;
  size: ChartSize;
  operation?:
    | { a: number; b: number; op: "+" | "-" | "*" | "/" }
    | number
    | null;
  isFunnel?: boolean;
  isPreview?: boolean;
}
const COLOR_PALETTES = {
  default: ["var(--text-success)", "var(--light-gray)", "var(--alt-purple)"],
  faturamento: ["var(--text-success)", "var(--text-error)"],
};
const CHART_SIZES = {
  "extra-small": {
    className: "h-[32px] w-[32px]",
    innerRadius: 18,
    outerRadius: 22,
    width: 44,
    height: 44,
  },
  small: {
    className: "h-[75px] w-[75px]",
    innerRadius: 22,
    outerRadius: 28,
    width: 75,
    height: 75,
  },
  medium: {
    className: "h-[100px] w-[100px]",
    innerRadius: 32,
    outerRadius: 40,
    width: 100,
    height: 100,
  },
  large: {
    className: "h-[125px] w-[125px]",
    innerRadius: 42,
    outerRadius: 50,
    width: 125,
    height: 125,
  }
};

const renderPieShape = (props: PieShapeProps) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    isActive,
    isPreview,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {isActive && !isPreview && (
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 3}
          outerRadius={outerRadius + 6}
          fill={fill}
        />
      )}
    </g>
  );
};

const InteractivePieChart: React.FC<InteractivePieChartProps> = ({
  data,
  type,
  title,
  size,
  operation,
  isFunnel = false,
  isPreview = false,
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [tooltipData, setTooltipData] = React.useState<{
    label: string;
    value: number;
    fill: string;
    x: number;
    y: number;
  } | null>(null);

  const chartRef = React.useRef<HTMLDivElement>(null);

  const currentColors = COLOR_PALETTES[type] || COLOR_PALETTES.default;
  const chartConfig = CHART_SIZES[size];

  React.useEffect(() => {
    const handleOutsideTouch = (e: TouchEvent | MouseEvent) => {
      if (chartRef.current && !chartRef.current.contains(e.target as Node)) {
        setActiveIndex(null);
        setTooltipData(null);
      }
    };

    document.addEventListener("pointerdown", handleOutsideTouch);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideTouch);
    };
  }, []);

  const computedValue = React.useMemo(() => {
    if (!operation) return null;

    if (typeof operation === "number") {
      return operation || 0;
    }

    const { a, b, op } = operation;
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b !== 0 ? a / b : NaN;
      default:
        return null;
    }
  }, [operation]);

  const formatValue = (value: number | null) => {
    if (value == null || isNaN(value)) return "0";
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  };

  const renderCenterValue = ({ cx, cy }: { cx: number; cy: number }) => {
    const text = formatValue(computedValue!);

    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className={`fill-text-main font-normal`}
        style={{ fontSize: `9px`, lineHeight: 1 }}
      >
        {text}
      </text>
    );
  };

  const handlePieEnter = React.useCallback(
    (_: unknown, index: number) => {
      setActiveIndex(index);
      setTooltipData({
        label: data[index].label,
        value: data[index].value,
        fill: currentColors[index % currentColors.length],
        x: -20,
        y: (5.5 * chartConfig.height) / 6,
      });
    },
    [data, currentColors, chartConfig.height]
  );

  const handlePieLeave = React.useCallback(() => {
    if (window.innerWidth > 768) {
      setActiveIndex(null);
      setTooltipData(null);
    }
  }, []);

  const handlePieClick = React.useCallback(
    (_: unknown, index: number) => {
      if (activeIndex === index) {
        setActiveIndex(null);
        setTooltipData(null);
        return;
      }

      setActiveIndex(index);
      setTooltipData({
        label: data[index].label,
        value: data[index].value,
        fill: currentColors[index % currentColors.length],
        x: -20,
        y: (5 * chartConfig.height) / 6,
      });
    },
    [data, currentColors, chartConfig.height, activeIndex]
  );

  return (
    <div
      ref={chartRef}
      className="relative flex flex-col items-center text-content text-text-main h-full w-full"
    >
      {tooltipData && (
        <div
          className="flex gap-extra-small absolute p-2 text-content bg-bg-card dark:bg-bg-card text-black dark:text-white border rounded-small shadow-lg pointer-events-none"
          style={{
            top: tooltipData.y,
            left: tooltipData.x,
            zIndex: 9999,
          }}
        >
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-sm mr-1.5"
              style={{ backgroundColor: tooltipData.fill }}
            ></div>
            <span className="flex truncate font-bold">{tooltipData.label}:</span>
          </div>
          <div className="">
            {isFunnel
              ? Math.round(tooltipData.value).toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : tooltipData.value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
          </div>
        </div>
      )}

      <h3 className="text-center text-small">{title}</h3>

      <ResponsiveContainer
        width={chartConfig.width}
        height={chartConfig.height}
        className={chartConfig.className}
      >
        <PieChart onMouseLeave={handlePieLeave}>
          <Pie
            shape={(props: unknown, index: number) =>
              renderPieShape({
                ...(props as Omit<PieShapeProps, "isActive" | "isPreview">),
                isActive: activeIndex === index,
                isPreview,
              })
            }
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={chartConfig.innerRadius}
            outerRadius={chartConfig.outerRadius}
            dataKey="value"
            onMouseEnter={handlePieEnter}
            onMouseLeave={handlePieLeave}
            onClick={handlePieClick}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={currentColors[index % currentColors.length]}
                className="focus:outline-none outline-none"
              />
            ))}
          </Pie>
          {operation !== null && (
            <g>
              {renderCenterValue({
                cx: chartConfig.width / 2,
                cy: chartConfig.height / 2,
              })}
            </g>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InteractivePieChart;
