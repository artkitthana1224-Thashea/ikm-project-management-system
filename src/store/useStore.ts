import { create } from 'zustand';
import { User, Task, WorkRequest, MainEquipment, ApprovalRecord, UserRole } from '../types';
import { SupabaseService, SupabaseProjectRow, Employee } from '../lib/supabaseService';
import { initialEquipmentList, initialEnterpriseEmployees } from '../data/equipmentData';

export type { Employee };

interface AppState {
  user: User | null;
  activeTab: 'home' | 'requests' | 'tasks' | 'calendar' | 'more';
  tasks: Task[];
  requests: WorkRequest[];
  projects: SupabaseProjectRow[];
  employees: Employee[];
  equipments: MainEquipment[];
  approvalRecords: ApprovalRecord[];
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
  switchUser: (userOrEmp: User | Employee) => void;
  switchRole: (role: UserRole) => void;
  setActiveTab: (tab: 'home' | 'requests' | 'tasks' | 'calendar' | 'more') => void;
  setFabOpen: (isOpen: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'TH' | 'EN') => void;
  toggleSidebar: () => void;
  toggleSidebarAutoHide: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarAutoHide: (autoHide: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Supabase & Local Data Actions
  initSupabaseData: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string, hardDelete?: boolean) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  addRequest: (request: WorkRequest) => Promise<void>;
  updateRequest: (id: string, updates: Partial<WorkRequest>) => Promise<void>;
  archiveRequest: (id: string) => Promise<void>;
  submitApproval: (record: Omit<ApprovalRecord, 'id' | 'approvedAt'>) => Promise<void>;
  
  // Employee Actions
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  addEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string, hardDelete?: boolean) => Promise<void>;
  archiveEmployee: (id: string) => Promise<void>;
  updateUserAvatar: (avatarUrl: string | undefined) => Promise<void>;
  updateUserProfile: (updates: {
    name?: string;
    username?: string;
    password?: string;
    role?: string;
    userLevel?: UserRole;
    department?: string;
    avatar?: string;
    skills?: string[];
    phone?: string;
    email?: string;
    bio?: string;
  }) => Promise<void>;
  
  // Main Equipment Actions
  addEquipment: (equipment: MainEquipment) => Promise<void>;
  updateEquipment: (id: string, updates: Partial<MainEquipment>) => Promise<void>;
  deleteEquipment: (id: string, hardDelete?: boolean) => Promise<void>;
  archiveEquipment: (id: string) => Promise<void>;
}

const getInitialUser = (): User | null => {
  try {
    if (localStorage.getItem('ikm_logged_out') === 'true') {
      return null;
    }
    const saved = localStorage.getItem('ikm_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name) return parsed;
    }
  } catch (e) {}
  return {
    id: 'emp-003-country',
    name: 'Art Kitthana',
    username: 'art.countrymgr',
    role: 'Country Manager',
    userLevel: 'Country Manager',
    department: 'Management',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: ['Project Governance', 'Offshore Strategy', 'P&L Management', 'High-Level Approval'],
    phone: '089-112-3344',
    email: 'art.k@ikm-ops.com',
  };
};

