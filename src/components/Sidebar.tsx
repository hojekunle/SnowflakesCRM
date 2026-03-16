import { LayoutDashboard, Kanban, CheckSquare, Settings, Moon, Sun, LogOut, List as ListIcon, Users, Snowflake } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { List } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, onLogout }: SidebarProps) => {
  const { theme, setTheme, user } = useAppStore();

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ['lists'],
    queryFn: () => fetch('/api/lists').then(res => res.json())
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen border-r flex flex-col glass sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
            <Snowflake size={18} />
          </div>
          <span className="text-lg font-medium tracking-tight">Snowflakes CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive 
                    ? 'bg-accent/10 text-accent font-medium' 
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <Icon size={18} className={cn('transition-colors', isActive ? 'text-accent' : 'group-hover:text-text-primary-light dark:group-hover:text-text-primary-dark')} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-8 pb-4">
          <h3 className="px-4 text-[10px] uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark font-semibold mb-2">
            Lists
          </h3>
          <div className="space-y-1">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => onTabChange(`list-${list.id}`)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group text-sm',
                  activeTab === `list-${list.id}`
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <ListIcon size={16} />
                <span className="truncate">{list.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t space-y-4">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-medium">
            {user?.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.full_name}</p>
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark truncate">{user?.email}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
