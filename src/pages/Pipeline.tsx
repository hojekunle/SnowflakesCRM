import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreVertical, Mail, Phone, Building2 } from 'lucide-react';
import { Lead, Task, List } from '../types';
import { STAGES, cn } from '../lib/utils';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';

const LeadCard = ({ lead, isOverlay, onClick }: { lead: Lead, isOverlay?: boolean, onClick?: () => void, key?: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 group",
        isDragging && "opacity-30",
        isOverlay && "shadow-2xl scale-105 cursor-grabbing"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div 
          className="flex-1 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <h4 className="text-sm font-medium group-hover:text-accent transition-colors">{lead.first_name} {lead.last_name}</h4>
        </div>
        <div {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing">
          <MoreVertical size={14} className="text-text-secondary-light" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          <Building2 size={12} />
          <span className="truncate">{lead.company}</span>
        </div>
        {lead.email && (
          <a 
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-[11px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors"
          >
            <Mail size={12} />
            <span className="truncate">{lead.email}</span>
          </a>
        )}
        {lead.phone && (
          <a 
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-[11px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors"
          >
            <Phone size={12} />
            <span className="truncate">{lead.phone}</span>
          </a>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {lead.tags?.map((tag, i) => (
          <span key={i} className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full text-[9px] uppercase tracking-wider font-medium text-text-secondary-light">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const Column = ({ stage, leads, onLeadClick }: { stage: string, leads: Lead[], onLeadClick: (lead: Lead) => void, key?: string }) => {
  const { setNodeRef } = useSortable({ id: stage });

  return (
    <div className="flex flex-col w-80 min-w-[320px] h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">
            {stage}
          </h3>
          <span className="text-[10px] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-full font-medium">
            {leads.length}
          </span>
        </div>
        <button className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
          <Plus size={14} className="text-text-secondary-light" />
        </button>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto pr-2 pb-4"
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const Pipeline = () => {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => fetch('/api/leads').then(res => res.json())
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, status_stage, order_index }: { id: string, status_stage: string, order_index: number }) => 
      fetch(`/api/leads/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_stage, order_index })
      }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeLead = leads.find(l => l.id === active.id);
    if (!activeLead) return;

    // Check if dropped over a column or another card
    const overId = over.id as string;
    const overStage = STAGES.includes(overId) ? overId : leads.find(l => l.id === overId)?.status_stage;

    if (overStage && activeLead.status_stage !== overStage) {
      updateStageMutation.mutate({
        id: activeLead.id,
        status_stage: overStage,
        order_index: 0 // Simplification for now
      });
    }

    setActiveId(null);
  };

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/leads/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(null);
    }
  });

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ['lists'],
    queryFn: () => fetch('/api/lists').then(res => res.json())
  });

  const { data: leadTasks = [] } = useQuery<Task[]>({
    queryKey: ['lead-tasks', selectedLead?.id],
    queryFn: () => fetch(`/api/tasks?lead_id=${selectedLead?.id}`).then(res => res.json()),
    enabled: !!selectedLead
  });

  const addTaskMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-tasks', selectedLead?.id] })
  });

  const addToListMutation = useMutation({
    mutationFn: ({ listId, leadIds }: { listId: string, leadIds: string[] }) => 
      fetch(`/api/lists/${listId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: leadIds })
      }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] })
  });

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-8 interstitial-fade">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Pipeline</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Manage your sales funnel with drag and drop.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => {
            const name = prompt('Enter list name:');
            if (name) {
              fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: Math.random().toString(36).substr(2, 9), name })
              }).then(() => queryClient.invalidateQueries({ queryKey: ['lists'] }));
            }
          }}>New List</Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max">
            {STAGES.map(stage => (
              <Column 
                key={stage} 
                stage={stage} 
                leads={leads.filter(l => l.status_stage === stage)} 
                onLeadClick={setSelectedLead}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Lead Detail Modal */}
      <Modal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title="Lead Details"
        className="max-w-2xl"
      >
        {selectedLead && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl font-medium">
                  {selectedLead.first_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedLead.first_name} {selectedLead.last_name}</h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{selectedLead.company}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  className="text-xs bg-black/5 dark:bg-white/5 rounded-lg px-3 py-1.5 outline-none"
                  onChange={(e) => {
                    if (e.target.value) {
                      addToListMutation.mutate({ listId: e.target.value, leadIds: [selectedLead.id] });
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Add to List...</option>
                  {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-text-secondary-light font-medium">Email</p>
                {selectedLead.email ? (
                  <a href={`mailto:${selectedLead.email}`} className="text-sm text-accent hover:underline">{selectedLead.email}</a>
                ) : (
                  <p className="text-sm">N/A</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-text-secondary-light font-medium">Phone</p>
                {selectedLead.phone ? (
                  <a href={`tel:${selectedLead.phone}`} className="text-sm text-accent hover:underline">{selectedLead.phone}</a>
                ) : (
                  <p className="text-sm">N/A</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-text-secondary-light font-medium">Status</p>
                <p className="text-sm">{selectedLead.status_stage}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-text-secondary-light font-medium">Value</p>
                <p className="text-sm">${selectedLead.value?.toLocaleString() || '0'}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-[10px] uppercase tracking-wider text-text-secondary-light font-medium">Tags</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedLead.tags?.length ? selectedLead.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-text-secondary-light border border-black/5 dark:border-white/5">
                      {tag}
                    </span>
                  )) : <p className="text-sm text-text-secondary-light italic">No tags</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-sm font-medium">Tasks</h4>
                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => {
                  const title = prompt('Task title:');
                  if (title) {
                    addTaskMutation.mutate({
                      id: Math.random().toString(36).substr(2, 9),
                      lead_id: selectedLead.id,
                      title,
                      priority: 'medium',
                      status: 'todo'
                    });
                  }
                }}>+ Add Task</Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {leadTasks.length === 0 ? (
                  <p className="text-xs text-text-secondary-light text-center py-4 italic">No tasks for this lead.</p>
                ) : (
                  leadTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        )} />
                        <span className="text-xs">{task.title}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider opacity-50">{task.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 border-t flex justify-between items-center">
              <Button 
                variant="danger" 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this lead?')) {
                    deleteLeadMutation.mutate(selectedLead.id);
                  }
                }}
              >
                Delete Lead
              </Button>
              <Button variant="secondary" onClick={() => setSelectedLead(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="New Lead"
      >
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = {
            id: Math.random().toString(36).substr(2, 9),
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            company: formData.get('company'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status_stage: 'New',
            value: Number(formData.get('value')),
            order_index: 0
          };
          
          fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setIsAddModalOpen(false);
          });
        }}>
          <div className="grid grid-cols-2 gap-4">
            <Input name="first_name" label="First Name" placeholder="John" required />
            <Input name="last_name" label="Last Name" placeholder="Doe" />
          </div>
          <Input name="company" label="Company" placeholder="Acme Inc." />
          <Input name="email" label="Email" type="email" placeholder="john@example.com" />
          <Input name="value" label="Lead Value ($)" type="number" placeholder="5000" />
          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Lead</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
