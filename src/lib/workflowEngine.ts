import { TaskStatus, UserRole, User, WorkRequest, JobPlan, ScopeRiskAssessment, DailyProgressReport, ChangeRequest, IssueIncident, InspectionRecord, FinalReport, CloseoutChecklist, PerformanceEvaluation5D } from '../types';

export interface WorkflowTransition {
  from: TaskStatus;
  to: TaskStatus;
  actionName: string;
  actionNameTH: string;
  allowedRoles: UserRole[];
  requiresReason?: boolean;
  validationCheck?: (context: WorkflowValidationContext) => { valid: boolean; message: string };
}

export interface WorkflowValidationContext {
  request?: WorkRequest;
  assessment?: ScopeRiskAssessment;
  jobPlan?: JobPlan;
  dprs?: DailyProgressReport[];
  changeRequests?: ChangeRequest[];
  issues?: IssueIncident[];
  inspection?: InspectionRecord;
  finalReport?: FinalReport;
  closeout?: CloseoutChecklist;
  evaluation?: PerformanceEvaluation5D;
  userRole: UserRole;
  notes?: string;
}

// Complete 22-step Workflow Transition Matrix
export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  // 1. Creation & Submission
  {
    from: 'Draft',
    to: 'Submitted',
    actionName: 'Submit Work Request',
    actionNameTH: 'ยื่นคำของาน (Submit)',
    allowedRoles: ['Requester', 'Sales / Requester', 'Coordinator', 'Manager', 'Country Manager', 'Admin'],
    validationCheck: (ctx) => {
      if (!ctx.request?.title || !ctx.request?.scopeOfWork || !ctx.request?.customer) {
        return { valid: false, message: 'กรุณากรอกข้อมูล ชื่องาน, ขอบเขตงาน (Scope of Work) และชื่อลูกค้าให้ครบถ้วนก่อน Submit' };
      }
      return { valid: true, message: '' };
    }
  },

  // 2. Request Review by Coordinator
  {
    from: 'Submitted',
    to: 'Under Review',
    actionName: 'Start Request Review',
    actionNameTH: 'เริ่มการตรวจสอบคำขอ (Review)',
    allowedRoles: ['Coordinator', 'Project Manager', 'Operation Manager', 'Country Manager', 'Admin'],
  },
  {
    from: 'Under Review',
    to: 'Returned for Information',
    actionName: 'Return for More Information',
    actionNameTH: 'ส่งกลับเพื่อขอข้อมูลเพิ่มเติม (Return)',
    allowedRoles: ['Coordinator', 'Project Manager', 'Country Manager', 'Admin'],
    requiresReason: true,
  },
  {
    from: 'Returned for Information',
    to: 'Submitted',
    actionName: 'Resubmit Updated Request',
    actionNameTH: 'ยื่นคำขอที่แก้ไขแล้วใหม่ (Resubmit)',
    allowedRoles: ['Requester', 'Sales / Requester', 'Coordinator', 'Admin'],
  },
  {
    from: 'Under Review',
    to: 'Pending Management Review',
    actionName: 'Escalate to Management',
    actionNameTH: 'ส่งให้ฝ่ายบริหารพิจารณา (Out of Scope)',
    allowedRoles: ['Coordinator', 'Admin'],
    requiresReason: true,
  },
  {
    from: 'Pending Management Review',
    to: 'Assessment',
    actionName: 'Management Approved to Assess',
    actionNameTH: 'ฝ่ายบริหารอนุมัติให้ประเมินความเสี่ยง',
    allowedRoles: ['Project Manager', 'Operation Manager', 'Country Manager', 'Admin'],
  },
  {
    from: 'Under Review',
    to: 'Assessment',
    actionName: 'Proceed to Risk Assessment',
    actionNameTH: 'ข้อมูลครบถ้วน ส่งไปประเมินความเสี่ยง (Proceed)',
    allowedRoles: ['Coordinator', 'Project Manager', 'Country Manager', 'Admin'],
  },

  // 3. Risk & Complexity Assessment -> Planning
  {
    from: 'Assessment',
    to: 'Planning',
    actionName: 'Complete Assessment & Start Planning',
    actionNameTH: 'ประเมินความเสี่ยงเรียบร้อย เข้าสู่ขั้นตอนวางแผน (Planning)',
    allowedRoles: ['Coordinator', 'Supervisor', 'Project Manager', 'Admin'],
    validationCheck: (ctx) => {
      if (!ctx.assessment?.overallRiskLevel) {
        return { valid: false, message: 'กรุณาระบุผลการประเมินความเสี่ยง (Risk Level) ก่อนส่งต่อไปวางแผน' };
      }
      return { valid: true, message: '' };
    }
  },

  // 4 & 5. Resource Planning (Manpower & Main Equipment) -> Job Plan Approval
  {
    from: 'Planning',
    to: 'Pending Approval',
    actionName: 'Submit Job Plan for Approval',
    actionNameTH: 'ส่ง Job Plan เพื่อขออนุมัติ (Submit for Approval)',
    allowedRoles: ['Coordinator', 'Supervisor', 'Admin'],
    validationCheck: (ctx) => {
      if (!ctx.jobPlan?.teamList || ctx.jobPlan.teamList.length === 0) {
        return { valid: false, message: 'กรุณาจัดสรรทีมงาน (Manpower) อย่างน้อย 1 คนก่อนส่งอนุมัติ' };
      }
      return { valid: true, message: '' };
    }
  },

  // 6 & 7. Approval
  {
    from: 'Pending Approval',
    to: 'Approved',
    actionName: 'Approve Job Plan',
    actionNameTH: 'อนุมัติแผนงานโครงการ (Approve)',
    allowedRoles: ['Project Manager', 'Operation Manager', 'Country Manager', 'Admin'],
  },
  {
    from: 'Pending Approval',
    to: 'Planning',
    actionName: 'Reject Job Plan for Revision',
    actionNameTH: 'ส่งกลับให้ปรับปรุงแผนงาน (Revise Plan)',
    allowedRoles: ['Project Manager', 'Operation Manager', 'Country Manager', 'Admin'],
    requiresReason: true,
  },

  // 8. Assignment Confirmation
  {
    from: 'Approved',
    to: 'Assigned',
    actionName: 'Dispatch Assignments to Crew',
    actionNameTH: 'ส่งมอบหมายงานสู่ทีมปฏิบัติการ (Dispatch)',
    allowedRoles: ['Coordinator', 'Supervisor', 'Admin'],
  },
  {
    from: 'Assigned',
    to: 'Confirmed',
    actionName: 'Confirm Crew Acceptance',
    actionNameTH: 'ยืนยันการตอบรับจากทีมงานครบถ้วน (Confirmed)',
    allowedRoles: ['Supervisor', 'Coordinator', 'Admin'],
  },

  // 9 & 10. Pre-Mobilization & Mobilization
  {
    from: 'Confirmed',
    to: 'Pre-Mobilization',
    actionName: 'Start Pre-Mobilization Checklist',
    actionNameTH: 'เริ่มตรวจสอบ Checklist ก่อนเดินทาง (Pre-Mob)',
    allowedRoles: ['Coordinator', 'Supervisor', 'HSE', 'QA/QC', 'Equipment Controller', 'Admin'],
  },
  {
    from: 'Pre-Mobilization',
    to: 'Mobilized',
    actionName: 'Sign-off Mobilization & Depart to Site',
    actionNameTH: 'อนุมัติการเดินทางและเบิกจ่ายเครื่องมือ (Mobilized)',
    allowedRoles: ['Coordinator', 'Supervisor', 'Equipment Controller', 'Admin'],
  },

  // 11 & 12. Work Execution & DPR
  {
    from: 'Mobilized',
    to: 'In Progress',
    actionName: 'Start On-Site Work Execution',
    actionNameTH: 'เริ่มลงมือปฏิบัติงานหน้างาน (In Progress)',
    allowedRoles: ['Supervisor', 'Technician', 'Admin'],
  },

  // 15 & 16. Inspection & Client Acceptance
  {
    from: 'In Progress',
    to: 'Pending Inspection',
    actionName: 'Request Client QA/QC Inspection',
    actionNameTH: 'ส่งตรวจรับงาน (Request Inspection)',
    allowedRoles: ['Supervisor', 'QA/QC', 'Admin'],
  },
  {
    from: 'Pending Inspection',
    to: 'Rectification Required',
    actionName: 'Punch List Issued (Rectification Required)',
    actionNameTH: 'พบรายการต้องแก้ไขตาม Punch List',
    allowedRoles: ['QA/QC', 'Supervisor', 'Customer', 'Admin'],
    requiresReason: true,
  },
  {
    from: 'Rectification Required',
    to: 'In Progress',
    actionName: 'Resume Rework on Punch List',
    actionNameTH: 'ดำเนินการแก้ไขรายการ Punch List',
    allowedRoles: ['Supervisor', 'Technician', 'Admin'],
  },
  {
    from: 'Pending Inspection',
    to: 'Work Completed',
    actionName: 'Client Acceptance Signed Off',
    actionNameTH: 'ลูกค้าลงนามตรวจรับงานผ่านเรียบร้อย (Accepted)',
    allowedRoles: ['Supervisor', 'QA/QC', 'Coordinator', 'Customer', 'Project Manager', 'Admin'],
  },

  // 17 & 18. Equipment Return & Final Report
  {
    from: 'Work Completed',
    to: 'Final Report Submitted',
    actionName: 'Submit Final Engineering Report',
    actionNameTH: 'ส่งรายงานสรุปผลงานขั้นสุดท้าย (Final Report)',
    allowedRoles: ['Supervisor', 'Coordinator', 'QA/QC', 'Admin'],
    validationCheck: (ctx) => {
      if (!ctx.finalReport?.documentNumber) {
        return { valid: false, message: 'กรุณาสร้างและบันทึกเอกสาร Final Report พร้อมเลขที่เอกสารก่อนส่ง' };
      }
      return { valid: true, message: '' };
    }
  },

  // 19 & 20. Close-out
  {
    from: 'Final Report Submitted',
    to: 'Pending Close',
    actionName: 'Initiate Operational & Financial Close-out',
    actionNameTH: 'เริ่มกระบวนการปิดโครงการ (Close-out)',
    allowedRoles: ['Coordinator', 'Finance', 'Project Manager', 'Admin'],
  },
  {
    from: 'Pending Close',
    to: 'Closed',
    actionName: 'Complete Job & Lock Final Close-out',
    actionNameTH: 'ปิดโครงการสมบูรณ์ (Project Closed)',
    allowedRoles: ['Project Manager', 'Operation Manager', 'Country Manager', 'Admin'],
    validationCheck: (ctx) => {
      if (!ctx.closeout?.financial.billingReadiness) {
        return { valid: false, message: 'กรุณาตรวจสอบความพร้อมด้านการวางบิล (Billing Readiness) ก่อนปิดงาน' };
      }
      return { valid: true, message: '' };
    }
  },

  // Global Exception State Transitions
  {
    from: 'In Progress',
    to: 'On Hold',
    actionName: 'Put Job On Hold',
    actionNameTH: 'พักงานชั่วคราว (On Hold)',
    allowedRoles: ['Supervisor', 'Coordinator', 'Project Manager', 'Country Manager', 'Admin'],
    requiresReason: true,
  },
  {
    from: 'On Hold',
    to: 'In Progress',
    actionName: 'Resume Work from Hold',
    actionNameTH: 'ดำเนินงานต่อหลังพักงาน (Resume)',
    allowedRoles: ['Supervisor', 'Coordinator', 'Project Manager', 'Country Manager', 'Admin'],
  },
  {
    from: 'Under Review',
    to: 'Rejected',
    actionName: 'Reject Work Request',
    actionNameTH: 'ปฏิเสธคำของาน (Reject)',
    allowedRoles: ['Coordinator', 'Project Manager', 'Country Manager', 'Admin'],
    requiresReason: true,
  },
  {
    from: 'Closed',
    to: 'Reopened',
    actionName: 'Request Project Reopen',
    actionNameTH: 'ขอเปิดโครงการใหม่ (Reopen Request)',
    allowedRoles: ['Country Manager', 'Admin'],
    requiresReason: true,
  },
  {
    from: 'Reopened',
    to: 'In Progress',
    actionName: 'Approve Reopen & Resume Operations',
    actionNameTH: 'อนุมัติเปิดโครงการและกลับสู่การปฏิบัติงาน',
    allowedRoles: ['Country Manager', 'Admin'],
  }
];

