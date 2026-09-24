import { pgTable, text, timestamp, boolean, varchar, uuid, integer, jsonb } from 'drizzle-orm/pg-core';

// 1. Existing Chats & Messages
export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  isGroup: boolean('is_group').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMembers = pgTable('chat_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id).notNull(),
  senderId: varchar('sender_id', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tasks, Task Comments & Attachments (Core Operations)
export const tasks = pgTable('tasks', {
  id: varchar('id', { length: 50 }).primaryKey().$defaultFn(() => `task-${Date.now()}`),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  column: varchar('column', { length: 50 }).default('todo'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  progress: integer('progress').default(0).notNull(),
  assignee: varchar('assignee', { length: 255 }),
  assigneeId: varchar('assignee_id', { length: 255 }),
  assigneeRole: varchar('assignee_role', { length: 100 }),
  projectId: varchar('project_id', { length: 255 }),
  dueDate: timestamp('due_date'),
  location: varchar('location', { length: 255 }),
  customer: varchar('customer', { length: 255 }),
  tags: jsonb('tags').default('[]'),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: varchar('task_id', { length: 50 }).notNull(),
  userId: varchar('user_id', { length: 255 }),
  authorId: varchar('author_id', { length: 255 }),
  authorName: varchar('author_name', { length: 255 }),
  authorRole: varchar('author_role', { length: 100 }),
  content: text('content'),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taskAttachments = pgTable('task_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: varchar('task_id', { length: 50 }).notNull(),
  userId: varchar('user_id', { length: 255 }),
  name: varchar('name', { length: 255 }),
  fileName: varchar('file_name', { length: 255 }),
  url: text('url'),
  size: varchar('size', { length: 50 }),
  fileSize: varchar('file_size', { length: 50 }),
  type: varchar('type', { length: 50 }),
  fileType: varchar('file_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// 2. Core Users & User Profiles
export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey(),
  username: varchar('username', { length: 100 }),
  fullName: text('full_name').notNull(),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 100 }).default('Technician').notNull(),
  department: varchar('department', { length: 100 }),
  departmentId: uuid('department_id'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Work Requests (Step 1-3)
export const workRequests = pgTable('work_requests', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g. WR-2026-0001
  title: varchar('title', { length: 255 }).notNull(),
  customer: varchar('customer', { length: 255 }).notNull(),
  customerContact: jsonb('customer_contact').notNull().default('{}'),
  serviceCategory: varchar('service_category', { length: 100 }).notNull(),
  scopeOfWork: text('scope_of_work').notNull(),
  siteLocation: varchar('site_location', { length: 255 }).notNull(),
  isOffshore: boolean('is_offshore').default(false).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  shift: varchar('shift', { length: 100 }),
  workingHoursEstimated: integer('working_hours_estimated').default(8),
  urgency: varchar('urgency', { length: 50 }).default('Medium'),
  commercialResponsiblePerson: varchar('commercial_responsible_person', { length: 255 }),
  requester: varchar('requester', { length: 255 }).notNull(),
  requesterId: varchar('requester_id', { length: 255 }),
  coordinator: varchar('coordinator', { length: 255 }),
  coordinatorId: varchar('coordinator_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('Draft'),
  progress: integer('progress').default(0).notNull(),
  currentRevision: integer('current_revision').default(1).notNull(),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Work Request Revisions
export const workRequestRevisions = pgTable('work_request_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workRequestId: varchar('work_request_id', { length: 50 }).references(() => workRequests.id).notNull(),
  revisionNo: integer('revision_no').notNull(),
  changedBy: varchar('changed_by', { length: 255 }).notNull(),
  changedRole: varchar('changed_role', { length: 100 }).notNull(),
  reason: text('reason').notNull(),
  scopeDelta: text('scope_delta'),
  snapshotData: jsonb('snapshot_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Scope & Risk Assessments (Step 3)
export const scopeRiskAssessments = pgTable('scope_risk_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  workRequestId: varchar('work_request_id', { length: 50 }).references(() => workRequests.id).notNull(),
  jobComplexity: varchar('job_complexity', { length: 20 }).notNull().default('MEDIUM'),
  technicalRisk: varchar('technical_risk', { length: 20 }).notNull().default('LOW'),
  safetyRisk: varchar('safety_risk', { length: 20 }).notNull().default('LOW'),
  travelRisk: varchar('travel_risk', { length: 20 }).notNull().default('LOW'),
  offshoreRisk: varchar('offshore_risk', { length: 20 }).notNull().default('LOW'),
  equipmentAvailabilityRisk: varchar('equipment_availability_risk', { length: 20 }).notNull().default('LOW'),
  subcontractorRisk: varchar('subcontractor_risk', { length: 20 }).notNull().default('LOW'),
  scheduleRisk: varchar('schedule_risk', { length: 20 }).notNull().default('LOW'),
  customerRestrictionRisk: varchar('customer_restriction_risk', { length: 20 }).notNull().default('LOW'),
  overallRiskLevel: varchar('overall_risk_level', { length: 20 }).notNull().default('MEDIUM'),
  estimatedManHours: integer('estimated_man_hours').default(0).notNull(),
  estimatedCostBaht: integer('estimated_cost_baht').default(0).notNull(),
  requiredApprovalLevel: varchar('required_approval_level', { length: 50 }).notNull().default('Project Manager'),
  mitigationPlan: text('mitigation_plan'),
  assessedBy: varchar('assessed_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Job Plans & Engineering Operations (Step 4-8)
export const jobPlans = pgTable('job_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  workRequestId: varchar('work_request_id', { length: 50 }).references(() => workRequests.id).notNull(),
  jobNumber: varchar('job_number', { length: 50 }).notNull(),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  methodStatement: text('method_statement'),
  teamList: jsonb('team_list').default('[]'),
  equipmentList: jsonb('equipment_list').default('[]'),
  mobilizationPlan: jsonb('mobilization_plan').default('{}'),
  workSchedule: jsonb('work_schedule').default('[]'),
  status: varchar('status', { length: 50 }).default('Draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Daily Progress Reports (Step 12-13)
export const dailyProgressReports = pgTable('daily_progress_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: varchar('job_id', { length: 50 }).notNull(),
  reportDate: timestamp('report_date').notNull(),
  dayNumber: integer('day_number').default(1).notNull(),
  plannedProgressPercent: integer('planned_progress_percent').default(0).notNull(),
  actualProgressPercent: integer('actual_progress_percent').default(0).notNull(),
  variancePercent: integer('variance_percent').default(0).notNull(),
  regularManHours: integer('regular_man_hours').default(8).notNull(),
  otManHours: integer('ot_man_hours').default(0).notNull(),
  activitiesPerformed: text('activities_performed').notNull(),
  equipmentCondition: text('equipment_condition'),
  hseObservations: text('hse_observations'),
  qualityNcrObservations: text('quality_ncr_observations'),
  nextDayPlan: text('next_day_plan'),
  photos: jsonb('photos').default('[]'),
  submittedBy: varchar('submitted_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Change Requests (Step 13-14)
export const changeRequests = pgTable('change_requests', {
  id: varchar('id', { length: 50 }).primaryKey(),
  jobId: varchar('job_id', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  originalScope: text('original_scope').notNull(),
  newScope: text('new_scope').notNull(),
  reason: text('reason').notNull(),
  scheduleImpactDays: integer('schedule_impact_days').default(0).notNull(),
  costImpactBaht: integer('cost_impact_baht').default(0).notNull(),
  status: varchar('status', { length: 50 }).default('Draft').notNull(),
  requesterName: varchar('requester_name', { length: 255 }).notNull(),
  approverName: varchar('approver_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Issues & Incident Management (Step 14-15)
export const issuesIncidents = pgTable('issues_incidents', {
  id: varchar('id', { length: 50 }).primaryKey(),
  jobId: varchar('job_id', { length: 50 }).notNull(),
  issueNumber: varchar('issue_number', { length: 50 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull().default('Medium'),
  description: text('description').notNull(),
  ownerName: varchar('owner_name', { length: 255 }).notNull(),
  containmentAction: text('containment_action'),
  rootCauseAnalysis: text('root_cause_analysis'),
  correctiveAction: text('corrective_action'),
  preventiveAction: text('preventive_action'),
  verificationStatus: varchar('verification_status', { length: 50 }).default('Open').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Inspections & Punch Lists (Step 15-16)
export const inspections = pgTable('inspections', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: varchar('job_id', { length: 50 }).notNull(),
  inspectionDate: timestamp('inspection_date').defaultNow().notNull(),
  scopeVerified: boolean('scope_verified').default(true).notNull(),
  clientDecision: varchar('client_decision', { length: 50 }).default('Accept').notNull(),
  clientRepresentativeName: varchar('client_representative_name', { length: 255 }).notNull(),
  clientComments: text('client_comments'),
  punchList: jsonb('punch_list').default('[]'),
  inspectedBySupervisor: varchar('inspected_by_supervisor', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('Pending Inspection').notNull(),
});

// 11. Final Reports (Step 18)
export const finalReports = pgTable('final_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: varchar('job_id', { length: 50 }).notNull(),
  documentNumber: varchar('document_number', { length: 100 }).notNull(),
  revision: integer('revision').default(1).notNull(),
  preparedBy: varchar('prepared_by', { length: 255 }).notNull(),
  checkedBy: varchar('checked_by', { length: 255 }).notNull(),
  approvedBy: varchar('approved_by', { length: 255 }).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  sections: jsonb('sections').default('{}').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Close-out Checklists & Financials (Step 19-20)
export const closeoutChecklists = pgTable('closeout_checklists', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: varchar('job_id', { length: 50 }).notNull(),
  operational: jsonb('operational').default('{}').notNull(),
  documentation: jsonb('documentation').default('{}').notNull(),
  financial: jsonb('financial').default('{}').notNull(),
  approvals: jsonb('approvals').default('{}').notNull(),
  status: varchar('status', { length: 50 }).default('In Progress').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. 5-Dimension Performance Evaluation (Step 21-22)
export const performanceEvaluations = pgTable('performance_evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: varchar('job_id', { length: 50 }).notNull(),
  dimensions: jsonb('dimensions').default('{}').notNull(),
  compositeScore: integer('composite_score').default(0).notNull(),
  lessonsLearned: jsonb('lessons_learned').default('{}').notNull(),
  evaluatedBy: varchar('evaluated_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Notifications & Audit Logs (Step 23-24)
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  priority: varchar('priority', { length: 20 }).default('Medium').notNull(),
  read: boolean('read').default(false).notNull(),
  jobId: varchar('job_id', { length: 50 }),
  targetRole: varchar('target_role', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  userRole: varchar('user_role', { length: 100 }).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  recordType: varchar('record_type', { length: 100 }).notNull(),
  recordId: varchar('record_id', { length: 100 }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
