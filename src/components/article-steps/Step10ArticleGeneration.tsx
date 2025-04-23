
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { apiService } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Check, Download, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from "jspdf";

export function Step10ArticleGeneration() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [humanizing, setHumanizing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>("preview");
  const { toast } = useToast();
  const [downloadFormat, setDownloadFormat] = React.useState<"text" | "markdown" | "pdf">("markdown");

  React.useEffect(() => {
    const generateInitialArticle = async () => {
      if (!state.topic || !state.primaryKeyword || state.outline.length === 0) return;
      
      // Only generate if we don't have an article yet
      if (!state.generatedArticle) {
        setLoading(true);
        try {
          const secondaryKeywordTexts = state.secondaryKeywords.map(k => k.text);
          const article = await apiService.generateArticle(
            state.topic,
            state.outline,
            state.primaryKeyword.text,
            secondaryKeywordTexts,
            state.writingStyle,
            state.pointOfView,
            state.articleLength,
            state.expertGuidance
          );
          
          dispatch({ type: "SET_GENERATED_ARTICLE", payload: article });
          
          toast({
            title: "Article Generated",
            description: "Your article has been successfully generated.",
            variant: "default", // Changed from "success" to "default"
          });
        } catch (error) {
          console.error("Error generating article:", error);
          toast({
            title: "Error Generating Article",
            description: "There was an issue generating your article. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    generateInitialArticle();
  }, [state.topic, state.primaryKeyword, state.secondaryKeywords, state.outline, state.writingStyle, state.pointOfView, state.articleLength, state.expertGuidance, state.generatedArticle, dispatch, toast]);

  const handleRegenerateArticle = async () => {
    if (!state.topic || !state.primaryKeyword || state.outline.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please complete all previous steps before generating an article.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const secondaryKeywordTexts = state.secondaryKeywords.map(k => k.text);
      const article = await apiService.generateArticle(
        state.topic,
        state.outline,
        state.primaryKeyword.text,
        secondaryKeywordTexts,
        state.writingStyle,
        state.pointOfView,
        state.articleLength,
        state.expertGuidance
      );
      
      dispatch({ type: "SET_GENERATED_ARTICLE", payload: article });
      
      // Reset humanized article if we regenerate
      if (state.humanizedArticle) {
        dispatch({ type: "SET_HUMANIZED_ARTICLE", payload: "" });
      }
      
      toast({
        title: "Article Regenerated",
        description: "Your article has been successfully regenerated.",
        variant: "default", // Changed from "success" to "default"
      });
    } catch (error) {
      console.error("Error regenerating article:", error);
      toast({
        title: "Error Regenerating Article",
        description: "There was an issue regenerating your article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHumanizeArticle = async () => {
    if (!state.generatedArticle) {
      toast({
        title: "No Article to Humanize",
        description: "Please generate an article first.",
        variant: "destructive"
      });
      return;
    }
    
    setHumanizing(true);
    try {
      const humanizedArticle = await apiService.humanizeArticle(state.generatedArticle);
      dispatch({ type: "SET_HUMANIZED_ARTICLE", payload: humanizedArticle });
      
      toast({
        title: "Article Humanized",
        description: "Your article has been successfully humanized.",
        variant: "default", // Changed from "success" to "default"
      });
      
      // Switch to humanized tab
      setActiveTab("humanized");
    } catch (error) {
      console.error("Error humanizing article:", error);
      toast({
        title: "Error Humanizing Article",
        description: "There was an issue humanizing your article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setHumanizing(false);
    }
  };

  const handleDownloadArticle = () => {
    const article = activeTab === "humanized" && state.humanizedArticle 
      ? state.humanizedArticle 
      : state.generatedArticle;
    
    if (!article) {
      toast({
        title: "No Article to Download",
        description: "Please generate an article first.",
        variant: "destructive"
      });
      return;
    }
    
    const fileName = state.title 
      ? state.title.text.replace(/[^a-z0-9]/gi, '_').toLowerCase() 
      : "article";
    
    if (downloadFormat === "pdf") {
      try {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(22);
        doc.text(state.title?.text || state.topic, 20, 20);
        
        // Add content
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(
          article.replace(/#{1,6} /g, '').replace(/\*\*/g, ''), 
          170
        );
        let y = 40;
        
        for (let i = 0; i < splitText.length; i++) {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(splitText[i], 20, y);
          y += 7;
        }
        
        doc.save(`${fileName}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "PDF Generation Error",
          description: "There was an issue creating your PDF. Try a different format.",
          variant: "destructive"
        });
        return;
      }
    } else {
      const fileExtension = downloadFormat === "markdown" ? "md" : "txt";
      const blob = new Blob([article], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${fileName}.${fileExtension}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
    
    toast({
      title: "Download Started",
      description: `Your article is being downloaded as a ${downloadFormat.toUpperCase()} file.`,
      variant: "default", // Changed from "success" to "default"
    });
  };

  const renderArticleContent = (content: string) => {
    if (!content) return <div className="text-gray-500 italic">No content available</div>;
    
    // Convert markdown to HTML for preview
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: content
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
            .replace(/\n/gim, '<br />')
        }}
      />
    );
  };

  return (
    <ArticleLayout loading={loading && !state.generatedArticle}>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2">Article Generation</h2>
          <p className="text-gray-600 mb-4">
            Review your generated article, make it more human-like, and download in your preferred format.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Button 
              onClick={handleRegenerateArticle} 
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Regenerate Article
            </Button>
            
            <Button 
              onClick={handleHumanizeArticle}
              disabled={humanizing || !state.generatedArticle}
              variant="outline"
            >
              {humanizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 16v-4a4 4 0 00-8 0v4"></path>
                  <path d="M12 16v4"></path>
                  <path d="M8 22h8"></path>
                  <path d="M19 6a7 7 0 00-13.8 0"></path>
                </svg>
              )}
              Make More Human-like
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <select
                className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as any)}
              >
                <option value="markdown">Markdown</option>
                <option value="text">Text</option>
                <option value="pdf">PDF</option>
              </select>
              
              <Button 
                onClick={handleDownloadArticle}
                disabled={!state.generatedArticle}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {loading && !state.generatedArticle ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">Generating your article...</p>
            <p className="text-gray-500 text-center max-w-md mt-2">
              We're crafting a comprehensive, SEO-optimized article based on your topic, keywords, and outline.
              This may take a minute or two.
            </p>
          </div>
        ) : !state.generatedArticle ? (
          <div className="text-center p-12 border border-dashed rounded-lg">
            <p className="text-lg font-medium text-gray-700">No article generated yet</p>
            <p className="text-gray-500 mt-2 mb-6">
              Click the button below to generate an article based on your outline and keywords
            </p>
            <Button onClick={handleRegenerateArticle}>Generate Article</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="bg-gray-50 border-b px-4 py-3">
                  <TabsList className="bg-transparent p-0">
                    <TabsTrigger value="preview" className="data-[state=active]:bg-white">
                      Original
                    </TabsTrigger>
                    <TabsTrigger 
                      value="humanized" 
                      disabled={!state.humanizedArticle}
                      className="data-[state=active]:bg-white"
                    >
                      Humanized
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="preview" className="p-6 focus:outline-none">
                  <h1 className="text-3xl font-bold mb-6">{state.title?.text || state.topic}</h1>
                  {renderArticleContent(state.generatedArticle)}
                </TabsContent>
                
                <TabsContent value="humanized" className="p-6 focus:outline-none">
                  {state.humanizedArticle ? (
                    <>
                      <h1 className="text-3xl font-bold mb-6">{state.title?.text || state.topic}</h1>
                      {renderArticleContent(state.humanizedArticle)}
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-gray-600 mb-4">You haven't humanized your article yet.</p>
                      <Button onClick={handleHumanizeArticle}>
                        Make More Human-like
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        
        {state.enhancements && state.enhancements.length > 0 && state.generatedArticle && (
          <>
            <Separator className="my-8" />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Selected Enhancements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.enhancements.map(enhancementId => {
                  const enhancementTitle = enhancementId === "faq" ? "FAQ Section" :
                    enhancementId === "summary" ? "TL;DR Summary" :
                    enhancementId === "callToAction" ? "Call to Action" :
                    enhancementId === "keyTakeaways" ? "Key Takeaways" :
                    enhancementId === "expertQuote" ? "Expert Quote" :
                    enhancementId === "featuredImage" ? "Featured Image" :
                    enhancementId === "socialQuotes" ? "Social Media Quotes" :
                    enhancementId === "tableOfContents" ? "Table of Contents" :
                    enhancementId;
                  
                  return (
                    <div key={enhancementId} className="bg-white border rounded-lg p-4">
                      <div className="font-medium mb-1">{enhancementTitle}</div>
                      <div className="text-sm text-gray-600">
                        This enhancement will be included in your final article.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-green-800">Article Generation Complete</h3>
              <p className="text-sm text-green-700 mt-1">
                Your {state.articleLength === "sm" ? "short" : state.articleLength === "md" ? "medium" : "long"} article has been generated in a {state.writingStyle} style with {state.pointOfView} point-of-view.
                It includes your primary keyword "{state.primaryKeyword?.text}" and {state.secondaryKeywords.length} secondary keywords.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ArticleLayout>
  );
}
