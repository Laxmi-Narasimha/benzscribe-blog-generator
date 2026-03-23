import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { apiService } from "@/services/apiService";
import { Keyword } from "@/lib/types";
import { Check, Loader2, Plus, Search, X, Lightbulb } from "lucide-react";

const MAX_SECONDARY_KEYWORDS = 20;

export function Step6SecondaryKeywords() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedKeywordIds, setSelectedKeywordIds] = React.useState<string[]>(state.secondaryKeywords.map(k => k.id) || []);
  const [customKeyword, setCustomKeyword] = React.useState("");

  React.useEffect(() => {
    const event = new CustomEvent('step:loading', { detail: { loading } });
    window.dispatchEvent(event);
  }, [loading]);

  React.useEffect(() => {
    const fetchSecondaryKeywords = async () => {
      if (!state.primaryKeyword) return;
      setLoading(true);
      try {
        const data = await apiService.fetchSecondaryKeywords(state.primaryKeyword.text, state.topic);
        setKeywords(data);
        if (state.secondaryKeywords.length > 0) {
          setSelectedKeywordIds(state.secondaryKeywords.map(k => k.id));
        } else if (data.length > 0) {
          const initialSelection = data.slice(0, 3).map(k => k.id);
          setSelectedKeywordIds(initialSelection);
          dispatch({ type: "SET_SECONDARY_KEYWORDS", payload: data.filter(k => initialSelection.includes(k.id)) });
        }
      } catch {
        const fallbackKeywords: Keyword[] = [
          { id: 'sk-fallback-1', text: `best ${state.primaryKeyword.text}`, volume: Math.floor(Math.random() * 800) + 200, difficulty: Math.floor(Math.random() * 50) + 20 },
          { id: 'sk-fallback-2', text: `${state.primaryKeyword.text} examples`, volume: Math.floor(Math.random() * 600) + 100, difficulty: Math.floor(Math.random() * 40) + 20 },
          { id: 'sk-fallback-3', text: `how to use ${state.primaryKeyword.text}`, volume: Math.floor(Math.random() * 700) + 150, difficulty: Math.floor(Math.random() * 45) + 25 }
        ];
        setKeywords(fallbackKeywords);
        setSelectedKeywordIds(fallbackKeywords.map(k => k.id));
        dispatch({ type: "SET_SECONDARY_KEYWORDS", payload: fallbackKeywords });
      } finally {
        setLoading(false);
      }
    };
    fetchSecondaryKeywords();
  }, [state.primaryKeyword, state.topic]);

  const filteredKeywords = keywords.filter(k => k.text.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleKeywordToggle = (keywordId: string) => {
    let newSelectedIds: string[];
    if (selectedKeywordIds.includes(keywordId)) {
      newSelectedIds = selectedKeywordIds.filter(id => id !== keywordId);
    } else {
      if (selectedKeywordIds.length >= MAX_SECONDARY_KEYWORDS) return;
      newSelectedIds = [...selectedKeywordIds, keywordId];
    }
    setSelectedKeywordIds(newSelectedIds);
    dispatch({ type: "SET_SECONDARY_KEYWORDS", payload: keywords.filter(k => newSelectedIds.includes(k.id)) });
  };

  const handleCustomKeywordAdd = () => {
    if (!customKeyword.trim()) return;
    const newKeyword: Keyword = { id: `custom-${Date.now()}`, text: customKeyword.trim(), volume: Math.floor(Math.random() * 800) + 100, difficulty: Math.floor(Math.random() * 50) + 20 };
    setKeywords(prev => [newKeyword, ...prev]);
    let newSelectedIds = selectedKeywordIds;
    if (selectedKeywordIds.length < MAX_SECONDARY_KEYWORDS) {
      newSelectedIds = [...selectedKeywordIds, newKeyword.id];
    }
    setSelectedKeywordIds(newSelectedIds);
    setCustomKeyword("");
    dispatch({ type: "SET_SECONDARY_KEYWORDS", payload: keywords.concat(newKeyword).filter(k => newSelectedIds.includes(k.id)) });
  };

  const removeSelectedKeyword = (keywordId: string) => {
    const newSelectedIds = selectedKeywordIds.filter(id => id !== keywordId);
    setSelectedKeywordIds(newSelectedIds);
    dispatch({ type: "SET_SECONDARY_KEYWORDS", payload: keywords.filter(k => newSelectedIds.includes(k.id)) });
  };

  return (
    <div className="space-y-8">
      {/* Selected Keywords Chips */}
      {selectedKeywordIds.length > 0 && (
        <div className="artisan-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">Selected</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">{selectedKeywordIds.length}/{MAX_SECONDARY_KEYWORDS}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedKeywordIds.map(id => {
              const keyword = keywords.find(k => k.id === id);
              if (!keyword) return null;
              return (
                <div key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-body font-medium transition-all duration-200 hover:bg-primary/10">
                  {keyword.text}
                  <button onClick={() => removeSelectedKeyword(id)} className="hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom */}
      <div className="flex items-center gap-2">
        <input type="text" className="artisan-input flex-1" placeholder="Add a custom keyword..." value={customKeyword} onChange={(e) => setCustomKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCustomKeywordAdd(); }} />
        <button className="artisan-btn-primary" onClick={handleCustomKeywordAdd}><Plus className="h-4 w-4" /></button>
      </div>

      {/* Keywords List */}
      <div className="artisan-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input type="text" className="artisan-input pl-11" placeholder="Search keywords..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {loading ? (
            <div className="flex flex-col items-center py-14">
              <Loader2 className="h-7 w-7 text-primary animate-spin mb-3" />
              <p className="text-sm font-body text-muted-foreground">Loading related keywords...</p>
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="flex flex-col items-center py-14">
              <p className="text-sm font-body text-muted-foreground">No keywords found.</p>
            </div>
          ) : (
            filteredKeywords.map((keyword) => {
              const isSelected = selectedKeywordIds.includes(keyword.id);
              return (
                <div key={keyword.id} className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-200 ${isSelected ? "bg-accent/50" : "hover:bg-muted/30"}`} onClick={() => handleKeywordToggle(keyword.id)}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? "border-primary" : "border-border"}`}>
                    {isSelected && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  <span className="flex-1 text-sm font-body font-medium text-foreground">{keyword.text}</span>
                  <span className="text-xs font-mono text-muted-foreground">{keyword.volume && `${keyword.volume.toLocaleString()}/mo`}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pro Tip */}
      <div className="artisan-card p-5 border-primary/10 bg-accent/30">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-body font-semibold text-foreground mb-1">Pro Tip</h4>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Semantic keywords help search engines understand your content context. Choose keywords with different search intents for maximum coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
