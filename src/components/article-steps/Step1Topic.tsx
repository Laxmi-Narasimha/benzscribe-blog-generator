import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { SAMPLE_PACKAGING_TOPICS, COUNTRIES, LANGUAGES } from "@/lib/constants";
import { openaiService } from "@/services/openaiService";
import { Loader2 } from "lucide-react";

export function Step1Topic() {
  const { state, dispatch, nextStep } = useArticle();
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [aiTitleSuggestions, setAiTitleSuggestions] = React.useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_TOPIC", payload: e.target.value });
    // Reset error when topic changes
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

  // Force regenerate suggestions button handler
  const handleRegenerateSuggestions = async () => {
    if (!state.topic || state.topic.trim().length < 3) {
      setError("Please enter a topic with at least 3 characters");
      return;
    }
    
    setLoadingSuggestions(true);
    setError(null);
    
    try {
      console.log('Manually triggering suggestion generation for topic:', state.topic);
      const suggestions = await openaiService.generateTitleSuggestions(state.topic);
      console.log('Received suggestions:', suggestions);
      
      if (suggestions.length > 0) {
        setAiTitleSuggestions(suggestions.map(s => s.text));
      } else {
        setError("Could not generate suggestions. Please try a different topic.");
      }
    } catch (err) {
      console.error('Error during manual regeneration:', err);
      setError("An error occurred while generating suggestions. Please try again.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Generate AI title suggestions when the topic changes
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const generateSuggestions = async () => {
      if (!state.topic || state.topic.trim().length < 3) {
        setAiTitleSuggestions([]);
        return;
      }
      
      setLoadingSuggestions(true);
      setError(null);
      
      try {
        console.log('Auto-generating suggestions for topic:', state.topic);
        const suggestions = await openaiService.generateTitleSuggestions(state.topic);
        console.log('Received suggestions:', suggestions);
        
        if (suggestions.length > 0) {
          setAiTitleSuggestions(suggestions.map(s => s.text));
        } else {
          setError("Could not generate suggestions. Please try a different topic.");
        }
      } catch (error) {
        console.error('Error generating title suggestions:', error);
        setError("An error occurred while generating suggestions. Please try again.");
        
        // Still set fallback suggestions based on the topic
        setAiTitleSuggestions([
          `Understanding the Different Types of ${state.topic} and Their Applications`,
          `How to Choose the Right ${state.topic} for Your Needs`,
          `The Environmental Impact of ${state.topic}: Myths and Facts`,
          `Innovations in Corrosion Prevention: Future Trends in ${state.topic} Solutions`
        ]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    
    // Debounce the API call to prevent too many requests while typing
    if (state.topic && state.topic.trim().length >= 3) {
      console.log('Setting timeout for topic:', state.topic);
      timeoutId = setTimeout(generateSuggestions, 1200); // Increased debounce time to 1.2s
    }
    
    return () => {
      if (timeoutId) {
        console.log('Clearing timeout');
        clearTimeout(timeoutId);
      }
    };
  }, [state.topic]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium mb-4">Start Your Article: Choose Your Topic</h2>
        <p className="text-gray-600 mb-6">
          Define the key elements to tailor your content for targeted impact.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label 
            htmlFor="topic" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Topic
          </label>
          <div className="relative">
            <input
              id="topic"
              type="text" 
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your topic (e.g., VCI bags, sustainable packaging)"
              value={state.topic}
              onChange={handleTopicChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-500 mb-2">Suggested Topics</div>
                  <div className="space-y-1">
                    {SAMPLE_PACKAGING_TOPICS.map((topic, index) => (
                      <div
                        key={index}
                        className="cursor-pointer hover:bg-blue-50 p-2 rounded-md text-sm"
                        onClick={() => handleSuggestionClick(topic)}
                      >
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              htmlFor="targetCountry" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Target Audience Location
            </label>
            <select
              id="targetCountry"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div>
            <label 
              htmlFor="language" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Article Language
            </label>
            <select
              id="language"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {state.topic && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-800">AI-Generated Topic Suggestions</h3>
            <div className="flex items-center gap-2">
              {loadingSuggestions && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
              <button 
                onClick={handleRegenerateSuggestions}
                disabled={loadingSuggestions}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded p-2 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {loadingSuggestions ? (
              <div className="col-span-2 text-center py-4 text-gray-500">
                Generating smart suggestions based on your topic...
              </div>
            ) : aiTitleSuggestions.length > 0 ? (
              aiTitleSuggestions.map((suggestion, index) => (
                <button 
                  key={index}
                  className="text-left text-blue-600 hover:text-blue-800 hover:underline p-2 rounded-md"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))
            ) : (
              <div className="col-span-2 text-center py-4 text-gray-500">
                Enter a specific topic to see AI-generated suggestions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
