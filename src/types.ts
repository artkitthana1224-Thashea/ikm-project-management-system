export type TaskStatus = 
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Returned for Information'
  | 'Pending Management Review'
  | 'Assessment'
  | 'Planning'
  | 'Pending Approval'
  | 'Approved'
  | 'Assigned'
  | 'Confirmed'
  | 'Pre-Mobilization'
  | 'Mobilized'
  | 'In Progress'
  | 'Pending Inspection'
  | 'Rectification Required'
  | 'Work Completed'
  | 'Final Report Submitted'
  | 'Pending Close'
  | 'Closed'
  | 'On Hold'
  | 'Rejected'
  | 'Cancelled'
  | 'Reopened'
  // Backward compatibility aliases
  | 'Completed' | 'Available' | 'Active' | 'Warning' | 'Partial' | 'Critical' | 'Overdue' | 'Conflict' | 'Training' | 'Leave' | 'Unavailable' | 'Pending' | 'Review' | 'Accepted';

export type UserRole = 
  | 'Admin' 
  | 'Country Manager' 
  | 'Operation Manager'
  | 'Project Manager'
  | 'Manager' 
  | 'Coordinator' 
  | 'Supervisor' 
  | 'Technician' 
  | 'Equipment Controller'
  | 'QA/QC'
  | 'HSE'
  | 'Finance'
  | 'Requester'
  | 'Sales / Requester'
  | 'Customer';

export interface User {
  id: string;
  name: string;
  username?: string;
  password?: string;
  role: string;
  userLevel?: UserRole;
  avatar: string;
  department: string;
  departmentId?: string;
  skills?: string[];
  phone?: string;
  email?: string;
  bio?: string;
  baseLocation?: string;
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
  departmentId?: string;
  avatarColor: string;
  avatarUrl?: string;
  availability: 'available' | 'busy' | 'on-leave' | 'off-shift';
  utilization: number;
  score: number;
  skills: string[];
  phone?: string;
  email?: string;
  bio?: string;
  education?: string[];
  experiences?: {
    period: string;
    position: string;
    company: string;
    description: string;
  }[];
  cv?: EmployeeCV;
  certificates?: EmployeeCertificate[];
  isArchived?: boolean;
  baseLocation?: 'IKM Rayong (RY)' | 'IKM Laem Chabang (LKU)' | 'Offshore Rig' | 'Mobile' | string;
  medicalExpiryDate?: string;
  trainingExpiryDate?: string;
  offshoreCertified?: boolean;
  currentAssignment?: string;
  workloadHours?: number;
}

export type EquipmentStatus = 
  | 'Available' 
  | 'Reserved' 
  | 'Checked Out' 
  | 'In Use' 
  | 'In Transit' 
  | 'Under Inspection' 
  | 'Under Maintenance' 
  | 'Calibration Due' 
  | 'Damaged' 
  | 'Lost' 
  | 'Retired';

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
  brand?: string;
  model?: string;
  serialNumber: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  location?: string;
  baseLocation?: string;
  assignedProject?: string;
  assignedJobId?: string;
  assignedOperator?: string;
  assignedSupervisor?: string;
  nextAvailableDate?: string;
  calibrationStatus?: 'Valid' | 'Due Soon' | 'Expired' | 'Under Calibration';
  lastInspection?: string;
  calibrationDue?: string;
  calibrationDueDate?: string;
  maintenanceStatus?: 'Good' | 'Maintenance Required' | 'In Repair';
  accessories?: string[];
  responsiblePerson?: string;
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
  jobId?: string;
  approverId: string;
  approverName: string;
  approverRole: UserRole | string;
  decision: 'Approved' | 'Rejected' | 'Returned for Information';
  reason: string;
  approvedAt: string;
  revision: number;
}

// 1. Work Request & Revisions
export interface WorkRequestRevision {
  revisionNo: number;
  changedAt: string;
  changedBy: string;
  changedRole: string;
  reason: string;
  scopeDelta: string;
  previousData: Partial<WorkRequest>;
}

