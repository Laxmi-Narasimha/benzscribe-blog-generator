import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ARTICLE_TYPES, RESEARCH_METHODS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, BookOpen, Clipboard, Package, Box, Star } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "file-text": <FileText className="h-5 w-5" />,
  "box": <Box className="h-5 w-5" />,
  "book-open": <BookOpen className="h-5 w-5" />,
  "clipboard": <Clipboard className="h-5 w-5" />,
  "package": <Package className="h-5 w-5" />,
};

export function Step2ArticleType() {
  const { state, dispatch } = useArticle();
  const [selectedResearchMethod, setSelectedResearchMethod] = React.useState(RESEARCH_METHODS[0].id);

  const handleArticleTypeClick = (articleTypeId: string) => {
    dispatch({ type: "SET_ARTICLE_TYPE", payload: articleTypeId });
  };

  return (
    <div className="space-y-10">
      <p className="text-base font-body text-muted-foreground leading-relaxed max-w-2xl">
        Choose your article format and research methodology to craft the perfect piece.
      </p>

      {/* Article Type */}
      <div className="space-y-4">
        <h3 className="text-xs font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground">
          Article Format
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARTICLE_TYPES.map((type) => {
            const isSelected = state.articleType === type.id;
            return (
              <button
                key={type.id}
                className={`artisan-card-interactive p-5 text-left ${
                  isSelected ? "border-primary shadow-gold ring-1 ring-primary/20" : ""
                }`}
                onClick={() => handleArticleTypeClick(type.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl transition-premium ${
                    isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {ICON_MAP[type.icon || "file-text"] || <FileText className="h-5 w-5" />}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-body font-semibold text-foreground">{type.name}</span>
                {type.id === 'product' && (
                  <Badge variant="pro" className="mt-2 text-[10px]">Recommended</Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Research Method */}
      <div className="space-y-4">
        <h3 className="text-xs font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground">
          Research Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RESEARCH_METHODS.map((method) => {
            const isSelected = selectedResearchMethod === method.id;
            return (
              <div
                key={method.id}
                className={`artisan-card p-6 cursor-pointer transition-premium ${
                  isSelected ? "border-primary shadow-gold ring-1 ring-primary/20" : "hover:border-muted-foreground/20"
                }`}
                onClick={() => setSelectedResearchMethod(method.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-display text-xl font-semibold text-foreground mb-1">{method.name}</h4>
                    <p className="text-sm font-body text-muted-foreground">{method.description}</p>
                  </div>
                  {method.recommended && (
                    <Badge variant="pro" className="text-[10px] shrink-0">
                      <Star className="h-3 w-3 mr-0.5" /> Best
                    </Badge>
                  )}
                </div>
                <ul className="space-y-2 mb-5">
                  {method.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm font-body text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-body font-medium transition-premium ${
                    isSelected
                      ? "artisan-btn-primary justify-center"
                      : "artisan-btn-secondary justify-center"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Method"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
