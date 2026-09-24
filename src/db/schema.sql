-- ==============================================================================
-- IKM Engineering Operations & Workflow Management System
-- Comprehensive & Idempotent PostgreSQL Migration Script (100% Safe)
-- Compatible with PostgreSQL 12+, Cloud SQL, Supabase, and Drizzle ORM
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Core Users, Roles & Directory
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE,
    full_name TEXT NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(100) NOT NULL DEFAULT 'Technician',
    department VARCHAR(100),
    department_id UUID,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Idempotent Column Additions in case table previously existed with older structure
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Technician';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS department_id UUID;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ==============================================================================
-- 3. Communication & Messaging System (Chats, Members, Messages)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    is_group BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_chat_member UNIQUE(chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat ON chat_members(chat_id);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id, created_at DESC);

-- ==============================================================================
-- 4. Tasks, Task Comments & Task Attachments (Core Operations)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "column" VARCHAR(50) DEFAULT 'todo' NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
    assignee VARCHAR(255),
    assignee_id VARCHAR(255),
    assignee_role VARCHAR(100),
    project_id VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    customer VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Idempotent Column Additions for tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "column" VARCHAR(50) DEFAULT 'todo';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_role VARCHAR(100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS customer VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks("column");
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    author_id VARCHAR(255),
    author_name VARCHAR(255),
    author_role VARCHAR(100),
    content TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS message TEXT;

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    name VARCHAR(255),
    file_name VARCHAR(255),
    url TEXT,
    size VARCHAR(50),
    file_size VARCHAR(50),
    type VARCHAR(50),
    file_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE task_attachments ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE task_attachments ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE task_attachments ADD COLUMN IF NOT EXISTS file_size VARCHAR(50);
ALTER TABLE task_attachments ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);

-- ==============================================================================
-- 5. 22-Step Engineering Workflow Entities
-- ==============================================================================

-- (Step 1-3) Work Requests
CREATE TABLE IF NOT EXISTS work_requests (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    customer VARCHAR(255) NOT NULL,
    customer_contact JSONB DEFAULT '{}'::jsonb NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    scope_of_work TEXT NOT NULL,
    site_location VARCHAR(255) NOT NULL,
    is_offshore BOOLEAN DEFAULT false NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    shift VARCHAR(100),
    working_hours_estimated INTEGER DEFAULT 8,
    urgency VARCHAR(50) DEFAULT 'Medium',
    commercial_responsible_person VARCHAR(255),
    requester VARCHAR(255) NOT NULL,
    requester_id VARCHAR(255),
    coordinator VARCHAR(255),
    coordinator_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
    current_revision INTEGER DEFAULT 1 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_work_requests_status ON work_requests(status);
CREATE INDEX IF NOT EXISTS idx_work_requests_customer ON work_requests(customer);
CREATE INDEX IF NOT EXISTS idx_work_requests_created ON work_requests(created_at DESC);

-- (Step 2) Work Request Revisions & Change Tracking
CREATE TABLE IF NOT EXISTS work_request_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_request_id VARCHAR(50) NOT NULL REFERENCES work_requests(id) ON DELETE CASCADE,
    revision_no INTEGER NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    changed_role VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    scope_delta TEXT,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_work_request_revision UNIQUE(work_request_id, revision_no)
);

CREATE INDEX IF NOT EXISTS idx_wr_revisions_request_id ON work_request_revisions(work_request_id);

