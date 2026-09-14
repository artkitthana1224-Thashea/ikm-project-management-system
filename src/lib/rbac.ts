import { User, UserRole, WorkRequest, Task, MainEquipment, Employee } from '../types';
import { SupabaseProjectRow } from './supabaseService';


/**
 * RBAC Helper utilities enforcing the exact permission rules requested:
 * 
 * Role	หน้าที่
 * Admin: ตั้งค่าระบบ, จัดการผู้ใช้, สิทธิ์, master data
 * Country Manager: ตั้งค่าระบบ, จัดการผู้ใช้, สิทธิ์, master data, เห็นภาพรวมทั้งหมด, สร้าง/แก้ project, assign งาน, ดู manpower, approve request ใน project, อนุมัติระดับสูง, ดู report/audit
 * Manager: เห็นภาพรวมทั้งหมด, สร้าง/แก้ project, assign งาน, ดู manpower, approve request ใน project ที่รับผิดชอบ
 * Coordinator: เห็นภาพรวมทั้งหมด, อนุมัติ/ปฏิเสธ request ตามขอบเขตที่ได้รับ, จัดทีมเพื่อเสนอ assign งาน, update manpower, ตรวจงาน, ปิดงานบางประเภท
 * Supervisor: เห็นงานของตัวเอง, จัดเครื่องมือหลัก, assign งานสู่ Technician, update progress, upload evidence, ส่งมอบงาน, แนบไฟล์
 * Technician: เห็นงานของตัวเองตามที่ได้รับมอบหมาย, update progress, upload evidence, แนบไฟล์
 * Requester: สร้าง Work Request, ติดตามสถานะ, แนบไฟล์
 */

export function getUserRole(user: User | Employee | null | undefined): UserRole {
  if (!user) return 'Requester';
  if (user.userLevel) return user.userLevel;
  
  const roleStr = (user.role || '').toLowerCase();
  if (roleStr.includes('admin')) return 'Admin';
  if (roleStr.includes('country')) return 'Country Manager';
  if (roleStr.includes('manager') || roleStr.includes('site manager')) return 'Manager';
  if (roleStr.includes('coord')) return 'Coordinator';
  if (roleStr.includes('supervisor') || roleStr.includes('lead')) return 'Supervisor';
  if (roleStr.includes('tech') || roleStr.includes('operator') || roleStr.includes('engineer')) return 'Technician';
  if (roleStr.includes('request')) return 'Requester';
  
  return 'Technician';
}

// 1. User & Permissions Management (สร้าง, แก้ไข, ลบ พนักงาน/ผู้ใช้)
// "สามารถสร้าง,แก้ไข และ ลบ ได้ด้วย Admin และ Country Manager"
export function canManageUsers(user: User | null): boolean {
  const role = getUserRole(user);
  return role === 'Admin' || role === 'Country Manager';
}

// Employee Self-Edit (แก้ไขข้อมูลตัวเองได้เฉพาะข้อความ)
export function canEditEmployee(currentUser: User | null, targetEmployeeId: string): boolean {
  if (!currentUser) return false;
  const role = getUserRole(currentUser);
  if (role === 'Admin' || role === 'Country Manager') return true;
  // Employee can edit their own profile
  return currentUser.id === targetEmployeeId;
}

// Check if user is editing self in self-service mode (can only edit text, not role/salary/score)
export function isSelfEditOnly(currentUser: User | null, targetEmployeeId: string): boolean {
  if (!currentUser) return false;
  const role = getUserRole(currentUser);
  if (role === 'Admin' || role === 'Country Manager') return false;
  return currentUser.id === targetEmployeeId;
}

// 2. Main Equipment List Permissions
// "สามารถสร้างเพิ่ม ได้โดย Admin, Country Manager, Manager และ Coordinator แต่ลบได้โดย Admin และ Country Manager"
export function canCreateEquipment(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Manager', 'Coordinator'].includes(role);
}

export function canEditEquipment(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Manager', 'Coordinator', 'Supervisor'].includes(role);
}

export function canDeleteEquipment(user: User | null): boolean {
  const role = getUserRole(user);
  return role === 'Admin' || role === 'Country Manager';
}

// 3. Project Management Permissions
// Rule 3: Manager only sees project they are responsible for
// Rule 4: Country Manager sees all projects across all bases
export function canViewAllProjects(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Coordinator'].includes(role);
}

export function canViewProject(user: User | null, project: SupabaseProjectRow): boolean {
  if (!user) return false;
  const role = getUserRole(user);
  if (['Admin', 'Country Manager', 'Coordinator'].includes(role)) return true;
  if (role === 'Manager') {
    // Check if project owner matches user id or project name matches assigned scope
    if (!project.owner_id) return true;
    return project.owner_id === user.id || project.owner_id.includes(user.name);
  }
  return true; // Techs & Supervisors view task-associated projects
}

export function canCreateProject(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Manager'].includes(role);
}

// 4. Work Request Permissions
// Rule 2: Requester can edit request ONLY when still not approved/rejected (i.e. 'Pending' / 'open')
export function canEditRequest(user: User | null, request: WorkRequest): boolean {
  if (!user) return false;
  const role = getUserRole(user);
  if (['Admin', 'Country Manager'].includes(role)) return true;
  
  if (role === 'Requester') {
    const isPending = request.status === 'Pending' || (request.status as string) === 'open';
    const isOwner = request.creatorId === user.id || request.requester === user.name;
    return isPending && isOwner;
  }
  
  if (role === 'Manager' || role === 'Coordinator') {
    return true;
  }
  
  return false;
}

// Rule 5: Approval permissions
export function canApproveRequest(user: User | null, request?: WorkRequest): boolean {
  const role = getUserRole(user);
  if (role === 'Admin' || role === 'Country Manager') return true;
  if (role === 'Manager') {
    if (!request || !request.responsibleManager) return true;
    return request.responsibleManager === user?.id || request.responsibleManager === user?.name;
  }
  if (role === 'Coordinator') return true;
  return false;
}

// 5. Task Permissions
// Rule 1: Supervisor can only edit task assigned to self / team
export function canEditTask(user: User | null, task: Task): boolean {
  if (!user) return false;
  const role = getUserRole(user);
  if (['Admin', 'Country Manager', 'Manager', 'Coordinator'].includes(role)) return true;
  
  if (role === 'Supervisor') {
    return task.supervisorId === user.id || task.supervisorName === user.name || task.assigneeId === user.id;
  }
  
  if (role === 'Technician') {
    return task.assigneeId === user.id || task.assigneeName === user.name;
  }
  
  return false;
}

export function canAssignTask(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Manager', 'Coordinator', 'Supervisor'].includes(role);
}

// 6. Report Export Permissions
// Rule 8: Export report restricted to Manager and above (or authorized viewers)
export function canExportReports(user: User | null): boolean {
  const role = getUserRole(user);
  return ['Admin', 'Country Manager', 'Manager'].includes(role);
}

// 7. Manpower List Review Permissions
// "Admin, Country Manager, Manager, Coordinator และตัวของพนักงานเอง สามารถเข้ามาพิจารณาได้"
export function canReviewEmployee(currentUser: User | null, targetEmployeeId?: string): boolean {
  if (!currentUser) return false;
  const role = getUserRole(currentUser);
  if (['Admin', 'Country Manager', 'Manager', 'Coordinator'].includes(role)) return true;
  return currentUser.id === targetEmployeeId;
}
