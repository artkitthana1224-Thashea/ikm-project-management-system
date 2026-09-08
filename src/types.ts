export type TaskStatus = 'Available' | 'Completed' | 'Assigned' | 'Active' | 'Warning' | 'Partial' | 'Critical' | 'Overdue' | 'Conflict' | 'Training' | 'Leave' | 'Unavailable' | 'Pending' | 'In Progress' | 'Review' | 'Closed' | 'Accepted';

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  location: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  progress: number;
  status: TaskStatus;
}

export interface WorkRequest {
  id: string;
  title: string;
  requester: string;
  project: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  dueDate: string;
  status: TaskStatus;
  assignedTo?: string;
  progress: number;
}

export interface VoiceReport {
  id: string;
  title: string;
  transcript: string;
  summary: string;
  category: 'Safety & HSE' | 'Mechanical' | 'Electrical & SCADA' | 'Civil & Structural' | 'Inspection' | 'Emergency Maintenance' | 'Routine Observation';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  equipmentId?: string;
  siteLocation?: string;
  actionItems?: string[];
  tags?: string[];
  durationSeconds?: number;
  language: 'TH' | 'EN';
  createdAt: string;
  createdBy: string;
  createdById?: string;
  followUpTaskId?: string;
  status: 'Recorded' | 'Processed' | 'Actioned' | 'Closed';
}
