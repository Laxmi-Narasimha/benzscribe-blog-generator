import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { SAMPLE_PACKAGING_TOPICS, COUNTRIES, LANGUAGES } from "@/lib/constants";
import { openaiService } from "@/services/openaiService";
import { Loader2, MapPin, Globe, Sparkles, RefreshCw } from "lucide-react";

export function Step1Topic() {
  const { state, dispatch } = useArticle();
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [aiTitleSuggestions, setAiTitleSuggestions] = React.useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_TOPIC", payload: e.target.value });
    setError(null);
  };

  const handleSuggestionClick = (topic: string) => {
    dispatch({ type: "SET_TOPIC", payload: topic });
    setShowSuggestions(false);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: "SET_TARGET_COUNTRY", payload: e.target.value });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: "SET_LANGUAGE", payload: e.target.value });
  };

  const handleRegenerateSuggestions = async () => {
    if (!state.topic || state.topic.trim().length < 3) {
      setError("Please enter a topic with at least 3 characters");
      return;
    }
    setLoadingSuggestions(true);
    setError(null);
    try {
      const suggestions = await openaiService.generateTitleSuggestions(state.topic);
      if (suggestions.length > 0) {
        setAiTitleSuggestions(suggestions.map(s => s.text));
      } else {
        setError("Could not generate suggestions. Please try a different topic.");
      }
    } catch {
      setError("An error occurred while generating suggestions. Please try again.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const generateSuggestions = async () => {
      if (!state.topic || state.topic.trim().length < 3) {
        setAiTitleSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      setError(null);
      try {
        const suggestions = await openaiService.generateTitleSuggestions(state.topic);
        if (suggestions.length > 0) {
          setAiTitleSuggestions(suggestions.map(s => s.text));
        }
      } catch {
        setAiTitleSuggestions([
          `Understanding the Different Types of ${state.topic} and Their Applications`,
          `How to Choose the Right ${state.topic} for Your Needs`,
          `The Environmental Impact of ${state.topic}: Myths and Facts`,
          `Innovations in ${state.topic}: Future Trends`
        ]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    if (state.topic && state.topic.trim().length >= 3) {
      timeoutId = setTimeout(generateSuggestions, 1200);
    }
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [state.topic]);

  return (
    <div className="space-y-8">
      {/* Topic Input */}
      <div className="artisan-card p-7">
        <label htmlFor="topic" className="block text-[11px] font-body font-semibold text-muted-foreground mb-3 tracking-[0.12em] uppercase">
          What would you like to write about?
        </label>
        <div className="relative">
          <input
            id="topic"
            type="text"
            className="artisan-input text-base py-4"
            placeholder="e.g., VCI packaging, sustainable materials, corrosion prevention..."
            value={state.topic}
            onChange={handleTopicChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && (
            <div className="absolute z-20 w-full mt-2 artisan-card p-2 max-h-60 overflow-auto animate-scale-in shadow-luxury">
              <p className="text-[10px] font-body tracking-[0.12em] uppercase text-muted-foreground/60 px-3 py-2">
                Quick Suggestions
              </p>
              {SAMPLE_PACKAGING_TOPICS.map((topic, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-body text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  onClick={() => handleSuggestionClick(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Country & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="artisan-card p-6">
          <label htmlFor="targetCountry" className="flex items-center gap-2 text-[11px] font-body font-semibold text-muted-foreground mb-3 tracking-[0.12em] uppercase">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Target Location
          </label>
          <select id="targetCountry" className="artisan-select" value={state.targetCountry} onChange={handleCountryChange}>
            {COUNTRIES.map((country) => (
              <option key={country.id} value={country.id}>{country.flag} {country.name}</option>
            ))}
          </select>
        </div>

        <div className="artisan-card p-6">
          <label htmlFor="language" className="flex items-center gap-2 text-[11px] font-body font-semibold text-muted-foreground mb-3 tracking-[0.12em] uppercase">
            <Globe className="h-3.5 w-3.5 text-primary" />
            Article Language
          </label>
          <select id="language" className="artisan-select" value={state.language} onChange={handleLanguageChange}>
            {LANGUAGES.map((language) => (
              <option key={language.id} value={language.id}>{language.flag} {language.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Suggestions */}
      {state.topic && (
        <div className="artisan-card overflow-hidden animate-fade-up">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg text-foreground">AI-Powered Suggestions</h3>
            </div>
            <div className="flex items-center gap-2">
              {loadingSuggestions && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
              <button onClick={handleRegenerateSuggestions} disabled={loadingSuggestions} className="artisan-btn-ghost text-xs">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3.5 rounded-xl bg-destructive/5 border border-destructive/15 text-destructive text-sm font-body">
              {error}
            </div>
          )}

          <div className="p-5">
            {loadingSuggestions ? (
              <div className="text-center py-10 text-muted-foreground text-sm font-body">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-3 text-primary" />
                Generating smart suggestions...
              </div>
            ) : aiTitleSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {aiTitleSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-left p-4 rounded-xl text-sm font-body text-foreground/75 hover:bg-accent hover:text-accent-foreground transition-all duration-200 border border-transparent hover:border-primary/10"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm font-body">
                Type at least 3 characters to see AI suggestions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
