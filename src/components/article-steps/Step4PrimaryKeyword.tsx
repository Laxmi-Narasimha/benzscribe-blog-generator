
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { apiService } from "@/services/apiService";
import { Keyword } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Check, Info, Loader2, Search } from "lucide-react";

export function Step4PrimaryKeyword() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedKeyword, setSelectedKeyword] = React.useState<string | null>(
    state.primaryKeyword?.id || null
  );
  const [customKeyword, setCustomKeyword] = React.useState("");

  React.useEffect(() => {
    const fetchKeywords = async () => {
      if (!state.topic) return;
      
      setLoading(true);
      try {
        const data = await apiService.fetchPrimaryKeywords(state.topic);
        setKeywords(data);
        
        // Auto-select the first keyword if none is selected
        if (!selectedKeyword && data.length > 0) {
          setSelectedKeyword(data[0].id);
          dispatch({ 
            type: "SET_PRIMARY_KEYWORD", 
            payload: data[0] 
          });
        }
      } catch (error) {
        console.error("Error fetching keywords:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeywords();
  }, [state.topic, dispatch, selectedKeyword]);

  const filteredKeywords = keywords.filter(keyword => 
    keyword.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeywordSelect = (keywordId: string) => {
    setSelectedKeyword(keywordId);
    
    const selected = keywords.find(k => k.id === keywordId);
    if (selected) {
      dispatch({ type: "SET_PRIMARY_KEYWORD", payload: selected });
    }
  };

  const handleCustomKeywordAdd = () => {
    if (!customKeyword.trim()) return;
    
    const newKeyword: Keyword = {
      id: `custom-${Date.now()}`,
      text: customKeyword.trim(),
    };
    
    setKeywords(prev => [newKeyword, ...prev]);
    setSelectedKeyword(newKeyword.id);
    setCustomKeyword("");
    
    dispatch({ type: "SET_PRIMARY_KEYWORD", payload: newKeyword });
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return "bg-gray-100 text-gray-600";
    if (difficulty < 30) return "bg-green-100 text-green-800";
    if (difficulty < 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getDifficultyText = (difficulty?: number) => {
    if (!difficulty) return "Unknown";
    if (difficulty < 30) return "Easy";
    if (difficulty < 60) return "Medium";
    return "Hard";
  };

  const isNextDisabled = !selectedKeyword;

  return (
    <ArticleLayout nextDisabled={isNextDisabled} loading={loading}>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-4">Select Primary Keyword</h2>
          <p className="text-gray-600 mb-6">
            Choose the main keyword to optimize your article for search engines.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Add a custom keyword</span>
              <div className="relative group">
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute left-full ml-2 w-60 p-2 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs text-gray-700">
                  If you don't find your preferred keyword in the list, you can add a custom one here.
                </div>
              </div>
            </div>
          </div>
          
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
              Add
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
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Keyword
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <span>Volume</span>
                            <BarChart2 className="h-3 w-3 ml-1" />
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Difficulty
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredKeywords.map((keyword) => {
                        const isSelected = selectedKeyword === keyword.id;
                        
                        return (
                          <tr 
                            key={keyword.id}
                            className={`hover:bg-gray-50 cursor-pointer ${
                              isSelected ? "bg-blue-50" : ""
                            }`}
                            onClick={() => handleKeywordSelect(keyword.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                isSelected 
                                  ? "bg-blue-600 border-blue-600 text-white" 
                                  : "border-gray-300"
                              }`}>
                                {isSelected && <Check className="h-4 w-4" />}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{keyword.text}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {keyword.volume ? (
                                <div className="text-sm text-gray-500">{keyword.volume.toLocaleString()}/mo</div>
                              ) : (
                                <div className="text-sm text-gray-400">N/A</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {keyword.difficulty ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(keyword.difficulty)}`}>
                                  {getDifficultyText(keyword.difficulty)} ({keyword.difficulty})
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  N/A
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {selectedKeyword && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Selected Keyword</h3>
            <div className="flex items-center">
              <Badge variant="info" className="text-sm">
                {keywords.find(k => k.id === selectedKeyword)?.text || ""}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </ArticleLayout>
  );
}
