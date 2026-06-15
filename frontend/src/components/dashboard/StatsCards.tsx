import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle, Zap, Clock } from 'lucide-react';
import type { DashboardStats } from '../../types';

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

const cards = [
  {
    key: 'active_agents' as const,
    label: 'Active Agents',
    icon: Bot,
    cta: 'View all',
    link: '/analytics',
    format: (v: number) => String(v),
  },
  {
    key: 'tasks_completed' as const,
    label: 'Tasks Completed',
    icon: CheckCircle,
    cta: 'History',
    link: '/analytics',
    format: (v: number) => String(v),
  },
  {
    key: 'estimated_savings' as const,
    label: 'Estimated Savings',
    icon: Zap,
    cta: 'Details',
    link: '/analytics',
    format: (v: number) => {
      if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
      return `$${v.toFixed(0)}`;
    },
  },
  {
    key: 'avg_response_time' as const,
    label: 'Avg Response Time',
    icon: Clock,
    cta: 'Metrics',
    link: '/analytics',
    format: (v: number) => `${v.toFixed(1)}s`,
  },
];

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            style={{
              background: 'var(--gc-grad)',
              borderRadius: 'var(--radius)',
              padding: '20px 22px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform .2s ease, box-shadow .2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 14px 36px rgba(50,0,128,.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 rounded w-24" style={{ background: 'rgba(255,255,255,.2)' }} />
                <div className="h-8 rounded w-16" style={{ background: 'rgba(255,255,255,.2)' }} />
              </div>
            ) : (
              <>
                {/* Icon circle */}
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <Icon style={{ width: 18, height: 18, color: '#ffffff' }} />
                </div>

                {/* Big number top-right */}
                <span style={{
                  position: 'absolute',
                  top: 18,
                  right: 20,
                  fontSize: 34,
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1,
                }}>
                  {stats && stats[card.key] != null ? card.format(stats[card.key]) : '--'}
                </span>

                {/* Title */}
                <p style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', marginBottom: 10 }}>
                  {card.label}
                </p>

                {/* CTA pill bottom-right */}
                <span
                  onClick={(e) => { e.stopPropagation(); navigate(card.link); }}
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    right: 16,
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--gc-primary)',
                    background: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: 20,
                    cursor: 'pointer',
                  }}
                >
                  {card.cta}
                </span>

                {/* Wave overlay (subtle) */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  background: 'linear-gradient(to top, rgba(255,255,255,.04), transparent)',
                  pointerEvents: 'none',
                }} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
