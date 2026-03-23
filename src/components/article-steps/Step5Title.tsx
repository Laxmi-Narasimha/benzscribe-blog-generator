import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { apiService } from "@/services/apiService";
import { ArticleTitle } from "@/lib/types";
import { Check, Loader2, Pencil, RefreshCw, Crown } from "lucide-react";

export function Step5Title() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [titles, setTitles] = React.useState<ArticleTitle[]>([]);
  const [selectedTitleId, setSelectedTitleId] = React.useState<string | null>(state.title?.id || null);
  const [customTitle, setCustomTitle] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    const generateTitles = async () => {
      if (!state.topic || !state.primaryKeyword) return;
      setLoading(true);
      try {
        const data = await apiService.generateTitles(state.topic, state.primaryKeyword.text);
        setTitles(data);
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
    if (selected) dispatch({ type: "SET_TITLE", payload: selected });
  };

  const handleCustomTitleSubmit = () => {
    if (!customTitle.trim()) return;
    const newTitle: ArticleTitle = { id: `custom-${Date.now()}`, text: customTitle.trim() };
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
      const data = await apiService.generateTitles(state.topic, state.primaryKeyword.text);
      setTitles(data);
    } catch (error) {
      console.error("Error regenerating titles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isEditing ? (
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <input type="text" className="artisan-input flex-1" placeholder="Write your own title..." value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCustomTitleSubmit(); }} autoFocus />
              <button className="artisan-btn-primary" onClick={handleCustomTitleSubmit}>Save</button>
            </div>
            <button className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <>
            <button className="artisan-btn-secondary" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" /> Write your own
            </button>
            <button className="artisan-btn-ghost border border-border" onClick={handleRegenerateTitles} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Regenerate
            </button>
          </>
        )}
      </div>

      {/* Title List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-14 artisan-card">
            <Loader2 className="h-7 w-7 text-primary animate-spin mb-3" />
            <p className="text-sm font-body text-muted-foreground">Crafting compelling titles...</p>
          </div>
        ) : titles.length === 0 ? (
          <div className="flex flex-col items-center py-14 artisan-card">
            <p className="text-sm font-body text-muted-foreground">No titles generated yet.</p>
          </div>
        ) : (
          titles.map((title, index) => {
            const isSelected = selectedTitleId === title.id;
            return (
              <div
                key={title.id}
                className={`artisan-card-interactive p-6 animate-fade-up ${isSelected ? "border-primary/40 shadow-gold ring-1 ring-primary/15" : ""}`}
                onClick={() => handleTitleSelect(title.id)}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all duration-300 ${isSelected ? "border-primary" : "border-border"}`}>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-display text-xl leading-snug ${isSelected ? "text-foreground" : "text-foreground/75"}`}>
                      {title.text}
                    </h3>
                    {title.score && (
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-mono ${
                          title.score >= 85 ? "bg-emerald-50 text-emerald-700" : title.score >= 70 ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"
                        }`}>
                          Score: {title.score}/100
                        </span>
                        {title.id.startsWith('custom-') && (
                          <span className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">Custom</span>
                        )}
                      </div>
                    )}
                  </div>
                  {title.score && title.score >= 90 && (
                    <Crown className="h-5 w-5 text-primary shrink-0" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected */}
      {selectedTitleId && (
        <div className="artisan-card p-6 border-primary/15 bg-accent/30 animate-fade-up">
          <p className="text-[10px] font-body font-semibold tracking-[0.12em] uppercase text-primary mb-2">Selected Title</p>
          <p className="text-lg font-display text-foreground">{titles.find(t => t.id === selectedTitleId)?.text || ""}</p>
        </div>
      )}
    </div>
  );
}
