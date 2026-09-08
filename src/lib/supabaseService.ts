import { supabase } from './supabase';
import { Task, WorkRequest, TaskStatus } from '../types';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarColor: string;
  availability: 'available' | 'busy' | 'on-leave' | 'off-shift';
  utilization: number;
  score: number;
  skills: string[];
  phone?: string;
  email?: string;
}

export interface SupabaseTaskRow {
  id: string;
  work_request_id?: string | null;
  title: string;
  description?: string | null;
  assignee_id?: string | null;
  status: 'todo' | 'doing' | 'done';
  estimate_hours?: number | null;
  created_at?: string;
  due_date?: string | null;
}

export interface SupabaseWorkRequestRow {
  id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  creator_id?: string | null;
  assignee_id?: string | null;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseProjectRow {
  id: string;
  name: string;
  description?: string | null;
  owner_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
}

export interface SupabaseUserProfileRow {
  user_id: string;
  full_name: string;
  avatar_url?: string | null;
  department_id?: string | null;
  phone?: string | null;
  metadata?: any;
  department?: any;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (str: string): boolean => Boolean(str && UUID_REGEX.test(str.trim()));

// Convert Supabase Task Row -> App Task
export function mapSupabaseTask(row: SupabaseTaskRow, projectMap?: Record<string, string>): Task {
  const statusMap: Record<string, TaskStatus> = {
    todo: 'Assigned',
    doing: 'In Progress',
    done: 'Completed',
  };

  const progress = row.status === 'done' ? 100 : row.status === 'doing' ? 50 : 15;

  return {
    id: row.id,
    title: row.title,
    project: row.work_request_id ? (projectMap && projectMap[row.work_request_id] ? projectMap[row.work_request_id] : `REQ-${row.work_request_id.slice(0, 6).toUpperCase()}`) : 'P-2026-018',
    location: (row.description && row.description.includes('Zone')) ? row.description : 'Site Area B',
    dueDate: row.due_date ? new Date(row.due_date).toLocaleDateString() : 'Today',
    priority: row.title.toLowerCase().includes('critical') || row.title.toLowerCase().includes('safety') ? 'Critical' : 'High',
    progress,
    status: statusMap[row.status] || 'Active',
  };
}

// Convert App Task -> Supabase Task payload
export function mapAppTaskToSupabase(task: Partial<Task>): Partial<SupabaseTaskRow> {
  const statusMap: Record<string, 'todo' | 'doing' | 'done'> = {
    'Completed': 'done',
    'Closed': 'done',
    'In Progress': 'doing',
    'Active': 'doing',
    'Review': 'doing',
    'Assigned': 'todo',
    'Pending': 'todo',
    'Available': 'todo',
  };

  const status = task.status ? (statusMap[task.status] || 'doing') : 'todo';

  return {
    title: task.title || 'Untitled Task',
    description: task.location ? `${task.title} - ${task.location}` : task.title,
    status,
    due_date: task.dueDate ? new Date().toISOString() : null,
  };
}

// Convert Supabase Work Request Row -> App WorkRequest
export function mapSupabaseWorkRequest(row: SupabaseWorkRequestRow, projectMap?: Record<string, string>): WorkRequest {
  const statusMap: Record<string, TaskStatus> = {
    open: 'Pending',
    in_progress: 'In Progress',
    closed: 'Completed',
  };

  const priorityMap: Record<string, 'High' | 'Medium' | 'Low' | 'Critical'> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Critical',
  };

  return {
    id: row.id,
    title: row.title,
    requester: 'Somchai S.',
    project: (projectMap && row.project_id && projectMap[row.project_id]) || (row.project_id ? `P-${row.project_id.slice(0, 6).toUpperCase()}` : 'P-2026-018'),
    priority: priorityMap[row.priority] || 'Medium',
    dueDate: row.due_date ? new Date(row.due_date).toLocaleDateString() : 'Next Week',
    status: statusMap[row.status] || 'Pending',
    progress: row.status === 'closed' ? 100 : row.status === 'in_progress' ? 50 : 0,
  };
}

// Convert App WorkRequest -> Supabase WorkRequest payload
export function mapAppWorkRequestToSupabase(req: Partial<WorkRequest>): Partial<SupabaseWorkRequestRow> {
  const statusMap: Record<string, 'open' | 'in_progress' | 'closed'> = {
    'Pending': 'open',
    'Assigned': 'open',
    'In Progress': 'in_progress',
    'Active': 'in_progress',
    'Completed': 'closed',
    'Closed': 'closed',
  };

  const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
    'Low': 'low',
    'Medium': 'medium',
    'High': 'high',
    'Critical': 'urgent',
  };

