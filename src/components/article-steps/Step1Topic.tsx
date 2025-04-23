
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { SAMPLE_PACKAGING_TOPICS, COUNTRIES, LANGUAGES } from "@/lib/constants";

export function Step1Topic() {
  const { state, dispatch } = useArticle();
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_TOPIC", payload: e.target.value });
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

  const isNextDisabled = !state.topic.trim();

  return (
    <ArticleLayout nextDisabled={isNextDisabled}>
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
            <h3 className="font-medium text-blue-800 mb-2">Suggested Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button className="text-left text-blue-600 hover:text-blue-800 hover:underline p-2 rounded-md" onClick={() => handleSuggestionClick(`Understanding the Different Types of ${state.topic} and Their Applications`)}>
                Understanding the Different Types of {state.topic} and Their Applications
              </button>
              <button className="text-left text-blue-600 hover:text-blue-800 hover:underline p-2 rounded-md" onClick={() => handleSuggestionClick(`How to Choose the Right ${state.topic} for Your Needs`)}>
                How to Choose the Right {state.topic} for Your Needs
              </button>
              <button className="text-left text-blue-600 hover:text-blue-800 hover:underline p-2 rounded-md" onClick={() => handleSuggestionClick(`The Environmental Impact of ${state.topic}: Myths and Facts`)}>
                The Environmental Impact of {state.topic}: Myths and Facts
              </button>
              <button className="text-left text-blue-600 hover:text-blue-800 hover:underline p-2 rounded-md" onClick={() => handleSuggestionClick(`Innovations in Corrosion Prevention: Future Trends in ${state.topic} Solutions`)}>
                Innovations in Corrosion Prevention: Future Trends in {state.topic} Solutions
              </button>
            </div>
          </div>
        )}
      </div>
    </ArticleLayout>
  );
}
