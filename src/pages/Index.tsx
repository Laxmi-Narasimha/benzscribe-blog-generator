import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { ArticleProvider, useArticle } from "@/context/ArticleContext";
import { Step1Topic } from "@/components/article-steps/Step1Topic";
import { Step2ArticleType } from "@/components/article-steps/Step2ArticleType";
import { Step3References } from "@/components/article-steps/Step3References";
import { Step4PrimaryKeyword } from "@/components/article-steps/Step4PrimaryKeyword";
import { Step5Title } from "@/components/article-steps/Step5Title";
import { Step6SecondaryKeywords } from "@/components/article-steps/Step6SecondaryKeywords";
import { Step7Configuration } from "@/components/article-steps/Step7Configuration";
import { Step8ArticleOutline } from "@/components/article-steps/Step8ArticleOutline";
import { Step9ArticleEnhancements } from "@/components/article-steps/Step9ArticleEnhancements";
import { Step10ArticleGeneration } from "@/components/article-steps/Step10ArticleGeneration";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

// Define a custom event interface
interface StepLoadingEvent extends CustomEvent {
  detail: {
    loading: boolean;
  };
}

// This component will render the appropriate step based on the current state
const StepContent = () => {
  const { state } = useArticle();
  
  // Log the current step to help with debugging
  useEffect(() => {
    console.log('Current step:', state.step);
  }, [state.step]);
  
  switch (state.step) {
    case 1:
      return <Step1Topic />;
    case 2:
      return <Step2ArticleType />;
    case 3:
      return <Step3References />;
    case 4:
      return <Step4PrimaryKeyword />;
    case 5:
      return <Step5Title />;
    case 6:
      return <Step6SecondaryKeywords />;
    case 7:
      return <Step7Configuration />;
    case 8:
      return <Step8ArticleOutline />;
    case 9:
      return <Step9ArticleEnhancements />;
    case 10:
      return <Step10ArticleGeneration />;
    default:
      return <Step1Topic />;
  }
};

// This component determines if the next button should be disabled based on the current step
const ArticleLayoutWrapper = () => {
  const { state } = useArticle();
  const [loading, setLoading] = React.useState(false);
  
  // Expose loading state to child components
  React.useEffect(() => {
    // Add a window event listener to capture loading state from step components
    const handleLoading = (event: StepLoadingEvent) => {
      setLoading(event.detail.loading);
    };
    
    window.addEventListener('step:loading', handleLoading as EventListener);
    
    return () => {
      window.removeEventListener('step:loading', handleLoading as EventListener);
    };
  }, []);
  
  // Determine if next button should be disabled based on current step
  const isNextDisabled = () => {
    switch (state.step) {
      case 1:
        return !state.topic.trim(); // Topic is required
      case 2:
        return !state.articleType; // Article type is required
      case 3:
        return state.references.length === 0; // At least one reference is required
      case 4:
        return !state.primaryKeyword; // Primary keyword is required
      case 5:
        return !state.title || !state.title.text; // Title is required
      case 6:
        return !state.secondaryKeywords || state.secondaryKeywords.length === 0; // At least one secondary keyword is required
      case 7:
        return false; // Configuration is optional
      case 8:
        return !state.outline || state.outline.length === 0; // Outline is required
      case 9:
        return false; // Enhancements are optional
      case 10:
        return false; // Generation is always allowed
      default:
        return false;
    }
  };
  
  return (
    <ArticleLayout nextDisabled={isNextDisabled()} loading={loading}>
      <StepContent />
    </ArticleLayout>
  );
};

const Index = () => {
  const navigate = useNavigate();
  
  // Redirect user from /articles route to main page
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/articles') {
      console.log('Redirecting from /articles to home page');
      navigate('/');
    }
  }, [navigate]);

  return (
    <ArticleProvider>
      <ArticleLayoutWrapper />
    </ArticleProvider>
  );
};

export default Index;
