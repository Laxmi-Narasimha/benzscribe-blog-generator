import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { apiService } from "@/services/apiService";
import { Check, Download, Loader2, RefreshCw, User, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from "jspdf";
import { Switch } from "@/components/ui/switch";
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
    if (hasAttemptedGeneration || state.generatedArticle) return;
    if (!state.topic || !state.primaryKeyword || state.outline.length === 0 || !state.articleType) return;

    const generateArticleOnLoad = async () => {
      setLoading(true);
      setHasAttemptedGeneration(true);
      try {
        const secondaryKeywordText = state.secondaryKeywords.map(k => k.text);
        const enhancementsPayload = state.enhancements?.length ? { ids: state.enhancements, content: state.enhancementContent || {} } : undefined;

        if (showRealTimeGeneration) {
          setGeneratingProgress("# Generating your article...\n\n");
          await new Promise(resolve => setTimeout(resolve, 1000));
          setGeneratingProgress(prev => prev + `## Introduction\n\nCreating an engaging introduction about ${state.topic}...\n\n`);
          for (const section of state.outline) {
            await new Promise(resolve => setTimeout(resolve, 800));
            setGeneratingProgress(prev => prev + `## ${section.heading}\n\nWriting content...\n\n`);
            for (const sub of section.subheadings) {
              await new Promise(resolve => setTimeout(resolve, 600));
              setGeneratingProgress(prev => prev + `### ${sub}\n\nDeveloping insights...\n\n`);
            }
          }
          if (articleContainerRef.current) articleContainerRef.current.scrollTop = articleContainerRef.current.scrollHeight;
        }

        const article = await apiService.generateArticle(state.topic, state.outline, state.primaryKeyword?.text || state.topic, secondaryKeywordText, state.articleType, state.writingStyle, state.pointOfView, state.articleLength, state.expertGuidance, enhancementsPayload);
        dispatch({ type: "SET_GENERATED_ARTICLE", payload: article });
        setGeneratingProgress("");
        toast({ title: "Article Generated", description: "Your article is ready.", variant: "default" });
      } catch {
        setGeneratingProgress("");
        toast({ title: "Error", description: "Failed to generate. Please try again.", variant: "destructive" });
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
      const secondaryKeywordText = state.secondaryKeywords.map(k => k.text);
      const enhancementsPayload = state.enhancements?.length ? { ids: state.enhancements, content: state.enhancementContent || {} } : undefined;
      if (showRealTimeGeneration) {
        setGeneratingProgress("# Regenerating...\n\n");
        for (const section of state.outline) {
          await new Promise(resolve => setTimeout(resolve, 600));
          setGeneratingProgress(prev => prev + `## ${section.heading}\n\n`);
        }
      }
      const article = await apiService.generateArticle(state.topic, state.outline, state.primaryKeyword?.text || state.topic, secondaryKeywordText, state.articleType, state.writingStyle, state.pointOfView, state.articleLength, state.expertGuidance, enhancementsPayload);
      dispatch({ type: "SET_GENERATED_ARTICLE", payload: article });
      dispatch({ type: "SET_HUMANIZED_ARTICLE", payload: "" });
      setActiveTab("original");
      setGeneratingProgress("");
      toast({ title: "Regenerated", description: "Article regenerated successfully.", variant: "default" });
    } catch {
      setGeneratingProgress("");
      toast({ title: "Error", description: "Failed to regenerate.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleHumanizeArticle = async () => {
    if (!state.generatedArticle) return;
    setHumanizing(true);
    try {
      const humanizedArticle = await apiService.humanizeArticle(state.generatedArticle);
      dispatch({ type: "SET_HUMANIZED_ARTICLE", payload: humanizedArticle });
      toast({ title: "Humanized", description: "Article humanized successfully.", variant: "default" });
      setActiveTab("humanized");
    } catch {
      toast({ title: "Error", description: "Failed to humanize.", variant: "destructive" });
    } finally {
      setHumanizing(false);
    }
  };

  const getCombinedArticleContent = (baseContent: string): string => {
    if (!state.enhancements?.length) return baseContent;
    const enhancementContent = state.enhancementContent || {};
    const selectedWithContent = state.enhancements.filter(id => enhancementContent[id]);
    if (selectedWithContent.length === 0) return baseContent;

    let combined = "";
    const ordered: { id: string; position: 'prepend' | 'append'; heading?: string }[] = [
      { id: "tableOfContents", position: 'prepend', heading: "## Table of Contents" },
      { id: "summary", position: 'prepend', heading: "## TL;DR Summary" },
      { id: "keyTakeaways", position: 'prepend', heading: "## Key Takeaways" },
      { id: "expertQuote", position: 'append', heading: "## Expert Insight" },
      { id: "faq", position: 'append', heading: "## FAQ" },
      { id: "callToAction", position: 'append', heading: "## Next Steps" },
      { id: "socialQuotes", position: 'append', heading: "## Shareable Quotes" }
    ];

    ordered.forEach(({ id, position, heading }) => {
      if (position === 'prepend' && state.enhancements.includes(id) && enhancementContent[id]) {
        if (heading) combined += `${heading}\n\n`;
        combined += enhancementContent[id] + "\n\n---\n\n";
      }
    });
    combined += baseContent;
    ordered.forEach(({ id, position, heading }) => {
      if (position === 'append' && state.enhancements.includes(id) && enhancementContent[id]) {
        combined += "\n\n---\n\n";
        if (heading) combined += `${heading}\n\n`;
        combined += enhancementContent[id];
      }
    });

    const processedIds = ordered.map(e => e.id);
    state.enhancements.forEach(id => {
      if (!processedIds.includes(id) && enhancementContent[id] && id !== 'featuredImage') {
        combined += `\n\n---\n\n## ${id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n`;
        combined += enhancementContent[id];
      }
    });
    return combined.trim();
  };

  const handleDownloadArticle = () => {
    const baseArticle = activeTab === "humanized" && state.humanizedArticle ? state.humanizedArticle : state.generatedArticle;
    const articleToDownload = getCombinedArticleContent(baseArticle);
    if (!articleToDownload) return;
    const fileName = state.title ? state.title.text.replace(/[^a-z0-9]/gi, '_').toLowerCase() : "article";

    if (downloadFormat === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text(state.title?.text || state.topic, 20, 20);
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(articleToDownload.replace(/#{1,6} /g, '').replace(/\*\*/g, ''), 170);
      let y = 40;
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(splitText[i], 20, y);
        y += 7;
      }
      doc.save(`${fileName}.pdf`);
    } else {
      const ext = downloadFormat === "markdown" ? "md" : "txt";
      const blob = new Blob([articleToDownload], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${fileName}.${ext}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
    toast({ title: "Downloading", description: `Exporting as ${downloadFormat.toUpperCase()}.`, variant: "default" });
  };

  const renderArticleContent = (content: string, featuredImage?: string) => {
    if (!content) return null;
    let modifiedContent = content;
    const placeholderRegex = /\[Featured Image: AI-generated image for .*?\]/gi;

    if (featuredImage) {
      const titleRegex = /^#\s+(.+?)$/m;
      const titleMatch = titleRegex.exec(modifiedContent);
      const altText = titleMatch ? titleMatch[1] : 'Featured image';
      const imgHtml = `\n\n<div style="position: relative; margin: 24px 0 32px 0; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1);"><img src="${featuredImage}" alt="${altText}" style="width: 100%; height: auto; display: block; max-height: 500px; object-fit: cover;" /></div>\n\n`;
      if (placeholderRegex.test(modifiedContent)) {
        modifiedContent = modifiedContent.replace(placeholderRegex, imgHtml);
      } else if (titleMatch) {
        modifiedContent = modifiedContent.replace(titleRegex, `# $1${imgHtml}`);
      } else {
        modifiedContent = imgHtml + modifiedContent;
      }
    } else {
      modifiedContent = modifiedContent.replace(placeholderRegex, '');
    }

    const processedContent = marked.parse(modifiedContent) as string;
    return <div className="prose-premium" dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="artisan-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button className="artisan-btn-secondary" onClick={handleRegenerateArticle} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Regenerate
          </button>
          <button className="artisan-btn-secondary" onClick={handleHumanizeArticle} disabled={humanizing || !state.generatedArticle}>
            {humanizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
            Humanize
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-body text-muted-foreground">Real-time</span>
            <Switch checked={showRealTimeGeneration} onCheckedChange={setShowRealTimeGeneration} />
          </div>

          <Separator orientation="vertical" className="h-8 hidden md:block" />

          <div className="flex items-center gap-2">
            <select className="artisan-select text-xs py-2 px-3 w-32" value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as "markdown" | "txt" | "pdf")}>
              <option value="markdown">Markdown</option>
              <option value="txt">Plain Text</option>
              <option value="pdf">PDF</option>
            </select>
            <button className="artisan-btn-primary" onClick={handleDownloadArticle} disabled={!state.generatedArticle}>
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Progress */}
      {loading && generatingProgress && (
        <div className="artisan-card overflow-hidden animate-fade-up">
          <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-body font-medium text-foreground">Generating in Real-Time</span>
          </div>
          <div ref={articleContainerRef} className="p-6 max-h-[500px] overflow-y-auto">
            <div className="prose-premium" dangerouslySetInnerHTML={{
              __html: generatingProgress
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/\n/g, '<br />')
            }} />
          </div>
        </div>
      )}

      {/* Article Content */}
      {state.generatedArticle ? (
        <div className="artisan-card overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "original" | "humanized")}>
            <div className="px-5 py-3 border-b border-border bg-muted/20">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger value="original" className="rounded-lg text-xs font-body data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">Original</TabsTrigger>
                <TabsTrigger value="humanized" disabled={!state.humanizedArticle} className="rounded-lg text-xs font-body data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">Humanized</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="original" className="p-8 focus:outline-none">
              <h1 className="text-4xl font-display text-foreground mb-8">{state.title?.text || state.topic}</h1>
              {renderArticleContent(state.generatedArticle, state.enhancementContent?.featuredImage)}
            </TabsContent>
            <TabsContent value="humanized" className="p-8 focus:outline-none">
              <h1 className="text-4xl font-display text-foreground mb-8">{state.title?.text || state.topic}</h1>
              {state.humanizedArticle ? renderArticleContent(state.humanizedArticle, state.enhancementContent?.featuredImage) : (
                <p className="text-muted-foreground font-body italic">No humanized version yet. Click "Humanize" above.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="artisan-card p-16 text-center">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-xl font-display text-foreground">Crafting your article...</p>
              <p className="text-sm font-body text-muted-foreground mt-2">This may take a moment depending on length.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="h-16 w-16 text-muted-foreground/15 mb-4" />
              <p className="text-xl font-display text-foreground mb-2">Ready to generate</p>
              <p className="text-sm font-body text-muted-foreground mb-6">Click below to create your article.</p>
              <button className="artisan-btn-primary" onClick={handleRegenerateArticle}>
                <Sparkles className="h-4 w-4" /> Generate Article
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enhancements Summary */}
      {state.enhancements?.length > 0 && state.generatedArticle && (
        <>
          <Separator />
          <div>
            <h3 className="text-[10px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-4">Included Enhancements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.enhancements.map(id => (
                <div key={id} className="artisan-card p-4 flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-body font-medium text-foreground capitalize">{id.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Completion */}
      <div className="artisan-card p-5 border-primary/10 bg-accent/30">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-body font-semibold text-foreground mb-1">Generation Complete</h4>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Your {state.articleLength === "sm" ? "short" : state.articleLength === "md" ? "medium" : "long"} article
              in {state.writingStyle} style with "{state.primaryKeyword?.text}" is ready for download.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
