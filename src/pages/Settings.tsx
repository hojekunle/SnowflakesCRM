import React, { useState } from 'react';
import { User, Shield, Bell, Database, Download, Upload } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAppStore } from '../store';
import Papa from 'papaparse';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { List, Lead } from '../types';
import { format } from 'date-fns';

export const Settings = () => {
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ['lists'],
    queryFn: () => fetch('/api/lists').then(res => res.json())
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => fetch('/api/leads').then(res => res.json())
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
        alert(`Successfully imported ${createdLeads.length} leads.`);
      }
    });
  };

  const handleExportCsv = () => {
    if (leads.length === 0) {
      alert('No leads to export.');
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 interstitial-fade">
      <header>
        <h1 className="text-2xl font-medium">Settings</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Manage your account and workspace preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <nav className="space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'workspace', label: 'Workspace', icon: Database },
            { id: 'billing', label: 'Billing', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="md:col-span-3 space-y-12">
          <section className="space-y-6">
            <h3 className="text-sm font-medium border-b pb-2">Profile Information</h3>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-medium border-2 border-accent/20">
                {user?.full_name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">{user?.full_name}</h3>
                <p className="text-sm text-text-secondary-light">{user?.email}</p>
                <Button variant="ghost" size="sm" className="h-8 text-xs">Change Avatar</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Input label="Full Name" defaultValue={user?.full_name} />
              <Input label="Email Address" defaultValue={user?.email} />
            </div>
            <Button>Save Changes</Button>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-medium border-b pb-2">Data Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <Upload size={20} />
                  <h4 className="text-sm font-medium">Import Leads</h4>
                </div>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Upload a CSV file to bulk import leads.
                </p>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 bg-black/5 dark:bg-white/5 rounded-lg px-3 py-1.5 text-xs outline-none"
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                    >
                      <option value="">No List</option>
                      {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px]" onClick={() => {
                      const name = prompt('New list name:');
                      if (name) createListMutation.mutate(name);
                    }}>+ New</Button>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button variant="secondary" className="w-full" disabled={isUploading}>
                      {isUploading ? 'Importing...' : 'Choose CSV File'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <Download size={20} />
                  <h4 className="text-sm font-medium">Export Data</h4>
                </div>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Download all your CRM leads in a portable CSV format.
                </p>
                <Button variant="secondary" className="w-full" onClick={handleExportCsv}>Export to CSV</Button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-medium border-b pb-2">Billing</h3>
            <div className="glass p-8 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pro Plan</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  Your next billing date is April 12, 2026.
                </p>
              </div>
              <Button variant="secondary">Manage Subscription</Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