const getInitialEquipments = (): MainEquipment[] => {
  try {
    const saved = localStorage.getItem('ikm_equipment_list');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return initialEquipmentList;
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
  employees: initialEnterpriseEmployees,
  equipments: getInitialEquipments(),
  tasks: [],
  requests: [],
  approvalRecords: [],

  initSupabaseData: async () => {
    set({ isLoadingData: true });
    try {
      // 1. Ensure initial enterprise data exists in user Supabase
      await SupabaseService.seedIfEmpty();

      const state = get();
      const isLoggedOut = localStorage.getItem('ikm_logged_out') === 'true';
      
      let localSavedUser: User | null = null;
      try {
        const raw = localStorage.getItem('ikm_user_profile');
        if (raw) localSavedUser = JSON.parse(raw);
      } catch (e) {}

      const activeUserId = localSavedUser?.id || state.user?.id;

      // 2. Fetch live data concurrently from Supabase
      const [dbTasks, dbRequests, dbProjects, dbEmployees, dbUserProfile] = await Promise.all([
        SupabaseService.getTasks(),
        SupabaseService.getWorkRequests(),
        SupabaseService.getProjects(),
        SupabaseService.getEmployees(),
        activeUserId ? SupabaseService.getCurrentUserProfile(activeUserId) : Promise.resolve(null),
      ]);

      let finalUser: User | null = null;
      if (!isLoggedOut) {
        if (dbUserProfile && dbUserProfile.name) {
          finalUser = dbUserProfile;
        } else if (localSavedUser) {
          // Check if employee with same ID or username exists in dbEmployees
          const matchedDbEmp = dbEmployees.find(e => e.id === localSavedUser?.id || (e.email && e.email === localSavedUser?.email));
          if (matchedDbEmp) {
            finalUser = {
              ...localSavedUser,
              name: matchedDbEmp.name, // Real full_name from database
              role: matchedDbEmp.role,
              department: matchedDbEmp.department,
              phone: matchedDbEmp.phone,
              email: matchedDbEmp.email,
              avatar: matchedDbEmp.avatarUrl || localSavedUser.avatar,
            };
          } else {
            finalUser = localSavedUser;
          }
        } else if (state.user) {
          const matchedDbEmp = dbEmployees.find(e => e.id === state.user?.id || (e.email && e.email === state.user?.email));
          if (matchedDbEmp) {
            finalUser = {
              ...state.user,
              name: matchedDbEmp.name,
              role: matchedDbEmp.role,
              department: matchedDbEmp.department,
            };
          } else {
            finalUser = state.user;
          }
        } else if (dbEmployees.length > 0) {
          const first = dbEmployees[0];
          finalUser = {
            id: first.id,
            name: first.name, // Real full_name from database
            username: first.username || first.name.toLowerCase().replace(/\s+/g, '.'),
            role: first.role,
            userLevel: first.userLevel || 'Manager',
            department: first.department,
            avatar: first.avatarUrl || '',
            skills: first.skills || ['Operations'],
            email: first.email || '',
            phone: first.phone || '',
          };
        }
      }
      
      const finalEmployees = dbEmployees && dbEmployees.length > 0 ? dbEmployees : [];
      
      if (finalUser) {
        try {
          localStorage.setItem('ikm_user_profile', JSON.stringify(finalUser));
        } catch (err) {}
      }

      set({
        tasks: dbTasks,
        requests: dbRequests,
        projects: dbProjects,
        employees: finalEmployees,
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
        const freshEmployees = await SupabaseService.getEmployees();
        set((s) => {
          return {
            employees: freshEmployees && freshEmployees.length > 0 ? freshEmployees : s.employees,
          };
        });
      });

    } catch (e) {
      console.error('Failed to initialize Supabase data:', e);
      set({ isLoadingData: false, isSupabaseConnected: false });
    }
  },

  login: (user) => {
    try {
      localStorage.removeItem('ikm_logged_out');
      localStorage.setItem('ikm_user_profile', JSON.stringify(user));
    } catch (e) {}
    set({ user });
  },
  
  logout: () => {
    try {
      localStorage.removeItem('ikm_user_profile');
      localStorage.setItem('ikm_logged_out', 'true');
    } catch (e) {}
    set({ user: null, activeTab: 'home' });
  },
  
  switchUser: (userOrEmp: User | Employee) => {
    const roleLevels: Record<string, UserRole> = {
      'Admin': 'Admin',
      'Country Manager': 'Country Manager',
      'Manager': 'Manager',
      'Coordinator': 'Coordinator',
      'Supervisor': 'Supervisor',
      'Technician': 'Technician',
      'Requester': 'Requester'
    };

    const targetLevel: UserRole = userOrEmp.userLevel || roleLevels[userOrEmp.role] || (
      userOrEmp.role.toLowerCase().includes('admin') ? 'Admin' :
      userOrEmp.role.toLowerCase().includes('country') ? 'Country Manager' :
      userOrEmp.role.toLowerCase().includes('manager') ? 'Manager' :
      userOrEmp.role.toLowerCase().includes('coord') ? 'Coordinator' :
      userOrEmp.role.toLowerCase().includes('lead') || userOrEmp.role.toLowerCase().includes('super') ? 'Supervisor' :
      userOrEmp.role.toLowerCase().includes('request') ? 'Requester' : 'Technician'
    );

    const newUser: User = {
      id: userOrEmp.id,
      name: userOrEmp.name,
      username: (userOrEmp as any).username || `${userOrEmp.name.toLowerCase().replace(/\s+/g, '.')}`,
      role: userOrEmp.role,
      userLevel: targetLevel,
      avatar: (userOrEmp as any).avatarUrl || (userOrEmp as any).avatar || '',
      department: userOrEmp.department,
      skills: userOrEmp.skills,
      phone: userOrEmp.phone,
      email: userOrEmp.email,
    };

    set({ user: newUser });
    try {
      localStorage.setItem('ikm_user_profile', JSON.stringify(newUser));
    } catch (e) {}
  },

  switchRole: (role: UserRole) => {
    const state = get();
    // Find matching demo user for that role or update current user's role
    const matchingEmp = state.employees.find(e => e.userLevel === role || e.role.toLowerCase().includes(role.toLowerCase()));
    if (matchingEmp) {
      get().switchUser(matchingEmp);
    } else if (state.user) {
      const updatedUser: User = {
        ...state.user,
        role: role,
        userLevel: role
      };
      set({ user: updatedUser });
      try {
        localStorage.setItem('ikm_user_profile', JSON.stringify(updatedUser));
      } catch (e) {}
    }
  },

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

  deleteTask: async (id: string, hardDelete = false) => {
    if (hardDelete) {
      set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }));
      await SupabaseService.deleteTask(id);
    } else {
      // Soft-delete to preserve audit trail
      await get().archiveTask(id);
    }
  },

  archiveTask: async (id: string) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, isArchived: true } : t)
    }));
    await SupabaseService.updateTask(id, { isArchived: true } as any);
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
      requests: state.requests.map(r => r.id === id ? { ...r, ...updates, currentRevision: (r.currentRevision || 1) + 1 } : r)
    }));
    await SupabaseService.updateWorkRequest(id, updates);
  },

  archiveRequest: async (id: string) => {
    set((state) => ({
      requests: state.requests.map(r => r.id === id ? { ...r, isArchived: true } : r)
    }));
    await SupabaseService.updateWorkRequest(id, { isArchived: true } as any);
  },

  submitApproval: async (record: Omit<ApprovalRecord, 'id' | 'approvedAt'>) => {
    const newRecord: ApprovalRecord = {
      ...record,
      id: `APP-REC-${Date.now()}`,
      approvedAt: new Date().toISOString()
    };

    set((state) => ({
      approvalRecords: [newRecord, ...state.approvalRecords],
      requests: state.requests.map(r => {
        if (r.id === record.requestId) {
          const currentApprovals = r.approvals || [];
          return {
            ...r,
            status: record.decision === 'Approved' ? 'In Progress' : 'Closed',
            approvals: [...currentApprovals, newRecord],
            currentRevision: (r.currentRevision || 1) + 1
          };
        }
        return r;
      })
    }));

    // Record in audit trail as well
    if (record.requestId) {
      await SupabaseService.updateWorkRequest(record.requestId, {
        status: record.decision === 'Approved' ? 'In Progress' : 'Closed',
      });
    }
  },

  updateEmployee: async (id: string, updates: Partial<Employee>) => {
    set((state) => {
      const isCurrentUser = state.user && (state.user.id === id || state.user.name === updates.name);
      const updatedUser = isCurrentUser && state.user ? {
        ...state.user,
        name: updates.name || state.user.name,
        role: updates.role || state.user.role,
        userLevel: updates.userLevel || state.user.userLevel,
        department: updates.department || state.user.department,
        avatar: updates.avatarUrl !== undefined ? (updates.avatarUrl || '') : state.user.avatar,
        skills: updates.skills || state.user.skills,
        phone: updates.phone || state.user.phone,
        email: updates.email || state.user.email,
        bio: updates.bio || state.user.bio,
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
  },

  addEmployee: async (employee: Employee) => {
    set((state) => ({
      employees: [employee, ...state.employees]
    }));
    await SupabaseService.addEmployee(employee);
  },

  deleteEmployee: async (id: string, hardDelete = false) => {
    if (hardDelete) {
      set((state) => ({
        employees: state.employees.filter(e => e.id !== id)
      }));
      await SupabaseService.deleteEmployee(id);
    } else {
      // Soft delete / archive to keep audit trail
      await get().archiveEmployee(id);
    }
  },

  archiveEmployee: async (id: string) => {
    set((state) => ({
      employees: state.employees.map(e => e.id === id ? { ...e, isArchived: true } : e)
    }));
    await SupabaseService.updateEmployee(id, { isArchived: true });
  },

  updateUserAvatar: async (avatarUrl: string | undefined) => {
    const state = get();
    if (!state.user) return;
    await get().updateUserProfile({ avatar: avatarUrl || '' });
  },

  updateUserProfile: async (updates: {
    name?: string;
    username?: string;
    password?: string;
    role?: string;
    userLevel?: UserRole;
    department?: string;
    avatar?: string;
    skills?: string[];
    phone?: string;
    email?: string;
    bio?: string;
  }) => {
    const state = get();
    if (!state.user) return;

    const updatedUser: User = {
      ...state.user,
      name: updates.name !== undefined ? updates.name : state.user.name,
      username: updates.username !== undefined ? updates.username : state.user.username,
      password: updates.password !== undefined ? updates.password : state.user.password,
      role: updates.role !== undefined ? updates.role : state.user.role,
      userLevel: updates.userLevel !== undefined ? updates.userLevel : state.user.userLevel,
      department: updates.department !== undefined ? updates.department : state.user.department,
      avatar: updates.avatar !== undefined ? updates.avatar : state.user.avatar,
      skills: updates.skills !== undefined ? updates.skills : state.user.skills,
      phone: updates.phone !== undefined ? updates.phone : state.user.phone,
      email: updates.email !== undefined ? updates.email : state.user.email,
    };

    set((s) => ({
      user: updatedUser,
      employees: s.employees.map(e => {
        if (s.user && (e.id === s.user.id || e.name === s.user.name || (updates.name && e.name === updates.name))) {
          return {
            ...e,
            name: updates.name || e.name,
            username: updates.username || e.username,
            role: updates.role || e.role,
            userLevel: updates.userLevel || e.userLevel,
            department: updates.department || e.department,
            avatarUrl: updates.avatar !== undefined ? (updates.avatar || undefined) : e.avatarUrl,
            skills: updates.skills || e.skills,
            phone: updates.phone || e.phone,
            email: updates.email || e.email,
            bio: updates.bio || e.bio,
          };
        }
        return e;
      })
    }));

    try {
      localStorage.setItem('ikm_user_profile', JSON.stringify(updatedUser));
    } catch (e) {}

    await SupabaseService.saveUserProfile(updatedUser);
  },

  // Main Equipment Actions
  addEquipment: async (equipment: MainEquipment) => {
    set((state) => {
      const updated = [equipment, ...state.equipments];
      try {
        localStorage.setItem('ikm_equipment_list', JSON.stringify(updated));
      } catch (e) {}
      return { equipments: updated };
    });
  },

  updateEquipment: async (id: string, updates: Partial<MainEquipment>) => {
    set((state) => {
      const updated = state.equipments.map(eq => eq.id === id ? { ...eq, ...updates, updatedAt: new Date().toISOString() } : eq);
      try {
        localStorage.setItem('ikm_equipment_list', JSON.stringify(updated));
      } catch (e) {}
      return { equipments: updated };
    });
  },

  deleteEquipment: async (id: string, hardDelete = false) => {
    if (hardDelete) {
      set((state) => {
        const updated = state.equipments.filter(eq => eq.id !== id);
        try {
          localStorage.setItem('ikm_equipment_list', JSON.stringify(updated));
        } catch (e) {}
        return { equipments: updated };
      });
    } else {
      await get().archiveEquipment(id);
    }
  },

  archiveEquipment: async (id: string) => {
    set((state) => {
      const updated = state.equipments.map(eq => eq.id === id ? { ...eq, isArchived: true, updatedAt: new Date().toISOString() } : eq);
      try {
        localStorage.setItem('ikm_equipment_list', JSON.stringify(updated));
      } catch (e) {}
      return { equipments: updated };
    });
  },
}));

