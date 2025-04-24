import * as React from "react";
import { useArticle } from "@/context/ArticleContext";

import { apiService } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Check, Download, Loader2, RefreshCw, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from "jspdf";
import { Switch } from "@/components/ui/switch";
import { FileText } from "lucide-react";
import { marked } from "marked";

export function Step10ArticleGeneration() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"original" | "humanized">("original");
  const [humanizing, setHumanizing] = React.useState(false);
  const [downloadFormat, setDownloadFormat] = React.useState<"markdown" | "txt" | "pdf">("markdown");
  const { toast } = useToast();
  const [generatingProgress, setGeneratingProgress] = React.useState<string>("");
  const [showRealTimeGeneration, setShowRealTimeGeneration] = React.useState<boolean>(true);
  const articleContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (hasAttemptedGeneration || state.generatedArticle) {
      return;
    }
    
    if (!state.topic || !state.primaryKeyword || state.outline.length === 0 || !state.articleType) {
      console.log("[Step 10 Debug] Missing required data for article generation");
      return;
    }
    
    const generateArticleOnLoad = async () => {
      setLoading(true);
      setHasAttemptedGeneration(true);
      
      try {
        console.log("[Step 10 Debug] Initiating article generation");
        console.log("[Step 10 Debug] Enhancement IDs to include:", state.enhancements);
        console.log("[Step 10 Debug] Enhancement content available:", state.enhancementContent);
        
        const secondaryKeywordText = state.secondaryKeywords.map(k => k.text);
        
        const enhancementsPayload = state.enhancements && state.enhancements.length > 0 
          ? { 
              ids: state.enhancements, 
              content: state.enhancementContent || {} 
            } 
          : undefined;
        
        if (enhancementsPayload) {
          console.log("[Step 10 Debug] Passing enhancements to article generation:", enhancementsPayload);
        }
        
        // Simulate real-time article generation with progress updates
        if (showRealTimeGeneration) {
          setGeneratingProgress("# Generating your article...\n\n");
          
          // Simulate introduction generation
          await new Promise(resolve => setTimeout(resolve, 1000));
          setGeneratingProgress(prev => prev + `## Introduction\n\nCreating an engaging introduction about ${state.topic}...\n\n`);
          
          // Simulate section-by-section generation
          for (const section of state.outline) {
            await new Promise(resolve => setTimeout(resolve, 800));
            setGeneratingProgress(prev => prev + `## ${section.heading}\n\nWriting content for this section...\n\n`);
            
            for (const subheading of section.subheadings) {
              await new Promise(resolve => setTimeout(resolve, 600));
              setGeneratingProgress(prev => prev + `### ${subheading}\n\nDeveloping this subsection with valuable insights...\n\n`);
            }
          }
          
          // Simulate conclusion
          await new Promise(resolve => setTimeout(resolve, 800));
          setGeneratingProgress(prev => prev + `## Conclusion\n\nFinalizing with a strong conclusion...\n\n`);
          
          // Scroll to the bottom as content is generated
          if (articleContainerRef.current) {
            articleContainerRef.current.scrollTop = articleContainerRef.current.scrollHeight;
          }
        }
        
        // Actual article generation
          const article = await apiService.generateArticle(
            state.topic,
            state.outline,
          state.primaryKeyword?.text || state.topic,
          secondaryKeywordText,
          state.articleType,
            state.writingStyle,
            state.pointOfView,
            state.articleLength,
          state.expertGuidance,
          enhancementsPayload
          );
        
        console.log("[Step 10 Debug] Article generation completed");
          
          dispatch({ type: "SET_GENERATED_ARTICLE", payload: article });
        setGeneratingProgress(""); // Clear progress display
          
          toast({
            title: "Article Generated",
            description: "Your article has been successfully generated.",
          variant: "default",
          });
        } catch (error) {
        console.error("[Step 10 Debug] Error generating article:", error);
        setGeneratingProgress(""); // Clear progress display
          toast({
          title: "Generation Error",
          description: "There was an error generating your article. Please try again.",
          variant: "destructive"
          });
        } finally {
          setLoading(false);
      }
    };
    
    generateArticleOnLoad();
  }, [state.topic, state.primaryKeyword, state.outline, state.articleType]);

  const handleRegenerateArticle = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      console.log("[Step 10 Debug] Regenerating article");
      
      const secondaryKeywordText = state.secondaryKeywords.map(k => k.text);
      
      const enhancementsPayload = state.enhancements && state.enhancements.length > 0 
        ? { 
            ids: state.enhancements, 
            content: state.enhancementContent || {} 
          } 
        : undefined;
        
      // Start real-time generation display if enabled
      if (showRealTimeGeneration) {
        setGeneratingProgress("# Regenerating your article...\n\n");
        
        // Simulate introduction generation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGeneratingProgress(prev => prev + `## Introduction\n\nCreating a fresh introduction about ${state.topic}...\n\n`);
        
        // Simulate section-by-section generation
        for (const section of state.outline) {
          await new Promise(resolve => setTimeout(resolve, 800));
          setGeneratingProgress(prev => prev + `## ${section.heading}\n\nRewriting content for this section...\n\n`);
          
          for (const subheading of section.subheadings) {
            await new Promise(resolve => setTimeout(resolve, 600));
            setGeneratingProgress(prev => prev + `### ${subheading}\n\nImproving this subsection with new insights...\n\n`);
          }
        }
        
        // Simulate conclusion
        await new Promise(resolve => setTimeout(resolve, 800));
        setGeneratingProgress(prev => prev + `## Conclusion\n\nCreating a stronger conclusion...\n\n`);
        
        // Scroll to the bottom as content is generated
        if (articleContainerRef.current) {
          articleContainerRef.current.scrollTop = articleContainerRef.current.scrollHeight;
        }
      }
      
      const article = await apiService.generateArticle(
        state.topic,
        state.outline,
        state.primaryKeyword?.text || state.topic,
        secondaryKeywordText,
        state.articleType,
        state.writingStyle,
        state.pointOfView,
        state.articleLength,
        state.expertGuidance,
        enhancementsPayload
      );
      
      console.log("[Step 10 Debug] Article regeneration completed");
      
      dispatch({ type: "SET_GENERATED_ARTICLE", payload: article });
      dispatch({ type: "SET_HUMANIZED_ARTICLE", payload: null });
      setActiveTab("original");
      setGeneratingProgress(""); // Clear progress display
      
      toast({
        title: "Article Regenerated",
        description: "Your article has been successfully regenerated.",
        variant: "default",
      });
    } catch (error) {
      console.error("[Step 10 Debug] Error regenerating article:", error);
      setGeneratingProgress(""); // Clear progress display
      toast({
        title: "Regeneration Error",
        description: "There was an error regenerating your article. Please try again.",
        variant: "destructive"
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
        variant: "default",
      });
      
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

  const getCombinedArticleContent = (baseContent: string): string => {
    console.log("[Step 10 Debug] getCombinedArticleContent called.");
    console.log("[Step 10 Debug] Selected enhancement IDs (state.enhancements):", state.enhancements);
    console.log("[Step 10 Debug] Available enhancement content map (state.enhancementContent):", state.enhancementContent);
    
    if (!state.enhancements || state.enhancements.length === 0) {
      console.log("[Step 10 Debug] No enhancements selected, returning base content.");
      return baseContent;
    }
    
    const enhancementContent = state.enhancementContent || {}; 
    
    const availableEnhancements = Object.keys(enhancementContent);
    console.log("[Step 10 Debug] Actually available enhancement content keys:", availableEnhancements);
    
    const selectedEnhancementsWithContent = state.enhancements.filter(id => enhancementContent[id]);
    console.log("[Step 10 Debug] Selected enhancements WITH content:", selectedEnhancementsWithContent);
    
    if (selectedEnhancementsWithContent.length === 0) {
      console.log("[Step 10 Debug] No enhancement content available for selected enhancements, returning base content.");
      return baseContent;
    }

    console.log("[Step 10 Debug] Building combined content with enhancements.");
    let combined = "";

    const orderedEnhancements: { id: string; position: 'prepend' | 'append'; heading?: string }[] = [
      { id: "tableOfContents", position: 'prepend', heading: "## Table of Contents" },
      { id: "summary", position: 'prepend', heading: "## TL;DR Summary" },
      { id: "keyTakeaways", position: 'prepend', heading: "## Key Takeaways" },
      { id: "expertQuote", position: 'append', heading: "## Expert Insight" },
      { id: "faq", position: 'append', heading: "## Frequently Asked Questions (FAQ)" },
      { id: "callToAction", position: 'append', heading: "## Next Steps" },
      { id: "socialQuotes", position: 'append', heading: "## Shareable Quotes" }
    ];

    orderedEnhancements.forEach(({ id, position, heading }) => {
      if (position === 'prepend' && state.enhancements.includes(id) && enhancementContent[id]) {
        console.log(`[Step 10 Debug] Adding prepend enhancement: ${id}`);
        if (heading) combined += `${heading}\n\n`;
        combined += enhancementContent[id] + "\n\n---\n\n"; 
      }
    });

    combined += baseContent;

    orderedEnhancements.forEach(({ id, position, heading }) => {
      if (position === 'append' && state.enhancements.includes(id) && enhancementContent[id]) {
        console.log(`[Step 10 Debug] Adding append enhancement: ${id}`);
        combined += "\n\n---\n\n";
        if (heading) combined += `${heading}\n\n`;
        combined += enhancementContent[id]; 
      }
    });

    const processedIds = orderedEnhancements.map(e => e.id);
    state.enhancements.forEach(id => {
      if (!processedIds.includes(id) && enhancementContent[id] && id !== 'featuredImage') { 
        console.log(`[Step 10 Debug] Adding unordered enhancement: ${id}`);
        combined += `\n\n---\n\n## ${id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n`; 
        combined += enhancementContent[id];
      }
    });

    if (state.enhancements.includes('featuredImage') && enhancementContent['featuredImage']) {
      console.log(`[Step 10 Debug] Featured image will be available for download/display`);
    }

    console.log("[Step 10 Debug] Combined content created successfully");
    return combined.trim();
  };

  const handleDownloadArticle = () => {
    const baseArticle = activeTab === "humanized" && state.humanizedArticle 
      ? state.humanizedArticle 
      : state.generatedArticle;
    
    const articleToDownload = getCombinedArticleContent(baseArticle);
    
    if (!articleToDownload) {
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
        
        doc.setFontSize(22);
        doc.text(state.title?.text || state.topic, 20, 20);
        
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(
          articleToDownload.replace(/#{1,6} /g, '').replace(/\*\*/g, ''), 
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
      const blob = new Blob([articleToDownload], { type: "text/plain" });
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
      variant: "default",
    });
  };

  const renderArticleContent = (content: string, featuredImage?: string) => {
    if (!content) return null;
    
    try {
      let modifiedContent = content;
      
      // Define the placeholder regex
      const placeholderRegex = /\[Featured Image: AI-generated image for .*?\]/gi;
      
      // Check if a featured image URL is provided
      if (featuredImage) {
        const titleRegex = /^#\s+(.+?)$/m;
        const titleMatch = titleRegex.exec(modifiedContent);
        const altText = titleMatch ? titleMatch[1] : 'Featured image';
        
        // Construct the image HTML
        const featuredImageHTML = `\n\n<div style="position: relative; margin: 20px 0 30px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
          <img src="${featuredImage}" alt="${altText}" style="width: 100%; height: auto; display: block; max-height: 500px; object-fit: cover;" />
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); color: white; padding: 15px;">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Featured image related to ${altText}</p>
          </div>
        </div>\n\n`;
        
        // Attempt to replace the placeholder text
        if (placeholderRegex.test(modifiedContent)) {
          modifiedContent = modifiedContent.replace(placeholderRegex, featuredImageHTML);
          console.log("[Step 10 Debug] Replaced featured image placeholder.");
        } else {
          // If placeholder isn't found, insert the image after the title
          console.log("[Step 10 Debug] Placeholder not found, inserting image after title.");
          if (titleMatch) {
            modifiedContent = modifiedContent.replace(titleRegex, `# $1${featuredImageHTML}`);
          } else {
            // If no title is found either, prepend the image to the content
            modifiedContent = featuredImageHTML + modifiedContent;
          }
        }
      } else {
        // If no featured image URL is available, remove the placeholder
        modifiedContent = modifiedContent.replace(placeholderRegex, '');
        console.log("[Step 10 Debug] No featured image URL, removed placeholder.");
      }
      
      return processMarkdown(modifiedContent);
    } catch (error) {
      console.error("Error rendering article content:", error);
      return processMarkdown(content); // Return original content on error
    }
  };

  // Helper function to escape special characters in regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  // Helper function to generate contextually relevant image captions
  const getImageCaption = (headingText: string) => {
    const headingLower = headingText.toLowerCase();
    
    // Try to match the heading content to a relevant caption
    if (headingLower.includes('benefit') || headingLower.includes('advantage')) {
      return "Visual representation of key benefits";
    } else if (headingLower.includes('how') || headingLower.includes('guide') || headingLower.includes('tutorial')) {
      return "Step-by-step visual guide";
    } else if (headingLower.includes('research') || headingLower.includes('study') || headingLower.includes('analysis')) {
      return "Research and analysis visualization";
    } else if (headingLower.includes('future') || headingLower.includes('trend')) {
      return "Visual representation of industry trends";
    } else if (headingLower.includes('challenge') || headingLower.includes('problem')) {
      return "Illustration of common challenges";
    } else if (headingLower.includes('strategy') || headingLower.includes('plan')) {
      return "Strategic planning visualization";
    } else if (headingLower.includes('team') || headingLower.includes('collaboration')) {
      return "Team collaboration in action";
    } else if (headingLower.includes('technology') || headingLower.includes('digital')) {
      return "Technology implementation example";
    }
    
    // Default caption options if no match found
    const generalCaptions = [
      "Relevant illustration",
      "Visual context for this section",
      "Topic-related imagery",
      "Conceptual representation",
      "Professional stock photo"
    ];
    
    return generalCaptions[Math.floor(Math.random() * generalCaptions.length)];
  };

  // Process markdown content to HTML
  const processMarkdown = (content: string) => {
    // Cast the result to string as marked's typings can be confusing
    // The parse function returns string in the browser context
    const processedContent = marked.parse(content) as string;
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  };

  return (
    
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
                <User className="mr-2 h-4 w-4" />
              )}
              Make it More Human
            </Button>

            <div className="flex items-center ml-auto">
              <span className="text-sm text-gray-600 mr-2">Show real-time progress:</span>
              <Switch 
                checked={showRealTimeGeneration} 
                onCheckedChange={setShowRealTimeGeneration} 
                aria-label="Toggle real-time generation display"
              />
            </div>
            
            <div className="flex items-center">
              <label htmlFor="format-select" className="mr-2 text-sm">Download as:</label>
              <select
                id="format-select"
                className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as "markdown" | "txt" | "pdf")}
              >
                <option value="markdown">Markdown</option>
                <option value="txt">Text</option>
                <option value="pdf">PDF</option>
              </select>
              <Button 
                onClick={handleDownloadArticle}
                disabled={!state.generatedArticle}
                size="sm" 
                className="ml-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {loading && generatingProgress && (
          <div className="border rounded-md overflow-hidden mb-6">
            <div className="bg-gray-50 border-b px-4 py-3 flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="font-medium">Generating Article in Real-Time</span>
            </div>
            <div 
              ref={articleContainerRef}
              className="p-6 max-h-[500px] overflow-y-auto"
            >
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: generatingProgress
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/\n/g, '<br />')
                }}
              />
          </div>
          </div>
        )}
        
        {state.generatedArticle ? (
          <div className="border rounded-md overflow-hidden">
            <Tabs 
              value={activeTab} 
              onValueChange={(value: string) => setActiveTab(value as "original" | "humanized")}
            >
                <div className="bg-gray-50 border-b px-4 py-3">
                  <TabsList className="bg-transparent p-0">
                  <TabsTrigger value="original" className="data-[state=active]:bg-white">
                      Original
                    </TabsTrigger>
                  <TabsTrigger value="humanized" className="data-[state=active]:bg-white" disabled={!state.humanizedArticle}>
                      Humanized
                    </TabsTrigger>
                  </TabsList>
                </div>
                
              <TabsContent value="original" className="p-6 focus:outline-none">
                  <h1 className="text-3xl font-bold mb-6">{state.title?.text || state.topic}</h1>
                {renderArticleContent(state.generatedArticle, state.enhancementContent?.featuredImage)}
                </TabsContent>
                
                <TabsContent value="humanized" className="p-6 focus:outline-none">
                <h1 className="text-3xl font-bold mb-6">{state.title?.text || state.topic}</h1>
                  {state.humanizedArticle ? (
                  renderArticleContent(state.humanizedArticle, state.enhancementContent?.featuredImage)
                ) : (
                  <div className="text-gray-500 italic">No humanized version available yet. Click "Make it More Human" to create one.</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
        ) : (
          <div className="border rounded-md p-8 text-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 mb-4 animate-spin text-blue-500" />
                <p className="text-gray-600">Generating your article...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a minute or two, depending on article length.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-gray-600 mb-2">No article generated yet</p>
                <p className="text-sm text-gray-500 mb-4">Click the button above to generate your article.</p>
                <Button onClick={handleRegenerateArticle} disabled={loading}>Generate Article</Button>
              </div>
            )}
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
    
  );
}
