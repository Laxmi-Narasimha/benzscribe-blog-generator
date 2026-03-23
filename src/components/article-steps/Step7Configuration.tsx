import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ARTICLE_LENGTHS, WRITING_STYLES, WRITING_POINTS_OF_VIEW } from "@/lib/constants";
import { Check, Save } from "lucide-react";

export function Step7Configuration() {
  const { state, dispatch } = useArticle();
  const [expertGuidance, setExpertGuidance] = React.useState(state.expertGuidance || "");

  const handleArticleLengthChange = (lengthId: string) => dispatch({ type: "SET_ARTICLE_LENGTH", payload: lengthId });
  const handleWritingStyleChange = (styleId: string) => dispatch({ type: "SET_WRITING_STYLE", payload: styleId });
  const handlePointOfViewChange = (povId: string) => dispatch({ type: "SET_POINT_OF_VIEW", payload: povId });
  const handleExpertGuidanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setExpertGuidance(e.target.value);
  const handleExpertGuidanceSave = () => dispatch({ type: "SET_EXPERT_GUIDANCE", payload: expertGuidance });

  return (
    <div className="space-y-10">
      {/* Article Length */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">Article Length</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ARTICLE_LENGTHS.map((option) => {
            const isSelected = state.articleLength === option.id;
            return (
              <button key={option.id} className={`artisan-card-interactive p-5 text-left ${isSelected ? "border-primary/40 shadow-gold ring-1 ring-primary/15" : ""}`} onClick={() => handleArticleLengthChange(option.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? "border-primary" : "border-border"}`}>
                    {isSelected && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  <div>
                    <span className="block text-sm font-body font-semibold text-foreground">{option.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{option.wordCount}</span>
                  </div>
                </div>
                {option.recommended && (
                  <span className="mt-3 inline-block text-[10px] font-body font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">Recommended</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Writing Style & POV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-[11px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">Writing Style</h3>
          <div className="space-y-2">
            {WRITING_STYLES.map((style) => {
              const isSelected = state.writingStyle === style.id;
              return (
                <button key={style.id} className={`w-full artisan-card-interactive p-4 text-left flex items-center gap-3 ${isSelected ? "border-primary/30 bg-accent/40" : ""}`} onClick={() => handleWritingStyleChange(style.id)}>
                  <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? "border-primary" : "border-border"}`}>
                    {isSelected && <Check className="h-2.5 w-2.5 text-primary" />}
                  </div>
                  <div>
                    <span className="block text-sm font-body font-medium text-foreground">{style.name}</span>
                    <span className="text-xs font-body text-muted-foreground">{style.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[11px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">Point of View</h3>
          <div className="space-y-2">
            {WRITING_POINTS_OF_VIEW.map((pov) => {
              const isSelected = state.pointOfView === pov.id;
              return (
                <button key={pov.id} className={`w-full artisan-card-interactive p-4 text-left flex items-center gap-3 ${isSelected ? "border-primary/30 bg-accent/40" : ""}`} onClick={() => handlePointOfViewChange(pov.id)}>
                  <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? "border-primary" : "border-border"}`}>
                    {isSelected && <Check className="h-2.5 w-2.5 text-primary" />}
                  </div>
                  <span className="text-sm font-body font-medium text-foreground">{pov.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expert Guidance */}
      <div className="artisan-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">Expert Guidance</h3>
          <span className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">Optional</span>
        </div>
        <p className="text-sm font-body text-muted-foreground">Provide specific instructions to make your content uniquely tailored.</p>
        <textarea className="artisan-input min-h-[120px] resize-y" placeholder="E.g., Focus on industrial applications, include cost comparisons..." value={expertGuidance} onChange={handleExpertGuidanceChange} onBlur={handleExpertGuidanceSave} />
        <div className="flex justify-end">
          <button className="artisan-btn-ghost text-xs" onClick={handleExpertGuidanceSave}>
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
