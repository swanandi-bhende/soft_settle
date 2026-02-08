// packages/frontend/components/Analytics.tsx
'use client';

import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type HistoryPoint = {
  timestamp: string;
  amount: number;
};

export default function Analytics({
  historyData,
}: {
  historyData: HistoryPoint[];
}) {
  const totalVolume = historyData.reduce((sum, d) => sum + d.amount, 0);
  const avgVolume = totalVolume / historyData.length;

  const data = {
    labels: historyData.map((d) => d.timestamp),
    datasets: [
      {
        label: 'Micro-Payments (USDC)',
        data: historyData.map((d) => d.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 12 },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 12 },
        },
        beginAtZero: true,
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Network Velocity
            </h3>
            <p className="text-xs text-slate-500 mt-1">Micro-payment activity over time</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Total Volume</p>
            <p className="text-2xl font-bold text-white font-mono">
              ${totalVolume.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="mb-6">
          <Line data={data} options={options} height={300} />
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-700">
          <div className="bg-slate-900/30 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Average Per Period</p>
            <p className="text-lg font-bold text-blue-400 font-mono">
              ${avgVolume.toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-900/30 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Data Points</p>
            <p className="text-lg font-bold text-blue-400 font-mono">
              {historyData.length}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}