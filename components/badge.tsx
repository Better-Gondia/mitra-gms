
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
        secondary:
          "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
        destructive:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 animate-pulse",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
        warning: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
