
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { apiService } from "@/services/apiService";
import { OutlineHeading } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp, Edit, Loader2, Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export function Step8ArticleOutline() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [outline, setOutline] = React.useState<OutlineHeading[]>(state.outline || []);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editingSubIndex, setEditingSubIndex] = React.useState<number | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const { toast } = useToast();

  React.useEffect(() => {
    const generateOutline = async () => {
      if (!state.topic || !state.primaryKeyword) return;
      
      // Only generate if we don't have an outline yet
      if (state.outline.length === 0) {
        setLoading(true);
        try {
          const secondaryKeywordTexts = state.secondaryKeywords.map(k => k.text);
          const data = await apiService.generateOutline(
            state.topic, 
            state.primaryKeyword.text,
            secondaryKeywordTexts,
            state.articleType
          );
          setOutline(data);
          dispatch({ type: "SET_OUTLINE", payload: data });

          // Expand all sections by default
          const newExpanded: Record<number, boolean> = {};
          data.forEach((_, index) => {
            newExpanded[index] = true;
          });
          setExpanded(newExpanded);
          
          toast({
            title: "Outline Generated",
            description: "Your article outline has been successfully generated.",
            variant: "success",
          });
        } catch (error) {
          console.error("Error generating outline:", error);
          toast({
            title: "Error Generating Outline",
            description: "There was an issue generating your article outline. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Use existing outline from state
        setOutline(state.outline);
        
        // Expand all sections by default
        const newExpanded: Record<number, boolean> = {};
        state.outline.forEach((_, index) => {
          newExpanded[index] = true;
        });
        setExpanded(newExpanded);
      }
    };
    
    generateOutline();
  }, [state.topic, state.primaryKeyword, state.secondaryKeywords, state.articleType, state.outline, dispatch, toast]);

  const handleSaveOutline = () => {
    dispatch({ type: "SET_OUTLINE", payload: outline });
    toast({
      title: "Outline Saved",
      description: "Your article outline has been saved successfully.",
      variant: "success",
    });
  };

  const handleRegenerateOutline = async () => {
    if (!state.topic || !state.primaryKeyword) return;
    
    setLoading(true);
    try {
      const secondaryKeywordTexts = state.secondaryKeywords.map(k => k.text);
      const data = await apiService.generateOutline(
        state.topic, 
        state.primaryKeyword.text,
        secondaryKeywordTexts,
        state.articleType
      );
      setOutline(data);
      dispatch({ type: "SET_OUTLINE", payload: data });
      
      // Expand all sections by default
      const newExpanded: Record<number, boolean> = {};
      data.forEach((_, index) => {
        newExpanded[index] = true;
      });
      setExpanded(newExpanded);
      
      toast({
        title: "Outline Regenerated",
        description: "Your article outline has been regenerated successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error regenerating outline:", error);
      toast({
        title: "Error Regenerating Outline",
        description: "There was an issue regenerating your article outline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (index: number) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const startEditingHeading = (index: number) => {
    setEditingIndex(index);
    setEditingSubIndex(null);
    setEditingText(outline[index].heading);
  };

  const startEditingSubheading = (headingIndex: number, subheadingIndex: number) => {
    setEditingIndex(headingIndex);
    setEditingSubIndex(subheadingIndex);
    setEditingText(outline[headingIndex].subheadings[subheadingIndex]);
  };

  const saveEditing = () => {
    if (editingIndex === null) return;
    
    const updatedOutline = [...outline];
    if (editingSubIndex === null) {
      // Editing a heading
      updatedOutline[editingIndex] = {
        ...updatedOutline[editingIndex],
        heading: editingText
      };
    } else {
      // Editing a subheading
      const updatedSubheadings = [...updatedOutline[editingIndex].subheadings];
      updatedSubheadings[editingSubIndex] = editingText;
      updatedOutline[editingIndex] = {
        ...updatedOutline[editingIndex],
        subheadings: updatedSubheadings
      };
    }
    
    setOutline(updatedOutline);
    setEditingIndex(null);
    setEditingSubIndex(null);
    setEditingText("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingSubIndex(null);
    setEditingText("");
  };

  const addHeading = () => {
    setOutline([...outline, { heading: "New Section", subheadings: [] }]);
  };

  const addSubheading = (headingIndex: number) => {
    const updatedOutline = [...outline];
    updatedOutline[headingIndex] = {
      ...updatedOutline[headingIndex],
      subheadings: [...updatedOutline[headingIndex].subheadings, "New Subsection"]
    };
    setOutline(updatedOutline);
  };

  const deleteHeading = (index: number) => {
    const updatedOutline = outline.filter((_, i) => i !== index);
    setOutline(updatedOutline);
  };

  const deleteSubheading = (headingIndex: number, subheadingIndex: number) => {
    const updatedOutline = [...outline];
    const updatedSubheadings = updatedOutline[headingIndex].subheadings.filter((_, i) => i !== subheadingIndex);
    updatedOutline[headingIndex] = {
      ...updatedOutline[headingIndex],
      subheadings: updatedSubheadings
    };
    setOutline(updatedOutline);
  };

  const moveHeading = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || 
        (direction === "down" && index === outline.length - 1)) {
      return;
    }
    
    const updatedOutline = [...outline];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    [updatedOutline[index], updatedOutline[targetIndex]] = 
      [updatedOutline[targetIndex], updatedOutline[index]];
    
    setOutline(updatedOutline);
  };

  const moveSubheading = (headingIndex: number, subheadingIndex: number, direction: "up" | "down") => {
    const subheadings = outline[headingIndex].subheadings;
    
    if ((direction === "up" && subheadingIndex === 0) || 
        (direction === "down" && subheadingIndex === subheadings.length - 1)) {
      return;
    }
    
    const updatedOutline = [...outline];
    const updatedSubheadings = [...subheadings];
    const targetIndex = direction === "up" ? subheadingIndex - 1 : subheadingIndex + 1;
    
    [updatedSubheadings[subheadingIndex], updatedSubheadings[targetIndex]] = 
      [updatedSubheadings[targetIndex], updatedSubheadings[subheadingIndex]];
    
    updatedOutline[headingIndex] = {
      ...updatedOutline[headingIndex],
      subheadings: updatedSubheadings
    };
    
    setOutline(updatedOutline);
  };

  return (
    <ArticleLayout loading={loading} nextDisabled={outline.length === 0}>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2">Customize Article Outline</h2>
          <p className="text-gray-600 mb-4">
            Refine the structure of your article by editing, rearranging, or adding sections and subsections.
          </p>
          
          <div className="flex items-center space-x-4 mb-8">
            <Button onClick={handleSaveOutline} disabled={loading}>
              <Check className="mr-2 h-4 w-4" />
              Save Outline
            </Button>
            <Button 
              variant="outline"
              onClick={handleRegenerateOutline} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15.14-6.63L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15.14 6.63L3 16"></path>
                </svg>
              )}
              Regenerate Outline
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">Generating your outline...</p>
            <p className="text-gray-500 text-center mt-2">
              We're creating a comprehensive outline based on your topic and keywords
            </p>
          </div>
        ) : outline.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-lg">
            <p className="text-lg font-medium text-gray-700">No outline created yet</p>
            <p className="text-gray-500 mt-2 mb-6">Click the button below to generate an outline for your article</p>
            <Button onClick={handleRegenerateOutline}>Generate Outline</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {outline.map((section, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  {editingIndex === index && editingSubIndex === null ? (
                    <div className="flex-1 flex items-center">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing();
                        }}
                        autoFocus
                      />
                      <div className="ml-2 flex space-x-1">
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEditing}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => toggleExpanded(index)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expanded[index] ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        <div className="font-medium text-lg">
                          {section.heading}
                        </div>
                        {index === 0 || index === outline.length - 1 ? (
                          <Badge variant="outline" className="ml-2">
                            {index === 0 ? 'Intro' : 'Conclusion'}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditingHeading(index)}
                          className="p-1.5 rounded-full hover:bg-gray-200"
                          title="Edit heading"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => moveHeading(index, "up")}
                          disabled={index === 0}
                          className={`p-1.5 rounded-full ${
                            index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'
                          }`}
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => moveHeading(index, "down")}
                          disabled={index === outline.length - 1}
                          className={`p-1.5 rounded-full ${
                            index === outline.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'
                          }`}
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteHeading(index)}
                          className="p-1.5 rounded-full hover:bg-gray-200"
                          title="Delete heading"
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {expanded[index] && (
                  <div className="p-4">
                    <div className="space-y-2">
                      {section.subheadings.map((subheading, subIndex) => (
                        <div 
                          key={subIndex}
                          className="ml-6 flex items-center justify-between border-b border-gray-100 pb-2"
                        >
                          {editingIndex === index && editingSubIndex === subIndex ? (
                            <div className="flex-1 flex items-center">
                              <input
                                type="text"
                                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditing();
                                }}
                                autoFocus
                              />
                              <div className="ml-2 flex space-x-1">
                                <Button size="sm" variant="outline" onClick={cancelEditing}>
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={saveEditing}>
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-gray-700">• {subheading}</div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => startEditingSubheading(index, subIndex)}
                                  className="p-1.5 rounded-full hover:bg-gray-200"
                                  title="Edit subheading"
                                >
                                  <Edit className="h-3.5 w-3.5 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => moveSubheading(index, subIndex, "up")}
                                  disabled={subIndex === 0}
                                  className={`p-1.5 rounded-full ${
                                    subIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'
                                  }`}
                                  title="Move up"
                                >
                                  <ChevronUp className="h-3.5 w-3.5 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => moveSubheading(index, subIndex, "down")}
                                  disabled={subIndex === section.subheadings.length - 1}
                                  className={`p-1.5 rounded-full ${
                                    subIndex === section.subheadings.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'
                                  }`}
                                  title="Move down"
                                >
                                  <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => deleteSubheading(index, subIndex)}
                                  className="p-1.5 rounded-full hover:bg-gray-200"
                                  title="Delete subheading"
                                >
                                  <Trash className="h-3.5 w-3.5 text-red-500" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      <div className="ml-6 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addSubheading(index)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Subsection
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
            
            <div className="pt-4 flex justify-center">
              <Button variant="outline" onClick={addHeading} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Section
              </Button>
            </div>
          </div>
        )}

        {outline.length > 0 && !loading && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Outline Preview</h3>
            <div className="space-y-4">
              {outline.map((section, idx) => (
                <div key={idx} className="text-blue-800">
                  <div className="font-medium">{idx + 1}. {section.heading}</div>
                  {section.subheadings.length > 0 && (
                    <ul className="ml-8 list-disc text-blue-700">
                      {section.subheadings.map((sub, subIdx) => (
                        <li key={subIdx} className="mt-1">
                          {sub}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ArticleLayout>
  );
}
