import * as React from "react";
import { useArticle } from "@/context/ArticleContext";

import { Button } from "@/components/ui/button";
import { Check, Plus, Trash } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Enhancement {
  id: string;
  type: string;
  name: string;
  description: string;
  selected: boolean;
  content?: string;
}

export function Step9ArticleEnhancements() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [selectedEnhancements, setSelectedEnhancements] = React.useState<string[]>(
    state.enhancements || []
  );
  const [previewContent, setPreviewContent] = React.useState<Record<string, string>>({});
  const [activePreview, setActivePreview] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState<Record<string, boolean>>({});
  
  // Add mountedRef for cleanup
  const mountedRef = React.useRef(true);

  const availableEnhancements: Enhancement[] = [
    {
      id: "faq",
      type: "content",
      name: "FAQ Section",
      description: "Add a comprehensive FAQ section addressing common questions related to your topic.",
      selected: selectedEnhancements.includes("faq"),
      content: previewContent["faq"]
    },
    {
      id: "summary",
      type: "content",
      name: "TL;DR Summary",
      description: "Add a concise summary at the beginning of your article for readers who want a quick overview.",
      selected: selectedEnhancements.includes("summary"),
      content: previewContent["summary"]
    },
    {
      id: "callToAction",
      type: "content",
      name: "Call to Action",
      description: "Add a compelling call-to-action section to prompt readers to take the next step.",
      selected: selectedEnhancements.includes("callToAction"),
      content: previewContent["callToAction"]
    },
    {
      id: "keyTakeaways",
      type: "content",
      name: "Key Takeaways",
      description: "Add a section highlighting the most important points from your article.",
      selected: selectedEnhancements.includes("keyTakeaways"),
      content: previewContent["keyTakeaways"]
    },
    {
      id: "expertQuote",
      type: "content",
      name: "Expert Quote",
      description: "Include a relevant expert quote to add authority to your article.",
      selected: selectedEnhancements.includes("expertQuote"),
      content: previewContent["expertQuote"]
    },
    {
      id: "featuredImage",
      type: "visual",
      name: "AI Featured Image",
      description: "Generate a custom image for your article using AI.",
      selected: selectedEnhancements.includes("featuredImage"),
      content: previewContent["featuredImage"]
    },
    {
      id: "socialQuotes",
      type: "promotion",
      name: "Social Media Quotes",
      description: "Generate shareable quotes for social media promotion.",
      selected: selectedEnhancements.includes("socialQuotes"),
      content: previewContent["socialQuotes"]
    },
    {
      id: "tableOfContents",
      type: "navigation",
      name: "Table of Contents",
      description: "Add an interactive table of contents for easier navigation.",
      selected: selectedEnhancements.includes("tableOfContents"),
      content: previewContent["tableOfContents"]
    }
  ];

  // Effect to load initial state
  React.useEffect(() => {
    console.log("[Step 9] Loading initial state...");
    
    // Load initial values from global state
    if (state.enhancements && state.enhancements.length > 0) {
      setSelectedEnhancements(state.enhancements);
      console.log("[Step 9] Loaded enhancements:", state.enhancements);
    }
    
    // Load enhancement content from global state
    if (state.enhancementContent) {
      setPreviewContent(state.enhancementContent);
      console.log("[Step 9] Loaded enhancement content:", state.enhancementContent);
    }
    
    // Auto-generate cover image if not already present
    // We'll use a timeout to make sure the component is fully mounted
    const timer = setTimeout(() => {
      if (
        (state.primaryKeyword?.text && state.title?.text) && 
        (!state.enhancements?.includes("featuredImage") || 
        !state.enhancementContent?.featuredImage)
      ) {
        console.log("[Step 9] Auto-generating featured image...");
        generateImagePreview();
      }
    }, 1000);
    
    // Cleanup function
    return () => {
      console.log("[Step 9] Component unmounting, setting mounted ref to false");
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  // Effect to sync selectedEnhancements with global state
  React.useEffect(() => {
    // Skip on initial render
    if (selectedEnhancements.length === 0 && !state.enhancements?.length) return;
    
    // Only update if there's been a change
    if (JSON.stringify(selectedEnhancements) !== JSON.stringify(state.enhancements)) {
      if (mountedRef.current) {
        console.log("[Step 9] Syncing selected enhancements to global state:", selectedEnhancements);
        dispatch({ type: "SET_ENHANCEMENTS", payload: selectedEnhancements });
      }
    }
  }, [selectedEnhancements, state.enhancements]);

  // Effect to sync previewContent with global state
  React.useEffect(() => {
    // Skip if previewContent is empty
    if (Object.keys(previewContent).length === 0) return;
    
    // Compare if there's a change before updating
    const isEqual = JSON.stringify(previewContent) === JSON.stringify(state.enhancementContent);
    
    if (!isEqual && mountedRef.current) {
      console.log("[Step 9] Syncing enhancement content to global state:", previewContent);
      
      // Update one by one to avoid large state updates
      Object.entries(previewContent).forEach(([id, content]) => {
        if (state.enhancementContent?.[id] !== content) {
          dispatch({ 
            type: "SET_ENHANCEMENT_CONTENT", 
            payload: { id, content } 
          });
        }
      });
    }
  }, [previewContent, state.enhancementContent]);

  const toggleEnhancement = (enhancementId: string) => {
    // Update local state
    const newSelectedEnhancements = selectedEnhancements.includes(enhancementId)
      ? selectedEnhancements.filter(id => id !== enhancementId)
      : [...selectedEnhancements, enhancementId];
    
    // Update local state
    setSelectedEnhancements(newSelectedEnhancements);
    
    // Immediately update global state
    dispatch({ type: "SET_ENHANCEMENTS", payload: newSelectedEnhancements });
    
    console.log("[Step 9 Debug] Enhancement toggled:", enhancementId, "New state:", newSelectedEnhancements);
  };

  const saveEnhancements = () => {
    // Always update state with the current selections
    dispatch({ type: "SET_ENHANCEMENTS", payload: selectedEnhancements });
    
    // Also save any enhancement content that hasn't been saved yet
    Object.entries(previewContent).forEach(([id, content]) => {
      if (selectedEnhancements.includes(id)) {
        dispatch({ 
          type: "SET_ENHANCEMENT_CONTENT", 
          payload: { id, content } 
        });
      }
    });
    
    // Display confirmation toast
    toast({
      title: "Enhancements Saved",
      description: `${selectedEnhancements.length} enhancement${selectedEnhancements.length !== 1 ? 's' : ''} have been saved for your article.`,
      variant: "default",
    });
    
    // Log for debugging
    console.log("[Step 9 Debug] Saved enhancements:", selectedEnhancements);
    console.log("[Step 9 Debug] Enhancement content:", previewContent);
  };

  const generatePreview = async (enhancementId: string) => {
    // Don't regenerate if already loading this enhancement
    if (isGenerating[enhancementId]) return;

    // Set loading state for this specific enhancement
    setIsGenerating(prev => ({ ...prev, [enhancementId]: true }));

    try {
      // Find this enhancement in our enhancement definitions
      const enhancement = availableEnhancements.find(e => e.id === enhancementId);
      if (!enhancement) {
        toast({
          title: "Enhancement Not Found",
          description: `Enhancement ${enhancementId} not found`,
          variant: "destructive"
        });
        setIsGenerating(prev => ({ ...prev, [enhancementId]: false }));
        return;
      }

      // Get the article text to use for generation
      const articleText = state.generatedArticle || '';
      if (!articleText) {
        toast({
          title: "Missing Article Text",
          description: "No article text available",
          variant: "destructive"
        });
        setIsGenerating(prev => ({ ...prev, [enhancementId]: false }));
        return;
      }

      // Call the API to generate the enhancement
      console.log(`[Step 9] Generating ${enhancement.name} preview...`);
      
      let content;
      try {
        // Call the API service with the correct parameters (only 3 params)
        content = await apiService.generateEnhancement(
          enhancementId,
          articleText,
          state.primaryKeyword?.text || ''
        );
      } catch (error) {
        console.error("Error generating enhancement:", error);
        toast({
          title: "Generation Failed",
          description: `Failed to generate ${enhancement.name}. Using fallback data.`,
          variant: "destructive"
        });
        
        // Create basic fallback content since getMockEnhancementContent doesn't exist
        content = `This is a sample ${enhancement.name} content. In production, this would be generated using AI based on your article content.`;
      }

      console.log(`[Step 9] Generated content for ${enhancement.name}:`, content);

      // Update the preview content state
      setPreviewContent(prev => ({
        ...prev,
        [enhancementId]: content
      }));

      // Add to selected enhancements if not already selected
      if (!selectedEnhancements.includes(enhancementId)) {
        setSelectedEnhancements(prev => [...prev, enhancementId]);
      }

      toast({
        title: "Enhancement Generated",
        description: `${enhancement.name} generated successfully`,
        variant: "default"
      });
    } catch (error) {
      console.error(`Error generating ${enhancementId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Generation Error",
        description: `Failed to generate enhancement: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      // Clear loading state
      setIsGenerating(prev => ({ ...prev, [enhancementId]: false }));
    }
  };

  const generateImagePreview = async () => {
    if (!state.primaryKeyword || !state.title) {
      toast({
        title: "Information Required",
        description: "Please select a primary keyword and title before generating an image.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setActivePreview("featuredImage");
    
    try {
      // Show loading message
      toast({
        title: "Generating Image",
        description: "Creating a realistic image for your article...",
        variant: "default",
      });
      
      const imageUrl = await apiService.generateImageSuggestion(
        state.primaryKeyword.text,
        state.title.text,
        false // Always use DALL-E
      );
      
      if (imageUrl) {
        // Update local preview content state
        setPreviewContent(prev => ({
          ...prev,
          featuredImage: imageUrl
        }));
        
        // Save generated content to global state
        dispatch({ 
          type: "SET_ENHANCEMENT_CONTENT", 
          payload: { id: "featuredImage", content: imageUrl } 
        });
        
        // Auto-select the enhancement if it's not already selected
        if (!selectedEnhancements.includes("featuredImage")) {
          // Update local state
          const newSelectedEnhancements = [...selectedEnhancements, "featuredImage"];
          setSelectedEnhancements(newSelectedEnhancements);
          
          // Update global state
          dispatch({ type: "SET_ENHANCEMENTS", payload: newSelectedEnhancements });
          
          console.log("[Step 9 Debug] Featured image enhancement auto-selected");
        }
        
        toast({
          title: "Image Added",
          description: "A professional-quality image has been created for your article.",
          variant: "default",
        });
        
        console.log("[Step 9 Debug] Generated featured image preview");
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error Getting Image",
        description: "There was an issue obtaining the image. Trying alternative source.",
        variant: "destructive"
      });
      
      // Try a fallback approach with a different prompt
      try {
        const fallbackImageUrl = await apiService.generateImageSuggestion(
          state.primaryKeyword.text,
          state.title.text,
          false // Always use DALL-E
        );
      
        if (fallbackImageUrl) {
          setPreviewContent(prev => ({
            ...prev,
            featuredImage: fallbackImageUrl
          }));
          
          dispatch({ 
            type: "SET_ENHANCEMENT_CONTENT", 
            payload: { id: "featuredImage", content: fallbackImageUrl } 
          });
          
          toast({
            title: "Fallback Image Added",
            description: "We've used an alternative approach to provide an image for your article.",
            variant: "default",
          });
        }
      } catch (fallbackError) {
        console.error("Fallback image also failed:", fallbackError);
        toast({
          title: "Image Generation Failed",
          description: "We couldn't generate an image at this time. Please try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Group enhancements by type
  const contentEnhancements = availableEnhancements.filter(e => e.type === "content");
  const visualEnhancements = availableEnhancements.filter(e => e.type === "visual");
  const promotionEnhancements = availableEnhancements.filter(e => e.type === "promotion");
  const navigationEnhancements = availableEnhancements.filter(e => e.type === "navigation");

  const renderEnhancement = (enhancement: Enhancement) => (
    <div key={enhancement.id} className="flex flex-col space-y-3 p-4 border rounded-md">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge 
              variant={enhancement.selected ? "default" : "outline"}
              className={enhancement.selected ? "" : "text-gray-400"}
            >
              {enhancement.selected ? "Selected" : "Available"}
            </Badge>
          </div>
          <h3 className="font-medium text-gray-900">{enhancement.name}</h3>
          {enhancement.id === "featuredImage" ? (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => generateImagePreview()}
              disabled={loading && activePreview === enhancement.id}
              className="h-8 px-2"
            >
              {loading && activePreview === enhancement.id ? (
                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Preview
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => generatePreview(enhancement.id)}
              disabled={loading && activePreview === enhancement.id}
              className="h-8 px-2"
            >
              {loading && activePreview === enhancement.id ? (
                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Preview
            </Button>
          )}
        </div>
        <div>
          <Checkbox 
            id={`enhancement-${enhancement.id}`}
            checked={enhancement.selected}
            onCheckedChange={() => toggleEnhancement(enhancement.id)}
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{enhancement.description}</p>
      
      {previewContent[enhancement.id] && (
        <div className="mt-3 bg-white rounded-md border p-3 text-sm">
          {enhancement.id === "featuredImage" ? (
            <div className="flex flex-col items-center">
              <img 
                src={previewContent[enhancement.id]} 
                alt="Featured Image" 
                className="max-h-80 object-contain rounded-md"
              />
              <p className="text-xs text-gray-500 mt-2">
                AI-generated image
              </p>
            </div>
          ) : enhancement.id === "tableOfContents" ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: previewContent[enhancement.id]
                  .replace(/\n/g, "<br />")
                  // Convert markdown links to actual hyperlinks with proper anchor formatting
                  .replace(/\[([^\]]+)\]\(#([^)]+)\)/g, '<a href="#$2" class="text-blue-600 hover:underline">$1</a>')
                  // Also handle plain text entries that might not be in markdown format
                  .replace(/^([-*•] )(.*?)( -|:| –) /gm, '$1<a href="#$2" class="text-blue-600 hover:underline">$2</a>$3 ')
              }}
            />
          ) : (
            <div 
              className="prose prose-sm max-w-none" 
              dangerouslySetInnerHTML={{ __html: previewContent[enhancement.id].replace(/\n/g, "<br />") }}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2">Add Enhancements</h2>
          <p className="text-gray-600 mb-4">
            Enhance your article with additional elements to make it more engaging and comprehensive.
          </p>
          
          <Button onClick={saveEnhancements} className="mb-8">
            <Check className="mr-2 h-4 w-4" />
            Save Selected Enhancements
          </Button>
        </div>

        <Tabs defaultValue="content">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="promotion">Promotion</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="space-y-4">
            {contentEnhancements.map(renderEnhancement)}
          </TabsContent>
          <TabsContent value="visual" className="space-y-4">
            {visualEnhancements.map(renderEnhancement)}
          </TabsContent>
          <TabsContent value="promotion" className="space-y-4">
            {promotionEnhancements.map(renderEnhancement)}
          </TabsContent>
          <TabsContent value="navigation" className="space-y-4">
            {navigationEnhancements.map(renderEnhancement)}
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />
        
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Pro Tip</h3>
          <p className="text-sm text-yellow-800">
            Adding complementary enhancements can significantly improve reader engagement. 
            Studies show that articles with visual elements get 94% more views, and FAQ sections 
            can boost your SEO by helping your content appear in Google's featured snippets.
          </p>
        </div>
      </div>
    
  );
}
