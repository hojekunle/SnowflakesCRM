export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  status_stage: string;
  value: number;
  order_index: number;
  tags?: string[];
  created_at: string;
}

export interface Task {
  id: string;
  lead_id: string | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
}

export interface List {
  id: string;
  name: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totalLeads: number;
  winRate: number;
  revenue: number;
  tasksDue: number;
}

export interface Tag {
  id: string;
  name: string;
  color_code: string;
}

export interface PipelineData {
  name: string;
  value: number;
}
