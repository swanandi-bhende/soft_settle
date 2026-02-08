// packages/frontend/components/Analytics.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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
  const data = {
    labels: historyData.map((d) => d.timestamp),
    datasets: [
      {
        label: 'Micro-Payments (USDC)',
        data: historyData.map((d) => d.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold mb-6 text-white">Network Velocity</h3>
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            },
          },
        }}
      />
    </div>
  );
}