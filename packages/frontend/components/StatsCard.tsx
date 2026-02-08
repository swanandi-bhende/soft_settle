// packages/frontend/components/StatsCard.tsx
export default function StatsCard({ label, value, trend }: any) {
  return (
    <div className="p-6 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <div className="flex items-baseline space-x-3">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <span className={trend > 0 ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
}