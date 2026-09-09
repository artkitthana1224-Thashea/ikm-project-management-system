import { supabase } from './supabase';
import { User, Task, WorkRequest, TaskStatus, VoiceReport } from '../types';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarColor: string;
  avatarUrl?: string;
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

export interface SupabaseVoiceReportRow {
  id: string;
  actor_id?: string | null;
  action: string;
  details: {
    title?: string;
    transcript?: string;
    summary?: string;
    category?: any;
    priority?: any;
    equipmentId?: string;
    siteLocation?: string;
    actionItems?: string[];
    tags?: string[];
    durationSeconds?: number;
    language?: 'TH' | 'EN';
    createdBy?: string;
    followUpTaskId?: string;
    status?: any;
    [key: string]: any;
  };
  created_at: string;
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

// Map Supabase audit_log voice row -> VoiceReport
export function mapSupabaseVoiceReport(row: SupabaseVoiceReportRow): VoiceReport {
  const d = row.details || {};
  return {
    id: row.id,
    title: d.title || 'Voice Field Inspection Report',
    transcript: d.transcript || '',
    summary: d.summary || d.transcript || 'No summary available.',
    category: d.category || 'Inspection',
    priority: d.priority || 'Medium',
    equipmentId: d.equipmentId || 'N/A',
    siteLocation: d.siteLocation || 'Site Area',
    actionItems: Array.isArray(d.actionItems) ? d.actionItems : ['Review report details'],
    tags: Array.isArray(d.tags) ? d.tags : ['VoiceLog'],
    durationSeconds: d.durationSeconds || 10,
    language: d.language || 'TH',
    createdAt: row.created_at,
    createdBy: d.createdBy || 'Somchai Suksan',
    createdById: row.actor_id || undefined,
    followUpTaskId: d.followUpTaskId,
    status: d.status || 'Recorded',
  };
}

// Keep active channel references to prevent duplicate listener errors
let activeTasksChannel: ReturnType<typeof supabase.channel> | null = null;
let activeReqsChannel: ReturnType<typeof supabase.channel> | null = null;
let activeProfilesChannel: ReturnType<typeof supabase.channel> | null = null;
let activeVoiceChannel: ReturnType<typeof supabase.channel> | null = null;

// --- API Service Methods ---
export const SupabaseService = {
  // Current User Profile from Supabase
  async getCurrentUserProfile(userId?: string): Promise<User | null> {
    try {
      const { data: profiles, error: pError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, avatar_url, phone, metadata, department:departments(name)');

      if (pError || !profiles || profiles.length === 0) {
        return null;
      }

      const p = (userId ? profiles.find(item => item.user_id === userId) : null) || profiles[0];
      const meta = p.metadata || {};

      let skills: string[] = ['Leadership', 'SCADA', 'Turbine Overhaul', 'Field Inspection'];
      if (Array.isArray(meta.skills)) {
        skills = meta.skills;
      } else if (typeof meta.skills === 'string') {
        skills = meta.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      return {
        id: p.user_id,
        name: p.full_name || 'Somchai Suksan',
        role: meta.role || 'Site Manager',
        department: (p as any).department?.name || meta.department || 'Engineering',
        avatar: p.avatar_url || meta.avatarUrl || '',
        skills: skills,
        phone: p.phone || meta.phone || '081-998-8776',
        email: meta.email || 'somchai.s@ikm-ops.com',
      };
    } catch (e) {
      console.error('getCurrentUserProfile exception:', e);
      return null;
    }
  },

  // Save / Update User Profile directly to Supabase
  async saveUserProfile(user: Partial<User> & { id?: string }): Promise<boolean> {
    try {
      const { data: profiles } = await supabase.from('user_profiles').select('*');

      if (profiles && profiles.length > 0) {
        const target = (user.id ? profiles.find(p => p.user_id === user.id) : null) || profiles[0];
        const currentMeta = target.metadata || {};

        let updatedRoster: Employee[] = Array.isArray(currentMeta.employee_roster) ? [...currentMeta.employee_roster] : [];
        if (updatedRoster.length > 0) {
          updatedRoster = updatedRoster.map((emp: Employee) => {
            if (emp.id === target.user_id || (user.id && emp.id === user.id) || (user.name && emp.name === user.name) || emp.name === target.full_name) {
              return {
                ...emp,
                name: user.name !== undefined ? user.name : emp.name,
                role: user.role !== undefined ? user.role : emp.role,
                department: user.department !== undefined ? user.department : emp.department,
                avatarUrl: user.avatar !== undefined ? (user.avatar || undefined) : emp.avatarUrl,
                skills: user.skills !== undefined ? user.skills : emp.skills,
                phone: user.phone !== undefined ? user.phone : emp.phone,
                email: user.email !== undefined ? user.email : emp.email,
              };
            }
            return emp;
          });
        }

        const newMeta = {
          ...currentMeta,
          role: user.role !== undefined ? user.role : (currentMeta.role || 'Site Manager'),
          department: user.department !== undefined ? user.department : (currentMeta.department || 'Engineering'),
          skills: user.skills !== undefined ? user.skills : (currentMeta.skills || []),
          email: user.email !== undefined ? user.email : (currentMeta.email || 'somchai.s@ikm-ops.com'),
          phone: user.phone !== undefined ? user.phone : (currentMeta.phone || target.phone),
          avatarUrl: user.avatar !== undefined ? user.avatar : (target.avatar_url || currentMeta.avatarUrl),
          employee_roster: updatedRoster,
        };

        const updatePayload: any = {
          metadata: newMeta,
        };
        if (user.name !== undefined) updatePayload.full_name = user.name;
        if (user.avatar !== undefined) updatePayload.avatar_url = user.avatar || null;
        if (user.phone !== undefined) updatePayload.phone = user.phone;

        const { error } = await supabase
          .from('user_profiles')
          .update(updatePayload)
          .eq('user_id', target.user_id);

        if (error) {
          console.error('Supabase saveUserProfile error:', error);
          return false;
        }
        return true;
      } else {
        // Table was empty, insert new persistent user profile
        const uid = user.id && isUuid(user.id) ? user.id : '46de6855-477a-4a99-bb4c-7e627500fafa';
        const meta = {
          role: user.role || 'Site Manager',
          department: user.department || 'Engineering',
          skills: user.skills || ['Leadership', 'Operations', 'Inspection'],
          email: user.email || 'somchai.s@ikm-ops.com',
          phone: user.phone || '081-998-8776',
          avatarUrl: user.avatar || '',
        };
        const { error } = await supabase.from('user_profiles').insert({
          user_id: uid,
          full_name: user.name || 'Somchai Suksan',
          avatar_url: user.avatar || null,
          phone: user.phone || '081-998-8776',
          metadata: meta,
        });
        return !error;
      }
    } catch (e) {
      console.error('saveUserProfile exception:', e);
      return false;
    }
  },

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
            let skills: string[] = ['Leadership', 'Operations'];
            if (Array.isArray(meta.skills)) skills = meta.skills;
            else if (typeof meta.skills === 'string') skills = meta.skills.split(',').map((s: string) => s.trim()).filter(Boolean);

            employeesList.push({
              id: p.user_id,
              name: p.full_name || 'Staff Member',
              role: meta.role || 'Site Manager',
              department: (p as any).department?.name || meta.department || 'Engineering',
              avatarColor: meta.avatarColor || '#F58220',
              avatarUrl: p.avatar_url || meta.avatarUrl || undefined,
              availability: meta.availability || 'available',
              utilization: meta.utilization || 80,
              score: meta.score || 95,
              skills: skills,
              phone: p.phone || meta.phone || '081-998-8776',
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
        const primary = (profiles.find(p => p.user_id === id)) || profiles[0];
        let currentRoster: Employee[] = primary.metadata?.employee_roster || [];
        
        currentRoster = currentRoster.map(e => (e.id === id || (updates.name && e.name === updates.name)) ? { ...e, ...updates } : e);
        
        const metadataUpdate: any = {
          ...primary.metadata,
          employee_roster: currentRoster,
        };

        let fullName = primary.full_name;
        let avatarUrl = primary.avatar_url;
        if (id === primary.user_id || primary.full_name === updates.name) {
          if (updates.name) fullName = updates.name;
          if (updates.avatarUrl !== undefined) avatarUrl = updates.avatarUrl || null;
          if (updates.role) metadataUpdate.role = updates.role;
          if (updates.department) metadataUpdate.department = updates.department;
          if (updates.availability) metadataUpdate.availability = updates.availability;
          if (updates.score) metadataUpdate.score = updates.score;
          if (updates.skills) metadataUpdate.skills = updates.skills;
          if (updates.email) metadataUpdate.email = updates.email;
          if (updates.phone) metadataUpdate.phone = updates.phone;
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: fullName,
            avatar_url: avatarUrl,
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

  async deleteEmployee(id: string): Promise<boolean> {
    try {
      const { data: profiles } = await supabase.from('user_profiles').select('*');
      if (profiles && profiles.length > 0) {
        const primary = profiles[0];
        let currentRoster: Employee[] = primary.metadata?.employee_roster || [];
        
        currentRoster = currentRoster.filter(e => e.id !== id);
        
        const metadataUpdate: any = {
          ...primary.metadata,
          employee_roster: currentRoster,
        };

        const { error } = await supabase
          .from('user_profiles')
          .update({
            metadata: metadataUpdate,
          })
          .eq('user_id', primary.user_id);

        return !error;
      }
      return false;
    } catch (e) {
      console.error('deleteEmployee error:', e);
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

  // --- Voice Reports (Stored in Supabase audit_logs with action = 'voice_report') ---
  async getVoiceReports(): Promise<VoiceReport[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action', 'voice_report')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch voice reports error:', error);
        return [];
      }
      return (data || []).map(row => mapSupabaseVoiceReport(row as any));
    } catch (e) {
      console.error('getVoiceReports exception:', e);
      return [];
    }
  },

  async createVoiceReport(report: Partial<VoiceReport>, createLinkedTask: boolean = false): Promise<VoiceReport | null> {
    try {
      let createdTaskId: string | undefined = undefined;

      // Automatically create a linked task in Supabase tasks table if requested
      if (createLinkedTask) {
        const taskPayload: Partial<Task> = {
          title: `[Voice Action] ${report.title || 'Field Follow-up'}`,
          location: report.siteLocation || 'Site Area B',
          priority: (report.priority as any) || 'High',
          status: 'Assigned',
        };
        const task = await this.createTask(taskPayload);
        if (task) {
          createdTaskId = task.id;
        }
      }

      const payload = {
        action: 'voice_report',
        details: {
          title: report.title || 'Voice Field Report',
          transcript: report.transcript || '',
          summary: report.summary || '',
          category: report.category || 'Inspection',
          priority: report.priority || 'Medium',
          equipmentId: report.equipmentId || 'N/A',
          siteLocation: report.siteLocation || 'Site Area B',
          actionItems: report.actionItems || ['Review report and conduct verification'],
          tags: report.tags || ['VoiceReport', 'Inspection'],
          durationSeconds: report.durationSeconds || 0,
          language: report.language || 'TH',
          createdBy: report.createdBy || 'Somchai Suksan',
          followUpTaskId: createdTaskId || report.followUpTaskId,
          status: report.status || 'Recorded',
        }
      };

      const { data, error } = await supabase
        .from('audit_logs')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase createVoiceReport error:', error);
        return null;
      }

      return mapSupabaseVoiceReport(data as any);
    } catch (e) {
      console.error('createVoiceReport exception:', e);
      return null;
    }
  },

  async deleteVoiceReport(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .eq('id', id);

      if (error) console.error('deleteVoiceReport error:', error);
      return !error;
    } catch (e) {
      console.error('deleteVoiceReport exception:', e);
      return false;
    }
  },

  async updateVoiceReport(id: string, updates: Partial<VoiceReport>): Promise<boolean> {
    try {
      const { data: current } = await supabase.from('audit_logs').select('*').eq('id', id).single();
      if (!current) return false;

      const mergedDetails = {
        ...current.details,
        ...updates,
      };

      const { error } = await supabase
        .from('audit_logs')
        .update({ details: mergedDetails })
        .eq('id', id);

      return !error;
    } catch (e) {
      console.error('updateVoiceReport exception:', e);
      return false;
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

  subscribeToVoiceReports(onUpdate: (payload: any) => void) {
    try {
      if (activeVoiceChannel) {
        supabase.removeChannel(activeVoiceChannel);
        activeVoiceChannel = null;
      }
      const uniqueId = `voice_rt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      activeVoiceChannel = supabase
        .channel(uniqueId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, (payload) => {
          if (payload.new && (payload.new as any).action === 'voice_report') {
            onUpdate(payload);
          } else if (payload.eventType === 'DELETE') {
            onUpdate(payload);
          }
        })
        .subscribe();

      return () => {
        if (activeVoiceChannel) {
          supabase.removeChannel(activeVoiceChannel);
          activeVoiceChannel = null;
        }
      };
    } catch (err) {
      console.warn('Realtime voice reports subscription caught:', err);
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

      // Seed initial enterprise user profiles if none exist
      const { count: profileCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      if (profileCount === 0) {
        const initialRoster: Employee[] = [
          {
            id: '46de6855-477a-4a99-bb4c-7e627500fafa',
            name: 'Somchai Suksan',
            role: 'Site Manager',
            department: 'Engineering',
            avatarColor: '#F58220',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            availability: 'available',
            utilization: 85,
            score: 98,
            skills: ['Leadership', 'SCADA', 'Turbine Overhaul', 'Field Inspection'],
            phone: '081-998-8776',
            email: 'somchai.s@ikm-ops.com',
          },
          {
            id: '57de6855-477a-4a99-bb4c-7e627500fafb',
            name: 'Art Kitthana',
            role: 'Lead Mechanical Engineer',
            department: 'Maintenance',
            avatarColor: '#10B981',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            availability: 'available',
            utilization: 75,
            score: 95,
            skills: ['Gas Turbine', 'Pressure Vessels', 'ISO 9001 Audit'],
            phone: '089-112-3344',
            email: 'art.k@ikm-ops.com',
          },
          {
            id: '68de6855-477a-4a99-bb4c-7e627500fafc',
            name: 'Nattaporn S.',
            role: 'Safety & HSE Officer',
            department: 'Safety & HSE',
            avatarColor: '#EF4444',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            availability: 'busy',
            utilization: 90,
            score: 99,
            skills: ['Hazard Analysis', 'Incident Investigation', 'Fire Safety'],
            phone: '082-334-5566',
            email: 'nattaporn.s@ikm-ops.com',
          },
          {
            id: '79de6855-477a-4a99-bb4c-7e627500fafd',
            name: 'Prasert Boonmee',
            role: 'Senior Electrical Engineer',
            department: 'Operations',
            avatarColor: '#3B82F6',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            availability: 'available',
            utilization: 60,
            score: 91,
            skills: ['Substation', 'High Voltage Relay', 'PLC Control'],
            phone: '084-556-7788',
            email: 'prasert.b@ikm-ops.com',
          }
        ];

        await supabase.from('user_profiles').insert({
          user_id: '46de6855-477a-4a99-bb4c-7e627500fafa',
          full_name: 'Somchai Suksan',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          phone: '081-998-8776',
          metadata: {
            role: 'Site Manager',
            department: 'Engineering',
            skills: ['Leadership', 'SCADA', 'Turbine Overhaul', 'Field Inspection'],
            email: 'somchai.s@ikm-ops.com',
            employee_roster: initialRoster,
          }
        });
      }

      // Seed initial realistic voice reports if none exist
      const { count: voiceCount } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true }).eq('action', 'voice_report');
      if (voiceCount === 0) {
        const initialVoiceReports = [
          {
            action: 'voice_report',
            details: {
              title: 'ตรวจพบแรงดันตกในท่อส่งก๊าซหลัก Line-2A',
              transcript: 'ระหว่างการเดินตรวจพื้นที่ Zone B ช่วงเช้า พบเกจวัดแรงดันที่ท่อ Line 2A ตกลงต่ำกว่า 4.2 Bar ขอให้ฝ่ายซ่อมบำรุงเข้ามาเช็ควาล์วควบคุมด่วน',
              summary: 'ตรวจพบแรงดันในท่อ Line-2A ลดลงต่ำกว่าเกณฑ์มาตรฐาน 4.2 Bar บริเวณ Zone B แนะนำเข้าตรวจสอบวาล์วควบคุมและซีลข้อต่อทันที',
              category: 'Mechanical',
              priority: 'Critical',
              equipmentId: 'PIPE-LINE-2A',
              siteLocation: 'Zone B - Compressor Yard',
              actionItems: ['ปิดการจ่ายก๊าซสำรอง', 'เข้าตรวจสอบซีลเกลียวและจุดเชื่อม', 'ทดสอบแรงดันซ้ำ Hydrostatic Test'],
              tags: ['GasLine', 'PressureDrop', 'Critical', 'P-2026-018'],
              durationSeconds: 18,
              language: 'TH',
              createdBy: 'Somchai Suksan',
              status: 'Actioned',
            }
          },
          {
            action: 'voice_report',
            details: {
              title: 'Turbine Vibration & Temperature Routine Check',
              transcript: 'Completed daily acoustic and thermal imaging inspection on Turbine B. Vibration level measured at 2.4 mm/s, bearing temperature stable at 68 degrees Celsius. All parameters within ISO acceptable limits.',
              summary: 'Daily routine inspection for Turbine B completed successfully. Vibration and bearing temperature are fully within safe operating limits.',
              category: 'Inspection',
              priority: 'Low',
              equipmentId: 'TURBINE-02B',
              siteLocation: 'Powerhouse Unit 2',
              actionItems: ['Log vibration data into CMMS', 'Schedule next routine check for tomorrow 08:00'],
              tags: ['Turbine', 'Vibration', 'Routine', 'Passed'],
              durationSeconds: 24,
              language: 'EN',
              createdBy: 'Art Kitthana',
              status: 'Closed',
            }
          }
        ];
        await supabase.from('audit_logs').insert(initialVoiceReports);
      }
    } catch (e) {
      console.warn('Seed error (ignorable):', e);
    }
  }
};
