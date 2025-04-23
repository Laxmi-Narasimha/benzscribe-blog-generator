
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { apiService } from "@/services/apiService";
import { Keyword } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Plus, Search, X } from "lucide-react";

export function Step6SecondaryKeywords() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedKeywordIds, setSelectedKeywordIds] = React.useState<string[]>(
    state.secondaryKeywords.map(k => k.id) || []
  );
  const [customKeyword, setCustomKeyword] = React.useState("");

  React.useEffect(() => {
    const fetchSecondaryKeywords = async () => {
      if (!state.primaryKeyword) return;
      
      setLoading(true);
      try {
        const data = await apiService.fetchSecondaryKeywords(
          state.primaryKeyword.text
        );
        setKeywords(data);
        
        // Pre-select any existing keywords from the state
        if (state.secondaryKeywords.length > 0) {
          setSelectedKeywordIds(state.secondaryKeywords.map(k => k.id));
        }
      } catch (error) {
        console.error("Error fetching secondary keywords:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSecondaryKeywords();
  }, [state.primaryKeyword, state.secondaryKeywords]);

  const filteredKeywords = keywords.filter(keyword => 
    keyword.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeywordToggle = (keywordId: string) => {
    let newSelectedIds: string[];
    
    if (selectedKeywordIds.includes(keywordId)) {
      newSelectedIds = selectedKeywordIds.filter(id => id !== keywordId);
    } else {
      // Limit to 5 selections
      if (selectedKeywordIds.length >= 5) {
        newSelectedIds = [...selectedKeywordIds.slice(1), keywordId];
      } else {
        newSelectedIds = [...selectedKeywordIds, keywordId];
      }
    }
    
    setSelectedKeywordIds(newSelectedIds);
    
    // Update the article context
    const selectedKeywords = keywords.filter(k => newSelectedIds.includes(k.id));
    dispatch({ type: "SET_SECONDARY_KEYWORDS", payload: selectedKeywords });
  };

  const handleCustomKeywordAdd = () => {
    if (!customKeyword.trim()) return;
    
    const newKeyword: Keyword = {
      id: `custom-${Date.now()}`,
      text: customKeyword.trim(),
    };
    
    setKeywords(prev => [newKeyword, ...prev]);
    
    // Add to selected keywords
    const newSelectedIds = [...selectedKeywordIds, newKeyword.id];
    if (newSelectedIds.length > 5) {
      newSelectedIds.shift(); // Remove the first item if we exceed 5
    }
    
    setSelectedKeywordIds(newSelectedIds);
    setCustomKeyword("");
    
    // Update the article context
    const selectedKeywords = [...state.secondaryKeywords, newKeyword];
    if (selectedKeywords.length > 5) {
      selectedKeywords.shift(); // Remove the first item if we exceed 5
    }
    dispatch({ type: "SET_SECONDARY_KEYWORDS", payload: selectedKeywords });
  };

  const removeSelectedKeyword = (keywordId: string) => {
    const newSelectedIds = selectedKeywordIds.filter(id => id !== keywordId);
    setSelectedKeywordIds(newSelectedIds);
    
    // Update the article context
    const selectedKeywords = keywords.filter(k => newSelectedIds.includes(k.id));
    dispatch({ type: "SET_SECONDARY_KEYWORDS", payload: selectedKeywords });
  };

  return (
    <ArticleLayout loading={loading}>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-4">Select Secondary Keywords</h2>
          <p className="text-gray-600 mb-6">
            Choose up to 5 secondary keywords to enhance your article's SEO performance.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Currently selected:</span>
              <Badge variant="secondary">{selectedKeywordIds.length}/5</Badge>
            </div>
          </div>
          
          {selectedKeywordIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedKeywordIds.map(id => {
                const keyword = keywords.find(k => k.id === id);
                if (!keyword) return null;
                
                return (
                  <div 
                    key={id} 
                    className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{keyword.text}</span>
                    <button 
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      onClick={() => removeSelectedKeyword(id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a custom keyword..."
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCustomKeywordAdd();
              }}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleCustomKeywordAdd}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-gray-600">Loading keywords...</p>
                </div>
              ) : filteredKeywords.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-gray-600">No keywords found. Try adding a custom keyword above.</p>
                </div>
              ) : (
                filteredKeywords.map((keyword) => {
                  const isSelected = selectedKeywordIds.includes(keyword.id);
                  
                  return (
                    <div 
                      key={keyword.id}
                      className={`flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleKeywordToggle(keyword.id)}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "border-gray-300"
                      }`}>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">{keyword.text}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {keyword.volume && `${keyword.volume.toLocaleString()}/mo`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Pro Tip</h3>
          <p className="text-sm text-yellow-800">
            Including semantic keywords in your article helps search engines understand your content context better. 
            Choose keywords that are closely related to your primary keyword but target different search intents.
          </p>
        </div>
      </div>
    </ArticleLayout>
  );
}