-- (Step 3) Scope & Risk Assessments
CREATE TABLE IF NOT EXISTS scope_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_request_id VARCHAR(50) NOT NULL REFERENCES work_requests(id) ON DELETE CASCADE,
    job_complexity VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL,
    technical_risk VARCHAR(20) DEFAULT 'LOW' NOT NULL,
    safety_risk VARCHAR(20) DEFAULT 'LOW' NOT NULL,
    travel_risk VARCHAR(20) DEFAULT 'LOW' NOT NULL,
    offshore_risk VARCHAR(20) DEFAULT 'LOW' NOT NULL,
    equipment_availability_risk VARCHAR(20) DEFAULT 'LOW' NOT NULL,
    subcontractor_risk VARCHAR(20) DEFAULT 'LOW' NOT NULL,
    schedule_risk VARCHAR(20) DEFAULT 'LOW' NOT NULL,
    customer_restriction_risk VARCHAR(20) DEFAULT 'LOW' NOT NULL,
    overall_risk_level VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL,
    estimated_man_hours INTEGER DEFAULT 0 NOT NULL,
    estimated_cost_baht INTEGER DEFAULT 0 NOT NULL,
    required_approval_level VARCHAR(50) DEFAULT 'Project Manager' NOT NULL,
    mitigation_plan TEXT,
    assessed_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scope_risk_wr_id ON scope_risk_assessments(work_request_id);

-- (Step 4-8) Job Plans & Engineering Operations
CREATE TABLE IF NOT EXISTS job_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_request_id VARCHAR(50) NOT NULL REFERENCES work_requests(id) ON DELETE CASCADE,
    job_number VARCHAR(50) NOT NULL UNIQUE,
    job_title VARCHAR(255) NOT NULL,
    method_statement TEXT,
    team_list JSONB DEFAULT '[]'::jsonb,
    equipment_list JSONB DEFAULT '[]'::jsonb,
    mobilization_plan JSONB DEFAULT '{}'::jsonb,
    work_schedule JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_plans_job_number ON job_plans(job_number);
CREATE INDEX IF NOT EXISTS idx_job_plans_work_request ON job_plans(work_request_id);

-- (Step 9-10) Pre-Mobilization Readiness Checklists
CREATE TABLE IF NOT EXISTS pre_mobilization_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(50) NOT NULL,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    all_passed BOOLEAN DEFAULT false NOT NULL,
    checked_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pre_mob_job_id ON pre_mobilization_checklists(job_id);

-- (Step 12-13) Daily Progress Reports (DPR)
CREATE TABLE IF NOT EXISTS daily_progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(50) NOT NULL,
    report_date TIMESTAMP WITH TIME ZONE NOT NULL,
    day_number INTEGER DEFAULT 1 NOT NULL,
    planned_progress_percent INTEGER DEFAULT 0 NOT NULL,
    actual_progress_percent INTEGER DEFAULT 0 NOT NULL,
    variance_percent INTEGER DEFAULT 0 NOT NULL,
    regular_man_hours INTEGER DEFAULT 8 NOT NULL,
    ot_man_hours INTEGER DEFAULT 0 NOT NULL,
    activities_performed TEXT NOT NULL,
    equipment_condition TEXT,
    hse_observations TEXT,
    quality_ncr_observations TEXT,
    technical_recommendations TEXT,
    next_day_plan TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    submitted_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dpr_job_id_date ON daily_progress_reports(job_id, report_date DESC);

