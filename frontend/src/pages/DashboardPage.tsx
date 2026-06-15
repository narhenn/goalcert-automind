import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bot, Rocket, Activity, Clock, Server } from 'lucide-react';
import { useAgents, useDashboardStats, useDashboardActivity } from '../hooks/useAgents';
import StatsCards from '../components/dashboard/StatsCards';
import AgentCard from '../components/dashboard/AgentCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import CreateAgentModal from '../components/agents/CreateAgentModal';
import { useAuthStore } from '../stores/authStore';
import { timeAgo } from '../lib/utils';
import type { Agent } from '../types';

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: agents, isLoading: agentsLoading } = useAgents();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useDashboardActivity();

  const handleEdit = (agent: Agent) => {
    navigate(`/agents/${agent.id}/builder`);
  };

  const handleViewDetails = (agent: Agent) => {
    navigate(`/agents/${agent.id}`);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  // System status calculations
  const activeAgentCount = agents?.filter((a) => a.status === 'active').length ?? 0;
  const totalAgentCount = agents?.length ?? 0;
  const errorAgentCount = agents?.filter((a) => a.status === 'error').length ?? 0;
  const lastExecTime = agents
    ?.filter((a) => a.last_execution_at)
    .sort((a, b) => new Date(b.last_execution_at!).getTime() - new Date(a.last_execution_at!).getTime())[0]
    ?.last_execution_at;

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--gc-grad)',
        borderRadius: 'var(--radius)',
        padding: '32px 36px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,.06) 0%, transparent 70%)',
        }} />
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#ffffff', marginBottom: 6, position: 'relative' }}>
          Welcome, {firstName}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', marginBottom: 18, position: 'relative' }}>
          Your AI agents are ready. Monitor performance, launch new automations, and scale effortlessly.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#ffffff',
            color: 'var(--gc-primary)',
            padding: '10px 20px',
            borderRadius: 11,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            boxShadow: '0 4px 14px rgba(0,0,0,.12)',
          }}
        >
          <Rocket style={{ width: 16, height: 16 }} />
          Launch an Agent
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <StatsCards stats={stats} isLoading={statsLoading} />
      </div>

      {/* System Status Bar */}
      <div style={{
        background: 'var(--gc-card)',
        border: '1px solid var(--gc-border)',
        borderRadius: 'var(--radius)',
        padding: '14px 22px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div className="flex items-center gap-2">
          <Activity style={{ width: 14, height: 14, color: 'var(--gc-primary)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gc-text)', letterSpacing: '.3px', textTransform: 'uppercase' }}>
            System Status
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--gc-border)' }} />

        {/* Active agents */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {agentsLoading ? (
              <div className="animate-pulse" style={{ width: 50, height: 14, borderRadius: 4, background: 'var(--gc-border)' }} />
            ) : (
              <>
                {Array.from({ length: Math.min(activeAgentCount, 8) }).map((_, i) => (
                  <span key={i} className="pulse-dot" style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--gc-green)',
                    display: 'inline-block',
                  }} />
                ))}
                <span style={{ fontSize: 12, color: 'var(--gc-text2)', marginLeft: 4 }}>
                  <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{activeAgentCount}</span> active
                </span>
              </>
            )}
          </div>
        </div>

        {/* Error count */}
        {errorAgentCount > 0 && (
          <>
            <div style={{ width: 1, height: 20, background: 'var(--gc-border)' }} />
            <div className="flex items-center gap-1.5">
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--gc-red)',
                display: 'inline-block',
              }} />
              <span style={{ fontSize: 12, color: 'var(--gc-red)', fontWeight: 600 }}>
                {errorAgentCount} error{errorAgentCount > 1 ? 's' : ''}
              </span>
            </div>
          </>
        )}

        <div style={{ width: 1, height: 20, background: 'var(--gc-border)' }} />

        {/* Worker status */}
        <div className="flex items-center gap-1.5">
          <Server style={{ width: 13, height: 13, color: 'var(--gc-green)' }} />
          <span style={{ fontSize: 12, color: 'var(--gc-text2)' }}>
            Workers: <span style={{ fontWeight: 600, color: 'var(--gc-green)' }}>healthy</span>
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--gc-border)' }} />

        {/* Total agents */}
        <div className="flex items-center gap-1.5">
          <Bot style={{ width: 13, height: 13, color: 'var(--gc-muted)' }} />
          <span style={{ fontSize: 12, color: 'var(--gc-text2)' }}>
            <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{totalAgentCount}</span> total agents
          </span>
        </div>

        {/* Last execution */}
        {lastExecTime && (
          <>
            <div style={{ width: 1, height: 20, background: 'var(--gc-border)' }} />
            <div className="flex items-center gap-1.5">
              <Clock style={{ width: 13, height: 13, color: 'var(--gc-muted)' }} />
              <span style={{ fontSize: 12, color: 'var(--gc-text2)' }}
                title={new Date(lastExecTime).toLocaleString()}>
                Last execution: <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{timeAgo(lastExecTime)}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Activity Feed */}
        <ActivityFeed activities={activities} isLoading={activitiesLoading} />

        {/* Agent summary / CTA */}
        {agents && agents.length > 0 ? (
          <div style={{
            background: 'var(--gc-card)',
            border: '1px solid var(--gc-border)',
            borderRadius: 'var(--radius)',
            padding: 24,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 14 }}>
              Agent Summary
            </h3>
            <div className="space-y-3">
              {agents.slice(0, 4).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--gc-soft)',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewDetails(agent)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="pulse-dot" style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: agent.status === 'active' ? 'var(--gc-green)' :
                        agent.status === 'error' ? 'var(--gc-red)' :
                        agent.status === 'paused' ? 'var(--gc-orange)' : 'var(--gc-muted)',
                      display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gc-text)' }}>{agent.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--gc-muted)' }}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--gc-card)',
            border: '1px solid var(--gc-border)',
            borderRadius: 'var(--radius)',
            padding: 36,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--gc-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}>
              <Bot style={{ width: 28, height: 28, color: 'var(--gc-muted)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 6 }}>
              Create your first agent
            </h3>
            <p style={{ fontSize: 13, color: 'var(--gc-muted)', marginBottom: 16 }}>
              Set up an AI agent to start automating tasks.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--gc-primary)',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: 11,
                fontSize: 12.5,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Create Agent
            </button>
          </div>
        )}
      </div>

      {/* Agent Grid */}
      {agentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              background: 'var(--gc-card)',
              border: '1px solid var(--gc-border)',
              borderRadius: 'var(--radius)',
              padding: 20,
            }} className="animate-pulse">
              <div className="h-2 rounded mb-4" style={{ background: 'var(--gc-border)' }} />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--gc-border)' }} />
                <div className="space-y-1">
                  <div className="h-4 rounded w-24" style={{ background: 'var(--gc-border)' }} />
                  <div className="h-3 rounded w-16" style={{ background: 'var(--gc-border)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : agents && agents.length > 0 ? (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 14 }}>
            All Agents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Create Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
