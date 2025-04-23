
import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ProgressStepsProps {
  steps: { id: number; name: string }[]
  currentStep: number
  onStepClick?: (step: number) => void
  className?: string
}

export function ProgressSteps({
  steps,
  currentStep,
  onStepClick,
  className,
}: ProgressStepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          const isLast = index === steps.length - 1

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                isLast ? "" : "flex-1 md:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 after:text-gray-200",
                isCompleted ? "text-blue-600 dark:text-blue-500 after:border-blue-600 dark:after:border-blue-500" : ""
              )}
              onClick={() => onStepClick && onStepClick(step.id)}
              role={onStepClick ? "button" : undefined}
            >
              <span className="flex items-center justify-center">
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 me-2 rounded-full shrink-0",
                    isCompleted ? "bg-blue-600 text-white" : isActive ? "border-2 border-blue-600 text-blue-600" : "border border-gray-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </span>
                <span
                  className={cn(
                    "hidden md:inline-flex",
                    isCompleted ? "text-blue-600" : isActive ? "text-blue-600" : ""
                  )}
                >
                  {step.name}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