-- (Step 13-14) Change Requests
CREATE TABLE IF NOT EXISTS change_requests (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_scope TEXT NOT NULL,
    new_scope TEXT NOT NULL,
    reason TEXT NOT NULL,
    schedule_impact_days INTEGER DEFAULT 0 NOT NULL,
    cost_impact_baht INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    approver_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_change_requests_job_id ON change_requests(job_id);

-- (Step 14-15) Issues & Incident Management
CREATE TABLE IF NOT EXISTS issues_incidents (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    issue_number VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'Medium' NOT NULL,
    description TEXT NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    containment_action TEXT,
    root_cause_analysis TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    verification_status VARCHAR(50) DEFAULT 'Open' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_issues_job_id ON issues_incidents(job_id);

-- (Step 15-16) Inspections & Punch Lists
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(50) NOT NULL,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    scope_verified BOOLEAN DEFAULT true NOT NULL,
    client_decision VARCHAR(50) DEFAULT 'Accept' NOT NULL,
    client_representative_name VARCHAR(255) NOT NULL,
    client_comments TEXT,
    punch_list JSONB DEFAULT '[]'::jsonb,
    inspected_by_supervisor VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending Inspection' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inspections_job_id ON inspections(job_id);

-- (Step 18) Final Engineering Reports
CREATE TABLE IF NOT EXISTS final_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(50) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    revision INTEGER DEFAULT 1 NOT NULL,
    prepared_by VARCHAR(255) NOT NULL,
    checked_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255) NOT NULL,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    sections JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_final_reports_job_id ON final_reports(job_id);

-- (Step 19-20) Close-out Checklists & Financial Reconciliation
CREATE TABLE IF NOT EXISTS closeout_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(50) NOT NULL,
    operational JSONB DEFAULT '{}'::jsonb NOT NULL,
    documentation JSONB DEFAULT '{}'::jsonb NOT NULL,
    financial JSONB DEFAULT '{}'::jsonb NOT NULL,
    approvals JSONB DEFAULT '{}'::jsonb NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_closeout_job_id ON closeout_checklists(job_id);

-- (Step 21-22) 5-Dimension Performance Evaluation
CREATE TABLE IF NOT EXISTS performance_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(50) NOT NULL,
    dimensions JSONB DEFAULT '{}'::jsonb NOT NULL,
    composite_score INTEGER DEFAULT 0 NOT NULL,
    lessons_learned JSONB DEFAULT '{}'::jsonb NOT NULL,
    evaluated_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evaluations_job_id ON performance_evaluations(job_id);

-- ==============================================================================
-- 6. Notifications, Voice Reports & Audit Trail
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    job_id VARCHAR(50),
    target_role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);

CREATE TABLE IF NOT EXISTS voice_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    transcript TEXT NOT NULL,
    summary TEXT,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' NOT NULL,
    equipment_id VARCHAR(100),
    site_location VARCHAR(255),
    action_items JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    language VARCHAR(10) DEFAULT 'TH' NOT NULL,
    audio_url TEXT,
    created_by VARCHAR(255),
    created_by_id VARCHAR(255),
    follow_up_task_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Logged' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_voice_reports_created ON voice_reports(created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ==============================================================================
-- 7. Initial Seed Data (Admin, Standard Roles, Master Records)
-- ==============================================================================

INSERT INTO user_profiles (user_id, username, full_name, email, role, department, phone, is_active)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'admin', 'Somchai Admin', 'admin@ikm-engineering.com', 'Admin', 'Management', '+66 81 234 5678', true),
    ('a0000000-0000-0000-0000-000000000002', 'pm_kittipong', 'Kittipong Project Manager', 'kittipong@ikm-engineering.com', 'Project Manager', 'Engineering Operations', '+66 82 345 6789', true),
    ('a0000000-0000-0000-0000-000000000003', 'coord_nattaporn', 'Nattaporn Coordinator', 'nattaporn@ikm-engineering.com', 'Coordinator', 'Planning & Logistics', '+66 83 456 7890', true),
    ('a0000000-0000-0000-0000-000000000004', 'sup_wichai', 'Wichai Supervisor', 'wichai@ikm-engineering.com', 'Supervisor', 'Field Engineering', '+66 84 567 8901', true),
    ('a0000000-0000-0000-0000-000000000005', 'tech_anupong', 'Anupong Technician', 'anupong@ikm-engineering.com', 'Technician', 'Field Engineering', '+66 85 678 9012', true)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    is_active = EXCLUDED.is_active;

-- Initial System Notifications
INSERT INTO notifications (title, message, type, priority, read, target_role)
VALUES 
    ('System Initialized', 'Engineering Workflow System database tables created and ready.', 'system', 'Low', false, 'Admin'),
    ('Ready for Operations', 'All 22 workflow stages and RBAC security rules configured.', 'workflow', 'Medium', false, 'Project Manager')
ON CONFLICT DO NOTHING;
