import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { AppHeader } from "./AppHeader";
import { SidebarProgress } from "./SidebarProgress";
import { STEPS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_INTROS: Record<number, { subtitle: string; description: string }> = {
  1: { subtitle: "Foundation", description: "Every great article begins with a compelling topic. Define your subject and tailor it to your audience." },
  2: { subtitle: "Format", description: "Choose the article format and research methodology that best suits your content goals." },
  3: { subtitle: "Research", description: "Select authoritative references to enrich your article with credible, well-sourced information." },
  4: { subtitle: "SEO Core", description: "Identify the primary keyword that will anchor your article's search visibility and drive organic traffic." },
  5: { subtitle: "Headline", description: "Your title is the first impression. Choose one that's magnetic, SEO-optimized, and impossible to ignore." },
  6: { subtitle: "Semantic SEO", description: "Expand your article's reach with semantically related keywords that strengthen topical authority." },
  7: { subtitle: "Voice & Style", description: "Fine-tune your article's personality — length, tone, perspective, and expert guidance." },
  8: { subtitle: "Architecture", description: "Sculpt the perfect structure. Each section should flow naturally and serve your reader's journey." },
  9: { subtitle: "Enhancements", description: "Elevate your article with AI-powered additions — FAQs, images, social quotes, and more." },
  10: { subtitle: "Masterpiece", description: "Your article is ready. Review, refine, humanize, and export in your preferred format." },
};

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
  const stepIntro = STEP_INTROS[state.step];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[280px] border-r border-sidebar-border bg-sidebar hidden lg:flex flex-col relative overflow-hidden">
          {/* Sidebar header */}
          <div className="p-5 pb-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5 mb-1.5">
              <Sparkles className="h-4 w-4 text-sidebar-primary" />
              <h2 className="text-base font-display text-sidebar-foreground tracking-tight">
                Article Studio
              </h2>
            </div>
            <p className="text-[11px] font-body text-sidebar-foreground/30 leading-relaxed">
              10-step precision workflow
            </p>
          </div>
          <SidebarProgress />

          {/* Decorative gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: 'linear-gradient(to top, hsl(225, 25%, 7%), transparent)' }}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 max-w-3xl w-full mx-auto px-6 lg:px-10 py-10">
            {/* Step header */}
            <div className="mb-12 animate-fade-up">
              {/* Step badge */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-body font-bold text-primary-foreground"
                    style={{ background: 'linear-gradient(135deg, hsl(38, 75%, 48%), hsl(40, 80%, 58%))' }}>
                    {state.step}
                  </div>
                  <span className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                    {stepIntro?.subtitle}
                  </span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {state.step}/10
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-display text-foreground leading-[1.1] mb-3">
                {currentStep?.name || "Create Article"}
              </h1>

              {/* Description */}
              <p className="text-base font-body text-muted-foreground leading-relaxed max-w-xl">
                {stepIntro?.description}
              </p>
            </div>

            {/* Step content */}
            <div className="mb-24 animate-fade-up" style={{ animationDelay: '0.08s' }}>
              {children}
            </div>

            {/* Navigation */}
            <div className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-border/50 -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 z-10">
              <div className="flex justify-between items-center max-w-3xl mx-auto">
                {state.step > 1 ? (
                  <button className="artisan-btn-secondary" onClick={handlePrev}>
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
                        (nextDisabled || isProcessing || loading) && "opacity-40 cursor-not-allowed"
                      )}
                      disabled={nextDisabled || isProcessing || loading}
                      onClick={handleNext}
                    >
                      {(isProcessing || loading) && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {state.step === 10 && (
                    <button className="artisan-btn-primary" onClick={handleNext}>
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
