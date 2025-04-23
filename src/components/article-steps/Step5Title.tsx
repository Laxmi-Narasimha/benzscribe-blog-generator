
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { apiService } from "@/services/apiService";
import { ArticleTitle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Pencil, RefreshCw, Star } from "lucide-react";

export function Step5Title() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [titles, setTitles] = React.useState<ArticleTitle[]>([]);
  const [selectedTitleId, setSelectedTitleId] = React.useState<string | null>(
    state.title?.id || null
  );
  const [customTitle, setCustomTitle] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    const generateTitles = async () => {
      if (!state.topic || !state.primaryKeyword) return;
      
      setLoading(true);
      try {
        const data = await apiService.generateTitles(
          state.topic, 
          state.primaryKeyword.text
        );
        setTitles(data);
        
        // Auto-select the first title if none is selected
        if (!selectedTitleId && data.length > 0) {
          setSelectedTitleId(data[0].id);
          dispatch({ type: "SET_TITLE", payload: data[0] });
        }
      } catch (error) {
        console.error("Error generating titles:", error);
      } finally {
        setLoading(false);
      }
    };
    
    generateTitles();
  }, [state.topic, state.primaryKeyword, dispatch, selectedTitleId]);

  const handleTitleSelect = (titleId: string) => {
    setSelectedTitleId(titleId);
    
    const selected = titles.find(t => t.id === titleId);
    if (selected) {
      dispatch({ type: "SET_TITLE", payload: selected });
    }
  };

  const handleCustomTitleSubmit = () => {
    if (!customTitle.trim()) return;
    
    const newTitle: ArticleTitle = {
      id: `custom-${Date.now()}`,
      text: customTitle.trim(),
    };
    
    setTitles(prev => [newTitle, ...prev]);
    setSelectedTitleId(newTitle.id);
    setCustomTitle("");
    setIsEditing(false);
    
    dispatch({ type: "SET_TITLE", payload: newTitle });
  };

  const handleRegenerateTitles = async () => {
    if (!state.topic || !state.primaryKeyword) return;
    
    setLoading(true);
    try {
      const data = await apiService.generateTitles(
        state.topic, 
        state.primaryKeyword.text
      );
      setTitles(data);
    } catch (error) {
      console.error("Error regenerating titles:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    
    let variant: "success" | "warning" | "destructive" = "destructive";
    if (score >= 85) variant = "success";
    else if (score >= 70) variant = "warning";
    
    return (
      <Badge variant={variant} className="ml-2">
        {score}/100
      </Badge>
    );
  };

  const isNextDisabled = !selectedTitleId;

  return (
    <ArticleLayout nextDisabled={isNextDisabled} loading={loading}>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-4">Select a Title</h2>
          <p className="text-gray-600 mb-6">
            Choose a compelling title for your article that includes your primary keyword.
          </p>
        </div>

        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Create your own title
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your custom title..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomTitleSubmit();
                  }}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleCustomTitleSubmit}
                >
                  Save
                </button>
              </div>
              <button
                className="text-blue-600 hover:text-blue-800 text-sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Create my own title
              </button>
              <button
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleRegenerateTitles}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Generate more titles
              </button>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                <p className="text-gray-600">Generating titles...</p>
              </div>
            ) : titles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No titles generated yet. Try adding your own title.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {titles.map((title) => {
                  const isSelected = selectedTitleId === title.id;
                  
                  return (
                    <div
                      key={title.id}
                      className={`border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer ${
                        isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/50" : "border-gray-200"
                      }`}
                      onClick={() => handleTitleSelect(title.id)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mt-1 ${
                          isSelected 
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "border-gray-300"
                        }`}>
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <h3 className={`text-lg font-medium ${isSelected ? "text-blue-800" : "text-gray-900"}`}>
                              {title.text}
                            </h3>
                            {getScoreBadge(title.score)}
                          </div>
                          {title.id.startsWith('custom-') && (
                            <Badge variant="secondary" className="mt-1">Custom</Badge>
                          )}
                        </div>
                        {title.score && title.score >= 90 && (
                          <div className="flex-shrink-0">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {selectedTitleId && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Selected Title</h3>
            <p className="text-lg font-medium">
              {titles.find(t => t.id === selectedTitleId)?.text || ""}
            </p>
          </div>
        )}
      </div>
    </ArticleLayout>
  );
}
