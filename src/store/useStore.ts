import { create } from 'zustand';
import { User, Task, WorkRequest } from '../types';
import { SupabaseService, SupabaseProjectRow, Employee } from '../lib/supabaseService';

export type { Employee };

interface AppState {
  user: User | null;
  activeTab: 'home' | 'requests' | 'tasks' | 'calendar' | 'more';
  tasks: Task[];
  requests: WorkRequest[];
  projects: SupabaseProjectRow[];
  employees: Employee[];
  isFabOpen: boolean;
  theme: 'light' | 'dark';
  language: 'TH' | 'EN';
  isSidebarCollapsed: boolean;
  isSidebarAutoHide: boolean;
  isMobileMenuOpen: boolean;
  isSupabaseConnected: boolean;
  isLoadingData: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setActiveTab: (tab: 'home' | 'requests' | 'tasks' | 'calendar' | 'more') => void;
  setFabOpen: (isOpen: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'TH' | 'EN') => void;
  toggleSidebar: () => void;
  toggleSidebarAutoHide: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarAutoHide: (autoHide: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Supabase Data Actions
  initSupabaseData: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addRequest: (request: WorkRequest) => Promise<void>;
  updateRequest: (id: string, updates: Partial<WorkRequest>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  addEmployee: (employee: Employee) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: {
    id: '46de6855-477a-4a99-bb4c-7e627500fafa',
    name: 'Somchai Suksan',
    role: 'Site Manager',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  activeTab: 'home',
  isFabOpen: false,
  theme: 'light',
  language: 'TH',
  isSidebarCollapsed: false,
  isSidebarAutoHide: false,
  isMobileMenuOpen: false,
  isSupabaseConnected: true,
  isLoadingData: false,
  projects: [],
  employees: [],
  tasks: [],
  requests: [],

  initSupabaseData: async () => {
    set({ isLoadingData: true });
    try {
      // 1. Ensure initial enterprise data exists in user Supabase
      await SupabaseService.seedIfEmpty();

      // 2. Fetch live data concurrently from Supabase
      const [dbTasks, dbRequests, dbProjects, dbEmployees] = await Promise.all([
        SupabaseService.getTasks(),
        SupabaseService.getWorkRequests(),
        SupabaseService.getProjects(),
        SupabaseService.getEmployees(),
      ]);

      set({
        tasks: dbTasks,
        requests: dbRequests,
        projects: dbProjects,
        employees: dbEmployees,
        isSupabaseConnected: true,
        isLoadingData: false,
      });

      // 3. Setup live realtime subscriptions
      SupabaseService.subscribeToTasks(async () => {
        const freshTasks = await SupabaseService.getTasks();
        set({ tasks: freshTasks });
      });

      SupabaseService.subscribeToWorkRequests(async () => {
        const freshReqs = await SupabaseService.getWorkRequests();
        set({ requests: freshReqs });
      });

      SupabaseService.subscribeToProfiles(async () => {
        const freshEmployees = await SupabaseService.getEmployees();
        set({ employees: freshEmployees });
      });

    } catch (e) {
      console.error('Failed to initialize Supabase data:', e);
      set({ isLoadingData: false, isSupabaseConnected: false });
    }
  },

  login: (user) => set({ user }),
  logout: () => set({ user: null, activeTab: 'home' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFabOpen: (isOpen) => set({ isFabOpen: isOpen }),
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  setLanguage: (lang) => set({ language: lang }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleSidebarAutoHide: () => set((state) => ({ isSidebarAutoHide: !state.isSidebarAutoHide })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setSidebarAutoHide: (autoHide) => set({ isSidebarAutoHide: autoHide }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  addTask: async (task: Task) => {
    set((state) => ({ tasks: [task, ...state.tasks] }));
    const created = await SupabaseService.createTask(task);
    if (created) {
      const freshTasks = await SupabaseService.getTasks();
      set({ tasks: freshTasks });
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
    await SupabaseService.updateTask(id, updates);
  },

  deleteTask: async (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== id)
    }));
    await SupabaseService.deleteTask(id);
  },

  addRequest: async (request: WorkRequest) => {
    set((state) => ({ requests: [request, ...state.requests] }));
    const created = await SupabaseService.createWorkRequest(request);
    if (created) {
      const freshReqs = await SupabaseService.getWorkRequests();
      set({ requests: freshReqs });
    }
  },

  updateRequest: async (id: string, updates: Partial<WorkRequest>) => {
    set((state) => ({
      requests: state.requests.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
    await SupabaseService.updateWorkRequest(id, updates);
  },

  updateEmployee: async (id: string, updates: Partial<Employee>) => {
    set((state) => ({
      employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
    await SupabaseService.updateEmployee(id, updates);
  },

  addEmployee: async (employee: Employee) => {
    set((state) => ({
      employees: [...state.employees, employee]
    }));
    await SupabaseService.addEmployee(employee);
  },
}));
