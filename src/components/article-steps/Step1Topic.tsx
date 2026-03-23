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
      <div>
        <p className="text-base font-body text-muted-foreground leading-relaxed max-w-2xl">
          Define the foundation of your article. Choose a compelling topic and tailor it for your target audience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Topic Input */}
        <div className="artisan-card p-6">
          <label htmlFor="topic" className="block text-sm font-body font-semibold text-foreground mb-3 tracking-wide uppercase">
            Topic
          </label>
          <div className="relative">
            <input
              id="topic"
              type="text"
              className="artisan-input text-base"
              placeholder="Enter your topic (e.g., VCI bags, sustainable packaging)"
              value={state.topic}
              onChange={handleTopicChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && (
              <div className="absolute z-20 w-full mt-2 artisan-card p-2 max-h-60 overflow-auto animate-scale-in">
                <p className="text-[10px] font-body tracking-[0.15em] uppercase text-muted-foreground px-3 py-2">
                  Suggested Topics
                </p>
                {SAMPLE_PACKAGING_TOPICS.map((topic, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-body text-foreground hover:bg-primary/5 hover:text-primary transition-premium"
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
            <label htmlFor="targetCountry" className="flex items-center gap-2 text-sm font-body font-semibold text-foreground mb-3 tracking-wide uppercase">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Target Location
            </label>
            <select
              id="targetCountry"
              className="artisan-select"
              value={state.targetCountry}
              onChange={handleCountryChange}
            >
              {COUNTRIES.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="artisan-card p-6">
            <label htmlFor="language" className="flex items-center gap-2 text-sm font-body font-semibold text-foreground mb-3 tracking-wide uppercase">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Article Language
            </label>
            <select
              id="language"
              className="artisan-select"
              value={state.language}
              onChange={handleLanguageChange}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.flag} {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {state.topic && (
        <div className="artisan-card overflow-hidden animate-fade-up">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-semibold text-foreground">AI Suggestions</h3>
            </div>
            <div className="flex items-center gap-2">
              {loadingSuggestions && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
              <button
                onClick={handleRegenerateSuggestions}
                disabled={loadingSuggestions}
                className="artisan-btn-ghost text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-sm font-body">
              {error}
            </div>
          )}

          <div className="p-4">
            {loadingSuggestions ? (
              <div className="text-center py-8 text-muted-foreground text-sm font-body">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Generating smart suggestions...
              </div>
            ) : aiTitleSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {aiTitleSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-left p-3.5 rounded-xl text-sm font-body text-foreground/80 hover:bg-primary/5 hover:text-primary transition-premium border border-transparent hover:border-primary/10"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm font-body">
                Enter a specific topic to see AI-generated suggestions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
