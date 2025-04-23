
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { AppHeader } from "./AppHeader";
import { SidebarProgress } from "./SidebarProgress";
import { STEPS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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

  const currentStep = STEPS.find(step => step.id === state.step);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <div className="w-64 border-r bg-gray-50 hidden md:block">
          <div className="py-4">
            <div className="px-4 py-2">
              <h2 className="text-xl font-semibold text-gray-800">AI Article Writer</h2>
              <p className="text-sm text-gray-500">
                Factually accurate, SEO-optimized articles and blogs of up to 5000 words
              </p>
            </div>
            <SidebarProgress />
          </div>
        </div>
        <div className="flex-1">
          <main className="max-w-5xl mx-auto px-4 py-6">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">{currentStep?.name || "Create Article"}</h1>
            </div>
            <div className="mb-16">
              {children}
            </div>
            <div className="flex justify-between pt-4 border-t">
              {state.step > 1 ? (
                <button
                  className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                  onClick={handlePrev}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div></div>
              )}
              <div className="flex items-center space-x-2">
                {state.step < 10 && (
                  <button
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700",
                      (nextDisabled || isProcessing || loading) && "opacity-50 cursor-not-allowed"
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
                    className="flex items-center space-x-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={handleNext}
                  >
                    <span>Download Article</span>
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
