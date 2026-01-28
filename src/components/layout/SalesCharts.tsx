"use client";

import React, { useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { SalesReport } from '../../types/sales';

// Register Chart.js components for chart functionality
Chart.register(...registerables);

/**
 * SalesCharts component for displaying revenue and product performance data
 * 
 * @component
 * @description 
 * - Displays interactive charts for sales analytics using Chart.js
 * - Includes line chart for revenue trends over time
 * - Includes bar chart for top-selling products
 * - Features responsive design with dynamic chart adjustments
 * - Automatically adjusts label rotation based on container width
 * - Uses dark theme styling consistent with application design
 * 
 * @param {Object} props - Component properties
 * @param {SalesReport} props.report - Sales report data containing revenue and product information
 * 
 * @example
 * <SalesCharts report={salesReportData} />
 * 
 * @returns {JSX.Element} Responsive charts container with revenue and product performance data
 */
export default function SalesCharts({ report }: { report: SalesReport }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const dailyRevenue = report.dailyRevenue ?? [];
  const topProducts = report.topProducts ?? [];

  const baseScales = {
    ticks: { color: "#fff" },
    grid: { color: "rgba(255,255,255,0.15)", borderColor: "#fff" }
  };

  const optionsLine = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ...baseScales,
        ticks: {
          ...baseScales.ticks,
          maxRotation: 0,
          autoSkip: true,
          callback: function (val: string | number) {
            const label = typeof val === 'number' ? String(val) : val;
            try {
              const date = new Date(label);
              return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
            } catch {
              return label;
            }
          }
        }
      },
      y: {
        ...baseScales,
        beginAtZero: true,
        ticks: {
          ...baseScales.ticks,
          callback: (value: string | number) => '₹' + Number(value).toLocaleString('en-IN')
        }
      }
    },
    plugins: {
      legend: { labels: { color: "#fff" } },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => `Revenue: ₹${(context.raw as number).toLocaleString('en-IN')}`
        }
      }
    }
  };

  const optionsBar = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ...baseScales,
        beginAtZero: true,
        grid: { display: true, color: "rgba(255,255,255,0.15)" }
      },
      y: {
        ...baseScales,
        grid: { display: false },
        ticks: {
          ...baseScales.ticks,
          callback: (val: string | number) => {
            const label = typeof val === 'number' ? String(val) : val;
            if (typeof label === 'string' && label.length > 25) {
              return label.substring(0, 22) + '...';
            }
            return label;
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: TooltipItem<'bar'>[]) => items[0].label,
          label: (context: TooltipItem<'bar'>) => `Sold: ${context.raw}`
        }
      }
    }
  };

  return (
    <div ref={containerRef} className="mt-6 space-y-12">
      {/* Revenue Line Chart Section */}
      <div className="bg-linear-to-b from-black/40 to-black/60 p-3 md:p-6 rounded-2xl border border-white/10">
        <h4 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
          Revenue Trend
        </h4>
        <div className="h-64 sm:h-80 w-full relative">
          <Line
            data={{
              labels: dailyRevenue.map(d => d.date),
              datasets: [{
                label: 'Revenue',
                data: dailyRevenue.map(d => d.revenue),
                borderColor: '#FF5500',
                backgroundColor: 'rgba(255,85,0,0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#FF5500',
                pointRadius: 4,
                pointHoverRadius: 6
              }]
            }}
            options={optionsLine}
          />
        </div>
      </div>

      {/* Top Products Bar Chart Section */}
      <div className="bg-linear-to-b from-black/40 to-black/60 p-3 md:p-6 rounded-2xl border border-white/10">
        <h4 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
          Top Selling Items
        </h4>
        <div className="h-112.5 w-full relative">
          <Bar
            data={{
              labels: topProducts.map(p => p.name),
              datasets: [{
                label: 'Quantity Sold',
                data: topProducts.map(p => p.quantity),
                backgroundColor: '#CFB54F',
                borderRadius: 4,
                barThickness: 20
              }]
            }}
            options={optionsBar}
          />
        </div>
      </div>
    </div>
  );
}