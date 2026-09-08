import * as React from "react"
import { cn } from "@/src/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, color = "bg-ikm-orange", className, ...props }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={cn("w-full bg-gray-100 rounded-full h-2 overflow-hidden", className)} {...props}>
      <div 
        className={cn("h-full transition-all duration-500 ease-in-out", color)} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
