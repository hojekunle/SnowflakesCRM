import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name: string;
  theme_preference: 'light' | 'dark' | 'system';
}

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  setUser: (user: User) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: 'default-user',
    email: 'user@example.com',
    full_name: 'Aura User',
    theme_preference: 'system',
  },
  theme: 'light',
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  setUser: (user) => set({ user }),
}));
