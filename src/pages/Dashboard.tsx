import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Users, Target, DollarSign, Clock } from 'lucide-react';
import { AnalyticsSummary, PipelineData } from '../types';

const MetricCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="glass p-6 rounded-2xl space-y-4">
    <div className="flex items-center justify-between">
      <div className="p-2 bg-accent/10 rounded-lg text-accent">
        <Icon size={20} />
      </div>
      {trend && (
        <span className={cn("text-xs font-medium", trend > 0 ? "text-emerald-500" : "text-red-500")}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-medium">
        {title}
      </p>
      <p className="text-2xl font-medium tracking-tight mt-1">
        {value}
      </p>
    </div>
  </div>
);

import { cn } from '../lib/utils';
import { Task } from '../types';

export const Dashboard = () => {
  const { data: summary } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary'],
    queryFn: () => fetch('/api/analytics/summary').then(res => res.json())
  });

  const { data: pipeline } = useQuery<PipelineData[]>({
    queryKey: ['analytics-pipeline'],
    queryFn: () => fetch('/api/analytics/pipeline').then(res => res.json())
  });

  const { data: recentTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks-recent'],
    queryFn: () => fetch('/api/tasks').then(res => res.json().then(data => data.slice(0, 5)))
  });

  // Mock velocity data
  const velocityData = [
    { name: '1 Mar', value: 12 },
    { name: '5 Mar', value: 18 },
    { name: '10 Mar', value: 15 },
    { name: '15 Mar', value: 25 },
    { name: '20 Mar', value: 22 },
    { name: '25 Mar', value: 30 },
    { name: '30 Mar', value: 28 },
  ];

  return (
    <div className="space-y-8 interstitial-fade">
      <header>
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Welcome back, here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Active Leads" value={summary?.totalLeads || 0} icon={Users} trend={12} />
        <MetricCard title="Win Rate" value={`${summary?.winRate || 0}%`} icon={Target} trend={5} />
        <MetricCard title="Revenue in Pipeline" value={`$${(summary?.revenue || 0).toLocaleString()}`} icon={DollarSign} trend={8} />
        <MetricCard title="Tasks Due Today" value={summary?.tasksDue || 0} icon={Clock} trend={-2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Recent Tasks</h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Your upcoming action items</p>
            </div>
            <a href="/tasks" className="text-xs text-accent hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {recentTasks.length > 0 ? recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-accent/10 transition-all">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  task.priority === 'high' ? "bg-red-500" : task.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", task.is_completed && "line-through opacity-50")}>{task.title}</p>
                  <p className="text-[10px] text-text-secondary-light truncate">{task.description}</p>
                </div>
                {task.due_date && (
                  <span className="text-[10px] text-text-secondary-light whitespace-nowrap">
                    {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            )) : (
              <p className="text-sm text-text-secondary-light italic text-center py-8">No tasks found</p>
            )}
          </div>
        </div>

        <div className="glass p-8 rounded-2xl space-y-6">
          <div>
            <h3 className="text-sm font-medium">Lead Velocity</h3>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">New leads added over the last 30 days</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(12px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontSize: 12, fontWeight: 500 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl space-y-6">
          <div>
            <h3 className="text-sm font-medium">Pipeline Distribution</h3>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Concentration of leads across stages</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline || []} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(12px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {pipeline?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#6366f1" fillOpacity={0.6 + (index * 0.1)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
