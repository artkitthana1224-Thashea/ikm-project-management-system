import * as React from "react"
import { cn } from "@/src/lib/utils"
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, XCircle } from "lucide-react"
import { TaskStatus } from "@/src/types"

const statusConfig: Partial<Record<TaskStatus, { bg: string, text: string, icon: React.ReactNode }>> = {
  Draft: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: <Clock className="w-3.5 h-3.5" /> },
  Submitted: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', icon: <Clock className="w-3.5 h-3.5" /> },
  'Under Review': { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', icon: <Clock className="w-3.5 h-3.5" /> },
  'Returned for Information': { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  'Pending Management Review': { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', icon: <Clock className="w-3.5 h-3.5" /> },
  Assessment: { bg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-300', icon: <Clock className="w-3.5 h-3.5" /> },
  Planning: { bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', icon: <Clock className="w-3.5 h-3.5" /> },
  'Pending Approval': { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', icon: <Clock className="w-3.5 h-3.5" /> },
  Approved: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Assigned: { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark', icon: <Clock className="w-3.5 h-3.5" /> },
  Confirmed: { bg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-700 dark:text-teal-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  'Pre-Mobilization': { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', icon: <Clock className="w-3.5 h-3.5" /> },
  Mobilized: { bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-700 dark:text-sky-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  'In Progress': { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark', icon: <Clock className="w-3.5 h-3.5" /> },
  'Pending Inspection': { bg: 'bg-yellow-100 dark:bg-yellow-950/60', text: 'text-yellow-800 dark:text-yellow-300', icon: <Clock className="w-3.5 h-3.5" /> },
  'Rectification Required': { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  'Work Completed': { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  'Final Report Submitted': { bg: 'bg-violet-100 dark:bg-violet-950/60', text: 'text-violet-700 dark:text-violet-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  'Pending Close': { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', icon: <Clock className="w-3.5 h-3.5" /> },
  Closed: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  'On Hold': { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  Rejected: { bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-300', icon: <XCircle className="w-3.5 h-3.5" /> },
  Cancelled: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', icon: <XCircle className="w-3.5 h-3.5" /> },
  Reopened: { bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', icon: <Clock className="w-3.5 h-3.5" /> },
  // Compatibility
  Available: { bg: 'bg-ikm-green-light', text: 'text-ikm-green', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Completed: { bg: 'bg-ikm-green-light', text: 'text-ikm-green', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Active: { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark', icon: <Clock className="w-3.5 h-3.5" /> },
  Pending: { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark', icon: <Clock className="w-3.5 h-3.5" /> },
  Review: { bg: 'bg-purple-100', text: 'text-status-purple', icon: <Clock className="w-3.5 h-3.5" /> },
  Accepted: { bg: 'bg-ikm-green-light', text: 'text-ikm-green', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Warning: { bg: 'bg-yellow-100', text: 'text-status-yellow', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  Partial: { bg: 'bg-yellow-100', text: 'text-status-yellow', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  Critical: { bg: 'bg-red-100', text: 'text-status-red', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  Overdue: { bg: 'bg-red-100', text: 'text-status-red', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  Conflict: { bg: 'bg-red-100', text: 'text-status-red', icon: <XCircle className="w-3.5 h-3.5" /> },
  Training: { bg: 'bg-purple-100', text: 'text-status-purple', icon: <Clock className="w-3.5 h-3.5" /> },
  Leave: { bg: 'bg-blue-100', text: 'text-status-blue', icon: <Clock className="w-3.5 h-3.5" /> },
  Unavailable: { bg: 'bg-gray-100', text: 'text-status-gray', icon: <XCircle className="w-3.5 h-3.5" /> }
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className, ...props }: BadgeProps) {
  const config = statusConfig[status] || statusConfig['Unavailable'];
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider", config.bg, config.text, className)} {...props}>
      {config.icon}
      {status}
    </div>
  )
}
