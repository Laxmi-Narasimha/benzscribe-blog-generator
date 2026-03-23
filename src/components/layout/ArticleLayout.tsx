import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { AppHeader } from "./AppHeader";
import { SidebarProgress } from "./SidebarProgress";
import { STEPS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  nextDisabled?: boolean;
  onNext?: () => Promise<void> | void;
  onPrev?: () => void;
}

export function ArticleLayout({
  children,
  loading = false,
  nextDisabled = false,
  onNext,
  onPrev,
}: ArticleLayoutProps) {
  const { state, nextStep, prevStep } = useArticle();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleNext = async () => {
    if (onNext) {
      setIsProcessing(true);
      try {
        await onNext();
      } catch (error) {
        console.error("Error in onNext handler:", error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else {
      prevStep();
    }
  };

  const currentStep = STEPS.find((step) => step.id === state.step);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-72 border-r border-sidebar-border bg-sidebar hidden md:flex flex-col">
          <div className="p-5 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-sidebar-primary" />
              <h2 className="text-lg font-display font-semibold text-sidebar-foreground">
                Article Studio
              </h2>
            </div>
            <p className="text-xs font-body text-sidebar-foreground/40 leading-relaxed">
              Craft SEO-optimized articles up to 5,000 words with AI precision
            </p>
          </div>
          <SidebarProgress />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 max-w-4xl w-full mx-auto px-6 lg:px-10 py-8">
            {/* Step header */}
            <div className="mb-10 animate-fade-up">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-body font-bold text-primary-foreground"
                  style={{ backgroundImage: 'linear-gradient(135deg, hsl(36, 72%, 48%), hsl(38, 80%, 55%))' }}>
                  {state.step}
                </span>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">
                  Step {state.step} of 10
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-semibold text-foreground mt-4">
                {currentStep?.name || "Create Article"}
              </h1>
            </div>

            {/* Step content */}
            <div className="mb-20 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {children}
            </div>

            {/* Navigation */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border -mx-6 lg:-mx-10 px-6 lg:px-10 py-4">
              <div className="flex justify-between items-center max-w-4xl mx-auto">
                {state.step > 1 ? (
                  <button
                    className="artisan-btn-secondary"
                    onClick={handlePrev}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  {state.step < 10 && (
                    <button
                      className={cn(
                        "artisan-btn-primary",
                        (nextDisabled || isProcessing || loading) &&
                          "opacity-50 cursor-not-allowed"
                      )}
                      disabled={nextDisabled || isProcessing || loading}
                      onClick={handleNext}
                    >
                      {(isProcessing || loading) && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {state.step === 10 && (
                    <button
                      className="artisan-btn-primary"
                      onClick={handleNext}
                    >
                      <span>Download Article</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
