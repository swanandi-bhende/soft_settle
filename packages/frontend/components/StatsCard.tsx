// packages/frontend/components/StatsCard.tsx
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow';
}

export default function StatsCard({ label, value, trend = 0, icon, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-600/20 to-blue-500/10 border-blue-500/30',
    green: 'from-green-600/20 to-green-500/10 border-green-500/30',
    purple: 'from-purple-600/20 to-purple-500/10 border-purple-500/30',
    yellow: 'from-yellow-600/20 to-yellow-500/10 border-yellow-500/30',
  };

  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400';

  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      className={`p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        {icon && (
          <div className="text-2xl opacity-80">{icon}</div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${trendColor}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-slate-500">vs last 24h</span>
        </div>
      )}
    </motion.div>
  );
}