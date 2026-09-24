import { create } from 'zustand';
import { 
  User, Task, WorkRequest, MainEquipment, ApprovalRecord, UserRole, TaskStatus,
  ScopeRiskAssessment, JobPlan, PreMobilizationChecklist, DailyProgressReport,
  ChangeRequest, IssueIncident, InspectionRecord, EquipmentReturnChecklist,
  FinalReport, CloseoutChecklist, PerformanceEvaluation5D, NotificationItem,
  AuditTrailEntry
} from '../types';
import { SupabaseService, SupabaseProjectRow, Employee } from '../lib/supabaseService';
import { initialEquipmentList, initialEnterpriseEmployees } from '../data/equipmentData';
import { WorkflowEngine } from '../lib/workflowEngine';

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
  
  // 22-Step Operations State
  assessments: Record<string, ScopeRiskAssessment>;
  jobPlans: Record<string, JobPlan>;
  preMobChecklists: Record<string, PreMobilizationChecklist>;
  dprs: DailyProgressReport[];
  changeRequests: ChangeRequest[];
  issues: IssueIncident[];
  inspections: Record<string, InspectionRecord>;
  returnChecklists: Record<string, EquipmentReturnChecklist[]>;
  finalReports: Record<string, FinalReport>;
  closeouts: Record<string, CloseoutChecklist>;
  evaluations: Record<string, PerformanceEvaluation5D>;
  notifications: NotificationItem[];
  auditLogs: AuditTrailEntry[];
  
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
  updateRequest: (id: string, updates: Partial<WorkRequest>, reason?: string) => Promise<void>;
  archiveRequest: (id: string) => Promise<void>;
  submitApproval: (record: Omit<ApprovalRecord, 'id' | 'approvedAt'>) => Promise<void>;
  
  // 22-Step Workflow & Operations Dispatchers
  executeWorkflowTransition: (
    requestId: string,
    targetStatus: TaskStatus,
    reason?: string
  ) => Promise<{ success: boolean; message?: string }>;
  saveAssessment: (assessment: ScopeRiskAssessment) => Promise<void>;
  saveJobPlan: (jobPlan: JobPlan) => Promise<void>;
  savePreMobChecklist: (checklist: PreMobilizationChecklist) => Promise<void>;
  saveDPR: (dpr: DailyProgressReport) => Promise<void>;
  saveChangeRequest: (cr: ChangeRequest) => Promise<void>;
  saveIssue: (issue: IssueIncident) => Promise<void>;
  saveInspection: (inspection: InspectionRecord) => Promise<void>;
  saveReturnChecklist: (jobId: string, checklists: EquipmentReturnChecklist[]) => Promise<void>;
  saveFinalReport: (report: FinalReport) => Promise<void>;
  saveCloseout: (closeout: CloseoutChecklist) => Promise<void>;
  saveEvaluation: (evaluation: PerformanceEvaluation5D) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  logAuditTrail: (entry: Omit<AuditTrailEntry, 'id' | 'timestamp'>) => void;

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

