import * as React from "react"
import { cn } from "@/src/lib/utils"

export function Avatar({ src, fallback, className }: { src?: string, fallback: string, className?: string }) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100", className)}>
      {src ? (
        <img src={src} className="aspect-square h-full w-full object-cover" alt="Avatar" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-gray-500">
          {fallback}
        </div>
      )}
    </div>
  )
}
