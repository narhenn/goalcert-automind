import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { timeAgo } from '../../lib/utils';
import type { ActivityItem } from '../../types';

interface ActivityFeedProps {
  activities: ActivityItem[] | undefined;
  isLoading: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failed':
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400" />;
  }
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-2 bg-slate-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = (activities || []).slice(0, 10);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{item.agent_name}</span>
                  {' '}
                  {item.action}
                </p>
                <p className="text-xs text-slate-400">{timeAgo(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
