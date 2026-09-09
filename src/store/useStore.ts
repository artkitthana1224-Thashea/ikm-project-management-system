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
  deleteEmployee: (id: string) => Promise<void>;
  updateUserAvatar: (avatarUrl: string | undefined) => Promise<void>;
  updateUserProfile: (updates: {
    name?: string;
    role?: string;
    department?: string;
    avatar?: string;
    skills?: string[];
    phone?: string;
    email?: string;
  }) => Promise<void>;
}

const getInitialUser = (): User => {
  try {
    const saved = localStorage.getItem('ikm_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name) return parsed;
    }
  } catch (e) {}
  return {
    id: '46de6855-477a-4a99-bb4c-7e627500fafa',
    name: 'Somchai Suksan',
    role: 'Site Manager',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: ['Leadership', 'SCADA', 'Turbine Overhaul', 'Field Inspection'],
    phone: '081-998-8776',
    email: 'somchai.s@ikm-ops.com',
  };
};

export const useStore = create<AppState>((set, get) => ({
  user: getInitialUser(),
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

      // 2. Fetch live data concurrently from Supabase including persistent user profile
      const [dbTasks, dbRequests, dbProjects, dbEmployees, dbUserProfile] = await Promise.all([
        SupabaseService.getTasks(),
        SupabaseService.getWorkRequests(),
        SupabaseService.getProjects(),
        SupabaseService.getEmployees(),
        SupabaseService.getCurrentUserProfile(),
      ]);

      const state = get();
      const finalUser = dbUserProfile || state.user || getInitialUser();
      try {
        localStorage.setItem('ikm_user_profile', JSON.stringify(finalUser));
      } catch (err) {}

      set({
        tasks: dbTasks,
        requests: dbRequests,
        projects: dbProjects,
        employees: dbEmployees,
        user: finalUser,
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
        const [freshEmployees, freshUser] = await Promise.all([
          SupabaseService.getEmployees(),
          SupabaseService.getCurrentUserProfile(),
        ]);
        set((s) => {
          const u = freshUser || s.user;
          if (u) {
            try {
              localStorage.setItem('ikm_user_profile', JSON.stringify(u));
            } catch (err) {}
          }
          return {
            employees: freshEmployees,
            user: u,
          };
        });
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
    set((state) => {
      const isCurrentUser = state.user && (state.user.id === id || state.user.name === updates.name);
      const updatedUser = isCurrentUser && state.user ? {
        ...state.user,
        name: updates.name || state.user.name,
        role: updates.role || state.user.role,
        department: updates.department || state.user.department,
        avatar: updates.avatarUrl !== undefined ? (updates.avatarUrl || '') : state.user.avatar,
        skills: updates.skills || state.user.skills,
        phone: updates.phone || state.user.phone,
        email: updates.email || state.user.email,
      } : state.user;

      if (updatedUser) {
        try {
          localStorage.setItem('ikm_user_profile', JSON.stringify(updatedUser));
        } catch (e) {}
      }

      return {
        employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e),
        user: updatedUser
      };
    });

    await SupabaseService.updateEmployee(id, updates);
    const freshUser = await SupabaseService.getCurrentUserProfile();
    if (freshUser) {
      set({ user: freshUser });
      try {
        localStorage.setItem('ikm_user_profile', JSON.stringify(freshUser));
      } catch (e) {}
    }
  },

  addEmployee: async (employee: Employee) => {
    set((state) => ({
      employees: [...state.employees, employee]
    }));
    await SupabaseService.addEmployee(employee);
  },

  deleteEmployee: async (id: string) => {
    set((state) => ({
      employees: state.employees.filter(e => e.id !== id)
    }));
    await SupabaseService.deleteEmployee(id);
  },

  updateUserAvatar: async (avatarUrl: string | undefined) => {
    const state = get();
    if (!state.user) return;
    await get().updateUserProfile({ avatar: avatarUrl || '' });
  },

  updateUserProfile: async (updates: {
    name?: string;
    role?: string;
    department?: string;
    avatar?: string;
    skills?: string[];
    phone?: string;
    email?: string;
  }) => {
    const state = get();
    if (!state.user) return;

    const updatedUser: User = {
      ...state.user,
      name: updates.name !== undefined ? updates.name : state.user.name,
      role: updates.role !== undefined ? updates.role : state.user.role,
      department: updates.department !== undefined ? updates.department : state.user.department,
      avatar: updates.avatar !== undefined ? updates.avatar : state.user.avatar,
      skills: updates.skills !== undefined ? updates.skills : state.user.skills,
      phone: updates.phone !== undefined ? updates.phone : state.user.phone,
      email: updates.email !== undefined ? updates.email : state.user.email,
    };

    // 1. Instant local store update & sync in employee roster
    set((s) => ({
      user: updatedUser,
      employees: s.employees.map(e => {
        if (s.user && (e.id === s.user.id || e.name === s.user.name || (updates.name && e.name === updates.name))) {
          return {
            ...e,
            name: updates.name || e.name,
            role: updates.role || e.role,
            department: updates.department || e.department,
            avatarUrl: updates.avatar !== undefined ? (updates.avatar || undefined) : e.avatarUrl,
            skills: updates.skills || e.skills,
            phone: updates.phone || e.phone,
            email: updates.email || e.email,
          };
        }
        return e;
      })
    }));

    // 2. Persist to localStorage for instant recovery on browser refresh
    try {
      localStorage.setItem('ikm_user_profile', JSON.stringify(updatedUser));
    } catch (e) {}

    // 3. Save to Supabase user_profiles table
    await SupabaseService.saveUserProfile(updatedUser);

    // 4. Fetch fresh data from Supabase to ensure 100% sync
    const [freshEmployees, freshUser] = await Promise.all([
      SupabaseService.getEmployees(),
      SupabaseService.getCurrentUserProfile(),
    ]);

    set((s) => {
      const u = freshUser || s.user;
      if (u) {
        try {
          localStorage.setItem('ikm_user_profile', JSON.stringify(u));
        } catch (e) {}
      }
      return {
        employees: freshEmployees,
        user: u,
      };
    });
  },
}));
