export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export function formatDuration(ms: number | string | null | undefined): string {
  const n = Number(ms);
  if (isNaN(n) || n === 0) return '--';
  if (n < 1000) return `${n}ms`;
  if (n < 60000) return `${(n / 1000).toFixed(1)}s`;
  return `${(n / 60000).toFixed(1)}m`;
}

export function formatCost(cost: number | string | null | undefined): string {
  const n = Number(cost);
  if (isNaN(n)) return '$0.00';
  return `$${n.toFixed(4)}`;
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function cronToHuman(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;
  const [min, hour, dom, , dow] = parts;

  let time = '';
  if (hour !== '*' && min !== '*') {
    time = `at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
  }

  if (dow === '1-5') return `Weekdays ${time}`.trim();
  if (dow === '0-6' || (dow === '*' && dom === '*')) return `Daily ${time}`.trim();
  if (dow === '1') return `Every Monday ${time}`.trim();
  if (dow === '2') return `Every Tuesday ${time}`.trim();
  if (dow === '3') return `Every Wednesday ${time}`.trim();
  if (dow === '4') return `Every Thursday ${time}`.trim();
  if (dow === '5') return `Every Friday ${time}`.trim();
  if (dow === '6') return `Every Saturday ${time}`.trim();
  if (dow === '0' || dow === '7') return `Every Sunday ${time}`.trim();
  return `${cron} ${time}`.trim();
}

export function cronNextRun(cron: string, tz: string = 'UTC'): string {
  // Simple approximation: compute next matching time from now
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return '';
  const [minStr, hourStr] = parts;
  if (minStr === '*' || hourStr === '*') return '';

  const targetMin = parseInt(minStr, 10);
  const targetHour = parseInt(hourStr, 10);
  if (isNaN(targetMin) || isNaN(targetHour)) return '';

  // Create "now" in the target timezone by formatting
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const formatted = formatter.format(now);
  const [nowH, nowM] = formatted.split(':').map(Number);

  // Minutes until next occurrence (within 24h)
  const nowTotal = nowH * 60 + nowM;
  const targetTotal = targetHour * 60 + targetMin;
  let diff = targetTotal - nowTotal;
  if (diff <= 0) diff += 24 * 60;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (hours === 0) return `in ${minutes}m`;
  if (minutes === 0) return `in ${hours}h`;
  return `in ${hours}h ${minutes}m`;
}