export class WorkflowEngine {
  /**
   * Check if a status transition is permissible based on current status and user role.
   */
  static canTransition(
    currentStatus: TaskStatus,
    targetStatus: TaskStatus,
    userRole: UserRole,
    context?: WorkflowValidationContext
  ): { allowed: boolean; reason?: string } {
    const transition = WORKFLOW_TRANSITIONS.find(
      t => t.from === currentStatus && t.to === targetStatus
    );

    if (!transition) {
      return { allowed: false, reason: `ไม่อนุญาตให้เปลี่ยนสถานะจาก '${currentStatus}' ไปเป็น '${targetStatus}' โดยตรง` };
    }

    // Role check (Admin has overriding permissions)
    if (userRole !== 'Admin' && !transition.allowedRoles.includes(userRole)) {
      return {
        allowed: false,
        reason: `บทบาทของคุณ (${userRole}) ไม่มีสิทธิ์เปลี่ยนสถานะนี้ (สิทธิ์สำหรับ: ${transition.allowedRoles.join(', ')})`
      };
    }

    // Custom validation logic check
    if (transition.validationCheck && context) {
      const checkResult = transition.validationCheck(context);
      if (!checkResult.valid) {
        return { allowed: false, reason: checkResult.message };
      }
    }

    return { allowed: true };
  }

