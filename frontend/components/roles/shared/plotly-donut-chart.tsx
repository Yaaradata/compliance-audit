"use client";

import dynamic from "next/dynamic";
import type { ComponentType, CSSProperties } from "react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }) as ComponentType<{
  data: Record<string, unknown>[];
  layout: Record<string, unknown>;
  config?: { displayModeBar?: boolean; responsive?: boolean };
  style?: CSSProperties;
}>;

export type PlotlyDonutChartProps = {
  values: number[];
  labels: string[];
  colors: string[];
  /** Percentage shown in the center (0–100). */
  centerPct: number;
  /** Second line under the percentage in the donut hole. */
  centerCaption: string;
  hole?: number;
  hoverTemplate?: string;
  className?: string;
};

export function PlotlyDonutChart({
  values,
  labels,
  colors,
  centerPct,
  centerCaption,
  hole = 0.7,
  hoverTemplate = "%{label}: %{value} (%{percent})<extra></extra>",
  className = "mx-auto h-40 w-40 shrink-0",
}: PlotlyDonutChartProps) {
  return (
    <div className={className}>
      <Plot
        data={[
          {
            type: "pie",
            values,
            labels,
            hole,
            sort: false,
            direction: "clockwise",
            textinfo: "none",
            marker: { colors },
            hovertemplate: hoverTemplate,
          },
        ]}
        layout={{
          autosize: true,
          margin: { l: 0, r: 0, t: 0, b: 0 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          showlegend: false,
          annotations: [
            {
              x: 0.5,
              y: 0.56,
              xref: "paper",
              yref: "paper",
              text: `<b>${centerPct}%</b>`,
              showarrow: false,
              font: { size: 24, color: "#0f172a" },
            },
            {
              x: 0.5,
              y: 0.42,
              xref: "paper",
              yref: "paper",
              text: centerCaption,
              showarrow: false,
              font: { size: 11, color: "#64748b" },
            },
          ],
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
