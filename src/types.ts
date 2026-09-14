export type TaskStatus = 'Available' | 'Completed' | 'Assigned' | 'Active' | 'Warning' | 'Partial' | 'Critical' | 'Overdue' | 'Conflict' | 'Training' | 'Leave' | 'Unavailable' | 'Pending' | 'In Progress' | 'Review' | 'Closed' | 'Accepted';

export type UserRole = 
  | 'Admin' 
  | 'Country Manager' 
  | 'Manager' 
  | 'Coordinator' 
  | 'Supervisor' 
  | 'Technician' 
  | 'Requester';

export interface User {
  id: string;
  name: string;
  username?: string;
  password?: string;
  role: string;
  userLevel?: UserRole;
  avatar: string;
  department: string;
  skills?: string[];
  phone?: string;
  email?: string;
  bio?: string;
  isArchived?: boolean;
}

export interface EmployeeCertificate {
  id: string;
  name: string;
  courseCode?: string;
  issuingBody: string;
  certificateNo: string;
  issueDate: string;
  expireDate: string;
  pdfUrl?: string;
  documentName?: string;
  notes?: string;
}

export interface EmployeeCV {
  summary?: string;
  bio?: string;
  education?: string[];
  experiences?: {
    period: string;
    position: string;
    company: string;
    description: string;
  }[];
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface Employee {
  id: string;
  name: string;
  username?: string;
  password?: string;
  role: string;
  userLevel?: UserRole;
  department: string;
  avatarColor: string;
  avatarUrl?: string;
  availability: 'available' | 'busy' | 'on-leave' | 'off-shift';
  utilization: number;
  score: number;
  skills: string[];
  phone?: string;
  email?: string;
  bio?: string;
  cv?: EmployeeCV;
  certificates?: EmployeeCertificate[];
  isArchived?: boolean;
  baseLocation?: 'IKM Rayong (RY)' | 'IKM Laem Chabang (LKU)' | 'Offshore Rig' | 'Mobile';
}

export type EquipmentStatus = 'Available' | 'In Use' | 'Under Maintenance';

export type EquipmentCategory = 
  | 'Hydrotesting'
  | 'Flange Management & Bolting'
  | 'Nitrogen & Pipeline'
  | 'Rigging & Lifting'
  | 'Instrumentation & Calibration'
  | 'Safety & HSE'
  | 'Welding & Fabrication'
  | string;

export interface MainEquipment {
  id: string;
  name: string;
  code: string;
  serialNumber: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  location?: string;
  baseLocation?: string;
  assignedProject?: string;
  assignedOperator?: string;
  assignedSupervisor?: string;
  lastInspection?: string;
  calibrationDue?: string;
  calibrationDueDate?: string;
  manualPdfUrl?: string;
  manualFileName?: string;
  manualPdfName?: string;
  calibrationCertPdfUrl?: string;
  calibrationCertName?: string;
  description?: string;
  specsSummary?: string;
  specifications?: any;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ApprovalRecord {
  id: string;
  requestId?: string;
  requestTitle?: string;
  taskId?: string;
  approverId: string;
  approverName: string;
  approverRole: UserRole | string;
  decision: 'Approved' | 'Rejected';
  reason: string;
  approvedAt: string;
  revision: number;
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
  assigneeId?: string;
  assigneeName?: string;
  supervisorId?: string;
  supervisorName?: string;
  equipmentIds?: string[];
  evidencePhotos?: string[];
  attachments?: string[];
  checklistCompleted?: number;
  checklistTotal?: number;
  isArchived?: boolean;
}

export interface WorkRequest {
  id: string;
  title: string;
  requester: string;
  creatorId?: string;
  project: string;
  projectId?: string;
  responsibleManager?: string;
  baseLocation?: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  dueDate: string;
  status: TaskStatus;
  assignedTo?: string;
  progress: number;
  description?: string;
  attachments?: string[];
  approvals?: ApprovalRecord[];
  currentRevision?: number;
  isArchived?: boolean;
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