  /**
   * Get all next valid actions available for a specific state and user role.
   */
  static getAvailableActions(
    currentStatus: TaskStatus,
    userRole: UserRole
  ): WorkflowTransition[] {
    return WORKFLOW_TRANSITIONS.filter(t => {
      if (t.from !== currentStatus) return false;
      if (userRole === 'Admin') return true;
      return t.allowedRoles.includes(userRole);
    });
  }

  /**
   * Get a readable step index (1-22) for the current status.
   */
  static getWorkflowStepNumber(status: TaskStatus): number {
    const stepMap: Partial<Record<TaskStatus, number>> = {
      'Draft': 1,
      'Submitted': 1,
      'Under Review': 2,
      'Returned for Information': 2,
      'Pending Management Review': 2,
      'Assessment': 3,
      'Planning': 4,
      'Pending Approval': 7,
      'Approved': 7,
      'Assigned': 8,
      'Confirmed': 8,
      'Pre-Mobilization': 9,
      'Mobilized': 10,
      'In Progress': 11,
      'Pending Inspection': 15,
      'Rectification Required': 15,
      'Work Completed': 16,
      'Final Report Submitted': 19,
      'Pending Close': 20,
      'Closed': 20,
      'On Hold': 11,
      'Rejected': 2,
      'Cancelled': 1,
      'Reopened': 20,
    };
    return stepMap[status] || 1;
  }
}
