import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle, Clock, AlertCircle, MoreVertical, Edit2, Trash2, User } from 'lucide-react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Task, Lead } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export const Tasks = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    lead_id: null,
    due_date: ''
  });

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => fetch('/api/tasks').then(res => res.json())
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => fetch('/api/leads').then(res => res.json())
  });

  const addTaskMutation = useMutation({
    mutationFn: (task: Partial<Task>) => fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...task, 
        id: Math.random().toString(36).substr(2, 9),
        due_date: task.due_date || null
      })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsAddModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', lead_id: null, due_date: '' });
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Task> & { id: string }) => fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updates,
        due_date: updates.due_date || null
      })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_completed }: { id: string, is_completed: boolean }) => fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed, status: is_completed ? 'done' : 'todo' })
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTaskMutation.mutate({ ...editingTask });
    } else {
      addTaskMutation.mutate(newTask);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-text-secondary-light bg-black/5';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 interstitial-fade">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Tasks</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Keep track of your action items.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus size={16} />
          New Task
        </Button>
      </header>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center glass rounded-2xl border-dashed border-2">
            <CheckCircle2 size={48} className="text-text-secondary-light mb-4 opacity-20" />
            <p className="text-text-secondary-light font-medium">No tasks found</p>
            <p className="text-sm text-text-secondary-light opacity-60">Create a task to get started.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              className={cn(
                "group flex items-center justify-between p-4 glass rounded-xl border border-transparent transition-all duration-200 hover:border-accent/20",
                task.is_completed && "opacity-60"
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => toggleMutation.mutate({ id: task.id, is_completed: !task.is_completed })}
                  className="text-text-secondary-light hover:text-accent transition-colors"
                >
                  {task.is_completed ? (
                    <CheckCircle2 size={24} className="text-accent" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn("font-medium truncate", task.is_completed && "line-through")}>
                      {task.title}
                    </h3>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold", getPriorityColor(task.priority))}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary-light">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {task.lead_id && (
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span className="truncate">
                          {leads.find(l => l.id === task.lead_id)?.first_name} {leads.find(l => l.id === task.lead_id)?.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setEditingTask(task);
                    setIsAddModalOpen(true);
                  }}
                >
                  <Edit2 size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                  onClick={() => {
                    deleteTaskMutation.mutate(task.id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? "Edit Task" : "New Task"}
        className="max-w-md"
      >
        <form onSubmit={handleTaskSubmit} className="space-y-6">
          <Input
            label="Title"
            placeholder="What needs to be done?"
            value={editingTask ? editingTask.title : newTask.title}
            onChange={(e) => editingTask 
              ? setEditingTask({ ...editingTask, title: e.target.value })
              : setNewTask({ ...newTask, title: e.target.value })
            }
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-accent/30 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 min-h-[100px] resize-none"
              placeholder="Add more details..."
              value={editingTask ? editingTask.description : newTask.description}
              onChange={(e) => editingTask
                ? setEditingTask({ ...editingTask, description: e.target.value })
                : setNewTask({ ...newTask, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                Priority
              </label>
              <select
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-accent/30 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
                value={editingTask ? editingTask.priority : newTask.priority}
                onChange={(e) => editingTask
                  ? setEditingTask({ ...editingTask, priority: e.target.value as any })
                  : setNewTask({ ...newTask, priority: e.target.value as any })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                Status
              </label>
              <select
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-accent/30 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
                value={editingTask ? editingTask.status : newTask.status}
                onChange={(e) => editingTask
                  ? setEditingTask({ ...editingTask, status: e.target.value as any })
                  : setNewTask({ ...newTask, status: e.target.value as any })
                }
              >
                <option value="todo">To-do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={editingTask ? editingTask.due_date?.split('T')[0] : newTask.due_date}
              onChange={(e) => editingTask
                ? setEditingTask({ ...editingTask, due_date: e.target.value })
                : setNewTask({ ...newTask, due_date: e.target.value })
              }
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                Associated Lead
              </label>
              <select
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-accent/30 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
                value={editingTask ? (editingTask.lead_id || '') : (newTask.lead_id || '')}
                onChange={(e) => editingTask
                  ? setEditingTask({ ...editingTask, lead_id: e.target.value || null })
                  : setNewTask({ ...newTask, lead_id: e.target.value || null })
                }
              >
                <option value="">None</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              isLoading={addTaskMutation.isPending || updateTaskMutation.isPending}
            >
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTask(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
