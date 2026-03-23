import { useArticle } from "@/context/ArticleContext";
import { STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function SidebarProgress() {
  const { state, goToStep } = useArticle();

  return (
    <div className="py-6 w-full">
      <div className="px-5 mb-6">
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-sidebar-foreground/50 mb-1">
          Progress
        </p>
        <div className="w-full h-1 rounded-full bg-sidebar-accent overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${((state.step - 1) / 9) * 100}%`,
              backgroundImage: 'linear-gradient(90deg, hsl(36, 72%, 48%), hsl(38, 80%, 62%))',
            }}
          />
        </div>
        <p className="text-xs font-body text-sidebar-foreground/40 mt-2">
          Step {state.step} of 10
        </p>
      </div>

      <div className="space-y-0.5 px-3">
        {STEPS.map((step, index) => {
          const isCompleted = state.step > step.id;
          const isCurrent = state.step === step.id;
          const isAccessible = step.id <= state.step;

          return (
            <button
              key={step.id}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-body transition-premium group",
                isCurrent && "bg-sidebar-accent text-sidebar-primary",
                isCompleted && "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                !isCompleted && !isCurrent && "text-sidebar-foreground/30 cursor-default"
              )}
              onClick={() => isAccessible && goToStep(step.id)}
              disabled={!isAccessible}
            >
              <div className="relative">
                {isCompleted ? (
                  <div className="step-indicator-completed w-7 h-7 flex items-center justify-center rounded-full">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : isCurrent ? (
                  <div className="step-indicator-active w-7 h-7 flex items-center justify-center rounded-full">
                    {step.id}
                  </div>
                ) : (
                  <div className="step-indicator-upcoming w-7 h-7 flex items-center justify-center rounded-full text-xs">
                    {step.id}
                  </div>
                )}
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 w-px h-2",
                    isCompleted ? "bg-sidebar-primary/30" : "bg-sidebar-accent"
                  )} />
                )}
              </div>
              <span className={cn(
                "text-left text-[13px] font-medium",
                isCurrent && "text-sidebar-primary"
              )}>
                {step.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
