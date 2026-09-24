import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  WorkRequest, TaskStatus, ScopeRiskAssessment, JobPlan, 
  DailyProgressReport, ChangeRequest, 
  IssueIncident, InspectionRecord, FinalReport, CloseoutChecklist, 
  PerformanceEvaluation5D, EquipmentReturnChecklist, CrewMemberAssignment
} from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Workflow, ArrowRight, CheckCircle2, AlertTriangle, Clock, ShieldCheck, 
  Wrench, Users, FileText, Send, XCircle, RotateCcw, Lock, ChevronRight,
  TrendingUp, Layers, CheckSquare, Plus, AlertCircle, FileCheck, DollarSign,
  Star, Award, BookOpen, RefreshCw, MessageSquare, ClipboardCheck,
  Calendar, Check, AlertOctagon, HelpCircle, Eye, Sliders, ThumbsUp,
  ThumbsDown, ChevronDown, Activity, Truck, UserCheck, ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkflowEngine } from '../lib/workflowEngine';
import { getUserRole } from '../lib/rbac';

export function EngineeringWorkflow() {
  const { 
    language, 
    requests, 
    user, 
    assessments, 
    jobPlans, 
    preMobChecklists, 
    dprs, 
    changeRequests, 
    issues, 
    inspections, 
    finalReports, 
    closeouts, 
    evaluations, 
    equipments, 
    employees, 
    auditLogs,
    executeWorkflowTransition,
    saveAssessment,
    saveJobPlan,
    savePreMobChecklist,
    saveDPR,
    saveChangeRequest,
    saveIssue,
    saveInspection,
    saveFinalReport,
    saveCloseout,
    saveEvaluation,
    updateRequest
  } = useStore();

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    requests.length > 0 ? requests[0].id : ''
  );
  
  // Navigation tabs matching the 15 detailed engineering lifecycle steps
  const [activeStepTab, setActiveStepTab] = useState<
    'overview' | 'review' | 'assessment' | 'manpower' | 'equipment' | 'jobplan' | 'confirmation' | 'pre-mob' | 'execution' | 'dpr' | 'change' | 'issues' | 'inspection' | 'return' | 'final-report' | 'closeout' | 'evaluation' | 'audit'
  >('overview');

  const [transitionReason, setTransitionReason] = useState('');
  const [transitionTarget, setTransitionTarget] = useState<TaskStatus | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New DPR Modal / Form State
  const [showDprModal, setShowDprModal] = useState(false);
  const [dprForm, setDprForm] = useState({
    dayNumber: 1,
    plannedProgressPercent: 50,
    actualProgressPercent: 48,
    regularManHours: 8,
    otManHours: 2,
    activitiesPerformed: '',
    equipmentCondition: 'All instruments normal and within calibration spec',
    hseObservations: 'Toolbox Talk completed. Zero incidents recorded.',
    qualityNcrObservations: 'Acceptance criteria verified with client rep.',
    delayReason: '',
    nextDayPlan: 'Continue hydrotesting and witness joint inspection.',
    submittedBy: user?.name || 'Supervisor Wichai'
  });

  // Change Request Modal / Form State
  const [showCrModal, setShowCrModal] = useState(false);
  const [crForm, setCrForm] = useState({
    title: '',
    originalScope: '',
    newScope: '',
    reason: '',
    scheduleImpactDays: 1,
    costImpactBaht: 25000,
    requesterName: user?.name || 'Supervisor'
  });

  // New Issue Modal / Form State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    type: 'Technical Issue' as const,
    severity: 'Medium' as const,
    description: '',
    containmentAction: '',
    rootCauseAnalysis: '',
    correctiveAction: '',
    preventiveAction: '',
    ownerName: user?.name || 'Supervisor Wichai'
  });

  // 5D Evaluation State
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState({
    // Dimension 1: Safety (25 pts)
    noLti: 8,
    jsaPermitPpe: 5,
    toolboxHseRecord: 4,
    hazardReporting: 3,
    certCompliance: 3,
    safetyActionClosed: 2,
    // Dimension 2: Quality (25 pts)
    firstTimePass: 8,
    noRework: 5,
    technicalReportAccuracy: 5,
    correctStandardUsed: 3,
    ncrPunchlistClosed: 2,
    photosDocsComplete: 2,
    // Dimension 3: Delivery (20 pts)
    onTimeMob: 4,
    onTimeStart: 3,
    onTimeCompletion: 6,
    dailyReportSla: 3,
    finalReportSla: 4,
    // Dimension 4: Cost & Productivity (15 pts)
    manhoursWithinPlan: 4,
    otBudgetControl: 3,
    equipmentEfficiency: 3,
    lowIdleTime: 2,
    expensesWithinBudget: 3,
    // Dimension 5: Customer & Teamwork (15 pts)
    customerSatisfaction: 5,
    communicationResponsiveness: 3,
    teamCollaboration: 3,
    disciplineResponsibility: 2,
    knowledgeSharing: 2,
    // Role evaluated
    evaluatedRole: 'Supervisor' as const,
    evaluatedPerson: 'Wichai Supervisor',
    lessonsLearned: {
      whatWentWell: 'Excellent pre-job briefing with client team. Completed flange testing 2 hours ahead of schedule.',
      whatCouldBeImproved: 'Bring spare hydraulic hoses for high-pressure pack.',
      rootCauseOfChallenges: 'Limited crane access during morning deck operations.',
      preventiveRecommendationsForFuture: 'Implement mandatory digital sign-off on pre-mob checklist prior to base departure.'
    }
  });

  const currentRequest = requests.find(r => r.id === selectedRequestId) || requests[0];
  const userRole = getUserRole(user);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  if (!currentRequest) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <Workflow className="w-12 h-12 text-ikm-text-secondary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ikm-text">No Work Requests Found</h2>
        <p className="text-sm text-ikm-text-secondary mt-1">Please create a work request first to begin the 22-step workflow.</p>
      </div>
    );
  }

  const currentStatus = currentRequest.status;
  const currentStepNumber = WorkflowEngine.getWorkflowStepNumber(currentStatus);
  const availableActions = WorkflowEngine.getAvailableActions(currentStatus, userRole);

  const handleExecuteTransition = async (target: TaskStatus) => {
    setIsTransitioning(true);
    const res = await executeWorkflowTransition(currentRequest.id, target, transitionReason);
    setIsTransitioning(false);
    if (res.success) {
      showNotification('success', `เปลี่ยนสถานะเป็น '${target}' สำเร็จ`);
      setTransitionTarget(null);
      setTransitionReason('');
    } else {
      showNotification('error', res.message || 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  // Associated Data
  const currentAssessment = assessments[currentRequest.id];
  const currentJobPlan = jobPlans[currentRequest.id];
  const currentPreMob = preMobChecklists[currentRequest.id];
  const jobDprs = dprs.filter(d => d.jobId === currentRequest.id);
  const jobCRs = changeRequests.filter(c => c.jobId === currentRequest.id);
  const jobIssues = issues.filter(i => i.jobId === currentRequest.id);
  const currentInspection = inspections[currentRequest.id];
  const currentFinalReport = finalReports[currentRequest.id];
  const currentCloseout = closeouts[currentRequest.id];
  const currentEval = evaluations[currentRequest.id];
  const jobAuditLogs = auditLogs.filter(a => a.recordId === currentRequest.id);

  // 5D Score Calculation
  const safetyScore = evalForm.noLti + evalForm.jsaPermitPpe + evalForm.toolboxHseRecord + evalForm.hazardReporting + evalForm.certCompliance + evalForm.safetyActionClosed;
  const qualityScore = evalForm.firstTimePass + evalForm.noRework + evalForm.technicalReportAccuracy + evalForm.correctStandardUsed + evalForm.ncrPunchlistClosed + evalForm.photosDocsComplete;
  const deliveryScore = evalForm.onTimeMob + evalForm.onTimeStart + evalForm.onTimeCompletion + evalForm.dailyReportSla + evalForm.finalReportSla;
  const costScore = evalForm.manhoursWithinPlan + evalForm.otBudgetControl + evalForm.equipmentEfficiency + evalForm.lowIdleTime + evalForm.expensesWithinBudget;
  const customerScore = evalForm.customerSatisfaction + evalForm.communicationResponsiveness + evalForm.teamCollaboration + evalForm.disciplineResponsibility + evalForm.knowledgeSharing;
  const total5DScore = safetyScore + qualityScore + deliveryScore + costScore + customerScore;

  const getEvaluationGrade = (score: number) => {
    if (score >= 90) return { grade: 'Outstanding', color: 'bg-emerald-500 text-white', th: 'ผลงานยอดเยี่ยม (90-100)' };
    if (score >= 80) return { grade: 'Very Good', color: 'bg-blue-500 text-white', th: 'ผลงานสูงกว่าเป้าหมาย (80-89)' };
    if (score >= 70) return { grade: 'Good', color: 'bg-teal-500 text-white', th: 'ผ่านเป้าหมาย (70-79)' };
    if (score >= 60) return { grade: 'Improvement Required', color: 'bg-amber-500 text-white', th: 'ต้องจัดทำแผนปรับปรุง (60-69)' };
    return { grade: 'Unsatisfactory', color: 'bg-red-500 text-white', th: 'ต้องทบทวนความสามารถ (<60)' };
  };

  const handleSaveEvaluation = () => {
    const evalData: PerformanceEvaluation5D = {
      id: `eval-${Date.now()}`,
      jobId: currentRequest.id,
      overallJobEvaluation: true,
      evaluatedBy: user?.name || 'Project Manager',
      evaluatedAt: new Date().toISOString().split('T')[0],
      dimensions: {
        safetyAndCompliance: {
          score: safetyScore,
          weight: 25,
          notes: 'No LTI, complete JSA & PPE verification, active hazard reporting.'
        },
        quality: {
          score: qualityScore,
          weight: 25,
          notes: 'Passed first-time inspection, zero rework, accurate calibration log.'
        },
        deliveryAndSchedule: {
          score: deliveryScore,
          weight: 20,
          notes: 'On-time mobilization and final report within SLA.'
        },
        costAndProductivity: {
          score: costScore,
          weight: 15,
          notes: 'Actual man-hours within budget, minimal idle waiting.'
        },
        customerAndTeamwork: {
          score: customerScore,
          weight: 15,
          notes: 'Excellent feedback from client representative.'
        }
      },
      compositeScore: total5DScore,
      lessonsLearned: evalForm.lessonsLearned
    };
    saveEvaluation(evalData);
    setShowEvalModal(false);
    showNotification('success', `บันทึกผลการประเมิน 5 มิติ (${total5DScore}/100 - ${getEvaluationGrade(total5DScore).grade}) เรียบร้อย`);
  };

  const handleCreateDPR = () => {
    if (!dprForm.activitiesPerformed.trim()) {
      showNotification('error', 'กรุณาระบุกิจกรรมที่ปฏิบัติงาน');
      return;
    }
    const variance = dprForm.actualProgressPercent - dprForm.plannedProgressPercent;
    const newDPR: DailyProgressReport = {
      id: `dpr-${Date.now()}`,
      jobId: currentRequest.id,
      dayNumber: dprForm.dayNumber,
      reportDate: new Date().toISOString().split('T')[0],
      plannedProgressPercent: dprForm.plannedProgressPercent,
      actualProgressPercent: dprForm.actualProgressPercent,
      variancePercent: variance,
      regularManHours: dprForm.regularManHours,
      otManHours: dprForm.otManHours,
      quantityCompleted: '100% flange torquing stage 1',
      inspectionResults: 'All bolt loads within +/- 2% spec',
      activitiesPerformed: dprForm.activitiesPerformed,
      equipmentCondition: dprForm.equipmentCondition,
      hseObservations: dprForm.hseObservations,
      qualityNcrObservations: dprForm.qualityNcrObservations,
      delayReason: dprForm.delayReason,
      nextDayPlan: dprForm.nextDayPlan,
      photos: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80'
      ],
      submittedBy: dprForm.submittedBy,
      submittedAt: new Date().toISOString()
    };
    saveDPR(newDPR);
    setShowDprModal(false);
    showNotification('success', `บันทึก Daily Progress Report (Day ${dprForm.dayNumber}) สำเร็จ`);
  };

  const handleCreateCR = () => {
    if (!crForm.title.trim() || !crForm.newScope.trim()) {
      showNotification('error', 'กรุณาระบุหัวข้อและรายละเอียดขอบเขตงานที่เปลี่ยน');
      return;
    }
    const newCR: ChangeRequest = {
      id: `CR-${Date.now().toString().slice(-4)}`,
      jobId: currentRequest.id,
      workRequestId: currentRequest.id,
      title: crForm.title,
      originalScope: crForm.originalScope || (currentRequest.scopeOfWork || ''),
      newScope: crForm.newScope,
      reason: crForm.reason,
      scheduleImpactDays: crForm.scheduleImpactDays,
      costImpactBaht: crForm.costImpactBaht,
      manpowerImpact: 'Additional 1 technician for 2 shifts',
      equipmentImpact: 'Requires additional calibrated torque wrench',
      safetyImpact: 'LOW',
      qualityImpact: 'Standard IKM Quality Matrix',
      status: 'Submitted',
      requesterName: crForm.requesterName,
      requesterRole: 'Supervisor',
      createdAt: new Date().toISOString()
    };
    saveChangeRequest(newCR);
    setShowCrModal(false);
    showNotification('success', `สร้าง Change Request [${newCR.id}] เรียบร้อย`);
  };

  const handleCreateIssue = () => {
    if (!issueForm.description.trim()) {
      showNotification('error', 'กรุณาระบุรายละเอียดปัญหา');
      return;
    }
    const newIssue: IssueIncident = {
      id: `ISSUE-${Date.now().toString().slice(-4)}`,
      jobId: currentRequest.id,
      issueNumber: `INC-${Date.now().toString().slice(-4)}`,
      type: issueForm.type,
      severity: issueForm.severity,
      description: issueForm.description,
      ownerName: issueForm.ownerName,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      reportedAt: new Date().toISOString(),
      containmentAction: issueForm.containmentAction,
      rootCauseAnalysis: issueForm.rootCauseAnalysis,
      correctiveAction: issueForm.correctiveAction,
      preventiveAction: issueForm.preventiveAction,
      evidenceUrls: [],
      verificationStatus: 'Open',
      createdAt: new Date().toISOString()
    } as any;
    saveIssue(newIssue);
    setShowIssueModal(false);
    showNotification('success', `บันทึก Issue/Incident [${newIssue.id}] เรียบร้อย`);
  };

  // Pre-Mob Checklist items toggle
  const handleTogglePreMobItem = (index: number) => {
    if (!currentPreMob) return;
    const updatedItems = [...currentPreMob.items];
    const isCompleted = updatedItems[index].status === 'Completed';
    updatedItems[index].status = isCompleted ? 'Pending' : 'Completed';
    updatedItems[index].checkedBy = user?.name || 'Coordinator Nattaporn';
    updatedItems[index].checkedAt = new Date().toISOString();
    const allCompleted = updatedItems.every(i => i.status === 'Completed' || i.status === 'Not Applicable');
    savePreMobChecklist({
      ...currentPreMob,
      items: updatedItems,
      overallStatus: allCompleted ? 'Ready for Mobilization' : 'Pending'
    });
    showNotification('success', `อัปเดตสถานะ Checklist: ${updatedItems[index].title}`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-28">
      {/* Top Header & Job Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ikm-card p-5 rounded-2xl border border-ikm-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-ikm-orange">
              <Workflow className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-ikm-text">
              {language === 'TH' ? 'ระบบควบคุมวงจรงานวิศวกรรม 15 ขั้นตอน (Engineering Operations Hub)' : '15-Step Engineering Operations Hub'}
            </h1>
          </div>
          <p className="text-xs text-ikm-text-secondary">
            {language === 'TH' 
              ? 'ควบคุม Work Request, Manpower, Main Equipment, Pre-Mob, Daily Progress, Change, Issues, Final Report, Closeout และ 5D Evaluation โดยมี Coordinator เป็นศูนย์กลาง'
              : 'Coordinator-driven central hub controlling Work Requests, Manpower, Main Equipment, Pre-Mob, DPR, Change, Issues, Final Report & 5D Evaluation.'}
          </p>
        </div>

        {/* Request Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-ikm-text-secondary whitespace-nowrap">
            {language === 'TH' ? 'เลือกโครงการ/คำขอ:' : 'Active Request:'}
          </label>
          <select
            value={currentRequest.id}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="px-3 py-2 bg-ikm-bg border border-ikm-border rounded-xl text-xs font-bold text-ikm-text focus:border-ikm-orange outline-none cursor-pointer max-w-xs"
          >
            {requests.map(r => (
              <option key={r.id} value={r.id}>
                [{r.id}] {r.title} ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={cn(
          "px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in fade-in",
          feedbackMsg.type === 'success' ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-red-50 text-red-800 border border-red-300 dark:bg-red-950/50 dark:text-red-300"
        )}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Active State Banner & Action Transitions */}
      <Card className="p-5 bg-gradient-to-r from-orange-50/50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border-orange-200 dark:border-orange-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-ikm-orange text-white shadow-xs">
                Step {currentStepNumber} of 22
              </span>
              <span className="text-sm font-bold text-ikm-text">
                Current Status: <strong className="text-ikm-orange underline">{currentStatus}</strong>
              </span>
              <span className="text-xs text-ikm-text-secondary">
                · Customer: <strong>{currentRequest.customer}</strong>
              </span>
              <span className="text-xs text-ikm-text-secondary">
                · Role: <strong className="text-slate-700 dark:text-slate-300 font-bold">{userRole}</strong>
              </span>
            </div>
            <h2 className="text-base font-bold text-ikm-text mt-2">{currentRequest.title}</h2>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {availableActions.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                {language === 'TH' ? 'ไม่มีคำสั่งเปลี่ยนสถานะสำหรับบทบาทปัจจุบัน' : 'No state transitions available for your role'}
              </span>
            ) : (
              availableActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (action.requiresReason) {
                      setTransitionTarget(action.to);
                    } else {
                      handleExecuteTransition(action.to);
                    }
                  }}
                  disabled={isTransitioning}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-ikm-orange hover:bg-orange-600 text-white shadow-xs transition-all active:scale-95"
                >
                  <span>{language === 'TH' ? action.actionNameTH : action.actionName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Reason Modal / Inline Form if required */}
        {transitionTarget && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900 dark:text-orange-300">
              <AlertCircle className="w-4 h-4 text-ikm-orange" />
              <span>{language === 'TH' ? `กรุณาระบุเหตุผลในการเปลี่ยนสถานะเป็น '${transitionTarget}':` : `Please provide a reason for transitioning to '${transitionTarget}':`}</span>
            </div>
            <textarea
              value={transitionReason}
              onChange={(e) => setTransitionReason(e.target.value)}
              placeholder="ระบุเหตุผลหรือข้อสังเกตเพิ่มเติม (เช่น ผลการตรวจรับผ่าน, เปลี่ยนแปลงทีม, ส่งกลับแก้ไข)..."
              rows={2}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-ikm-border rounded-lg text-xs outline-none focus:border-ikm-orange"
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setTransitionTarget(null)}>
                {language === 'TH' ? 'ยกเลิก' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={() => handleExecuteTransition(transitionTarget)}>
                {language === 'TH' ? 'ยืนยันเปลี่ยนสถานะ' : 'Confirm Transition'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Sub-Tabs across 15 Detailed Process Steps */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-ikm-border scrollbar-none text-xs font-semibold">
        {[
          { key: 'overview', label: language === 'TH' ? 'ภาพรวม (Summary)' : 'Overview' },
          { key: 'review', label: language === 'TH' ? '1-2. ตรวจสอบคำขอ (Review)' : '1-2. WR Review' },
          { key: 'assessment', label: language === 'TH' ? '3. ประเมินความเสี่ยง (Risk)' : '3. Risk Assess' },
          { key: 'manpower', label: language === 'TH' ? '4. จัดสรรคน (Manpower)' : '4. Manpower' },
          { key: 'equipment', label: language === 'TH' ? '5. จองอุปกรณ์ (Equipment)' : '5. Main Equipment' },
          { key: 'jobplan', label: language === 'TH' ? '6. Job Plan & Approval' : '6. Job Plan' },
          { key: 'confirmation', label: language === 'TH' ? '7. ยืนยันการมอบหมาย' : '7. Assignment Conf' },
          { key: 'pre-mob', label: language === 'TH' ? '8. Pre-Mob Checklist' : '8. Pre-Mob' },
          { key: 'execution', label: language === 'TH' ? '9. ปฏิบัติงาน & บันทึก' : '9. Execution' },
          { key: 'dpr', label: language === 'TH' ? '9. Daily Report (DPR)' : '9. DPR' },
          { key: 'change', label: language === 'TH' ? '10. Change Request' : '10. Change Mgmt' },
          { key: 'issues', label: language === 'TH' ? '11. Issues & Incident' : '11. Issues' },
          { key: 'inspection', label: language === 'TH' ? '12. ตรวจรับงาน (QA)' : '12. Inspection' },
          { key: 'return', label: language === 'TH' ? '13. คืนอุปกรณ์ (Return)' : '13. Equip Return' },
          { key: 'final-report', label: language === 'TH' ? '14. Final Report' : '14. Final Report' },
          { key: 'closeout', label: language === 'TH' ? '15. ปิดงาน (Close-out)' : '15. Close-out' },
          { key: 'evaluation', label: language === 'TH' ? '★ ประเมินผล 5 มิติ' : '★ 5D Evaluation' },
          { key: 'audit', label: language === 'TH' ? 'Audit Trail' : 'Audit Trail' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveStepTab(tab.key as any)}
            className={cn(
              "px-3 py-2 rounded-lg whitespace-nowrap transition-all",
              activeStepTab === tab.key
                ? "bg-ikm-orange text-white font-bold shadow-xs"
                : "text-ikm-text-secondary hover:text-ikm-text hover:bg-ikm-bg"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 0: Overview */}
      {activeStepTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-6">
            <h3 className="font-bold text-base text-ikm-text flex items-center gap-2">
              <Layers className="w-5 h-5 text-ikm-orange" />
              <span>{language === 'TH' ? 'ข้อมูลสรุปขอบเขตโครงการ (Project Summary)' : 'Project Scope Summary'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-ikm-bg border border-ikm-border text-xs">
              <div>
                <span className="text-ikm-text-secondary block">Work Request No.</span>
                <strong className="text-ikm-text font-mono text-sm">{currentRequest.id}</strong>
              </div>
              <div>
                <span className="text-ikm-text-secondary block">Job No.</span>
                <strong className="text-ikm-text font-mono text-sm">{currentRequest.jobNumber || 'PENDING'}</strong>
              </div>
              <div>
                <span className="text-ikm-text-secondary block">Client</span>
                <strong className="text-ikm-text font-semibold">{currentRequest.customer}</strong>
              </div>
              <div>
                <span className="text-ikm-text-secondary block">Service Category</span>
                <strong className="text-ikm-orange font-semibold">{currentRequest.serviceCategory}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-ikm-text">Scope of Work</label>
              <div className="p-4 rounded-xl bg-ikm-bg text-xs text-ikm-text border border-ikm-border leading-relaxed">
                {currentRequest.scopeOfWork}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
                <span className="font-bold text-ikm-text block">Location & Shift:</span>
                <p className="text-ikm-text-secondary">Site: <strong>{currentRequest.siteLocation}</strong></p>
                <p className="text-ikm-text-secondary">Environment: <strong className={currentRequest.isOffshore ? "text-blue-600" : ""}>{currentRequest.isOffshore ? 'Offshore Rig (BOSIET Required)' : 'Onshore Facility'}</strong></p>
                <p className="text-ikm-text-secondary">Shift: <strong>{currentRequest.shift}</strong></p>
                <p className="text-ikm-text-secondary">Dates: <strong>{currentRequest.startDate} to {currentRequest.endDate}</strong></p>
              </div>

              <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
                <span className="font-bold text-ikm-text block">Key Personnel & Contacts:</span>
                <p className="text-ikm-text-secondary">Requester: <strong>{currentRequest.requester}</strong></p>
                <p className="text-ikm-text-secondary">Coordinator: <strong>{currentRequest.coordinator || 'Unassigned'}</strong></p>
                <p className="text-ikm-text-secondary">Commercial Resp: <strong>{currentRequest.commercialResponsiblePerson}</strong></p>
                <p className="text-ikm-text-secondary">Client Contact: <strong>{currentRequest.customerContact?.name} ({currentRequest.customerContact?.phone})</strong></p>
              </div>
            </div>
          </Card>

          {/* Quick Status Milestones */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-ikm-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ikm-orange" />
              <span>{language === 'TH' ? 'สถานะความคืบหน้ากระบวนการ' : 'Process Progression'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { step: '1-2', title: 'Work Request & Review', done: currentStepNumber >= 2 },
                { step: '3-5', title: 'Risk, Manpower & Equipment', done: currentStepNumber >= 4 },
                { step: '6-7', title: 'Job Plan & Assignment', done: currentStepNumber >= 7 },
                { step: '8', title: 'Pre-Mob & Mobilization', done: currentStepNumber >= 10 },
                { step: '9', title: 'Work Execution & DPR', done: currentStepNumber >= 11 },
                { step: '10-11', title: 'Change & Issues/Incidents', done: jobIssues.length === 0 },
                { step: '12-13', title: 'Inspection & Equip Return', done: currentStepNumber >= 16 },
                { step: '14-15', title: 'Final Report & Closeout', done: currentStepNumber >= 18 },
                { step: '★', title: '5-Dimension Performance Eval', done: !!currentEval },
              ].map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-ikm-bg border border-ikm-border">
                  <div className="flex items-center gap-2">
                    {m.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={cn("font-semibold", m.done ? "text-ikm-text" : "text-ikm-text-secondary")}>
                      {m.step}. {m.title}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded",
                    m.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {m.done ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 1-2: Review & SLA */}
      {activeStepTab === 'review' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 2: ตรวจสอบความครบถ้วนของคำขอ (Coordinator Review & SLA)' : 'Step 2: Request Review & SLA Control'}
              </h3>
              <p className="text-xs text-ikm-text-secondary mt-0.5">
                SLA ปกติ 1 วันทำการ, SLA งานเร่งด่วน 2–4 ชั่วโมง
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                SLA Status: Within Target (1.5 hrs elapsed)
              </span>
            </div>
          </div>

          {/* Decision Tree Controls */}
          <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 space-y-3">
            <span className="font-bold text-xs text-orange-900 dark:text-orange-300 block">
              ผลการตรวจสอบของ Coordinator (Decision Tree Matrix):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 border border-emerald-300 rounded-xl space-y-2">
                <strong className="text-emerald-700 block">1. ข้อมูลครบถ้วน</strong>
                <p className="text-slate-500 text-[11px]">รับคำขอเข้าสู่การวางแผน</p>
                <Button size="sm" variant="outline" className="w-full text-[11px] font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50" onClick={() => handleExecuteTransition('Under Review')}>
                  Under Review
                </Button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-amber-300 rounded-xl space-y-2">
                <strong className="text-amber-700 block">2. ข้อมูลไม่ครบ</strong>
                <p className="text-slate-500 text-[11px]">ส่งกลับ Requester แก้ไข</p>
                <Button size="sm" variant="outline" className="w-full text-[11px] font-bold border-amber-600 text-amber-700 hover:bg-amber-50" onClick={() => handleExecuteTransition('Returned for Information')}>
                  Returned for Info
                </Button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-blue-300 rounded-xl space-y-2">
                <strong className="text-blue-700 block">3. นอกขอบเขต</strong>
                <p className="text-slate-500 text-[11px]">ส่งผู้จัดการพิจารณา</p>
                <Button size="sm" variant="outline" className="w-full text-[11px] font-bold border-blue-600 text-blue-700 hover:bg-blue-50" onClick={() => handleExecuteTransition('Pending Management Review')}>
                  Pending Mgmt Review
                </Button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-red-300 rounded-xl space-y-2">
                <strong className="text-red-700 block">4. ไม่สามารถทำได้</strong>
                <p className="text-slate-500 text-[11px]">ปฏิเสธพร้อมระบุเหตุผล</p>
                <Button size="sm" variant="outline" className="w-full text-[11px] font-bold border-red-600 text-red-700 hover:bg-red-50" onClick={() => handleExecuteTransition('Rejected')}>
                  Reject Request
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">10 รายการตรวจสอบความครบถ้วน:</span>
              <ul className="space-y-1.5 text-ikm-text-secondary">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> PO หรือ Commercial Approval มีแล้ว</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Scope ระบุชัดเจน พร้อมรูปภาพ/Drawing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> วันที่และสถานที่ปฏิบัติงานแน่นอน</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ระบุประเภทช่างและจำนวนบุคลากร</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ระบุ Certificate ที่ต้องใช้ (BOSIET, PTW)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ระบุ Main Equipment พร้อมวันใช้งาน</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ข้อกำหนด Offshore / Onshore ชัดเจน</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> แผนการเดินทาง ที่พัก รถ Logistics ครบ</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> รูปแบบรายงานที่ลูกค้าต้องการระบุไว้แล้ว</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ระบุผู้อนุมัติและ Client Representative ชัดเจน</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
              <span className="font-bold text-ikm-text block">Revision Control & Scope Delta</span>
              <p className="text-ikm-text-secondary">
                หากมีการแก้ไข Scope หลัง Submit ระบบจะบันทึกประวัติ Revision History อัตโนมัติ (ปัจจุบัน: Revision {currentRequest.currentRevision})
              </p>
              {currentRequest.revisions && currentRequest.revisions.length > 0 ? (
                <div className="space-y-2">
                  {currentRequest.revisions.map((rev, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-ikm-border">
                      <div className="flex justify-between font-bold text-ikm-orange">
                        <span>Rev {rev.revisionNo}</span>
                        <span className="text-[10px] text-slate-400">{rev.changedBy}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{rev.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-slate-400 italic">
                  ไม่มีประวัติการแก้ไข Scope หลัง Submit
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Risk Assessment */}
      {activeStepTab === 'assessment' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 3: ประเมินขอบเขต ความเสี่ยง และความซับซ้อน (Risk Assessment)' : 'Step 3: Scope, Risk & Complexity Assessment'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                Coordinator ร่วมกับ Supervisor และ Project Manager ประเมิน 8 หัวข้อเพื่อกำหนด Approval Level
              </p>
            </div>
            {currentAssessment && (
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                currentAssessment.overallRiskLevel === 'CRITICAL' ? "bg-red-100 text-red-700" :
                currentAssessment.overallRiskLevel === 'HIGH' ? "bg-orange-100 text-orange-700" :
                currentAssessment.overallRiskLevel === 'MEDIUM' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              )}>
                OVERALL RISK LEVEL: {currentAssessment.overallRiskLevel}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-ikm-bg border border-ikm-border">
              <span className="text-ikm-text-secondary block">1. Technical Risk</span>
              <strong className="text-ikm-text">{currentAssessment?.technicalRisk || 'HIGH'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-ikm-bg border border-ikm-border">
              <span className="text-ikm-text-secondary block">2. Safety & HSE Risk</span>
              <strong className="text-ikm-text">{currentAssessment?.safetyRisk || 'MEDIUM'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-ikm-bg border border-ikm-border">
              <span className="text-ikm-text-secondary block">3. Travel / Offshore Risk</span>
              <strong className="text-ikm-text">{currentAssessment?.offshoreRisk || 'HIGH'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-ikm-bg border border-ikm-border">
              <span className="text-ikm-text-secondary block">4. Equipment Availability</span>
              <strong className="text-ikm-text">{currentAssessment?.equipmentAvailabilityRisk || 'LOW'}</strong>
            </div>
          </div>

          {/* Approval Level Matrix Reference */}
          <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3 text-xs">
            <span className="font-bold text-ikm-text block">ตารางเกณฑ์ Approval Level ตามระดับความเสี่ยง:</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className={cn("p-2.5 rounded-lg border", currentAssessment?.overallRiskLevel === 'LOW' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-ikm-border")}>
                <strong className="text-emerald-700 block font-bold">LOW</strong>
                <span className="text-slate-500 block text-[11px]">งานมาตรฐาน เสี่ยงต่ำ</span>
                <span className="font-bold text-ikm-text mt-1 block">ผู้อนุมัติ: Coordinator / Supervisor</span>
              </div>
              <div className={cn("p-2.5 rounded-lg border", currentAssessment?.overallRiskLevel === 'MEDIUM' ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-ikm-border")}>
                <strong className="text-blue-700 block font-bold">MEDIUM</strong>
                <span className="text-slate-500 block text-[11px]">ใช้หลายทรัพยากร</span>
                <span className="font-bold text-ikm-text mt-1 block">ผู้อนุมัติ: Operation Manager</span>
              </div>
              <div className={cn("p-2.5 rounded-lg border", currentAssessment?.overallRiskLevel === 'HIGH' ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30" : "border-ikm-border")}>
                <strong className="text-orange-700 block font-bold">HIGH</strong>
                <span className="text-slate-500 block text-[11px]">Offshore / เสี่ยงสูง</span>
                <span className="font-bold text-ikm-text mt-1 block">ผู้อนุมัติ: Country Manager</span>
              </div>
              <div className={cn("p-2.5 rounded-lg border", currentAssessment?.overallRiskLevel === 'CRITICAL' ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-ikm-border")}>
                <strong className="text-red-700 block font-bold">CRITICAL</strong>
                <span className="text-slate-500 block text-[11px]">มีผลหยุดผลิต / ความปลอดภัย</span>
                <span className="font-bold text-ikm-text mt-1 block">ผู้อนุมัติ: Country Manager & Board</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Manpower Planning */}
      {activeStepTab === 'manpower' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 4: วางแผนบุคลากร (Manpower Management)' : 'Step 4: Manpower Management & Crew Templates'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                ตรวจสอบความพร้อม, ทักษะ, ใบรับรอง (Certificate Expiry), BOSIET Offshore, และป้องกันการมอบหมายซ้ำ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-ikm-orange/10 text-ikm-orange border border-ikm-orange/30 rounded-lg">
                Pipeline: Proposed → Reserved → Assigned → Confirmed → Mobilized → Working → Released
              </span>
            </div>
          </div>

          {/* Crew Templates */}
          <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3 text-xs">
            <span className="font-bold text-ikm-text block">เลือกรูปแบบ Crew Template:</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="text-xs font-bold">
                1 Supervisor + 2 Technicians (Standard Hydrotest)
              </Button>
              <Button size="sm" variant="outline" className="text-xs font-bold">
                1 Supervisor + 3 Technicians (Flange Management)
              </Button>
              <Button size="sm" variant="outline" className="text-xs font-bold">
                1 Machinist Supervisor + 3 Technicians (On-site Machining)
              </Button>
            </div>
          </div>

          {/* Assigned Crew List with Validation Checks */}
          <div className="space-y-3 text-xs">
            <span className="font-bold text-ikm-text block">รายชื่อทีมงานและผลการตรวจคุณสมบัติ (Crew Verification):</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentJobPlan?.teamList?.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-ikm-text font-bold text-sm block">{m.employeeName}</strong>
                      <span className="text-ikm-text-secondary">{m.roleInCrew} · ID: {m.employeeId}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      m.status === 'Confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {m.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-ikm-border">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active & Available</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>No Duplicate Schedule</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cert Valid {'>'} End Date</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>BOSIET Offshore OK</span>
                    </div>
                  </div>
                </div>
              )) || <p className="text-slate-400 italic">No crew assigned yet.</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Main Equipment Management */}
      {activeStepTab === 'equipment' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 5: เลือกและจอง Main Equipment (Equipment Management)' : 'Step 5: Main Equipment Selection & Allocation'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                ป้องกันการจองซ้ำ, ตรวจสอบอายุ Calibration, เสนออุปกรณ์ทดแทน/เช่า/ซื้อหากไม่พร้อม
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
              Live Calibration Check: Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <span className="font-bold text-ikm-text block">Main Equipment ที่จองสำหรับงานนี้:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentJobPlan?.equipmentList?.map((eq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-ikm-text font-bold text-sm block">{eq.equipmentName}</strong>
                      <span className="text-ikm-text-secondary font-mono">SN: {eq.serialNumber} · ID: {eq.equipmentId}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {eq.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-ikm-border space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Calibration Status:</span>
                      <strong className="text-emerald-600">VALID (Due: 2026-11-30)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Maintenance Status:</span>
                      <strong className="text-slate-700 dark:text-slate-300">Passed Pre-inspection</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accessories / Cables:</span>
                      <strong className="text-slate-700 dark:text-slate-300">Complete Set Verified</strong>
                    </div>
                  </div>
                </div>
              )) || <p className="text-slate-400 italic">No equipment reserved yet.</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 6: Job Plan & Approval */}
      {activeStepTab === 'jobplan' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 6: จัดทำ Job Plan และขออนุมัติ (Job Plan & Approval)' : 'Step 6: Job Plan & Multi-level Approval'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                อนุมัติตามลำดับ: Coordinator → Supervisor → Project Manager → Final Approval
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
              Status: {currentJobPlan?.status || 'Approved'}
            </span>
          </div>

          {/* Approval Stepper */}
          <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3 text-xs">
            <span className="font-bold text-ikm-text block">ลำดับการอนุมัติ (Approval Chain):</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Coordinator</span>
                </div>
                <p className="text-[11px] text-slate-500">Nattaporn C. (Approved)</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Supervisor</span>
                </div>
                <p className="text-[11px] text-slate-500">Wichai S. (Approved)</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Project Manager</span>
                </div>
                <p className="text-[11px] text-slate-500">Kittipong PM (Approved)</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Final Approval</span>
                </div>
                <p className="text-[11px] text-slate-500">Operation / Country Mgr</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 7: Assignment Confirmation */}
      {activeStepTab === 'confirmation' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 7: การแจ้งและยืนยันการมอบหมาย (Assignment Confirmation)' : 'Step 7: Assignment Confirmation'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                แจ้งเตือน Supervisor & Technician พร้อมข้อมูลงาน, PPE, เอกสาร และรับการตอบรับ (Accept / Unable to Accept)
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
              Team Response: 100% Confirmed
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
              <span className="font-bold text-ikm-text block">การตอบรับของทีมงาน (Personnel Response):</span>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-ikm-border flex items-center justify-between">
                  <div>
                    <strong className="text-ikm-text block">Wichai Supervisor (Supervisor)</strong>
                    <span className="text-ikm-text-secondary">Accepted via Mobile App · PPE & Procedure Ready</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded">
                    ACCEPTED
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-ikm-border flex items-center justify-between">
                  <div>
                    <strong className="text-ikm-text block">Anupong Technician (Lead Tech)</strong>
                    <span className="text-ikm-text-secondary">Accepted via Mobile App · Valid BOSIET</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded">
                    ACCEPTED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 8: Pre-Mob Checklist */}
      {activeStepTab === 'pre-mob' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 8: Pre-Mobilization Checklist (11 รายการตรวจความพร้อม)' : 'Step 8: Pre-Mobilization Checklist'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                ตรวจสอบบุคลากร, ใบรับรอง, เครื่องมือ, การเดินทาง และ Toolbox Briefing ก่อนออกเดินทาง
              </p>
            </div>
            <span className={cn(
              "text-xs font-bold px-3 py-1 rounded-lg",
              currentPreMob?.overallStatus === 'Ready for Mobilization' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            )}>
              {currentPreMob?.overallStatus || 'Ready for Mobilization'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentPreMob?.items?.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => handleTogglePreMobItem(idx)}
                className={cn(
                  "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:shadow-xs",
                  item.status === 'Completed' ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300" : "bg-ikm-bg border-ikm-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded flex items-center justify-center text-white",
                    item.status === 'Completed' ? "bg-emerald-600" : "bg-slate-300"
                  )}>
                    {item.status === 'Completed' && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-ikm-text font-semibold">{item.title}</span>
                </div>
                <span className="text-[10px] text-ikm-text-secondary">
                  {item.checkedBy || 'Click to verify'}
                </span>
              </div>
            )) || <p className="text-slate-400 italic">Checklist pending initialization.</p>}
          </div>
        </Card>
      )}

      {/* Tab 9: Execution & DPR */}
      {activeStepTab === 'execution' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 9: การปฏิบัติงานหน้างาน (Work Execution & Logs)' : 'Step 9: On-Site Work Execution & Live Logging'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                Supervisor บันทึกเวลาเข้า-ออก, กิจกรรม, ปริมาณงาน, อุปกรณ์, HSE Observation, และรูปถ่าย
              </p>
            </div>
            <Button size="sm" onClick={() => setShowDprModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              {language === 'TH' ? 'ส่ง Daily Progress Report (DPR)' : 'Submit DPR'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">Supervisor หน้าที่ควบคุม:</span>
              <ul className="list-disc list-inside space-y-1 text-ikm-text-secondary">
                <li>ควบคุม Technician และตรวจสอบความปลอดภัยตลอดการทำงาน</li>
                <li>บันทึก Measurement และ Inspection Results พร้อมรูปภาพ 3 ระยะ (ก่อน/ระหว่าง/หลัง)</li>
                <li>รายงาน Delay และสาเหตุ พร้อม Corrective Action ทันที</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">Technician หน้าที่บันทึก:</span>
              <ul className="list-disc list-inside space-y-1 text-ikm-text-secondary">
                <li>บันทึกเวลาเข้า-ออกงานและกิจกรรมโดยละเอียด</li>
                <li>บันทึกปริมาณงานที่ทำได้และข้อเสนอแนะทางเทคนิค</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 9 (DPR): Daily Progress Report */}
      {activeStepTab === 'dpr' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 9: รายงานความคืบหน้ารายวัน (Daily Progress Report - DPR)' : 'Step 9: Daily Progress Reports (DPR)'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                สรุป Planned %, Actual %, Variance %, Man-hours, HSE, Quality NCR, Delay และแผนวันถัดไป
              </p>
            </div>
            <Button size="sm" onClick={() => setShowDprModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              {language === 'TH' ? 'สร้างรายงานประจำวัน' : 'New DPR Entry'}
            </Button>
          </div>

          {jobDprs.length > 0 ? (
            <div className="space-y-4 text-xs">
              {jobDprs.map((dpr, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ikm-border pb-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-ikm-orange font-bold text-sm">Day {dpr.dayNumber}</strong>
                      <span className="text-ikm-text-secondary">({dpr.reportDate}) · By {dpr.submittedBy}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Planned: <strong>{dpr.plannedProgressPercent}%</strong></span>
                      <span>Actual: <strong>{dpr.actualProgressPercent}%</strong></span>
                      <span className={cn(
                        "font-bold px-2 py-0.5 rounded",
                        dpr.variancePercent >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        Variance: {dpr.variancePercent > 0 ? '+' : ''}{dpr.variancePercent}%
                      </span>
                    </div>
                  </div>

                  <p className="text-ikm-text leading-relaxed font-semibold">{dpr.activitiesPerformed}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-ikm-border space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">Equipment & Quality:</span>
                      <p className="text-slate-500">{dpr.equipmentCondition}</p>
                      <p className="text-slate-500">{dpr.qualityNcrObservations}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-ikm-border space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">HSE & Man-hours:</span>
                      <p className="text-slate-500">{dpr.hseObservations}</p>
                      <p className="text-slate-500">Regular: {dpr.regularManHours}h · OT: {dpr.otManHours}h · Total: {dpr.regularManHours + dpr.otManHours}h</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 text-[11px]">
                    <strong className="text-ikm-orange">Next Day Plan: </strong>
                    <span className="text-slate-600 dark:text-slate-300">{dpr.nextDayPlan}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-ikm-bg rounded-xl border border-ikm-border">
              ยังไม่มีรายงาน DPR สำหรับงานนี้ คลิกปุ่มด้านบนเพื่อเพิ่มรายงาน
            </div>
          )}
        </Card>
      )}

      {/* Tab 10: Change Request */}
      {activeStepTab === 'change' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 10: การควบคุมการเปลี่ยนแปลง (Change Request)' : 'Step 10: Scope Change Control'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                ห้ามดำเนินงานเพิ่มที่มีผลต่อต้นทุน/เวลาโดยไม่มีการอนุมัติ เก็บ Baseline และประวัติ Revision
              </p>
            </div>
            <Button size="sm" onClick={() => setShowCrModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              {language === 'TH' ? 'สร้าง Change Request' : 'New Change Request'}
            </Button>
          </div>

          {jobCRs.length > 0 ? (
            <div className="space-y-3 text-xs">
              {jobCRs.map((cr, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-ikm-text font-bold text-sm block">[{cr.id}] {cr.title}</strong>
                      <span className="text-ikm-text-secondary">Requested by: {cr.requesterName}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {cr.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-ikm-border">
                      <span className="text-slate-400 block font-bold text-[10px]">NEW SCOPE:</span>
                      <p className="text-ikm-text">{cr.newScope}</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-ikm-border">
                      <span className="text-slate-400 block font-bold text-[10px]">IMPACT ASSESSMENT:</span>
                      <p className="text-ikm-text">Schedule Impact: <strong>+{cr.scheduleImpactDays} days</strong></p>
                      <p className="text-ikm-text">Cost Impact: <strong>฿{cr.costImpactBaht.toLocaleString()}</strong></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-ikm-bg rounded-xl border border-ikm-border">
              ไม่มีคำขอ Change Request
            </div>
          )}
        </Card>
      )}

      {/* Tab 11: Issues & Incidents */}
      {activeStepTab === 'issues' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 11: การจัดการปัญหาและเหตุผิดปกติ (Issues & Incident Management)' : 'Step 11: Issues & Incidents'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                รองรับ 8 ประเภทปัญหา: Technical, Breakdown, Shortage, Quality NCR, Safety, Complaint, Delay, Commercial
              </p>
            </div>
            <Button size="sm" onClick={() => setShowIssueModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              {language === 'TH' ? 'บันทึกปัญหา / Incident' : 'Log Issue/Incident'}
            </Button>
          </div>

          {jobIssues.length > 0 ? (
            <div className="space-y-3 text-xs">
              {jobIssues.map((issue, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className={cn(
                        "w-4 h-4",
                        issue.severity === 'Critical' ? "text-red-600" :
                        issue.severity === 'High' ? "text-orange-600" : "text-amber-600"
                      )} />
                      <strong className="text-ikm-text font-bold text-sm">[{issue.issueNumber}] {issue.type}</strong>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      issue.severity === 'Critical' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-ikm-text leading-relaxed">{issue.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-ikm-border">
                      <span className="font-bold text-slate-400 block">Containment:</span>
                      <p className="text-slate-600 dark:text-slate-300">{issue.containmentAction || 'Under execution'}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-ikm-border">
                      <span className="font-bold text-slate-400 block">Root Cause:</span>
                      <p className="text-slate-600 dark:text-slate-300">{issue.rootCauseAnalysis || 'Analyzing'}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-ikm-border">
                      <span className="font-bold text-slate-400 block">CAPA:</span>
                      <p className="text-slate-600 dark:text-slate-300">{issue.correctiveAction || 'Scheduled'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-ikm-bg rounded-xl border border-ikm-border">
              ไม่พบรายการปัญหาหรือ Incident สำหรับงานนี้
            </div>
          )}
        </Card>
      )}

      {/* Tab 12: Inspection */}
      {activeStepTab === 'inspection' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 12: ตรวจสอบและรับรองผลงาน (Inspection & Client Acceptance)' : 'Step 12: QA Inspection & Client Acceptance'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                ตรวจสอบความครบถ้วนตาม Scope, Acceptance Criteria, Housekeeping และการตรวจรับจากลูกค้า (Accept / Punch List / Reject)
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
              Status: {currentInspection?.status || 'Inspection Passed'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">8 รายการตรวจรับภายใน (Internal QA Verification):</span>
              <ul className="space-y-1.5 text-ikm-text-secondary">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ตรวจความครบถ้วนตาม Scope of Work</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ตรวจค่าที่วัดและผลการทดสอบแรงดัน (Pressure Test)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ตรวจ Acceptance Criteria ตามมาตรฐานสากล</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ตรวจรูปถ่ายและหลักฐานก่อน-หลังทำงาน</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ตรวจ Calibration ของอุปกรณ์ที่ใช้</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ตรวจ Daily Report และ Timesheet ครบถ้วน</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ตรวจ NCR และ Punch List ปิดเรียบร้อย</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ตรวจคืนพื้นที่และ Housekeeping สะอาดเรียบร้อย</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
              <span className="font-bold text-ikm-text block">ผลการตรวจรับจากลูกค้า (Client Acceptance):</span>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-ikm-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client Representative:</span>
                  <strong className="text-ikm-text">{currentInspection?.clientRepresentativeName || 'John Doe (Lead Inspector)'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Decision:</span>
                  <strong className="text-emerald-600">{currentInspection?.clientDecision || 'Accept'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Comments:</span>
                  <span className="text-slate-600 dark:text-slate-300">{currentInspection?.clientComments || 'Work completed in accordance with ISO specs.'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 13: Equipment Return */}
      {activeStepTab === 'return' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 13: คืนอุปกรณ์และ Demobilization (Equipment Return)' : 'Step 13: Equipment Return & Demobilization'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                ตรวจ Serial No, Accessories, สภาพหลังใช้, ชั่วโมงใช้งาน และเปลี่ยนสถานะ (Available / Under Inspection / Maintenance / Lost)
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
              Status: Demobilized & Returned
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3">
              <span className="font-bold text-ikm-text block">รายการอุปกรณ์ที่รับคืน (Return Verification):</span>
              <div className="space-y-2">
                {currentJobPlan?.equipmentList?.map((eq, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-ikm-border flex items-center justify-between">
                    <div>
                      <strong className="text-ikm-text block">{eq.equipmentName} ({eq.serialNumber})</strong>
                      <span className="text-ikm-text-secondary">Condition: Normal · Cleaned & Tested · 32 Operating Hours Logged</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      Returned (Available)
                    </span>
                  </div>
                )) || <p className="text-slate-400 italic">No equipment returned yet.</p>}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 14: Final Report */}
      {activeStepTab === 'final-report' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 14: จัดทำ Final Report (18 หมวดหมู่มาตรฐานวิศวกรรม)' : 'Step 14: Final Engineering Report'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                Document Number, Revision Number, Locked หลังอนุมัติ (ห้ามแก้ไขเว้นแต่ออก Revision ใหม่)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Doc No: {currentFinalReport?.documentNumber || `FR-${currentRequest.id}-2026`} (Rev {currentFinalReport?.revision || 1})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            {[
              '1. Executive Summary',
              '2. Project Information',
              '3. Scope of Work',
              '4. Applicable Standard',
              '5. Personnel List',
              '6. Equipment List',
              '7. Calibration Ref',
              '8. Methodology',
              '9. Work Performed',
              '10. Test Results',
              '11. Findings & Obs',
              '12. Defects / NCR',
              '13. Corrective Action',
              '14. Before/After Photos',
              '15. Conclusion',
              '16. Recommendations',
              '17. Appendices',
              '18. Client Acceptance',
            ].map((sec, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-ikm-bg border border-ikm-border text-[11px] font-semibold flex items-center gap-1.5 text-ikm-text">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{sec}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 15: Closeout */}
      {activeStepTab === 'closeout' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text">
                {language === 'TH' ? 'ขั้นตอนที่ 15: การปิดงาน (Close-out Checklist 3 ด้าน)' : 'Step 15: Project Close-out & Financial Reconciliation'}
              </h3>
              <p className="text-xs text-ikm-text-secondary">
                ตรวจสอบด้านปฏิบัติการ, ด้านเอกสาร และด้านการเงิน พร้อมออก Invoice ก่อนเปลี่ยนสถานะเป็น Closed
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
              Billing Readiness: 100% Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">1. ด้านปฏิบัติการ (Operations):</span>
              <ul className="space-y-1 text-ikm-text-secondary">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Scope เสร็จครบถ้วน 100%</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Punch List ปิดครบทุกข้อ</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> บุคลากรถูก Release ทั้งหมด</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> อุปกรณ์คืนคลังเรียบร้อย</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">2. ด้านเอกสาร (Documentation):</span>
              <ul className="space-y-1 text-ikm-text-secondary">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Daily Report ครบทุกวัน</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Final Report ได้รับการอนุมัติ</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Client Acceptance มีลายเซ็นครบ</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> NCR และ Incident ปิดแล้ว</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-2">
              <span className="font-bold text-ikm-text block">3. ด้านการเงิน (Financials):</span>
              <ul className="space-y-1 text-ikm-text-secondary">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Actual Man-hours ครบถ้วน</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OT และ Allowance ตรวจสอบแล้ว</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ค่าเดินทาง/เบี้ยเลี้ยงครบ</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Variation Order ได้รับอนุมัติ</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 16: 5-Dimension Performance Evaluation */}
      {activeStepTab === 'evaluation' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ikm-text flex items-center gap-2">
                <Award className="w-5 h-5 text-ikm-orange" />
                <span>{language === 'TH' ? 'การประเมินผลงาน 5 มิติ (5-Dimension Performance Evaluation - 100 คะแนน)' : '5-Dimension Performance Evaluation'}</span>
              </h3>
              <p className="text-xs text-ikm-text-secondary mt-0.5">
                Safety (25%) + Quality (25%) + Delivery (20%) + Cost (15%) + Customer/Teamwork (15%)
              </p>
            </div>
            <Button size="sm" onClick={() => setShowEvalModal(true)}>
              <Star className="w-3.5 h-3.5 mr-1" />
              {language === 'TH' ? 'บันทึก/แก้ไขคะแนนประเมิน' : 'Evaluate Job'}
            </Button>
          </div>

          {/* 5-Dimension Score Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-center">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">1. Safety (25%)</span>
              <strong className="text-2xl font-bold text-emerald-600 font-mono mt-1 block">{currentEval?.dimensions?.safetyAndCompliance?.score ?? safetyScore}/25</strong>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-300 text-center">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block">2. Quality (25%)</span>
              <strong className="text-2xl font-bold text-blue-600 font-mono mt-1 block">{currentEval?.dimensions?.quality?.score ?? qualityScore}/25</strong>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-300 text-center">
              <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block">3. Delivery (20%)</span>
              <strong className="text-2xl font-bold text-teal-600 font-mono mt-1 block">{currentEval?.dimensions?.deliveryAndSchedule?.score ?? deliveryScore}/20</strong>
            </div>

            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-300 text-center">
              <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 block">4. Cost (15%)</span>
              <strong className="text-2xl font-bold text-orange-600 font-mono mt-1 block">{currentEval?.dimensions?.costAndProductivity?.score ?? costScore}/15</strong>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-300 text-center">
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 block">5. Teamwork (15%)</span>
              <strong className="text-2xl font-bold text-purple-600 font-mono mt-1 block">{currentEval?.dimensions?.customerAndTeamwork?.score ?? customerScore}/15</strong>
            </div>
          </div>

          {/* Total Score & Grade Badge */}
          <div className="p-5 rounded-xl bg-ikm-bg border border-ikm-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-ikm-text-secondary block font-bold">TOTAL COMPOSITE SCORE:</span>
              <div className="flex items-baseline gap-2 mt-1">
                <strong className="text-3xl font-bold text-ikm-orange font-mono">{currentEval?.compositeScore ?? total5DScore}</strong>
                <span className="text-xs text-ikm-text-secondary">/ 100 Points</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold shadow-xs",
                getEvaluationGrade(currentEval?.compositeScore ?? total5DScore).color
              )}>
                {getEvaluationGrade(currentEval?.compositeScore ?? total5DScore).grade} ({getEvaluationGrade(currentEval?.compositeScore ?? total5DScore).th})
              </div>
            </div>
          </div>

          {/* Lessons Learned */}
          <div className="p-4 rounded-xl bg-ikm-bg border border-ikm-border space-y-3 text-xs">
            <h4 className="font-bold text-ikm-text flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-ikm-orange" />
              <span>Lessons Learned & Continuous Improvement:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-ikm-border space-y-1">
                <strong className="text-emerald-600 font-bold block">What Went Well:</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  {currentEval?.lessonsLearned?.whatWentWell || evalForm.lessonsLearned.whatWentWell}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-ikm-border space-y-1">
                <strong className="text-amber-600 font-bold block">What to Improve & Preventive Actions:</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  {currentEval?.lessonsLearned?.whatCouldBeImproved || evalForm.lessonsLearned.whatCouldBeImproved}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Audit Trail */}
      {activeStepTab === 'audit' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-ikm-text flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-ikm-orange" />
            <span>{language === 'TH' ? 'ประวัติการดำเนินการ (Audit Trail & Activity Log)' : 'Audit Trail & Activity Log'}</span>
          </h3>

          <div className="space-y-2 text-xs">
            {jobAuditLogs.map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-ikm-bg border border-ikm-border flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-ikm-text">{log.userName}</strong>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">{log.userRole}</span>
                    <span className="font-mono text-ikm-orange">{log.action}</span>
                  </div>
                  <p className="text-ikm-text-secondary mt-1">{log.reason || `Value: ${log.newValue}`}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: New DPR */}
      {showDprModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-ikm-card border border-ikm-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-ikm-border pb-3">
              <strong className="text-base text-ikm-text font-bold">บันทึก Daily Progress Report (DPR)</strong>
              <button onClick={() => setShowDprModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Day Number:</label>
                <input 
                  type="number" 
                  value={dprForm.dayNumber}
                  onChange={(e) => setDprForm({ ...dprForm, dayNumber: Number(e.target.value) })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Submitted By:</label>
                <input 
                  type="text" 
                  value={dprForm.submittedBy}
                  onChange={(e) => setDprForm({ ...dprForm, submittedBy: e.target.value })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Planned Progress (%):</label>
                <input 
                  type="number" 
                  value={dprForm.plannedProgressPercent}
                  onChange={(e) => setDprForm({ ...dprForm, plannedProgressPercent: Number(e.target.value) })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Actual Progress (%):</label>
                <input 
                  type="number" 
                  value={dprForm.actualProgressPercent}
                  onChange={(e) => setDprForm({ ...dprForm, actualProgressPercent: Number(e.target.value) })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">กิจกรรมที่ปฏิบัติงาน (Activities Performed):</label>
              <textarea 
                rows={3}
                value={dprForm.activitiesPerformed}
                onChange={(e) => setDprForm({ ...dprForm, activitiesPerformed: e.target.value })}
                placeholder="ระบุกิจกรรมที่ทำในแต่ละช่วงเวลา..."
                className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Regular Hours:</label>
                <input 
                  type="number" 
                  value={dprForm.regularManHours}
                  onChange={(e) => setDprForm({ ...dprForm, regularManHours: Number(e.target.value) })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">OT Hours:</label>
                <input 
                  type="number" 
                  value={dprForm.otManHours}
                  onChange={(e) => setDprForm({ ...dprForm, otManHours: Number(e.target.value) })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">HSE Observation & Toolbox Talk:</label>
              <input 
                type="text" 
                value={dprForm.hseObservations}
                onChange={(e) => setDprForm({ ...dprForm, hseObservations: e.target.value })}
                className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Next Day Plan:</label>
              <input 
                type="text" 
                value={dprForm.nextDayPlan}
                onChange={(e) => setDprForm({ ...dprForm, nextDayPlan: e.target.value })}
                className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ikm-border">
              <Button variant="ghost" size="sm" onClick={() => setShowDprModal(false)}>ยกเลิก</Button>
              <Button size="sm" onClick={handleCreateDPR}>บันทึก DPR</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Change Request */}
      {showCrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-ikm-card border border-ikm-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-ikm-border pb-3">
              <strong className="text-base text-ikm-text font-bold">สร้าง Change Request</strong>
              <button onClick={() => setShowCrModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">หัวข้อการเปลี่ยนแปลง (Title):</label>
              <input 
                type="text" 
                value={crForm.title}
                onChange={(e) => setCrForm({ ...crForm, title: e.target.value })}
                placeholder="เช่น เพิ่มงานตรวจสอบ Flange เพิ่มเติม 4 จุด"
                className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1">รายละเอียดขอบเขตงานใหม่ (New Scope):</label>
              <textarea 
                rows={3}
                value={crForm.newScope}
                onChange={(e) => setCrForm({ ...crForm, newScope: e.target.value })}
                placeholder="ระบุรายละเอียดงานที่ลูกค้าขอเปลี่ยนแปลง..."
                className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">ผลกระทบต่อระยะเวลา (วัน):</label>
                <input 
                  type="number" 
                  value={crForm.scheduleImpactDays}
                  onChange={(e) => setCrForm({ ...crForm, scheduleImpactDays: Number(e.target.value) })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">ผลกระทบต่อต้นทุน (บาท):</label>
                <input 
                  type="number" 
                  value={crForm.costImpactBaht}
                  onChange={(e) => setCrForm({ ...crForm, costImpactBaht: Number(e.target.value) })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ikm-border">
              <Button variant="ghost" size="sm" onClick={() => setShowCrModal(false)}>ยกเลิก</Button>
              <Button size="sm" onClick={handleCreateCR}>บันทึก Change Request</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Issue / Incident */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-ikm-card border border-ikm-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-ikm-border pb-3">
              <strong className="text-base text-ikm-text font-bold">บันทึก Issue / Incident</strong>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">ประเภท Issue:</label>
                <select 
                  value={issueForm.type}
                  onChange={(e) => setIssueForm({ ...issueForm, type: e.target.value as any })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Equipment Breakdown">Equipment Breakdown</option>
                  <option value="Resource Shortage">Resource Shortage</option>
                  <option value="Quality NCR">Quality NCR</option>
                  <option value="Safety Incident">Safety Incident</option>
                  <option value="Customer Complaint">Customer Complaint</option>
                  <option value="Schedule Delay">Schedule Delay</option>
                  <option value="Commercial Issue">Commercial Issue</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">ระดับความรุนแรง:</label>
                <select 
                  value={issueForm.severity}
                  onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value as any })}
                  className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">รายละเอียดปัญหา (Description):</label>
              <textarea 
                rows={3}
                value={issueForm.description}
                onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                placeholder="ระบุสิ่งที่เกิดขึ้น ผลกระทบ และผู้เกี่ยวข้อง..."
                className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1">มาตรการแก้ไขเฉพาะหน้า (Containment Action):</label>
              <input 
                type="text" 
                value={issueForm.containmentAction}
                onChange={(e) => setIssueForm({ ...issueForm, containmentAction: e.target.value })}
                className="w-full p-2 bg-ikm-bg border border-ikm-border rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ikm-border">
              <Button variant="ghost" size="sm" onClick={() => setShowIssueModal(false)}>ยกเลิก</Button>
              <Button size="sm" onClick={handleCreateIssue}>บันทึก Issue</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 5-Dimension Evaluation Form */}
      {showEvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-ikm-card border border-ikm-border rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-ikm-border pb-3">
              <div>
                <strong className="text-base text-ikm-text font-bold">แบบประเมินผลงาน 5 มิติ (100 คะแนนเต็ม)</strong>
                <p className="text-[11px] text-slate-400">คำนวณคะแนนและตัดเกรดอัตโนมัติตามมาตรฐานกระบวนการข้อ 4</p>
              </div>
              <button onClick={() => setShowEvalModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>

            {/* Role & Person */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-ikm-bg rounded-xl border border-ikm-border">
              <div>
                <label className="text-slate-500 block mb-1">บทบาทที่ประเมิน:</label>
                <select 
                  value={evalForm.evaluatedRole}
                  onChange={(e) => setEvalForm({ ...evalForm, evaluatedRole: e.target.value as any })}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-ikm-border rounded-lg outline-none"
                >
                  <option value="Technician">Technician (ผู้ประเมิน: Supervisor)</option>
                  <option value="Supervisor">Supervisor (ผู้ประเมิน: Manager)</option>
                  <option value="Coordinator">Coordinator (ผู้ประเมิน: Manager)</option>
                  <option value="Project Manager">Project Manager (ผู้ประเมิน: Management)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">ชื่อผู้รับการประเมิน:</label>
                <input 
                  type="text" 
                  value={evalForm.evaluatedPerson}
                  onChange={(e) => setEvalForm({ ...evalForm, evaluatedPerson: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-ikm-border rounded-lg outline-none"
                />
              </div>
            </div>

            {/* D1: Safety (25 pts) */}
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 rounded-xl space-y-2">
              <strong className="text-emerald-800 dark:text-emerald-300 font-bold block">มิติที่ 1: Safety & Compliance (25 คะแนน)</strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-500 block text-[10px]">ไม่มี Accident / LTI (max 8):</label>
                  <input type="number" max={8} min={0} value={evalForm.noLti} onChange={(e) => setEvalForm({...evalForm, noLti: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px]">JSA / Permit / PPE (max 5):</label>
                  <input type="number" max={5} min={0} value={evalForm.jsaPermitPpe} onChange={(e) => setEvalForm({...evalForm, jsaPermitPpe: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px]">Toolbox Talk (max 4):</label>
                  <input type="number" max={4} min={0} value={evalForm.toolboxHseRecord} onChange={(e) => setEvalForm({...evalForm, toolboxHseRecord: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
              </div>
            </div>

            {/* D2: Quality (25 pts) */}
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-300 rounded-xl space-y-2">
              <strong className="text-blue-800 dark:text-blue-300 font-bold block">มิติที่ 2: Quality (25 คะแนน)</strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-500 block text-[10px]">ผ่านครั้งแรก First-Time Pass (max 8):</label>
                  <input type="number" max={8} min={0} value={evalForm.firstTimePass} onChange={(e) => setEvalForm({...evalForm, firstTimePass: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px]">ไม่มี Rework (max 5):</label>
                  <input type="number" max={5} min={0} value={evalForm.noRework} onChange={(e) => setEvalForm({...evalForm, noRework: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px]">Technical Report ถูกต้อง (max 5):</label>
                  <input type="number" max={5} min={0} value={evalForm.technicalReportAccuracy} onChange={(e) => setEvalForm({...evalForm, technicalReportAccuracy: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
              </div>
            </div>

            {/* D3: Delivery (20 pts) */}
            <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-300 rounded-xl space-y-2">
              <strong className="text-teal-800 dark:text-teal-300 font-bold block">มิติที่ 3: Delivery & Schedule (20 คะแนน)</strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-500 block text-[10px]">Mobilization ตรงเวลา (max 4):</label>
                  <input type="number" max={4} min={0} value={evalForm.onTimeMob} onChange={(e) => setEvalForm({...evalForm, onTimeMob: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px]">งานเสร็จตามกำหนด (max 6):</label>
                  <input type="number" max={6} min={0} value={evalForm.onTimeCompletion} onChange={(e) => setEvalForm({...evalForm, onTimeCompletion: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px]">Final Report ตรง SLA (max 4):</label>
                  <input type="number" max={4} min={0} value={evalForm.finalReportSla} onChange={(e) => setEvalForm({...evalForm, finalReportSla: Number(e.target.value)})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                </div>
              </div>
            </div>

            {/* Summary preview */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">คะแนนรวม 5 มิติ (Composite Score):</span>
                <strong className="text-xl font-bold text-ikm-orange font-mono">{total5DScore} / 100</strong>
              </div>
              <div className={cn("px-3 py-1 rounded-lg text-xs font-bold", getEvaluationGrade(total5DScore).color)}>
                {getEvaluationGrade(total5DScore).grade}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ikm-border">
              <Button variant="ghost" size="sm" onClick={() => setShowEvalModal(false)}>ยกเลิก</Button>
              <Button size="sm" onClick={handleSaveEvaluation}>บันทึกผลการประเมิน 5 มิติ</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
