import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { apiService } from "@/services/apiService";
import { Keyword } from "@/lib/types";
import { Check, Loader2, Search, TrendingUp } from "lucide-react";

export function Step4PrimaryKeyword() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedKeyword, setSelectedKeyword] = React.useState<string | null>(state.primaryKeyword?.id || null);
  const [customKeyword, setCustomKeyword] = React.useState("");

  React.useEffect(() => {
    const event = new CustomEvent('step:loading', { detail: { loading } });
    window.dispatchEvent(event);
  }, [loading]);

  React.useEffect(() => {
    const fetchKeywords = async () => {
      if (!state.topic) return;
      setLoading(true);
      try {
        const data = await apiService.fetchPrimaryKeywords(state.topic);
        setKeywords(data);
        if (!selectedKeyword && data.length > 0) {
          setSelectedKeyword(data[0].id);
          dispatch({ type: "SET_PRIMARY_KEYWORD", payload: data[0] });
        }
      } catch {
        const fallback: Keyword = { id: 'fallback-keyword', text: state.topic, volume: 1000, difficulty: 50 };
        setKeywords([fallback]);
        setSelectedKeyword(fallback.id);
        dispatch({ type: "SET_PRIMARY_KEYWORD", payload: fallback });
      } finally {
        setLoading(false);
      }
    };
    fetchKeywords();
  }, [state.topic, dispatch, selectedKeyword]);

  const filteredKeywords = keywords.filter(k => k.text.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleKeywordSelect = (keywordId: string) => {
    setSelectedKeyword(keywordId);
    const selected = keywords.find(k => k.id === keywordId);
    if (selected) dispatch({ type: "SET_PRIMARY_KEYWORD", payload: selected });
  };

  const handleCustomKeywordAdd = () => {
    if (!customKeyword.trim()) return;
    const newKeyword: Keyword = { id: `custom-${Date.now()}`, text: customKeyword.trim(), volume: Math.floor(Math.random() * 1000) + 500, difficulty: Math.floor(Math.random() * 50) + 30 };
    setKeywords(prev => [newKeyword, ...prev]);
    setSelectedKeyword(newKeyword.id);
    setCustomKeyword("");
    dispatch({ type: "SET_PRIMARY_KEYWORD", payload: newKeyword });
  };

  const getDifficultyStyle = (d?: number) => {
    if (!d) return "bg-muted text-muted-foreground";
    if (d < 30) return "bg-emerald-50 text-emerald-700";
    if (d < 60) return "bg-amber-50 text-amber-700";
    return "bg-red-50 text-red-700";
  };

  const getDifficultyLabel = (d?: number) => {
    if (!d) return "—";
    if (d < 30) return "Easy";
    if (d < 60) return "Medium";
    return "Hard";
  };

  return (
    <div className="space-y-8">
      {/* Custom Keyword */}
      <div className="artisan-card p-6">
        <label className="block text-[11px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
          Add Custom Keyword
        </label>
        <div className="flex items-center gap-2">
          <input type="text" className="artisan-input flex-1" placeholder="Enter a custom keyword..." value={customKeyword} onChange={(e) => setCustomKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCustomKeywordAdd(); }} />
          <button className="artisan-btn-primary" onClick={handleCustomKeywordAdd}>Add</button>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="artisan-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input type="text" className="artisan-input pl-11" placeholder="Search keywords..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center py-14">
              <Loader2 className="h-7 w-7 text-primary animate-spin mb-3" />
              <p className="text-sm font-body text-muted-foreground">Fetching keyword data...</p>
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="flex flex-col items-center py-14">
              <p className="text-sm font-body text-muted-foreground">No keywords found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-12 px-5 py-3" />
                  <th className="px-5 py-3 text-left text-[10px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">Keyword</th>
                  <th className="px-5 py-3 text-left text-[10px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Volume</span>
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredKeywords.map((keyword) => {
                  const isSelected = selectedKeyword === keyword.id;
                  return (
                    <tr key={keyword.id} className={`cursor-pointer transition-all duration-200 ${isSelected ? "bg-accent/50" : "hover:bg-muted/30"}`} onClick={() => handleKeywordSelect(keyword.id)}>
                      <td className="px-5 py-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? "border-primary" : "border-border"}`}>
                          {isSelected && <Check className="h-3 w-3 text-primary" />}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-body font-medium text-foreground">{keyword.text}</td>
                      <td className="px-5 py-4 text-sm font-mono text-muted-foreground">{keyword.volume ? `${keyword.volume.toLocaleString()}/mo` : "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-body font-medium ${getDifficultyStyle(keyword.difficulty)}`}>
                          {getDifficultyLabel(keyword.difficulty)} {keyword.difficulty ? `(${keyword.difficulty})` : ""}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected */}
      {selectedKeyword && (
        <div className="artisan-card p-5 border-primary/15 bg-accent/30 animate-fade-up">
          <p className="text-[10px] font-body font-semibold tracking-[0.12em] uppercase text-primary mb-2">Selected Keyword</p>
          <p className="text-base font-body font-semibold text-foreground">{keywords.find(k => k.id === selectedKeyword)?.text || ""}</p>
        </div>
      )}
    </div>
  );
}