// Seed initial operational records so users can experience all 22 workflow steps immediately
const seedInitialWorkRequests = (): WorkRequest[] => [
  {
    id: 'WR-2026-0018',
    title: 'Offshore Pipeline Hydrotest & Flange Bolting Services',
    jobNumber: 'JOB-2026-018',
    projectReferenceNumber: 'PTT-EP-ARTHIT-2026-B4',
    customer: 'PTTEP Exploration & Production',
    customerContact: {
      name: 'Khun Somporn V.',
      phone: '081-998-1122',
      email: 'somporn.v@pttep.com',
      position: 'Senior Asset Integrity Lead',
    },
    serviceCategory: 'Hydrotesting',
    scopeOfWork: 'Complete 15,000 PSI hydrotesting on 12-inch riser section and torque tensioning verification of 48 flange joints on Wellhead Platform 4.',
    siteLocation: 'Arthit Offshore Gas Field (Gulf of Thailand)',
    isOffshore: true,
    startDate: '2026-10-01',
    endDate: '2026-10-08',
    shift: '24-Hour Rotating (2 Shifts)',
    workingHoursEstimated: 168,
    requiredManpower: [
      { role: 'Supervisor', quantity: 1, skillRequirement: ['Offshore Lead', 'Flange Cert'] },
      { role: 'Technician', quantity: 3, skillRequirement: ['Hydrotest Operator', 'Torque Bolting'] }
    ],
    requiredMainEquipmentIds: ['EQ-HYD-001', 'EQ-TRQ-002'],
    hseRequirements: ['PTT Offshore Safety Passport', 'BOSIET / FOET with EBS', 'OPITO Flange Integrity'],
    qaQcRequirements: ['ISO 17025 Calibrated Gauge (0.25% F.S.)', 'Dual Digital Chart Recorder'],
    requiredReports: ['Daily Progress Report (DPR)', 'Flange Management Dossier', 'Final Engineering Report'],
    urgency: 'High',
    commercialResponsiblePerson: 'Nattapong Kittisak (Commercial Director)',
    requester: 'Nattapong Kittisak',
    requesterId: 'emp-sales-01',
    coordinator: 'Art Kitthana',
    coordinatorId: 'emp-003-country',
    status: 'In Progress',
    progress: 65,
    currentRevision: 1,
    revisions: [],
    comments: [
      {
        id: 'c1',
        authorId: 'emp-003-country',
        authorName: 'Art Kitthana',
        authorRole: 'Coordinator',
        message: 'Pre-Mob completed. Crew and Hydrotest Unit EQ-HYD-001 mobilized to Songkhla base on schedule.',
        createdAt: '2026-09-21T10:00:00Z'
      }
    ],
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
  },
  {
    id: 'WR-2026-0019',
    title: 'High Pressure Nitrogen Purging & Helium Leak Detection',
    jobNumber: 'JOB-2026-019',
    projectReferenceNumber: 'SPRC-TA-2026-ZONE3',
    customer: 'Star Petroleum Refining (SPRC)',
    customerContact: {
      name: 'Khun Wichai Prasert',
      phone: '086-334-9911',
      email: 'wichai.p@sprc.co.th',
      position: 'Turnaround Maintenance Lead',
    },
    serviceCategory: 'Nitrogen Purging',
    scopeOfWork: 'Continuous N2 purging and He leak detection on Crude Distillation Unit (CDU) piping circuit following major shutdown overhaul.',
    siteLocation: 'Map Ta Phut Industrial Estate, Rayong',
    isOffshore: false,
    startDate: '2026-10-12',
    endDate: '2026-10-16',
    shift: '12-Hour Shift (07:00 - 19:00)',
    workingHoursEstimated: 60,
    requiredManpower: [
      { role: 'Supervisor', quantity: 1 },
      { role: 'Technician', quantity: 2 }
    ],
    requiredMainEquipmentIds: ['EQ-NIT-003'],
    hseRequirements: ['Confined Space Attendant Cert', 'Atmospheric Gas Testing'],
    urgency: 'Medium',
    commercialResponsiblePerson: 'Nattapong Kittisak',
    requester: 'Wichai Prasert (Client)',
    coordinator: 'Art Kitthana',
    status: 'Assessment',
    progress: 20,
    currentRevision: 1,
    createdAt: '2026-09-20T09:00:00Z',
    updatedAt: '2026-09-22T04:00:00Z',
  }
];

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
  requests: seedInitialWorkRequests(),
  approvalRecords: [],

  assessments: {
    'WR-2026-0018': {
      id: 'ASM-018',
      workRequestId: 'WR-2026-0018',
      jobComplexity: 'HIGH',
      technicalRisk: 'HIGH',
      safetyRisk: 'MEDIUM',
      travelRisk: 'HIGH',
      offshoreRisk: 'HIGH',
      equipmentAvailabilityRisk: 'LOW',
      subcontractorRisk: 'LOW',
      scheduleRisk: 'MEDIUM',
      customerRestrictionRisk: 'MEDIUM',
      overallRiskLevel: 'HIGH',
      estimatedManHours: 168,
      estimatedCostBaht: 485000,
      requiredApprovalLevel: 'Country Manager',
      mitigationPlan: 'Deploy senior Level 3 offshore supervisor, backup pressure transducers, and verify daily weather window with vessel master.',
      assessedBy: 'Art Kitthana',
      assessedAt: '2026-09-16T10:00:00Z',
    }
  },

  jobPlans: {
    'WR-2026-0018': {
      id: 'JP-018',
      workRequestId: 'WR-2026-0018',
      jobNumber: 'JOB-2026-018',
      jobTitle: 'Offshore Pipeline Hydrotest & Flange Bolting Services',
      scopeOfWork: '15,000 PSI hydrotesting on 12-inch riser section and torque tensioning verification.',
      methodStatement: 'MS-IKM-HYD-2026-REV2: Pressurize system in 25%, 50%, 75%, 100% hold increments with 4-hour stabilization test.',
      teamList: [
        { employeeId: 'emp-001', employeeName: 'Somchai Suksan', roleInCrew: 'Supervisor', status: 'Working', confirmedAt: '2026-09-17' },
        { employeeId: 'emp-002', employeeName: 'Kittipong Mechai', roleInCrew: 'Lead Mechanical Tech', status: 'Working', confirmedAt: '2026-09-17' },
        { employeeId: 'emp-005', employeeName: 'Anurak Techaporn', roleInCrew: 'Senior Tech', status: 'Working', confirmedAt: '2026-09-17' },
      ],
      responsibilityMatrix: [
        { taskName: 'JSA & Toolbox Safety Briefing', responsibleRole: 'Supervisor', accountableRole: 'Safety Officer' },
        { taskName: 'Hydrotest Skid Hookup & Bleeding', responsibleRole: 'Lead Mechanical Tech', accountableRole: 'Supervisor' },
        { taskName: 'Torque Tightening to 1,250 Nm', responsibleRole: 'Senior Tech', accountableRole: 'Supervisor' },
      ],
      equipmentList: [
        { equipmentId: 'EQ-HYD-001', equipmentName: 'High-Pressure Hydrostatic Test Unit 15,000 PSI', serialNumber: 'SN-2024-8849-HY', status: 'In Use', startDate: '2026-10-01', endDate: '2026-10-08' },
        { equipmentId: 'EQ-TRQ-002', equipmentName: 'Hydraulic Torque Wrench Set & Power Pack', serialNumber: 'SN-TORQ-9912-EXP', status: 'In Use', startDate: '2026-10-01', endDate: '2026-10-08' }
      ],
      consumablesList: [
        { item: 'Spiral Wound Gaskets 12" Class 900', quantity: '12 pcs' },
        { item: 'Molykote High Temp Lubricant', quantity: '4 cans' },
        { item: 'Chart Paper & High-Pressure O-Rings', quantity: '2 boxes' }
      ],
      mobilizationPlan: {
        departDate: '2026-09-28',
        departLocation: 'IKM Rayong -> Songkhla Heliport',
        transportMode: 'Crew Boat / Helicopter S-92',
        accommodationDetails: 'Living Quarters Platform Arthit Module B',
        siteContactPerson: 'Khun Somporn V. (081-998-1122)'
      },
      workSchedule: [
        { phase: 'Phase 1: Mobilization & Hookup', startDate: '2026-10-01', endDate: '2026-10-02', deliverable: 'Skid connection sign-off' },
        { phase: 'Phase 2: Hydrostatic Pressure Test', startDate: '2026-10-03', endDate: '2026-10-05', deliverable: 'Dual pressure charts' },
        { phase: 'Phase 3: Flange Torque & De-mob', startDate: '2026-10-06', endDate: '2026-10-08', deliverable: 'Torque QA sheet' }
      ],
      communicationPlan: 'Daily morning satellite briefing at 07:00 with Coordinator Art Kitthana and SPRC Client Rep.',
      reportingRequirement: ['Daily Progress Report at 18:00', 'Immediate Incident Notification < 15 mins'],
      hsePlan: 'Zero LTI target, strict exclusion zone barriers during 15K PSI pressure hold.',
      qaQcPlan: 'Gauges verified with third-party calibration certificate valid through 2026-11-15.',
      approvals: [],
      status: 'Approved',
      createdAt: '2026-09-16T14:00:00Z',
      approvedAt: '2026-09-18T09:00:00Z',
    }
  },

  preMobChecklists: {
    'WR-2026-0018': {
      id: 'PMC-018',
      jobId: 'WR-2026-0018',
      overallStatus: 'Ready for Mobilization',
      items: [
        { key: 'pmc-1', title: 'Manpower Competency & Crew Allocation', status: 'Completed', checkedBy: 'Art Kitthana', checkedAt: '2026-09-20' },
        { key: 'pmc-2', title: 'Offshore Survival & Medical Certificate Validity', status: 'Completed', checkedBy: 'HSE Lead', checkedAt: '2026-09-20' },
        { key: 'pmc-3', title: 'BOSIET / FOET EBS Validation', status: 'Completed', checkedBy: 'HSE Lead', checkedAt: '2026-09-20' },
        { key: 'pmc-4', title: 'Approved Method Statement & JSA Dossier', status: 'Completed', checkedBy: 'Somchai Suksan', checkedAt: '2026-09-20' },
        { key: 'pmc-5', title: 'Hot/Cold Work Permit to Work (PTW) Package', status: 'Completed', checkedBy: 'Art Kitthana', checkedAt: '2026-09-20' },
        { key: 'pmc-6', title: 'Equipment Pre-Check & Functional Testing', status: 'Completed', checkedBy: 'Equipment Controller', checkedAt: '2026-09-20' },
        { key: 'pmc-7', title: 'Calibration Certificates Verified (Valid > 60 days)', status: 'Completed', checkedBy: 'QA Inspector', checkedAt: '2026-09-20' },
        { key: 'pmc-8', title: 'Critical Spare Parts & Consumables Pack', status: 'Completed', checkedBy: 'Equipment Controller', checkedAt: '2026-09-20' },
        { key: 'pmc-9', title: 'Helicopter & Logistics Transportation Clearance', status: 'Completed', checkedBy: 'Coordinator', checkedAt: '2026-09-20' },
        { key: 'pmc-10', title: 'Offshore Accommodation Bed Allocation', status: 'Completed', checkedBy: 'Coordinator', checkedAt: '2026-09-20' },
        { key: 'pmc-11', title: 'Emergency Response & Evacuation Protocol', status: 'Completed', checkedBy: 'HSE Lead', checkedAt: '2026-09-20' },
        { key: 'pmc-12', title: 'Toolbox Safety Briefing Done', status: 'Completed', checkedBy: 'Somchai Suksan', checkedAt: '2026-09-21' },
      ],
      signOffBy: 'Art Kitthana',
      signOffAt: '2026-09-21T09:00:00Z',
    }
  },

  dprs: [
    {
      id: 'DPR-018-01',
      jobId: 'WR-2026-0018',
      reportDate: '2026-09-22',
      dayNumber: 1,
      plannedProgressPercent: 30,
      actualProgressPercent: 35,
      variancePercent: 5,
      regularManHours: 24,
      otManHours: 4,
      activitiesPerformed: 'Completed equipment positioning on Wellhead deck. Connected high-pressure flex hoses. Executed leak test at 500 PSI holding for 30 minutes without drop.',
      quantityCompleted: '1 Test Circuit Hooked Up, 16 Flanges Inspected',
      equipmentCondition: 'EQ-HYD-001 running smoothly. Pressure transmitter readings stable at ambient 32°C.',
      inspectionResults: 'Visual inspection of 12" joint welds satisfactory. Zero weeping observed.',
      hseObservations: 'Toolbox talk conducted at 07:00 with 100% attendance. Eye protection and blast barricades verified in place.',
      nextDayPlan: 'Begin staged pressure ramping to 5,000 PSI and 10,000 PSI.',
      photos: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80'
      ],
      submittedBy: 'Somchai Suksan (Supervisor)',
      submittedAt: '2026-09-22T17:30:00Z',
    }
  ],

  changeRequests: [],
  issues: [],
  inspections: {},
  returnChecklists: {},
  finalReports: {},
  closeouts: {},
  evaluations: {},
  
  notifications: [
    {
      id: 'notif-1',
      title: 'Work Request In Progress',
      message: 'WR-2026-0018 (Offshore Pipeline Hydrotest) has reached 65% progress. DPR Day 1 submitted.',
      type: 'Mobilization',
      priority: 'Medium',
      read: false,
      jobId: 'WR-2026-0018',
      createdAt: '2026-09-22T10:00:00Z',
    },
    {
      id: 'notif-2',
      title: 'Calibration Attention Needed',
      message: 'EQ-CAL-004 (Fluke Process Calibrator) calibration expires soon.',
      type: 'Calibration Expiry',
      priority: 'High',
      read: false,
      createdAt: '2026-09-22T08:00:00Z',
    }
  ],

  auditLogs: [
    {
      id: 'aud-1',
      userId: 'emp-003-country',
      userName: 'Art Kitthana',
      userRole: 'Country Manager',
      action: 'WORKFLOW_TRANSITION',
      recordType: 'WorkRequest',
      recordId: 'WR-2026-0018',
      oldValue: 'Pre-Mobilization',
      newValue: 'In Progress',
      reason: 'On-site execution commenced following successful rig safety induction.',
      timestamp: '2026-09-22T07:00:00Z'
    }
  ],

  initSupabaseData: async () => {
    set({ isLoadingData: true });
    try {
      await SupabaseService.seedIfEmpty();
      const state = get();
      const isLoggedOut = localStorage.getItem('ikm_logged_out') === 'true';
      
      let localSavedUser: User | null = null;
      try {
        const raw = localStorage.getItem('ikm_user_profile');
        if (raw) localSavedUser = JSON.parse(raw);
      } catch (e) {}

      const activeUserId = localSavedUser?.id || state.user?.id;
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
          finalUser = localSavedUser;
        } else if (state.user) {
          finalUser = state.user;
        }
      }

      set({
        tasks: dbTasks.length > 0 ? dbTasks : state.tasks,
        requests: dbRequests.length > 0 ? dbRequests : (state.requests.length > 0 ? state.requests : seedInitialWorkRequests()),
        projects: dbProjects,
        employees: dbEmployees.length > 0 ? dbEmployees : initialEnterpriseEmployees,
        user: isLoggedOut ? null : finalUser,
        isLoadingData: false,
        isSupabaseConnected: true,
      });
    } catch (err) {
      console.warn('initSupabaseData fallback:', err);
      set({ isLoadingData: false });
    }
  },

  executeWorkflowTransition: async (requestId, targetStatus, reason) => {
    const state = get();
    const req = state.requests.find(r => r.id === requestId);
    if (!req) {
      return { success: false, message: 'ไม่พบรายการคำของานที่ระบุ' };
    }

    const currentUser = state.user;
    const userRole: UserRole = (currentUser?.userLevel || currentUser?.role || 'Coordinator') as UserRole;

    const validationContext = {
      request: req,
      assessment: state.assessments[requestId],
      jobPlan: state.jobPlans[requestId],
      dprs: state.dprs.filter(d => d.jobId === requestId),
      changeRequests: state.changeRequests.filter(c => c.jobId === requestId),
      issues: state.issues.filter(i => i.jobId === requestId),
      inspection: state.inspections[requestId],
      finalReport: state.finalReports[requestId],
      closeout: state.closeouts[requestId],
      evaluation: state.evaluations[requestId],
      userRole,
      notes: reason,
    };

    const check = WorkflowEngine.canTransition(req.status, targetStatus, userRole, validationContext);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'ไม่ได้รับอนุญาตให้เปลี่ยนสถานะนี้' };
    }

    const oldStatus = req.status;
    const updatedRequests = state.requests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: targetStatus,
          updatedAt: new Date().toISOString(),
          reviewNotes: reason || r.reviewNotes,
        };
      }
      return r;
    });

    // Automated Audit Log
    const newAuditEntry: AuditTrailEntry = {
      id: `aud-${Date.now()}`,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'System User',
      userRole: userRole,
      action: 'WORKFLOW_TRANSITION',
      recordType: 'WorkRequest',
      recordId: requestId,
      oldValue: oldStatus,
      newValue: targetStatus,
      reason: reason || `Transitioned from ${oldStatus} to ${targetStatus}`,
      timestamp: new Date().toISOString(),
    };

    // Automated Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Status Changed: ${requestId}`,
      message: `Work Request [${req.title}] moved to status: ${targetStatus}`,
      type: 'Mobilization',
      priority: 'Medium',
      read: false,
      jobId: requestId,
      createdAt: new Date().toISOString(),
    };

    set({
      requests: updatedRequests,
      auditLogs: [newAuditEntry, ...state.auditLogs],
      notifications: [newNotif, ...state.notifications],
    });

    // Background sync to Supabase
    try {
      await SupabaseService.updateWorkRequest(requestId, { status: targetStatus });
    } catch (e) {
      console.warn('Supabase sync background notice:', e);
    }

    return { success: true };
  },

  saveAssessment: async (assessment) => {
    set(state => ({
      assessments: { ...state.assessments, [assessment.workRequestId]: assessment },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          userId: state.user?.id || 'sys',
          userName: state.user?.name || 'System',
          userRole: state.user?.role || 'Coordinator',
          action: 'ASSESSMENT_SAVED',
          recordType: 'ScopeRiskAssessment',
          recordId: assessment.workRequestId,
          newValue: `Risk: ${assessment.overallRiskLevel}`,
          timestamp: new Date().toISOString()
        },
        ...state.auditLogs
      ]
    }));
  },

  saveJobPlan: async (jobPlan) => {
    set(state => ({
      jobPlans: { ...state.jobPlans, [jobPlan.workRequestId]: jobPlan },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          userId: state.user?.id || 'sys',
          userName: state.user?.name || 'System',
          userRole: state.user?.role || 'Coordinator',
          action: 'JOB_PLAN_UPDATED',
          recordType: 'JobPlan',
          recordId: jobPlan.workRequestId,
          newValue: `Status: ${jobPlan.status}`,
          timestamp: new Date().toISOString()
        },
        ...state.auditLogs
      ]
    }));
  },

  savePreMobChecklist: async (checklist) => {
    set(state => ({
      preMobChecklists: { ...state.preMobChecklists, [checklist.jobId]: checklist }
    }));
  },

  saveDPR: async (dpr) => {
    set(state => {
      const existing = state.dprs.filter(d => d.id !== dpr.id);
      return {
        dprs: [dpr, ...existing],
        auditLogs: [
          {
            id: `aud-${Date.now()}`,
            userId: state.user?.id || 'sys',
            userName: state.user?.name || 'System',
            userRole: state.user?.role || 'Supervisor',
            action: 'DPR_SUBMITTED',
            recordType: 'DailyProgressReport',
            recordId: dpr.jobId,
            newValue: `Day ${dpr.dayNumber}: ${dpr.actualProgressPercent}% (Variance ${dpr.variancePercent > 0 ? '+' : ''}${dpr.variancePercent}%)`,
            timestamp: new Date().toISOString()
          },
          ...state.auditLogs
        ]
      };
    });
  },

  saveChangeRequest: async (cr) => {
    set(state => {
      const existing = state.changeRequests.filter(c => c.id !== cr.id);
      return {
        changeRequests: [cr, ...existing],
        auditLogs: [
          {
            id: `aud-${Date.now()}`,
            userId: state.user?.id || 'sys',
            userName: state.user?.name || 'System',
            userRole: state.user?.role || 'Coordinator',
            action: 'CHANGE_REQUEST_LOGGED',
            recordType: 'ChangeRequest',
            recordId: cr.id,
            newValue: `Status: ${cr.status}`,
            timestamp: new Date().toISOString()
          },
          ...state.auditLogs
        ]
      };
    });
  },

  saveIssue: async (issue) => {
    set(state => {
      const existing = state.issues.filter(i => i.id !== issue.id);
      return {
        issues: [issue, ...existing],
        auditLogs: [
          {
            id: `aud-${Date.now()}`,
            userId: state.user?.id || 'sys',
            userName: state.user?.name || 'System',
            userRole: state.user?.role || 'Supervisor',
            action: 'ISSUE_LOGGED',
            recordType: 'IssueIncident',
            recordId: issue.id,
            newValue: `Severity: ${issue.severity}`,
            timestamp: new Date().toISOString()
          },
          ...state.auditLogs
        ]
      };
    });
  },

  saveInspection: async (inspection) => {
    set(state => ({
      inspections: { ...state.inspections, [inspection.jobId]: inspection },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          userId: state.user?.id || 'sys',
          userName: state.user?.name || 'System',
          userRole: state.user?.role || 'QA/QC',
          action: 'INSPECTION_RECORDED',
          recordType: 'InspectionRecord',
          recordId: inspection.jobId,
          newValue: `Decision: ${inspection.clientDecision}`,
          timestamp: new Date().toISOString()
        },
        ...state.auditLogs
      ]
    }));
  },

  saveReturnChecklist: async (jobId, checklists) => {
    set(state => ({
      returnChecklists: { ...state.returnChecklists, [jobId]: checklists }
    }));
  },

  saveFinalReport: async (report) => {
    set(state => ({
      finalReports: { ...state.finalReports, [report.jobId]: report },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          userId: state.user?.id || 'sys',
          userName: state.user?.name || 'System',
          userRole: state.user?.role || 'Coordinator',
          action: 'FINAL_REPORT_SAVED',
          recordType: 'FinalReport',
          recordId: report.jobId,
          newValue: `DocNo: ${report.documentNumber} (Locked: ${report.isLocked})`,
          timestamp: new Date().toISOString()
        },
        ...state.auditLogs
      ]
    }));
  },

  saveCloseout: async (closeout) => {
    set(state => ({
      closeouts: { ...state.closeouts, [closeout.jobId]: closeout },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          userId: state.user?.id || 'sys',
          userName: state.user?.name || 'System',
          userRole: state.user?.role || 'Project Manager',
          action: 'CLOSEOUT_UPDATED',
          recordType: 'CloseoutChecklist',
          recordId: closeout.jobId,
          newValue: `Billing Readiness: ${closeout.financial.billingReadiness}`,
          timestamp: new Date().toISOString()
        },
        ...state.auditLogs
      ]
    }));
  },

  saveEvaluation: async (evaluation) => {
    set(state => ({
      evaluations: { ...state.evaluations, [evaluation.jobId]: evaluation },
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          userId: state.user?.id || 'sys',
          userName: state.user?.name || 'System',
          userRole: state.user?.role || 'Project Manager',
          action: '5D_EVALUATION_RECORDED',
          recordType: 'PerformanceEvaluation5D',
          recordId: evaluation.jobId,
          newValue: `Score: ${evaluation.compositeScore}/100`,
          timestamp: new Date().toISOString()
        },
        ...state.auditLogs
      ]
    }));
  },

  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  },

  logAuditTrail: (entry) => {
    const fullEntry: AuditTrailEntry = {
      ...entry,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    set(state => ({ auditLogs: [fullEntry, ...state.auditLogs] }));
  },

  login: (user: User) => {
    localStorage.removeItem('ikm_logged_out');
    localStorage.setItem('ikm_user_profile', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.setItem('ikm_logged_out', 'true');
    localStorage.removeItem('ikm_user_profile');
    set({ user: null });
  },

  switchUser: (userOrEmp: User | Employee) => {
    localStorage.removeItem('ikm_logged_out');
    const newUser: User = {
      id: userOrEmp.id,
      name: userOrEmp.name,
      username: (userOrEmp as any).username,
      role: userOrEmp.role,
      userLevel: userOrEmp.userLevel || 'Technician',
      department: userOrEmp.department,
      departmentId: (userOrEmp as any).departmentId,
      avatar: (userOrEmp as any).avatarUrl || (userOrEmp as any).avatar || '',
      skills: userOrEmp.skills,
      phone: userOrEmp.phone,
      email: userOrEmp.email,
      bio: (userOrEmp as any).bio,
    };
    localStorage.setItem('ikm_user_profile', JSON.stringify(newUser));
    set({ user: newUser });
  },

  switchRole: (role: UserRole) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, role, userLevel: role };
      localStorage.setItem('ikm_user_profile', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  setFabOpen: (isFabOpen) => set({ isFabOpen }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleSidebarAutoHide: () => set((state) => ({ isSidebarAutoHide: !state.isSidebarAutoHide })),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setSidebarAutoHide: (isSidebarAutoHide) => set({ isSidebarAutoHide }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),

  addTask: async (task: Task) => {
    set(state => ({ tasks: [task, ...state.tasks] }));
    try {
      await SupabaseService.createTask(task);
    } catch (e) {
      console.warn('Supabase createTask fallback:', e);
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
    try {
      await SupabaseService.updateTask(id, updates);
    } catch (e) {
      console.warn('Supabase updateTask fallback:', e);
    }
  },

  deleteTask: async (id: string) => {
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
  },

  archiveTask: async (id: string) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, isArchived: true } : t)
    }));
  },

  addRequest: async (request: WorkRequest) => {
    set(state => ({ requests: [request, ...state.requests] }));
    try {
      await SupabaseService.createWorkRequest(request);
    } catch (e) {
      console.warn('Supabase createWorkRequest fallback:', e);
    }
  },

  updateRequest: async (id: string, updates: Partial<WorkRequest>, reason?: string) => {
    set(state => {
      const target = state.requests.find(r => r.id === id);
      const currentRev = target?.currentRevision || 1;
      const willRevise = updates.scopeOfWork && updates.scopeOfWork !== target?.scopeOfWork;
      
      const newRevisions = willRevise && target ? [
        ...(target.revisions || []),
        {
          revisionNo: currentRev,
          changedAt: new Date().toISOString(),
          changedBy: state.user?.name || 'User',
          changedRole: state.user?.role || 'Coordinator',
          reason: reason || 'Scope modification requested',
          scopeDelta: `Old: ${target.scopeOfWork} -> New: ${updates.scopeOfWork}`,
          previousData: target,
        }
      ] : (target?.revisions || []);

      return {
        requests: state.requests.map(r => r.id === id ? {
          ...r,
          ...updates,
          currentRevision: willRevise ? currentRev + 1 : currentRev,
          revisions: newRevisions,
          updatedAt: new Date().toISOString()
        } : r)
      };
    });

    try {
      await SupabaseService.updateWorkRequest(id, updates);
    } catch (e) {
      console.warn('Supabase updateWorkRequest fallback:', e);
    }
  },

  archiveRequest: async (id: string) => {
    set(state => ({
      requests: state.requests.map(r => r.id === id ? { ...r, isArchived: true } : r)
    }));
  },

  submitApproval: async (record) => {
    const newRecord: ApprovalRecord = {
      ...record,
      id: `appr-${Date.now()}`,
      approvedAt: new Date().toISOString(),
    };
    set(state => ({
      approvalRecords: [newRecord, ...state.approvalRecords]
    }));
  },

  updateEmployee: async (id, updates) => {
    set(state => ({
      employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  },

  addEmployee: async (employee) => {
    set(state => ({ employees: [employee, ...state.employees] }));
  },

  deleteEmployee: async (id) => {
    set(state => ({ employees: state.employees.filter(e => e.id !== id) }));
  },

  archiveEmployee: async (id) => {
    set(state => ({
      employees: state.employees.map(e => e.id === id ? { ...e, isArchived: true } : e)
    }));
  },

  updateUserAvatar: async (avatarUrl) => {
    set(state => {
      if (!state.user) return state;
      const updated = { ...state.user, avatar: avatarUrl || '' };
      localStorage.setItem('ikm_user_profile', JSON.stringify(updated));
      return { user: updated };
    });
  },

  updateUserProfile: async (updates) => {
    set(state => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      localStorage.setItem('ikm_user_profile', JSON.stringify(updated));
      return { user: updated };
    });
  },

  addEquipment: async (equipment) => {
    set(state => {
      const updated = [equipment, ...state.equipments];
      localStorage.setItem('ikm_equipment_list', JSON.stringify(updated));
      return { equipments: updated };
    });
  },

  updateEquipment: async (id, updates) => {
    set(state => {
      const updated = state.equipments.map(eq => eq.id === id ? { ...eq, ...updates } : eq);
      localStorage.setItem('ikm_equipment_list', JSON.stringify(updated));
      return { equipments: updated };
    });
  },

  deleteEquipment: async (id) => {
    set(state => {
      const updated = state.equipments.filter(eq => eq.id !== id);
      localStorage.setItem('ikm_equipment_list', JSON.stringify(updated));
      return { equipments: updated };
    });
  },

  archiveEquipment: async (id) => {
    set(state => {
      const updated = state.equipments.map(eq => eq.id === id ? { ...eq, isArchived: true } : eq);
      localStorage.setItem('ikm_equipment_list', JSON.stringify(updated));
      return { equipments: updated };
    });
  },
}));
