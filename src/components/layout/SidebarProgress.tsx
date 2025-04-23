
import { useArticle } from "@/context/ArticleContext";
import { STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function SidebarProgress() {
  const { state, goToStep } = useArticle();
  
  return (
    <div className="py-4 w-full">
      <div className="flex flex-col space-y-1">
        <h3 className="px-4 font-semibold text-sm">10-Step Article</h3>
        <div className="space-y-1 px-1">
          {STEPS.map((step) => {
            const isCompleted = state.step > step.id;
            const isCurrent = state.step === step.id;
            
            return (
              <button
                key={step.id}
                className={cn(
                  "w-full flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isCompleted && "text-blue-600",
                  isCurrent && "bg-blue-50 text-blue-600",
                  !isCompleted && !isCurrent && "text-gray-500 hover:bg-gray-100"
                )}
                onClick={() => goToStep(step.id)}
              >
                <div className="flex items-center justify-center mr-2">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center",
                      isCurrent ? "border-2 border-blue-600" : "border border-gray-300"
                    )}>
                      <span className="text-xs">{step.id}</span>
                    </div>
                  )}
                </div>
                <span>{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