  return {
    title: req.title || 'Untitled Request',
    description: req.requester ? `Requested by ${req.requester}` : 'Work request from portal',
    status: req.status ? (statusMap[req.status] || 'open') : 'open',
    priority: req.priority ? (priorityMap[req.priority] || 'medium') : 'medium',
  };
}

// Keep active channel references to prevent duplicate listener errors
let activeTasksChannel: ReturnType<typeof supabase.channel> | null = null;
let activeReqsChannel: ReturnType<typeof supabase.channel> | null = null;
let activeProfilesChannel: ReturnType<typeof supabase.channel> | null = null;

// --- API Service Methods ---
export const SupabaseService = {
  // Employees & User Profiles from Supabase
  async getEmployees(): Promise<Employee[]> {
    try {
      const { data: profiles, error: pError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, avatar_url, phone, metadata, department:departments(name)');

      if (pError) {
        console.error('Supabase fetch user_profiles error:', pError);
        return [];
      }

      const employeesList: Employee[] = [];
      const seenIds = new Set<string>();

      if (profiles && profiles.length > 0) {
        profiles.forEach((p) => {
          // If profile contains the full roster in metadata
          if (p.metadata && Array.isArray(p.metadata.employee_roster)) {
            p.metadata.employee_roster.forEach((emp: Employee) => {
              if (!seenIds.has(emp.id)) {
                seenIds.add(emp.id);
                employeesList.push(emp);
              }
            });
          }

          // Also add this specific profile if not already included
          if (!seenIds.has(p.user_id)) {
            seenIds.add(p.user_id);
            const meta = p.metadata || {};
            employeesList.push({
              id: p.user_id,
              name: p.full_name || 'Staff Member',
              role: meta.role || 'Site Manager',
              department: (p as any).department?.name || meta.department || 'Engineering',
              avatarColor: meta.avatarColor || '#F58220',
              availability: meta.availability || 'available',
              utilization: meta.utilization || 80,
              score: meta.score || 95,
              skills: meta.skills || ['Leadership', 'Operations'],
              phone: p.phone || '081-998-8776',
              email: meta.email || 'staff@ikm-ops.com',
            });
          }
        });
      }

      return employeesList;
    } catch (e) {
      console.error('getEmployees exception:', e);
      return [];
    }
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<boolean> {
    try {
      const { data: profiles } = await supabase.from('user_profiles').select('*');
      if (profiles && profiles.length > 0) {
        const primary = profiles[0];
        let currentRoster: Employee[] = primary.metadata?.employee_roster || [];
        
        currentRoster = currentRoster.map(e => e.id === id ? { ...e, ...updates } : e);
        
        const metadataUpdate: any = {
          ...primary.metadata,
          employee_roster: currentRoster,
        };

        let fullName = primary.full_name;
        if (id === primary.user_id) {
          if (updates.name) fullName = updates.name;
          if (updates.role) metadataUpdate.role = updates.role;
          if (updates.department) metadataUpdate.department = updates.department;
          if (updates.availability) metadataUpdate.availability = updates.availability;
          if (updates.score) metadataUpdate.score = updates.score;
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: fullName,
            phone: updates.phone || primary.phone,
            metadata: metadataUpdate,
          })
          .eq('user_id', primary.user_id);

        return !error;
      }
      return false;
    } catch (e) {
      console.error('updateEmployee error:', e);
      return false;
    }
  },

  async addEmployee(newEmp: Employee): Promise<boolean> {
    try {
      const { data: profiles } = await supabase.from('user_profiles').select('*');
      if (profiles && profiles.length > 0) {
        const primary = profiles[0];
        const currentRoster: Employee[] = primary.metadata?.employee_roster || [];
        currentRoster.push(newEmp);

        const { error } = await supabase
          .from('user_profiles')
          .update({
            metadata: {
              ...primary.metadata,
              employee_roster: currentRoster,
            }
          })
          .eq('user_id', primary.user_id);

        return !error;
      }
      return false;
    } catch (e) {
      console.error('addEmployee error:', e);
      return false;
    }
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch tasks error:', error);
        return [];
      }
      return (data || []).map(row => mapSupabaseTask(row));
    } catch (e) {
      console.error('getTasks exception:', e);
      return [];
    }
  },

  async createTask(task: Partial<Task>): Promise<Task | null> {
    try {
      const payload = mapAppTaskToSupabase(task);
      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase createTask error:', error);
        return null;
      }
      return mapSupabaseTask(data);
    } catch (e) {
      console.error('createTask exception:', e);
      return null;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const payload: any = {};
      if (updates.title) payload.title = updates.title;
      if (updates.status) {
        if (updates.status === 'Completed' || updates.status === 'Closed') payload.status = 'done';
        else if (updates.status === 'In Progress' || updates.status === 'Active') payload.status = 'doing';
        else payload.status = 'todo';
      }

      let targetId = id;
      // Resolve UUID if formatted ID was passed
      if (!isUuid(id)) {
        const cleanHex = id.replace(/^TSK-/i, '').toLowerCase();
        const { data: allTasks } = await supabase.from('tasks').select('id, title');
        const match = (allTasks || []).find(t => 
          t.id.toLowerCase().startsWith(cleanHex) || 
          t.id.toLowerCase().includes(cleanHex) ||
          (updates.title && t.title.toLowerCase() === updates.title.toLowerCase())
        );
        if (match) {
          targetId = match.id;
        } else {
          // If task not found in Supabase (e.g. locally created), insert it
          const created = await this.createTask({ ...updates, title: updates.title || id });
          return created !== null;
        }
      }

      const { error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', targetId);

      if (error) console.error('Supabase updateTask error:', error);
      return !error;
    } catch (e) {
      console.error('updateTask exception:', e);
      return false;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      let targetId = id;
      if (!isUuid(id)) {
        const cleanHex = id.replace(/^TSK-/i, '').toLowerCase();
        const { data: allTasks } = await supabase.from('tasks').select('id');
        const match = (allTasks || []).find(t => t.id.toLowerCase().startsWith(cleanHex) || t.id.toLowerCase().includes(cleanHex));
        if (match) targetId = match.id;
        else return true;
      }

      const { error } = await supabase.from('tasks').delete().eq('id', targetId);
      return !error;
    } catch (e) {
      console.error('deleteTask exception:', e);
      return false;
    }
  },

  // Work Requests
  async getWorkRequests(): Promise<WorkRequest[]> {
    try {
      const { data: projects } = await supabase.from('projects').select('id, name');
      const projectMap: Record<string, string> = {};
      (projects || []).forEach(p => { projectMap[p.id] = p.name; });

      const { data, error } = await supabase
        .from('work_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch work_requests error:', error);
        return [];
      }
      return (data || []).map(row => mapSupabaseWorkRequest(row, projectMap));
    } catch (e) {
      console.error('getWorkRequests exception:', e);
      return [];
    }
  },

  async createWorkRequest(req: Partial<WorkRequest>): Promise<WorkRequest | null> {
    try {
      const payload = mapAppWorkRequestToSupabase(req);
      const { data, error } = await supabase
        .from('work_requests')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase createWorkRequest error:', error);
        return null;
      }
      return mapSupabaseWorkRequest(data);
    } catch (e) {
      console.error('createWorkRequest exception:', e);
      return null;
    }
  },

  async updateWorkRequest(id: string, updates: Partial<WorkRequest>): Promise<boolean> {
    try {
      const payload: any = {};
      if (updates.title) payload.title = updates.title;
      if (updates.status) {
        if (updates.status === 'Completed' || updates.status === 'Closed') payload.status = 'closed';
        else if (updates.status === 'In Progress') payload.status = 'in_progress';
        else payload.status = 'open';
      }
      if (updates.priority) {
        payload.priority = updates.priority.toLowerCase() === 'critical' ? 'urgent' : updates.priority.toLowerCase();
      }

      let targetId = id;
      if (!isUuid(id)) {
        const cleanHex = id.replace(/^REQ-/i, '').toLowerCase();
        const { data: allReqs } = await supabase.from('work_requests').select('id, title');
        const match = (allReqs || []).find(r => 
          r.id.toLowerCase().startsWith(cleanHex) || 
          r.id.toLowerCase().includes(cleanHex) ||
          (updates.title && r.title.toLowerCase() === updates.title.toLowerCase())
        );
        if (match) {
          targetId = match.id;
        } else {
          const created = await this.createWorkRequest({ ...updates, title: updates.title || id });
          return created !== null;
        }
      }

      const { error } = await supabase
        .from('work_requests')
        .update(payload)
        .eq('id', targetId);

      return !error;
    } catch (e) {
      console.error('updateWorkRequest exception:', e);
      return false;
    }
  },

  // Projects
  async getProjects(): Promise<SupabaseProjectRow[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // User Profiles & Departments
  async getUserProfiles(): Promise<SupabaseUserProfileRow[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, avatar_url, phone, metadata, department:departments(name)');
      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async getDepartments(): Promise<{ id: string; name: string }[]> {
    try {
      const { data, error } = await supabase.from('departments').select('*');
      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async getRoles(): Promise<{ name: string; description?: string }[]> {
    try {
      const { data, error } = await supabase.from('roles').select('*');
      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // Realtime Subscriptions (safely manage existing channels)
  subscribeToTasks(onUpdate: (payload: any) => void) {
    try {
      if (activeTasksChannel) {
        supabase.removeChannel(activeTasksChannel);
        activeTasksChannel = null;
      }
      const uniqueId = `tasks_rt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      activeTasksChannel = supabase
        .channel(uniqueId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
          onUpdate(payload);
        })
        .subscribe();

      return () => {
        if (activeTasksChannel) {
          supabase.removeChannel(activeTasksChannel);
          activeTasksChannel = null;
        }
      };
    } catch (err) {
      console.warn('Realtime tasks subscription caught:', err);
      return () => {};
    }
  },

  subscribeToWorkRequests(onUpdate: (payload: any) => void) {
    try {
      if (activeReqsChannel) {
        supabase.removeChannel(activeReqsChannel);
        activeReqsChannel = null;
      }
      const uniqueId = `reqs_rt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      activeReqsChannel = supabase
        .channel(uniqueId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'work_requests' }, (payload) => {
          onUpdate(payload);
        })
        .subscribe();

      return () => {
        if (activeReqsChannel) {
          supabase.removeChannel(activeReqsChannel);
          activeReqsChannel = null;
        }
      };
    } catch (err) {
      console.warn('Realtime work_requests subscription caught:', err);
      return () => {};
    }
  },

  subscribeToProfiles(onUpdate: (payload: any) => void) {
    try {
      if (activeProfilesChannel) {
        supabase.removeChannel(activeProfilesChannel);
        activeProfilesChannel = null;
      }
      const uniqueId = `profiles_rt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      activeProfilesChannel = supabase
        .channel(uniqueId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, (payload) => {
          onUpdate(payload);
        })
        .subscribe();

      return () => {
        if (activeProfilesChannel) {
          supabase.removeChannel(activeProfilesChannel);
          activeProfilesChannel = null;
        }
      };
    } catch (err) {
      console.warn('Realtime user_profiles subscription caught:', err);
      return () => {};
    }
  },

  // Ensure baseline operational data exists in Supabase so tables are populated
  async seedIfEmpty() {
    try {
      const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
      if (count === 0) {
        const initialTasks = [
          { title: 'Inspect Main Turbine & Generator Unit', description: 'Zone B - Powerhouse 2', status: 'doing' as const },
          { title: 'High-Pressure Valve Safety Calibration', description: 'Compressor Yard Area', status: 'doing' as const },
          { title: 'Substation SCADA Telemetry Loop Check', description: 'Control Room Sub-station', status: 'todo' as const },
          { title: 'ISO 9001 Field QA Audit & Dossier Review', description: 'QA Office Room 3', status: 'done' as const },
          { title: 'Emergency Fire Siren System Quarterly Overhaul', description: 'Assembly Area A', status: 'done' as const },
        ];
        await supabase.from('tasks').insert(initialTasks);
      }

      const { count: reqCount } = await supabase.from('work_requests').select('*', { count: 'exact', head: true });
      if (reqCount === 0) {
        const initialRequests = [
          { title: 'High-Pressure Valve Replacement', description: 'Urgent replacement for cooling valve unit 3', status: 'open' as const, priority: 'urgent' as const },
          { title: 'HVAC Air Filter & Duct Cleaning', description: 'Quarterly ventilation filter overhaul', status: 'in_progress' as const, priority: 'medium' as const },
          { title: 'Transformer Oil Sampling & Lab Test', description: 'Dielectric breakdown voltage testing', status: 'open' as const, priority: 'high' as const },
          { title: 'Gas Leak Detection Sensor Calibration', description: 'Zone 1 & Zone 2 sensor verification', status: 'closed' as const, priority: 'urgent' as const },
        ];
        await supabase.from('work_requests').insert(initialRequests);
      }

      const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      if (projCount === 0) {
        const initialProjects = [
          { name: 'P-2026-018: Site Expansion Project', description: 'Main compressor expansion and new piping loops' },
          { name: 'P-2026-019: Turbine Generator Overhaul', description: 'Comprehensive overhaul and PM cycle' },
          { name: 'P-2026-010: Substation SCADA Modernization', description: 'Smart telemetry integration' },
        ];
        await supabase.from('projects').insert(initialProjects);
      }
    } catch (e) {
      console.warn('Seed error (ignorable):', e);
    }
  }
};
