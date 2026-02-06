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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics({ historyData }: { historyData: any[] }) {
  const data = {
    labels: historyData.map(d => d.timestamp),
    datasets: [
      {
        label: 'Micro-Payments (USDC)',
        data: historyData.map(d => d.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4">Network Velocity</h3>
      <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
    </div>
  );
}