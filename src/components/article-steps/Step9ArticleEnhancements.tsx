
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { Button } from "@/components/ui/button";
import { Check, Plus, Trash } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  React.useEffect(() => {
    // Update enhancements from state if available
    if (state.enhancements && state.enhancements.length > 0) {
      setSelectedEnhancements(state.enhancements);
    }
  }, [state.enhancements]);

  const toggleEnhancement = (enhancementId: string) => {
    setSelectedEnhancements(prev => {
      if (prev.includes(enhancementId)) {
        return prev.filter(id => id !== enhancementId);
      } else {
        return [...prev, enhancementId];
      }
    });
  };

  const saveEnhancements = () => {
    dispatch({ type: "SET_ENHANCEMENTS", payload: selectedEnhancements });
    toast({
      title: "Enhancements Saved",
      description: `${selectedEnhancements.length} enhancement${selectedEnhancements.length !== 1 ? 's' : ''} have been saved for your article.`,
      variant: "success"
    });
  };

  const generatePreview = async (enhancementId: string) => {
    if (!state.primaryKeyword) {
      toast({
        title: "Primary Keyword Required",
        description: "Please select a primary keyword before generating enhancements.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setActivePreview(enhancementId);
    
    try {
      // Generate a mock article if we don't have a real one yet
      const mockArticle = `# Article about ${state.topic}
      
      This is a sample article about ${state.topic} that focuses on ${state.primaryKeyword?.text}.
      
      ## Introduction
      This article explores ${state.topic} in detail, covering all the essential aspects.
      
      ## Main Section
      ${state.topic} has many important features and benefits. The key aspects include...`;
      
      const content = await apiService.generateEnhancement(
        enhancementId,
        state.generatedArticle || mockArticle,
        state.primaryKeyword.text
      );
      
      setPreviewContent(prev => ({
        ...prev,
        [enhancementId]: content
      }));
      
      // Auto-select the enhancement if it's not already selected
      if (!selectedEnhancements.includes(enhancementId)) {
        toggleEnhancement(enhancementId);
      }
      
      toast({
        title: "Preview Generated",
        description: "Enhancement preview has been successfully generated.",
        variant: "success"
      });
    } catch (error) {
      console.error("Error generating enhancement preview:", error);
      toast({
        title: "Error Generating Preview",
        description: "There was an issue generating the enhancement preview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      const imageUrl = await apiService.generateImageSuggestion(
        state.primaryKeyword.text,
        state.title.text
      );
      
      if (imageUrl) {
        setPreviewContent(prev => ({
          ...prev,
          featuredImage: imageUrl
        }));
        
        // Auto-select the enhancement if it's not already selected
        if (!selectedEnhancements.includes("featuredImage")) {
          toggleEnhancement("featuredImage");
        }
        
        toast({
          title: "Image Generated",
          description: "An AI-generated image has been created for your article.",
          variant: "success"
        });
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error Generating Image",
        description: "There was an issue generating the image. Please try again.",
        variant: "destructive"
      });
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
    <Card 
      key={enhancement.id} 
      className={`border p-4 mb-4 transition-all ${
        enhancement.selected ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <button
            onClick={() => toggleEnhancement(enhancement.id)}
            className={`w-6 h-6 rounded-full border flex items-center justify-center ${
              enhancement.selected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"
            }`}
          >
            {enhancement.selected && <Check className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">{enhancement.name}</h3>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => enhancement.id === "featuredImage" 
                ? generateImagePreview() 
                : generatePreview(enhancement.id)
              }
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
          </div>
          <p className="text-gray-600 text-sm mt-1">{enhancement.description}</p>
          
          {previewContent[enhancement.id] && (
            <div className="mt-3 bg-white rounded-md border p-3 text-sm">
              {enhancement.id === "featuredImage" ? (
                <div className="flex justify-center">
                  <img 
                    src={previewContent[enhancement.id]} 
                    alt="AI Generated Featured Image" 
                    className="max-h-80 object-contain rounded-md"
                  />
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: previewContent[enhancement.id].replace(/\n/g, "<br />") }}
                />
              )}
              
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setPreviewContent(prev => {
                      const updated = { ...prev };
                      delete updated[enhancement.id];
                      return updated;
                    });
                    
                    // Also remove from selected if it was selected
                    if (selectedEnhancements.includes(enhancement.id)) {
                      toggleEnhancement(enhancement.id);
                    }
                  }}
                >
                  <Trash className="h-3.5 w-3.5 mr-1" />
                  Remove Preview
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <ArticleLayout loading={loading && !activePreview}>
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
    </ArticleLayout>
  );
}
