import * as React from "react"
import { cn } from "@/src/lib/utils"
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, XCircle } from "lucide-react"
import { TaskStatus } from "@/src/types"

const statusConfig: Record<TaskStatus, { bg: string, text: string, icon: React.ReactNode }> = {
  Available: { bg: 'bg-ikm-green-light', text: 'text-ikm-green', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Completed: { bg: 'bg-ikm-green-light', text: 'text-ikm-green', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Assigned: { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark', icon: <Clock className="w-3.5 h-3.5" /> },
  Active: { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark', icon: <Clock className="w-3.5 h-3.5" /> },
  'In Progress': { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark', icon: <Clock className="w-3.5 h-3.5" /> },
  Pending: { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark', icon: <Clock className="w-3.5 h-3.5" /> },
  Review: { bg: 'bg-purple-100', text: 'text-status-purple', icon: <Clock className="w-3.5 h-3.5" /> },
  Closed: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
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
