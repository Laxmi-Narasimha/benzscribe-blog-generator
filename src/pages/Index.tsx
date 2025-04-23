
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { ArticleProvider } from "@/context/ArticleContext";
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
      return <Step8ArticleOutline />;
    case 9:
      return <Step9ArticleEnhancements />;
    case 10:
      return <Step10ArticleGeneration />;
    default:
      return <Step1Topic />;
  }
};

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
