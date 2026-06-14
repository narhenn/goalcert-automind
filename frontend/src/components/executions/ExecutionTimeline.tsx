import type { ExecutionNodeLog } from '../../types';
import NodeLogCard from './NodeLogCard';

interface ExecutionTimelineProps {
  logs: ExecutionNodeLog[];
}

export default function ExecutionTimeline({ logs }: ExecutionTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-400">No execution logs available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <NodeLogCard key={log.id} log={log} />
      ))}
    </div>
  );
}
