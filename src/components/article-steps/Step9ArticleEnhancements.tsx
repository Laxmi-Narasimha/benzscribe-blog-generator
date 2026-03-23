import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { Check, Plus, Loader2, Lightbulb, Image, MessageSquare, List, Quote, Zap, Share2, BookOpen } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface Enhancement {
  id: string;
  type: string;
  name: string;
  description: string;
  selected: boolean;
  content?: string;
  icon: React.ReactNode;
}

export function Step9ArticleEnhancements() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [selectedEnhancements, setSelectedEnhancements] = React.useState<string[]>(state.enhancements || []);
  const [previewContent, setPreviewContent] = React.useState<Record<string, string>>({});
  const [activePreview, setActivePreview] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState<Record<string, boolean>>({});
  const mountedRef = React.useRef(true);

  const availableEnhancements: Enhancement[] = [
    { id: "faq", type: "content", name: "FAQ Section", description: "Comprehensive FAQ addressing common questions.", selected: selectedEnhancements.includes("faq"), content: previewContent["faq"], icon: <MessageSquare className="h-5 w-5" /> },
    { id: "summary", type: "content", name: "TL;DR Summary", description: "Concise summary for quick overview.", selected: selectedEnhancements.includes("summary"), content: previewContent["summary"], icon: <Zap className="h-5 w-5" /> },
    { id: "callToAction", type: "content", name: "Call to Action", description: "Compelling CTA to prompt reader action.", selected: selectedEnhancements.includes("callToAction"), content: previewContent["callToAction"], icon: <Zap className="h-5 w-5" /> },
    { id: "keyTakeaways", type: "content", name: "Key Takeaways", description: "Highlight the most important points.", selected: selectedEnhancements.includes("keyTakeaways"), content: previewContent["keyTakeaways"], icon: <Lightbulb className="h-5 w-5" /> },
    { id: "expertQuote", type: "content", name: "Expert Quote", description: "Relevant expert quote for authority.", selected: selectedEnhancements.includes("expertQuote"), content: previewContent["expertQuote"], icon: <Quote className="h-5 w-5" /> },
    { id: "featuredImage", type: "visual", name: "AI Featured Image", description: "Generate a custom DALL-E image.", selected: selectedEnhancements.includes("featuredImage"), content: previewContent["featuredImage"], icon: <Image className="h-5 w-5" /> },
    { id: "socialQuotes", type: "promotion", name: "Social Media Quotes", description: "Shareable quotes for social promotion.", selected: selectedEnhancements.includes("socialQuotes"), content: previewContent["socialQuotes"], icon: <Share2 className="h-5 w-5" /> },
    { id: "tableOfContents", type: "navigation", name: "Table of Contents", description: "Interactive TOC for easy navigation.", selected: selectedEnhancements.includes("tableOfContents"), content: previewContent["tableOfContents"], icon: <List className="h-5 w-5" /> },
  ];

  React.useEffect(() => {
    if (state.enhancements?.length) setSelectedEnhancements(state.enhancements);
    if (state.enhancementContent) setPreviewContent(state.enhancementContent);
    const timer = setTimeout(() => {
      if (state.primaryKeyword?.text && state.title?.text && (!state.enhancements?.includes("featuredImage") || !state.enhancementContent?.featuredImage)) {
        generateImagePreview();
      }
    }, 1000);
    return () => { mountedRef.current = false; clearTimeout(timer); };
  }, []);

  React.useEffect(() => {
    if (selectedEnhancements.length === 0 && !state.enhancements?.length) return;
    if (JSON.stringify(selectedEnhancements) !== JSON.stringify(state.enhancements)) {
      if (mountedRef.current) dispatch({ type: "SET_ENHANCEMENTS", payload: selectedEnhancements });
    }
  }, [selectedEnhancements, state.enhancements]);

  React.useEffect(() => {
    if (Object.keys(previewContent).length === 0) return;
    const isEqual = JSON.stringify(previewContent) === JSON.stringify(state.enhancementContent);
    if (!isEqual && mountedRef.current) {
      Object.entries(previewContent).forEach(([id, content]) => {
        if (state.enhancementContent?.[id] !== content) {
          dispatch({ type: "SET_ENHANCEMENT_CONTENT", payload: { id, content } });
        }
      });
    }
  }, [previewContent, state.enhancementContent]);

  const toggleEnhancement = (id: string) => {
    const newSelected = selectedEnhancements.includes(id) ? selectedEnhancements.filter(x => x !== id) : [...selectedEnhancements, id];
    setSelectedEnhancements(newSelected);
    dispatch({ type: "SET_ENHANCEMENTS", payload: newSelected });
  };

  const saveEnhancements = () => {
    dispatch({ type: "SET_ENHANCEMENTS", payload: selectedEnhancements });
    Object.entries(previewContent).forEach(([id, content]) => {
      if (selectedEnhancements.includes(id)) dispatch({ type: "SET_ENHANCEMENT_CONTENT", payload: { id, content } });
    });
    toast({ title: "Saved", description: `${selectedEnhancements.length} enhancement(s) saved.`, variant: "default" });
  };

  const generatePreview = async (enhancementId: string) => {
    if (isGenerating[enhancementId]) return;
    setIsGenerating(prev => ({ ...prev, [enhancementId]: true }));
    try {
      const articleText = state.generatedArticle || '';
      if (!articleText) {
        toast({ title: "No Article", description: "Generate article first.", variant: "destructive" });
        return;
      }
      const content = await apiService.generateEnhancement(enhancementId, articleText, state.primaryKeyword?.text || '');
      setPreviewContent(prev => ({ ...prev, [enhancementId]: content }));
      if (!selectedEnhancements.includes(enhancementId)) setSelectedEnhancements(prev => [...prev, enhancementId]);
      toast({ title: "Generated", description: "Enhancement ready.", variant: "default" });
    } catch {
      const content = `Sample ${enhancementId} content. In production, this would be AI-generated.`;
      setPreviewContent(prev => ({ ...prev, [enhancementId]: content }));
      toast({ title: "Using Fallback", description: "Using sample content.", variant: "default" });
    } finally {
      setIsGenerating(prev => ({ ...prev, [enhancementId]: false }));
    }
  };

  const generateImagePreview = async () => {
    if (!state.primaryKeyword || !state.title) return;
    setLoading(true);
    setActivePreview("featuredImage");
    try {
      const imageUrl = await apiService.generateImageSuggestion(state.primaryKeyword.text, state.title.text, false);
      if (imageUrl) {
        setPreviewContent(prev => ({ ...prev, featuredImage: imageUrl }));
        dispatch({ type: "SET_ENHANCEMENT_CONTENT", payload: { id: "featuredImage", content: imageUrl } });
        if (!selectedEnhancements.includes("featuredImage")) {
          const newSelected = [...selectedEnhancements, "featuredImage"];
          setSelectedEnhancements(newSelected);
          dispatch({ type: "SET_ENHANCEMENTS", payload: newSelected });
        }
      }
    } catch {
      toast({ title: "Image Failed", description: "Could not generate image.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const contentEnhancements = availableEnhancements.filter(e => e.type === "content");
  const visualEnhancements = availableEnhancements.filter(e => e.type === "visual");
  const promotionEnhancements = availableEnhancements.filter(e => e.type === "promotion");
  const navigationEnhancements = availableEnhancements.filter(e => e.type === "navigation");

  const renderEnhancement = (enhancement: Enhancement) => (
    <div key={enhancement.id} className="artisan-card p-5 space-y-4 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl transition-all duration-300 ${enhancement.selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {enhancement.icon}
          </div>
          <div>
            <h4 className="text-sm font-body font-semibold text-foreground">{enhancement.name}</h4>
            <p className="text-xs font-body text-muted-foreground mt-0.5">{enhancement.description}</p>
            <button
              className="artisan-btn-ghost text-xs mt-2 px-2 py-1"
              onClick={() => enhancement.id === "featuredImage" ? generateImagePreview() : generatePreview(enhancement.id)}
              disabled={isGenerating[enhancement.id] || (loading && activePreview === enhancement.id)}
            >
              {(isGenerating[enhancement.id] || (loading && activePreview === enhancement.id)) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Preview
            </button>
          </div>
        </div>
        <Checkbox id={`enh-${enhancement.id}`} checked={enhancement.selected} onCheckedChange={() => toggleEnhancement(enhancement.id)} className="mt-1" />
      </div>

      {previewContent[enhancement.id] && (
        <div className="mt-3 rounded-xl border border-border bg-muted/20 p-4 text-sm font-body">
          {enhancement.id === "featuredImage" ? (
            <div className="flex flex-col items-center">
              <img src={previewContent[enhancement.id]} alt="Featured" className="max-h-64 object-contain rounded-xl" />
              <p className="text-xs text-muted-foreground mt-2">AI-generated image</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-foreground/75" dangerouslySetInnerHTML={{ __html: previewContent[enhancement.id].replace(/\n/g, "<br />") }} />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <button className="artisan-btn-primary" onClick={saveEnhancements}>
        <Check className="h-4 w-4" /> Save Enhancements
      </button>

      <Tabs defaultValue="content">
        <TabsList className="bg-muted/40 rounded-xl p-1">
          <TabsTrigger value="content" className="rounded-lg text-xs font-body data-[state=active]:bg-card data-[state=active]:shadow-sm">Content</TabsTrigger>
          <TabsTrigger value="visual" className="rounded-lg text-xs font-body data-[state=active]:bg-card data-[state=active]:shadow-sm">Visual</TabsTrigger>
          <TabsTrigger value="promotion" className="rounded-lg text-xs font-body data-[state=active]:bg-card data-[state=active]:shadow-sm">Promotion</TabsTrigger>
          <TabsTrigger value="navigation" className="rounded-lg text-xs font-body data-[state=active]:bg-card data-[state=active]:shadow-sm">Navigation</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="space-y-3 mt-4">{contentEnhancements.map(renderEnhancement)}</TabsContent>
        <TabsContent value="visual" className="space-y-3 mt-4">{visualEnhancements.map(renderEnhancement)}</TabsContent>
        <TabsContent value="promotion" className="space-y-3 mt-4">{promotionEnhancements.map(renderEnhancement)}</TabsContent>
        <TabsContent value="navigation" className="space-y-3 mt-4">{navigationEnhancements.map(renderEnhancement)}</TabsContent>
      </Tabs>

      <div className="artisan-card p-5 border-primary/10 bg-accent/30">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-body font-semibold text-foreground mb-1">Enhancement Tip</h4>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Articles with visual elements get 94% more views. FAQ sections boost SEO by enabling featured snippets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
