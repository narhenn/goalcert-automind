import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bot, Rocket } from 'lucide-react';
import { useAgents, useDashboardStats, useDashboardActivity } from '../hooks/useAgents';
import StatsCards from '../components/dashboard/StatsCards';
import AgentCard from '../components/dashboard/AgentCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import CreateAgentModal from '../components/agents/CreateAgentModal';
import { useAuthStore } from '../stores/authStore';
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
