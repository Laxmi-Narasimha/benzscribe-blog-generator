import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { apiService } from "@/services/apiService";
import { ArticleTitle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Pencil, RefreshCw, Star, Crown } from "lucide-react";

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
      <p className="text-base font-body text-muted-foreground leading-relaxed max-w-2xl">
        Choose a compelling, SEO-optimized title that captures your audience's attention.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isEditing ? (
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="artisan-input flex-1"
                placeholder="Enter your custom title..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCustomTitleSubmit(); }}
                autoFocus
              />
              <button className="artisan-btn-primary" onClick={handleCustomTitleSubmit}>Save</button>
            </div>
            <button className="text-sm font-body text-muted-foreground hover:text-foreground transition-premium" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
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
          <div className="flex flex-col items-center py-12 artisan-card">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <p className="text-sm font-body text-muted-foreground">Crafting compelling titles...</p>
          </div>
        ) : titles.length === 0 ? (
          <div className="flex flex-col items-center py-12 artisan-card">
            <p className="text-sm font-body text-muted-foreground">No titles generated yet.</p>
          </div>
        ) : (
          titles.map((title, index) => {
            const isSelected = selectedTitleId === title.id;
            return (
              <div
                key={title.id}
                className={`artisan-card-interactive p-5 ${
                  isSelected ? "border-primary shadow-gold ring-1 ring-primary/20" : ""
                }`}
                onClick={() => handleTitleSelect(title.id)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-premium ${
                    isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                  }`}>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-display text-xl font-semibold leading-snug ${
                      isSelected ? "text-foreground" : "text-foreground/80"
                    }`}>
                      {title.text}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {title.score && (
                        <Badge
                          variant={title.score >= 85 ? "success" : title.score >= 70 ? "warning" : "secondary"}
                          className="text-[10px] font-mono"
                        >
                          Score: {title.score}/100
                        </Badge>
                      )}
                      {title.id.startsWith('custom-') && (
                        <Badge variant="outline" className="text-[10px]">Custom</Badge>
                      )}
                    </div>
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

      {selectedTitleId && (
        <div className="artisan-card p-5 border-primary/20 bg-primary/5 animate-fade-up">
          <p className="text-xs font-body font-semibold tracking-[0.15em] uppercase text-primary mb-2">Selected Title</p>
          <p className="text-lg font-display font-semibold text-foreground">
            {titles.find(t => t.id === selectedTitleId)?.text || ""}
          </p>
        </div>
      )}
    </div>
  );
}
