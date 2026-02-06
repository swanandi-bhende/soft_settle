export default function StatsCard({ label, value, trend }: any) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        <span className={trend > 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
}