import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-ikm-orange text-white hover:bg-ikm-orange-dark shadow-sm",
      secondary: "bg-ikm-green text-white hover:bg-ikm-green-secondary shadow-sm",
      outline: "border border-ikm-border bg-ikm-card hover:bg-ikm-bg text-ikm-text",
      ghost: "hover:bg-ikm-border text-ikm-text",
      danger: "bg-status-red text-white hover:bg-red-600 shadow-sm",
    }
    const sizes = {
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-11 px-4 py-2 text-sm rounded-lg min-h-[44px]", // Minimum touch target 44px
      lg: "h-12 px-8 text-base rounded-xl min-h-[44px]",
      icon: "h-11 w-11 rounded-full flex items-center justify-center min-h-[44px]",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ikm-orange disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
