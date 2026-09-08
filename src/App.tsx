import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Requests } from './pages/Requests';
import { CreateRequest } from './pages/CreateRequest';
import { More } from './pages/More';
import { Chat } from './pages/Chat';
import { Kanban } from './pages/Kanban';
import { MyDashboard } from './pages/MyDashboard';
import { Availability } from './pages/Availability';
import { ManpowerTimeline } from './pages/ManpowerTimeline';
import { TeamDashboard } from './pages/TeamDashboard';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { Portfolio } from './pages/Portfolio';
import { GanttChart } from './pages/GanttChart';
import { Workload } from './pages/Workload';
import { ApprovalCenter } from './pages/ApprovalCenter';
import { PerformanceScore } from './pages/PerformanceScore';
import { ScoreAudit } from './pages/ScoreAudit';
import { Reports } from './pages/Reports';
import { UsersAdmin } from './pages/UsersAdmin';
import { AuditLog } from './pages/AuditLog';
import { CalendarView } from './pages/CalendarView';
import { 
  ProjList, ProjCalendar, TaskMgmt, ProjBoard, SubProject,
  PhotoReport, CustomReport, AIAssist, VoiceReport, Security
} from './pages/Modules';
import { AppShell } from './components/layout/AppShell';

// Map store's activeTab to URL path
function RouteSync() {
  const location = useLocation();
  const { setActiveTab } = useStore();

  useEffect(() => {
    const path = location.pathname.substring(1) || 'home';
    if (['home', 'requests', 'tasks', 'calendar', 'more'].includes(path)) {
      setActiveTab(path as any);
    } else {
      setActiveTab('more'); // Fallback for other routes
    }
  }, [location, setActiveTab]);

  return null;
}

// Map bottom nav clicks to URL navigation
export function useNavigationSync() {
  const navigate = useNavigate();
  return (tab: string) => navigate(`/${tab === 'home' ? '' : tab}`);
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore(state => state.user);
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <AppShell>
      <RouteSync />
      {children}
    </AppShell>
  );
}

export default function App() {
  const user = useStore(state => state.user);
  const initSupabaseData = useStore(state => state.initSupabaseData);

  useEffect(() => {
    initSupabaseData();
  }, [initSupabaseData]);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        
        {/* Core Nav Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
        <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
        
        {/* Real Implemented Pages */}
        <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/kanban" element={<ProtectedRoute><Kanban /></ProtectedRoute>} />
        
        {/* Ops & Personnel */}
        <Route path="/my-dashboard" element={<ProtectedRoute><MyDashboard /></ProtectedRoute>} />
        <Route path="/employee-availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
        <Route path="/manpower" element={<ProtectedRoute><ManpowerTimeline /></ProtectedRoute>} />
        <Route path="/team-dashboard" element={<ProtectedRoute><TeamDashboard /></ProtectedRoute>} />
        
        {/* Projects */}
        <Route path="/proj-dashboard" element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/proj-list" element={<ProtectedRoute><ProjList /></ProtectedRoute>} />
        <Route path="/proj-calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
        <Route path="/task-mgmt" element={<ProtectedRoute><TaskMgmt /></ProtectedRoute>} />
        <Route path="/proj-board" element={<ProtectedRoute><ProjBoard /></ProtectedRoute>} />
        <Route path="/sub-project" element={<ProtectedRoute><SubProject /></ProtectedRoute>} />
        
        {/* Planning */}
        <Route path="/gantt" element={<ProtectedRoute><GanttChart /></ProtectedRoute>} />
        <Route path="/workload" element={<ProtectedRoute><Workload /></ProtectedRoute>} />
        
        {/* Governance */}
        <Route path="/approval" element={<ProtectedRoute><ApprovalCenter /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><PerformanceScore /></ProtectedRoute>} />
        <Route path="/score-audit" element={<ProtectedRoute><ScoreAudit /></ProtectedRoute>} />
        
        {/* Reports */}
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/photo-report" element={<ProtectedRoute><PhotoReport /></ProtectedRoute>} />
        <Route path="/custom-report" element={<ProtectedRoute><CustomReport /></ProtectedRoute>} />
        
        {/* AI & Admin */}
        <Route path="/ai-assist" element={<ProtectedRoute><AIAssist /></ProtectedRoute>} />
        <Route path="/ai-voice" element={<ProtectedRoute><VoiceReport /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersAdmin /></ProtectedRoute>} />
        <Route path="/audit-log" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}




