import { Users, CheckCircle, Zap, Clock } from 'lucide-react';
import type { DashboardStats } from '../../types';

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

const cards = [
  {
    key: 'active_agents' as const,
    label: 'Active Agents',
    icon: Users,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    format: (v: number) => String(v),
  },
  {
    key: 'tasks_completed' as const,
    label: 'Tasks Completed',
    icon: CheckCircle,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    format: (v: number) => String(v),
  },
  {
    key: 'estimated_savings' as const,
    label: 'Estimated Savings',
    icon: Zap,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    format: (v: number) => {
      if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
      return `$${v.toFixed(0)}`;
    },
  },
  {
    key: 'avg_response_time' as const,
    label: 'Avg Response Time',
    icon: Clock,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    format: (v: number) => `${v.toFixed(1)}s`,
  },
];

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="bg-white rounded-lg border border-slate-200 p-5"
          >
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-8 bg-slate-200 rounded w-16" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">{card.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats ? card.format(stats[card.key]) : '--'}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
