import { User, UserRole, WorkRequest, Task, MainEquipment, Employee } from '../types';
import { SupabaseProjectRow } from './supabaseService';

/**
 * Enterprise Role-Based Access Control (RBAC) Module
 * 
 * Supports 13 Operational Roles:
 * 1. Admin: Full system governance, configuration, and data override
 * 2. Country Manager: Country oversight, P&L, master approval, reopen authority
 * 3. Operation Manager: Operations resource management, high-level approval, cross-project scheduling
 * 4. Project Manager: Project P&L, Job Plan approval, Change Request authorization, Close-out sign-off
 * 5. Coordinator: Central hub for Work Request intake, review, assessment, manpower/equipment scheduling, DPR review
 * 6. Supervisor: Field execution leadership, crew task dispatch, Daily Progress Reports (DPR), inspection requests
 * 7. Technician: Work execution, individual activity notes, checklist verification, timesheet
 * 8. Equipment Controller: Tool calibration, checkout/checkin, dispatch & return checklist, maintenance flags
 * 9. QA/QC: Quality assurance, inspection sign-off, NCR management, punch list tracking
 * 10. HSE: Safety compliance, JSA & Toolbox verification, incident investigation, risk assessment audit
 * 11. Finance: Cost tracking, man-hours reconciliation, billing readiness, expense audit
 * 12. Sales / Requester: Client interface, Work Request creation, scope revisions, quotation attachments
 * 13. Customer: Work Request tracking, milestone review, client acceptance inspection sign-off
 */

export function getUserRole(user: User | Employee | null | undefined): UserRole {
  if (!user) return 'Sales / Requester';
  if (user.userLevel) return user.userLevel;
  
  const roleStr = (user.role || '').toLowerCase();
  if (roleStr.includes('admin')) return 'Admin';
  if (roleStr.includes('country')) return 'Country Manager';
  if (roleStr.includes('op') && roleStr.includes('manager')) return 'Operation Manager';
  if (roleStr.includes('project manager') || roleStr.includes('pm')) return 'Project Manager';
  if (roleStr.includes('manager') || roleStr.includes('site manager')) return 'Manager';
  if (roleStr.includes('coord')) return 'Coordinator';
  if (roleStr.includes('supervisor') || roleStr.includes('lead')) return 'Supervisor';
  if (roleStr.includes('equipment') || roleStr.includes('tool')) return 'Equipment Controller';
  if (roleStr.includes('qa') || roleStr.includes('qc') || roleStr.includes('quality')) return 'QA/QC';
  if (roleStr.includes('hse') || roleStr.includes('safety')) return 'HSE';
  if (roleStr.includes('finance') || roleStr.includes('billing')) return 'Finance';
  if (roleStr.includes('customer') || roleStr.includes('client')) return 'Customer';
  if (roleStr.includes('sales') || roleStr.includes('request')) return 'Sales / Requester';
  if (roleStr.includes('tech') || roleStr.includes('operator') || roleStr.includes('engineer')) return 'Technician';
  
  return 'Technician';
}

// 1. User & Permissions Management
export function canManageUsers(user: User | null): boolean {
  const role = getUserRole(user);
  return role === 'Admin' || role === 'Country Manager';
}

export function canEditEmployee(currentUser: User | null, targetEmployeeId: string): boolean {
  if (!currentUser) return false;
  const role = getUserRole(currentUser);
  if (role === 'Admin' || role === 'Country Manager') return true;
  return currentUser.id === targetEmployeeId;
}

export function canReviewEmployee(currentUser: User | null, targetEmployeeId: string): boolean {
  return canEditEmployee(currentUser, targetEmployeeId);
}

export function isSelfEditOnly(currentUser: User | null, targetEmployeeId: string): boolean {
  if (!currentUser) return false;
  const role = getUserRole(currentUser);
  if (role === 'Admin' || role === 'Country Manager') return false;
  return currentUser.id === targetEmployeeId;
}

// 2. Main Equipment Management Permissions
export function canCreateEquipment(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Coordinator', 'Equipment Controller'].includes(role);
}

export function canEditEquipment(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Coordinator', 'Equipment Controller', 'Supervisor'].includes(role);
}

export function canDeleteEquipment(user: User | null): boolean {
  const role = getUserRole(user);
  return role === 'Admin' || role === 'Country Manager';
}

export function canDispatchEquipment(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Equipment Controller', 'Coordinator', 'Supervisor'].includes(role);
}

// 3. Work Request Permissions
export function canCreateRequest(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Coordinator', 'Sales / Requester', 'Requester', 'Manager'].includes(role);
}

export function canReviewRequest(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Coordinator'].includes(role);
}

export function canApproveRequest(user: User | null, request?: WorkRequest): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Manager'].includes(role);
}

export function canEditRequest(user: User | null, request: WorkRequest): boolean {
  if (!user) return false;
  const role = getUserRole(user);
  if (['Admin', 'Country Manager', 'Coordinator'].includes(role)) return true;
  
  if (role === 'Requester' || role === 'Sales / Requester') {
    const isPending = request.status === 'Draft' || request.status === 'Returned for Information' || request.status === 'Submitted';
    const isOwner = request.requesterId === user.id || request.requester === user.name;
    return isPending && isOwner;
  }
  
  return ['Operation Manager', 'Project Manager', 'Manager'].includes(role);
}

// 4. Job Plan & Resource Planning Permissions
export function canPlanJob(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Coordinator', 'Supervisor', 'Project Manager', 'Operation Manager'].includes(role);
}

export function canApproveJobPlan(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Manager'].includes(role);
}

// 5. Execution & Daily Progress Report (DPR)
export function canSubmitDPR(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Supervisor', 'Coordinator'].includes(role);
}

export function canAddTechnicianNote(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Supervisor', 'Technician'].includes(role);
}

// 6. Quality, HSE & Inspection
export function canSignInspection(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'QA/QC', 'Supervisor', 'Customer', 'Project Manager'].includes(role);
}

export function canManageHSE(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'HSE', 'Supervisor', 'Coordinator'].includes(role);
}

// 7. Project Close-out & Performance Evaluation
export function canCloseJob(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Manager'].includes(role);
}

export function canReopenJob(user: User | null): boolean {
  const role = getUserRole(user);
  return role === 'Admin' || role === 'Country Manager';
}

export function canEvaluatePerformance(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Coordinator', 'Supervisor'].includes(role);
}

// 8. General Report Export
export function canExportReports(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Operation Manager', 'Project Manager', 'Finance', 'Coordinator'].includes(role);
}
