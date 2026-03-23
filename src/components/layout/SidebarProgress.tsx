import { useArticle } from "@/context/ArticleContext";
import { STEPS } from "@/lib/constants";
import { Check } from "lucide-react";

const STEP_HINTS: Record<number, string> = {
  1: "Define your subject",
  2: "Choose format",
  3: "Source references",
  4: "Target keywords",
  5: "Craft headline",
  6: "Expand SEO",
  7: "Tune voice",
  8: "Build structure",
  9: "Add extras",
  10: "Generate & export",
};

export function SidebarProgress() {
  const { state, goToStep } = useArticle();

  const completedCount = state.step - 1;
  const progressPercent = (completedCount / 10) * 100;

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress indicator */}
      <div className="px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-sidebar-foreground/40">
            Progress
          </span>
          <span className="text-[10px] font-mono text-sidebar-primary">
            {completedCount}/10
          </span>
        </div>
        <div className="h-1 rounded-full bg-sidebar-accent overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, hsl(38, 75%, 48%), hsl(40, 80%, 60%))',
            }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto py-2">
        {STEPS.map((step) => {
          const isActive = step.id === state.step;
          const isCompleted = step.id < state.step;
          const isClickable = step.id <= state.step;

          return (
            <button
              key={step.id}
              className={`w-full flex items-center gap-3.5 px-5 py-3 text-left transition-all duration-300 relative ${
                isActive
                  ? "bg-sidebar-accent"
                  : isClickable
                  ? "hover:bg-sidebar-accent/50 cursor-pointer"
                  : "opacity-40 cursor-default"
              }`}
              onClick={() => isClickable && goToStep(step.id)}
              disabled={!isClickable}
            >
              {/* Step number/check */}
              {isCompleted ? (
                <div className="step-dot-completed" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : isActive ? (
                <div className="step-dot-active" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                  {step.id}
                </div>
              ) : (
                <div className="step-dot-upcoming" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                  {step.id}
                </div>
              )}

              {/* Step info */}
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-body font-medium truncate transition-colors duration-300 ${
                  isActive
                    ? "text-sidebar-primary"
                    : isCompleted
                    ? "text-sidebar-foreground"
                    : "text-sidebar-foreground/50"
                }`}>
                  {step.name}
                </div>
                {isActive && (
                  <div className="text-[10px] font-body text-sidebar-foreground/40 mt-0.5 truncate">
                    {STEP_HINTS[step.id]}
                  </div>
                )}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-l-full"
                  style={{ background: 'linear-gradient(180deg, hsl(38, 75%, 48%), hsl(40, 80%, 58%))' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
