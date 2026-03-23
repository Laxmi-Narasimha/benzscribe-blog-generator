import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { apiService } from "@/services/apiService";
import { OutlineHeading } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Edit, Loader2, Plus, Trash, RefreshCw, Save, GripVertical } from "lucide-react";
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
      if (state.outline.length === 0) {
        setLoading(true);
        try {
          const secondaryKeywordTexts = state.secondaryKeywords.map(k => k.text);
          const data = await apiService.generateOutline(state.topic, state.primaryKeyword.text, secondaryKeywordTexts, state.articleType);
          setOutline(data);
          dispatch({ type: "SET_OUTLINE", payload: data });
          const newExpanded: Record<number, boolean> = {};
          data.forEach((_, index) => { newExpanded[index] = true; });
          setExpanded(newExpanded);
          toast({ title: "Outline Generated", description: "Your article outline has been successfully generated.", variant: "default" });
        } catch (error) {
          console.error("Error generating outline:", error);
          toast({ title: "Error", description: "Failed to generate outline. Please try again.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      } else {
        setOutline(state.outline);
        const newExpanded: Record<number, boolean> = {};
        state.outline.forEach((_, index) => { newExpanded[index] = true; });
        setExpanded(newExpanded);
      }
    };
    generateOutline();
  }, [state.topic, state.primaryKeyword, state.secondaryKeywords, state.articleType, state.outline, dispatch, toast]);

  const handleSaveOutline = () => {
    dispatch({ type: "SET_OUTLINE", payload: outline });
    toast({ title: "Outline Saved", description: "Your outline has been saved.", variant: "default" });
  };

  const handleRegenerateOutline = async () => {
    if (!state.topic || !state.primaryKeyword) return;
    setLoading(true);
    try {
      const secondaryKeywordTexts = state.secondaryKeywords.map(k => k.text);
      const data = await apiService.generateOutline(state.topic, state.primaryKeyword.text, secondaryKeywordTexts, state.articleType);
      setOutline(data);
      dispatch({ type: "SET_OUTLINE", payload: data });
      const newExpanded: Record<number, boolean> = {};
      data.forEach((_, index) => { newExpanded[index] = true; });
      setExpanded(newExpanded);
      toast({ title: "Outline Regenerated", description: "New outline created.", variant: "default" });
    } catch (error) {
      console.error("Error regenerating outline:", error);
      toast({ title: "Error", description: "Failed to regenerate. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (index: number) => setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  const startEditingHeading = (index: number) => { setEditingIndex(index); setEditingSubIndex(null); setEditingText(outline[index].heading); };
  const startEditingSubheading = (hi: number, si: number) => { setEditingIndex(hi); setEditingSubIndex(si); setEditingText(outline[hi].subheadings[si]); };

  const saveEditing = () => {
    if (editingIndex === null) return;
    const updated = [...outline];
    if (editingSubIndex === null) {
      updated[editingIndex] = { ...updated[editingIndex], heading: editingText };
    } else {
      const subs = [...updated[editingIndex].subheadings];
      subs[editingSubIndex] = editingText;
      updated[editingIndex] = { ...updated[editingIndex], subheadings: subs };
    }
    setOutline(updated);
    setEditingIndex(null); setEditingSubIndex(null); setEditingText("");
  };

  const cancelEditing = () => { setEditingIndex(null); setEditingSubIndex(null); setEditingText(""); };
  const addHeading = () => setOutline([...outline, { heading: "New Section", subheadings: [] }]);
  const addSubheading = (hi: number) => {
    const updated = [...outline];
    updated[hi] = { ...updated[hi], subheadings: [...updated[hi].subheadings, "New Subsection"] };
    setOutline(updated);
  };
  const deleteHeading = (index: number) => setOutline(outline.filter((_, i) => i !== index));
  const deleteSubheading = (hi: number, si: number) => {
    const updated = [...outline];
    updated[hi] = { ...updated[hi], subheadings: updated[hi].subheadings.filter((_, i) => i !== si) };
    setOutline(updated);
  };

  const moveHeading = (index: number, dir: "up" | "down") => {
    if ((dir === "up" && index === 0) || (dir === "down" && index === outline.length - 1)) return;
    const updated = [...outline];
    const target = dir === "up" ? index - 1 : index + 1;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setOutline(updated);
  };

  const moveSubheading = (hi: number, si: number, dir: "up" | "down") => {
    const subs = outline[hi].subheadings;
    if ((dir === "up" && si === 0) || (dir === "down" && si === subs.length - 1)) return;
    const updated = [...outline];
    const newSubs = [...subs];
    const target = dir === "up" ? si - 1 : si + 1;
    [newSubs[si], newSubs[target]] = [newSubs[target], newSubs[si]];
    updated[hi] = { ...updated[hi], subheadings: newSubs };
    setOutline(updated);
  };

  return (
    <div className="space-y-8">
      <p className="text-base font-body text-muted-foreground leading-relaxed max-w-2xl">
        Sculpt the perfect structure. Edit, rearrange, or add sections to create a compelling narrative flow.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="artisan-btn-primary" onClick={handleSaveOutline} disabled={loading}>
          <Save className="h-4 w-4" /> Save Outline
        </button>
        <button className="artisan-btn-secondary" onClick={handleRegenerateOutline} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Regenerate
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 artisan-card">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-lg font-display font-semibold text-foreground">Crafting your outline...</p>
          <p className="text-sm font-body text-muted-foreground mt-1">Creating a comprehensive structure based on your inputs</p>
        </div>
      ) : outline.length === 0 ? (
        <div className="text-center py-16 artisan-card border-dashed">
          <p className="text-lg font-display font-semibold text-foreground mb-2">No outline yet</p>
          <p className="text-sm font-body text-muted-foreground mb-6">Generate an outline to get started</p>
          <button className="artisan-btn-primary" onClick={handleRegenerateOutline}>Generate Outline</button>
        </div>
      ) : (
        <div className="space-y-3">
          {outline.map((section, index) => (
            <div key={index} className="artisan-card overflow-hidden animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
              {/* Section Header */}
              <div className="px-5 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
                {editingIndex === index && editingSubIndex === null ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      className="artisan-input flex-1"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEditing(); }}
                      autoFocus
                    />
                    <button className="artisan-btn-ghost text-xs" onClick={cancelEditing}>Cancel</button>
                    <button className="artisan-btn-primary text-xs py-2 px-3" onClick={saveEditing}>Save</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleExpanded(index)} className="text-muted-foreground hover:text-foreground transition-premium">
                        {expanded[index] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                      <h4 className="font-display text-lg font-semibold text-foreground">{section.heading}</h4>
                      {(index === 0 || index === outline.length - 1) && (
                        <Badge variant="outline" className="text-[10px] font-body">{index === 0 ? 'Introduction' : 'Conclusion'}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => startEditingHeading(index)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-premium" title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => moveHeading(index, "up")} disabled={index === 0} className={`p-1.5 rounded-lg transition-premium ${index === 0 ? 'opacity-20' : 'hover:bg-muted text-muted-foreground'}`}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => moveHeading(index, "down")} disabled={index === outline.length - 1} className={`p-1.5 rounded-lg transition-premium ${index === outline.length - 1 ? 'opacity-20' : 'hover:bg-muted text-muted-foreground'}`}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteHeading(index)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-premium">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Subheadings */}
              {expanded[index] && (
                <div className="p-5 space-y-2">
                  {section.subheadings.map((sub, si) => (
                    <div key={si} className="ml-6 flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      {editingIndex === index && editingSubIndex === si ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            className="artisan-input flex-1 text-sm"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEditing(); }}
                            autoFocus
                          />
                          <button className="artisan-btn-ghost text-xs" onClick={cancelEditing}>Cancel</button>
                          <button className="artisan-btn-primary text-xs py-1.5 px-2.5" onClick={saveEditing}>Save</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            <span className="text-sm font-body text-foreground/80">{sub}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => startEditingSubheading(index, si)} className="p-1 rounded hover:bg-primary/10 text-primary transition-premium"><Edit className="h-3 w-3" /></button>
                            <button onClick={() => moveSubheading(index, si, "up")} disabled={si === 0} className={`p-1 rounded transition-premium ${si === 0 ? 'opacity-20' : 'hover:bg-muted'}`}><ChevronUp className="h-3 w-3 text-muted-foreground" /></button>
                            <button onClick={() => moveSubheading(index, si, "down")} disabled={si === section.subheadings.length - 1} className={`p-1 rounded transition-premium ${si === section.subheadings.length - 1 ? 'opacity-20' : 'hover:bg-muted'}`}><ChevronDown className="h-3 w-3 text-muted-foreground" /></button>
                            <button onClick={() => deleteSubheading(index, si)} className="p-1 rounded hover:bg-destructive/10 text-destructive transition-premium"><Trash className="h-3 w-3" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="ml-6 mt-3">
                    <button className="artisan-btn-ghost text-xs border border-dashed border-border" onClick={() => addSubheading(index)}>
                      <Plus className="h-3.5 w-3.5" /> Add Subsection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-center pt-4">
            <button className="artisan-btn-secondary" onClick={addHeading}>
              <Plus className="h-4 w-4" /> Add Section
            </button>
          </div>
        </div>
      )}

      {/* Outline Preview */}
      {outline.length > 0 && !loading && (
        <div className="artisan-card p-6 border-primary/15 bg-primary/5">
          <h3 className="text-xs font-body font-semibold tracking-[0.15em] uppercase text-primary mb-4">Outline Preview</h3>
          <div className="space-y-3">
            {outline.map((section, idx) => (
              <div key={idx}>
                <div className="text-sm font-body font-semibold text-foreground">{idx + 1}. {section.heading}</div>
                {section.subheadings.length > 0 && (
                  <ul className="ml-6 mt-1 space-y-0.5">
                    {section.subheadings.map((sub, si) => (
                      <li key={si} className="text-sm font-body text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary/30" />
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
  );
}
