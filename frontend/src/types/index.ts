// Agent types
export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: 'sales' | 'marketing' | 'support' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'error';
  schedule_cron: string | null;
  schedule_timezone: string;
  created_at: string;
  updated_at: string;
  last_execution_at: string | null;
  // Computed fields from API
  success_rate?: number;
  total_executions?: number;
}

// Workflow types
export interface WorkflowDefinition {
  nodes: any[];
  edges: any[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface Workflow {
  id: string;
  agent_id: string;
  status: 'draft' | 'active';
  definition: WorkflowDefinition;
  created_at: string;
  updated_at: string;
  deployed_at: string | null;
}

// Execution types
export interface Execution {
  id: string;
  agent_id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  triggered_by: 'manual' | 'schedule' | 'webhook';
  started_at: string | null;
  ended_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  variables: Record<string, any>;
  total_cost: number;
  created_at: string;
}

export interface ExecutionNodeLog {
  id: string;
  execution_id: string;
  node_id: string;
  node_type: string;
  node_label: string | null;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  started_at: string | null;
  ended_at: string | null;
  duration_ms: number | null;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  error_message: string | null;
  llm_usage: {
    model: string;
    input_tokens: number;
    output_tokens: number;
    cost: number;
  } | null;
  created_at: string;
}

// Template types
export interface AgentTemplate {
  id: string;
  name: string;
  description: string | null;
  type: string;
  workflow_definition: WorkflowDefinition;
  icon: string | null;
  color: string | null;
  features: string[];
  created_at: string;
}

// Integration types
export interface Integration {
  id: string;
  user_id: string;
  service: string;
  config: Record<string, any>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Dashboard types
export interface DashboardStats {
  total_agents: number;
  active_agents: number;
  tasks_completed: number;
  estimated_savings: number;
  avg_response_time: number;
}

export interface ActivityItem {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_type: string;
  action: string;
  status: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// Node config types for workflow builder
export interface TriggerConfig {
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'custom';
  cron?: string;
  timezone?: string;
}

export interface AIActionConfig {
  prompt: string;
  model: string;
  max_tokens: number;
  temperature: number;
  output_variable?: string;
}

export interface IntegrationConfig {
  service: 'email' | 'slack';
  action: string;
  recipients?: string;
  subject?: string;
  body?: string;
  channel?: string;
  message?: string;
}

export interface DecisionConfig {
  left_operand: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  right_operand: string;
}

export interface EscalationConfig {
  recipient_email: string;
  message_template: string;
}

export interface WebSearchConfig {
  query: string;
  max_results: number;
  output_variable?: string;
}
