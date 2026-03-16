import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building2,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  ChevronDown
} from 'lucide-react';
import { Lead, List, Tag } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { cn } from '../lib/utils';
import Papa from 'papaparse';
import { format } from 'date-fns';

export const Leads = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => fetch('/api/leads').then(res => res.json())
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => fetch('/api/tags').then(res => res.json())
  });

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ['lists'],
    queryFn: () => fetch('/api/lists').then(res => res.json())
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/leads/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Math.random().toString(36).substr(2, 9), name })
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] })
  });

  const addLeadsToListMutation = useMutation({
    mutationFn: ({ listId, leadIds }: { listId: string, leadIds: string[] }) => 
      fetch(`/api/lists/${listId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: leadIds })
      }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] })
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => fetch('/api/leads/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLeadIds([]);
    }
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status_stage }: { ids: string[], status_stage: string }) => 
      fetch('/api/leads/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status_stage })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLeadIds([]);
    }
  });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const mappedLeads = results.data.map((row: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          first_name: row.first_name || row.FirstName || row.Name?.split(' ')[0] || 'Unknown',
          last_name: row.last_name || row.LastName || row.Name?.split(' ').slice(1).join(' ') || '',
          company: row.company || row.Company || 'N/A',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
          status_stage: 'Lead',
          value: parseFloat(row.value || row.Value) || 0,
          order_index: 0,
          created_at: new Date().toISOString()
        }));

        const createdLeads = [];
        for (const lead of mappedLeads) {
          const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
          });
          if (res.ok) {
            const data = await res.json();
            createdLeads.push(data);
          }
        }

        if (selectedListId && createdLeads.length > 0) {
          addLeadsToListMutation.mutate({ 
            listId: selectedListId, 
            leadIds: createdLeads.map(l => l.id) 
          });
        }

        queryClient.invalidateQueries({ queryKey: ['leads'] });
        setIsUploading(false);
      }
    });
  };

  const handleExportCsv = () => {
    if (leads.length === 0) {
      return;
    }

    const csv = Papa.unparse(leads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aura_crm_leads_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(lead => 
    `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const pipelineStages = ['Lead', 'Contacted', 'Proposal', 'Negotiation', 'Closed'];

  return (
    <div className="space-y-8 interstitial-fade relative pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Leads</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Manage and segment your potential customers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2" onClick={handleExportCsv}>
            <Download size={16} />
            Export
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button variant="secondary" className="gap-2" isLoading={isUploading}>
              <Upload size={16} />
              Import
            </Button>
          </div>
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light" size={18} />
          <input 
            type="text" 
            placeholder="Search leads by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass rounded-xl border border-transparent focus:border-accent/30 outline-none transition-all duration-200"
          />
        </div>
        <Button variant="secondary" className="gap-2">
          <Filter size={18} />
          Filter
        </Button>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
              <th className="pl-6 py-4 w-10">
                <button 
                  onClick={toggleSelectAll}
                  className="text-text-secondary-light hover:text-accent transition-colors"
                >
                  {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                    <CheckSquare size={18} className="text-accent" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-text-secondary-light">Name</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-text-secondary-light">Company</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-text-secondary-light">Status</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-text-secondary-light">Tags</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-text-secondary-light">Value</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-text-secondary-light">Contact</th>
              <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-text-secondary-light text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-secondary-light">
                  No leads found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={cn(
                    "hover:bg-black/5 dark:hover:bg-white/5 transition-colors group",
                    selectedLeadIds.includes(lead.id) && "bg-accent/5"
                  )}
                >
                  <td className="pl-6 py-4">
                    <button 
                      onClick={() => toggleSelectLead(lead.id)}
                      className={cn(
                        "transition-colors",
                        selectedLeadIds.includes(lead.id) ? "text-accent" : "text-text-secondary-light hover:text-accent"
                      )}
                    >
                      {selectedLeadIds.includes(lead.id) ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium text-xs">
                        {lead.first_name.charAt(0)}{lead.last_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{lead.first_name} {lead.last_name}</p>
                        <p className="text-[10px] text-text-secondary-light">{format(new Date(lead.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 size={14} className="text-text-secondary-light" />
                      {lead.company}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold uppercase tracking-wider">
                      {lead.status_stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {lead.tags?.map((tag, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-text-secondary-light border border-black/5 dark:border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">${lead.value.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-text-secondary-light">
                      {lead.email && (
                        <a 
                          href={`mailto:${lead.email}`} 
                          className="hover:text-accent transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail size={14} />
                        </a>
                      )}
                      {lead.phone && (
                        <a 
                          href={`tel:${lead.phone}`} 
                          className="hover:text-accent transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this lead?')) {
                            deleteLeadMutation.mutate(lead.id);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedLeadIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-4 rounded-2xl shadow-2xl border border-accent/20 flex items-center gap-6 z-40"
          >
            <div className="flex items-center gap-2 pr-6 border-r border-black/10 dark:border-white/10">
              <span className="text-sm font-medium text-accent">{selectedLeadIds.length}</span>
              <span className="text-sm text-text-secondary-light">selected</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group/menu">
                <Button variant="secondary" size="sm" className="gap-2">
                  Change Status
                  <ChevronDown size={14} />
                </Button>
                <div className="absolute bottom-full left-0 mb-2 w-48 glass rounded-xl shadow-xl border border-black/5 dark:border-white/5 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 p-1">
                  {pipelineStages.map(stage => (
                    <button
                      key={stage}
                      onClick={() => bulkStatusMutation.mutate({ ids: selectedLeadIds, status_stage: stage })}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Move to {stage}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="danger" 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) {
                    bulkDeleteMutation.mutate(selectedLeadIds);
                  }
                }}
              >
                <Trash2 size={14} />
                Delete
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedLeadIds([])}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lead"
        className="max-w-md"
      >
        <form 
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              id: Math.random().toString(36).substr(2, 9),
              first_name: formData.get('first_name') as string,
              last_name: formData.get('last_name') as string,
              company: formData.get('company') as string,
              email: formData.get('email') as string,
              phone: formData.get('phone') as string,
              tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t !== ''),
              status_stage: 'Lead',
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
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Input name="first_name" label="First Name" placeholder="John" required />
            <Input name="last_name" label="Last Name" placeholder="Doe" required />
          </div>
          <Input name="company" label="Company" placeholder="Acme Inc." required />
          <Input name="email" label="Email" type="email" placeholder="john@example.com" required />
          <Input name="phone" label="Phone" placeholder="+1 555-0000" />
          <div className="space-y-1">
            <Input name="tags" label="Tags (comma separated)" placeholder="High Priority, Tech" />
            {tags.length > 0 && (
              <p className="text-[10px] text-text-secondary-light">
                Available: {tags.map(t => t.name).join(', ')}
              </p>
            )}
          </div>
          <Input name="value" label="Deal Value ($)" type="number" placeholder="5000" required />
          
          <div className="pt-4 flex gap-3">
            <Button type="submit" className="flex-1">Create Lead</Button>
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
