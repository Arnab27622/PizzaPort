"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { SalesReport } from '../../../types/sales';

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
  /**
   * Reference to the chart container for width measurement
   * @type {React.RefObject<HTMLDivElement>}
   */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * State for tracking container width for responsive adjustments
   * @state {number} width - Current width of the chart container in pixels
   */
  const [width, setWidth] = useState(0);

  /**
   * Effect hook for responsive chart behavior
   * @effect
   * @listens ResizeObserver
   * 
   * @description
   * - Observes container size changes to adjust chart layout
   * - Updates width state when container resizes
   * - Cleans up ResizeObserver on component unmount
   */
  useEffect(() => {
    if (!containerRef.current) return;

    /**
     * ResizeObserver callback to update container width
     * @function handleResize
     * @param {ResizeObserverEntry[]} entries - Resize observer entries
     */
    const obs = new ResizeObserver(entries => {
      const entry = entries[0];
      setWidth(entry.contentRect.width);
    });

    // Start observing the container element
    obs.observe(containerRef.current);

    // Cleanup: disconnect observer on component unmount
    return () => obs.disconnect();
  }, []);

  /**
   * Destructure report data with fallback to empty arrays
   * @constant {Array} dailyRevenue - Daily revenue data array
   * @constant {Array} topProducts - Top selling products data array
   */
  const dailyRevenue = report.dailyRevenue ?? [];
  const topProducts = report.topProducts ?? [];

  /**
   * Common Y-axis configuration for both charts
   * @constant {Object}
   */
  const baseScales = {
    y: {
      ticks: { color: "#fff", beginAtZero: true },
      grid: { color: "rgba(255,255,255,0.2)", borderColor: "#fff" }
    }
  };

  /**
   * Chart options configuration for the line chart (revenue over time)
   * @constant {Object}
   */
  const optionsLine = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.2)", borderColor: "#fff" }
      },
      ...baseScales
    },
    plugins: {
      legend: {
        labels: { color: "#fff" }
      }
    }
  };

  /**
   * Determine if labels should be rotated based on container width
   * @constant {boolean} rotate - True if container width is below 944px
   */
  const rotate = width > 0 && width < 944;

  /**
   * Chart options configuration for the bar chart (top products)
   * @constant {Object}
   */
  const optionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "#fff",
          autoSkip: false,
          maxRotation: rotate ? 90 : 0,
          minRotation: rotate ? 90 : 0
        },
        grid: { color: "rgba(255,255,255,0.2)", borderColor: "#fff" }
      },
      ...baseScales
    },
    plugins: {
      legend: {
        labels: { color: "#fff" }
      }
    }
  };

  return (
    <div className="mt-6 space-y-8">
      {/* Revenue Line Chart Section */}
      <div>
        <h4 className="text-xl font-semibold heading-border mb-1">
          Revenue over time
        </h4>
        <div
          ref={containerRef}
          className="w-full h-64 sm:h-80 relative bg-[rgba(0,0,0,0.6)] p-4 rounded-xl"
          role="img"
          aria-label="Line chart showing revenue trends over time"
        >
          <Line
            data={{
              labels: dailyRevenue.map(d => d.date),
              datasets: [{
                label: 'Revenue',
                data: dailyRevenue.map(d => d.revenue),
                borderColor: '#FF5500',
                backgroundColor: 'rgba(255,85,0,0.3)',
                fill: true
              }]
            }}
            options={optionsLine}
          />
        </div>
      </div>

      {/* Top Products Bar Chart Section */}
      <div>
        <h4 className="text-xl font-semibold heading-border mb-1">
          Top-selling items
        </h4>
        <div
          className="w-full h-64 sm:h-80 relative bg-[rgba(0,0,0,0.6)] p-4 rounded-xl"
          role="img"
          aria-label="Bar chart showing top-selling products by quantity"
        >
          <Bar
            data={{
              labels: topProducts.map(p => p.name),
              datasets: [{
                label: 'Quantity Sold',
                data: topProducts.map(p => p.quantity),
                backgroundColor: '#CFB54F'
              }]
            }}
            options={optionsBar}
          />
        </div>
      </div>
    </div>
  );
}