export interface WorkRequestAttachment {
  id: string;
  name: string;
  type: 'PO' | 'Quotation' | 'Drawing' | 'Datasheet' | 'Procedure' | 'Other';
  fileUrl: string;
  fileSize?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WorkRequestComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface WorkRequest {
  id: string; // e.g. WR-2026-0042
  title: string;
  jobNumber?: string; // e.g. JOB-2026-018
  projectReferenceNumber?: string;
  customer?: string;
  customerContact?: {
    name: string;
    phone: string;
    email: string;
    position?: string;
  };
  serviceCategory?: 'Flange Management' | 'Hydrotesting' | 'Nitrogen Purging' | 'Pipeline Pigging' | 'Valve Maintenance' | 'Instrumentation & Calibration' | 'On-site Machining' | 'General Engineering' | string;
  scopeOfWork?: string;
  siteLocation?: string;
  isOffshore?: boolean;
  startDate?: string;
  endDate?: string;
  shift?: 'Day Shift (08:00 - 17:00)' | 'Night Shift (20:00 - 05:00)' | '24-Hour Rotating (2 Shifts)' | '12-Hour Shift (07:00 - 19:00)' | string;
  workingHoursEstimated?: number;
  requiredManpower?: {
    role: string;
    quantity: number;
    skillRequirement?: string[];
    certificateRequirement?: string[];
  }[];
  requiredMainEquipmentIds?: string[];
  hseRequirements?: string[];
  qaQcRequirements?: string[];
  requiredReports?: string[];
  urgency?: 'Low' | 'Medium' | 'High' | 'Emergency / Critical';
  commercialResponsiblePerson?: string;
  requester: string;
  requesterId?: string;
  coordinator?: string;
  coordinatorId?: string;
  status: TaskStatus;
  progress: number;
  description?: string;
  attachments?: WorkRequestAttachment[];
  revisions?: WorkRequestRevision[];
  comments?: WorkRequestComment[];
  approvals?: ApprovalRecord[];
  currentRevision?: number;
  project?: string;
  projectId?: string;
  responsibleManager?: string;
  baseLocation?: string;
  priority?: 'High' | 'Medium' | 'Low' | 'Critical';
  dueDate?: string;
  assignedTo?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  reviewNotes?: string;
}

// 2. Risk & Complexity Assessment
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ScopeRiskAssessment {
  id: string;
  workRequestId: string;
  jobComplexity: RiskLevel;
  technicalRisk: RiskLevel;
  safetyRisk: RiskLevel;
  travelRisk: RiskLevel;
  offshoreRisk: RiskLevel;
  equipmentAvailabilityRisk: RiskLevel;
  subcontractorRisk: RiskLevel;
  scheduleRisk: RiskLevel;
  customerRestrictionRisk: RiskLevel;
  overallRiskLevel: RiskLevel;
  estimatedManHours: number;
  estimatedCostBaht: number;
  requiredApprovalLevel: 'Coordinator' | 'Project Manager' | 'Operations Manager' | 'Country Manager';
  subcontractorRequirement?: string;
  mitigationPlan: string;
  assessedBy: string;
  assessedAt: string;
}

// 3. Crew Template & Personnel Allocation
export interface CrewMemberAssignment {
  employeeId: string;
  employeeName: string;
  roleInCrew: 'Supervisor' | 'Lead Mechanical Tech' | 'Senior Tech' | 'Junior Tech' | 'Safety Officer' | 'QA Inspector';
  status: 'Proposed' | 'Reserved' | 'Assigned' | 'Confirmed' | 'Mobilized' | 'Working' | 'Demobilized' | 'Released';
  confirmedAt?: string;
  confirmationStatus?: 'Accepted' | 'Unable to Accept' | 'Pending';
  declineReason?: string;
}

export interface CrewTemplate {
  id: string;
  name: string; // e.g. "1 Supervisor + 2 Technicians"
  structure: { role: string; count: number }[];
}

// 4. Equipment Reservation & Checklist
export interface EquipmentReservationItem {
  equipmentId: string;
  equipmentName: string;
  serialNumber: string;
  status: EquipmentStatus;
  startDate: string;
  endDate: string;
  alternativeEquipmentId?: string;
  rentalRequired?: boolean;
  purchaseRequired?: boolean;
}

export interface EquipmentDispatchChecklist {
  id: string;
  jobId: string;
  equipmentId: string;
  equipmentName: string;
  visualInspection: boolean;
  functionalTest: boolean;
  calibrationCertificateValid: boolean;
  powerBatteryChecked: boolean;
  cableChecked: boolean;
  adapterChecked: boolean;
  accessoriesChecked: boolean;
  consumablesPacked: boolean;
  packingListVerified: boolean;
  photos: string[];
  issuedBy: string;
  receivedBy: string;
  signatureDate: string;
  notes?: string;
}

// 5. Job Plan
export interface JobPlan {
  id: string;
  workRequestId: string;
  jobNumber: string;
  jobTitle: string;
  scopeOfWork: string;
  methodStatement: string;
  teamList: CrewMemberAssignment[];
  responsibilityMatrix: { taskName: string; responsibleRole: string; accountableRole: string }[];
  equipmentList: EquipmentReservationItem[];
  consumablesList: { item: string; quantity: string }[];
  mobilizationPlan: {
    departDate: string;
    departLocation: string;
    transportMode: string;
    accommodationDetails: string;
    siteContactPerson: string;
  };
  workSchedule: { phase: string; startDate: string; endDate: string; deliverable: string }[];
  communicationPlan: string;
  reportingRequirement: string[];
  hsePlan: string;
  qaQcPlan: string;
  approvals: ApprovalRecord[];
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Revision Required';
  createdAt: string;
  approvedAt?: string;
}

// 6. Pre-Mobilization Checklist (17 items)
export interface PreMobilizationChecklist {
  id: string;
  jobId: string;
  items: {
    key: string;
    title: string;
    status: 'Pending' | 'Completed' | 'Not Applicable' | 'Issue';
    checkedBy?: string;
    checkedAt?: string;
    evidenceNotes?: string;
  }[];
  overallStatus: 'Pending' | 'Ready for Mobilization' | 'Blocked';
  signOffBy?: string;
  signOffAt?: string;
}

// 7. Daily Progress Report (DPR)
export interface DailyProgressReport {
  id: string;
  jobId: string;
  reportDate: string;
  dayNumber: number;
  plannedProgressPercent: number;
  actualProgressPercent: number;
  variancePercent: number; // actual - planned
  regularManHours: number;
  otManHours: number;
  activitiesPerformed: string;
  quantityCompleted: string;
  equipmentCondition: string;
  inspectionResults: string;
  measurementsRecorded?: string;
  hseObservations: string;
  qualityNcrObservations?: string;
  reworkRequired?: boolean;
  delaysEncountered?: string;
  delayReason?: string;
  technicalRecommendations?: string;
  clientInstructions?: string;
  correctiveActionsTaken?: string;
  nextDayPlan: string;
  photos: string[];
  technicianNotes?: { techName: string; time: string; note: string }[];
  submittedBy: string;
  submittedAt: string;
}

// 8. Change Request (CR)
export interface ChangeRequest {
  id: string; // e.g. CR-2026-001
  jobId: string;
  workRequestId: string;
  title: string;
  originalScope: string;
  newScope: string;
  reason: string;
  scheduleImpactDays: number;
  manpowerImpact: string;
  equipmentImpact: string;
  costImpactBaht: number;
  safetyImpact: string;
  qualityImpact: string;
  requesterName: string;
  requesterRole: string;
  approverName?: string;
  approverRole?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  decisionReason?: string;
  decisionDate?: string;
  createdAt: string;
}

// 9. Issue & Incident Management
export interface IssueIncident {
  id: string; // e.g. ISS-001
  jobId: string;
  issueNumber: string;
  type: 'Technical Issue' | 'Equipment Breakdown' | 'Resource Shortage' | 'Quality NCR' | 'Safety Incident' | 'Customer Complaint' | 'Schedule Delay' | 'Commercial Issue';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  ownerName: string;
  dueDate: string;
  containmentAction: string;
  rootCauseAnalysis: string;
  correctiveAction: string;
  preventiveAction: string;
  evidenceUrls: string[];
  verificationStatus: 'Open' | 'Under Investigation' | 'CAPA Implemented' | 'Verified & Closed';
  closedDate?: string;
  createdAt: string;
}

// 10. Inspection & Client Acceptance
export interface PunchListItem {
  id: string;
  itemDescription: string;
  rectificationPlan: string;
  assignedTo: string;
  targetDate: string;
  status: 'Open' | 'Rectified' | 'Verified Closed';
}

export interface InspectionRecord {
  id: string;
  jobId: string;
  inspectionDate: string;
  scopeVerified: boolean;
  measurementsVerified: boolean;
  testResultsAcceptable: boolean;
  acceptanceCriteriaMet: boolean;
  housekeepingComplete: boolean;
  punchList: PunchListItem[];
  clientDecision: 'Accept' | 'Accept with Comments' | 'Create Punch List' | 'Reject';
  clientRepresentativeName: string;
  clientSignatureDate?: string;
  clientComments?: string;
  inspectedBySupervisor: string;
  status: 'Pending Inspection' | 'Rectification Required' | 'Accepted';
}

// 11. Equipment Return Checklist
export interface EquipmentReturnChecklist {
  id: string;
  jobId: string;
  equipmentId: string;
  equipmentName: string;
  serialNumber: string;
  accessoriesComplete: boolean;
  physicalCondition: 'Normal' | 'Damaged' | 'Needs Cleaning' | 'Lost';
  usageHoursLogged: number;
  repairRequired: boolean;
  recalibrationRequired: boolean;
  photos: string[];
  senderName: string;
  receiverName: string;
  returnedAt: string;
  resultingStatus: EquipmentStatus;
}

// 12. Final Report (Document Control & 18 Sections)
export interface FinalReport {
  id: string;
  jobId: string;
  documentNumber: string; // e.g. IKM-FR-2026-018
  revision: number;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  issueDate: string;
  isLocked: boolean;
  sections: {
    executiveSummary: string;
    projectInformation: string;
    scopeOfWork: string;
    applicableStandards: string;
    personnelInvolved: string;
    equipmentAndCalibration: string;
    methodology: string;
    workPerformedSummary: string;
    inspectionAndTestResults: string;
    findingsAndObservations: string;
    deviationsAndMoc: string;
    correctiveActions: string;
    photosAndEvidence: string[];
    conclusions: string;
    recommendations: string;
    appendices: string;
    clientAcceptanceSummary: string;
  };
  revisionsHistory: { rev: number; changedBy: string; date: string; summary: string }[];
}

// 13. Close-out Checklist & Financials
export interface CloseoutChecklist {
  id: string;
  jobId: string;
  operational: {
    scopeComplete: boolean;
    punchListClosed: boolean;
    personnelReleased: boolean;
    equipmentReturned: boolean;
    consumablesRecorded: boolean;
    timesheetApproved: boolean;
  };
  documentation: {
    dailyReportsArchived: boolean;
    finalReportApproved: boolean;
    clientAcceptanceSigned: boolean;
    ncrIncidentsClosed: boolean;
    evidencePhotosStored: boolean;
  };
  financial: {
    actualTotalManHours: number;
    otHours: number;
    allowancesBaht: number;
    travelExpensesBaht: number;
    equipmentRentalBaht: number;
    repairsBaht: number;
    variationOrderAmountBaht: number;
    billingReadiness: 'Ready for Invoice' | 'Pending Cost Finalization' | 'Invoiced';
  };
  approvals: {
    supervisorSignOff?: { name: string; date: string };
    coordinatorSignOff?: { name: string; date: string };
    projectManagerSignOff?: { name: string; date: string };
    billingSignOff?: { name: string; date: string };
  };
  status: 'In Progress' | 'Closed';
  closedAt?: string;
}

// 14. 5-Dimension Performance Evaluation & Lessons Learned
export interface PerformanceEvaluation5D {
  id: string;
  jobId: string;
  employeeId?: string;
  overallJobEvaluation?: boolean;
  dimensions: {
    safetyAndCompliance: { score: number; weight: 25; notes: string };
    quality: { score: number; weight: 25; notes: string };
    deliveryAndSchedule: { score: number; weight: 20; notes: string };
    costAndProductivity: { score: number; weight: 15; notes: string };
    customerAndTeamwork: { score: number; weight: 15; notes: string };
  };
  compositeScore: number; // Weighted calculation out of 100
  lessonsLearned: {
    whatWentWell: string;
    whatCouldBeImproved: string;
    rootCauseOfChallenges: string;
    preventiveRecommendationsForFuture: string;
  };
  evaluatedBy: string;
  evaluatedAt: string;
}

// 15. In-App Notification Item
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'New Work Request' | 'Returned Request' | 'Approval Required' | 'Assignment' | 'Equipment Conflict' | 'Certificate Expiry' | 'Calibration Expiry' | 'Mobilization' | 'Daily Report Missing' | 'Issue Critical' | 'Inspection' | 'Punch List' | 'Final Report' | 'Close-out' | 'Billing Ready';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
  read: boolean;
  jobId?: string;
  requestId?: string;
  targetRole?: UserRole;
  createdAt: string;
}

// 16. Audit Trail Entry
export interface AuditTrailEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  recordType: string;
  recordId: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
  ipSession?: string;
}

// Legacy Task Model for Compatibility
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
  createdAt?: string;
  createdBy?: string;
  createdById?: string;
  followUpTaskId?: string;
  status?: 'Logged' | 'Action Scheduled' | 'Resolved' | 'Recorded';
}
