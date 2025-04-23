
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { ArticleProvider } from "@/context/ArticleContext";
import Step1Topic from "@/components/article-steps/Step1Topic";
import Step2ArticleType from "@/components/article-steps/Step2ArticleType";
import Step3References from "@/components/article-steps/Step3References";
import Step4PrimaryKeyword from "@/components/article-steps/Step4PrimaryKeyword";
import Step5Title from "@/components/article-steps/Step5Title";
import Step6SecondaryKeywords from "@/components/article-steps/Step6SecondaryKeywords";
import Step7Configuration from "@/components/article-steps/Step7Configuration";
import { useArticle } from "@/context/ArticleContext";

// This component will render the appropriate step based on the current state
const StepContent = () => {
  const { state } = useArticle();
  
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
      return <ArticleOutline />;
    case 9:
      return <ArticleEnhancements />;
    case 10:
      return <ArticleGeneration />;
    default:
      return <Step1Topic />;
  }
};

// Placeholder components for steps 8-10 until we implement them
const ArticleOutline = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Customize Article Outline</h2>
    <p className="text-gray-600">This feature will be implemented soon. Here you will be able to customize the outline of your article.</p>
  </div>
);

const ArticleEnhancements = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Add Enhancements</h2>
    <p className="text-gray-600">This feature will be implemented soon. Here you will be able to add enhancements to your article like FAQs, call-to-actions, and more.</p>
  </div>
);

const ArticleGeneration = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Article Generation</h2>
    <p className="text-gray-600">This feature will be implemented soon. Here you will be able to generate and review your article.</p>
  </div>
);

const Index = () => {
  return (
    <ArticleProvider>
      <ArticleLayout>
        <StepContent />
      </ArticleLayout>
    </ArticleProvider>
  );
};

export default Index;
