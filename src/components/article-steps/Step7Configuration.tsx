
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";

import { ARTICLE_LENGTHS, WRITING_STYLES, WRITING_POINTS_OF_VIEW } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function Step7Configuration() {
  const { state, dispatch } = useArticle();
  const [expertGuidance, setExpertGuidance] = React.useState(state.expertGuidance || "");

  const handleArticleLengthChange = (lengthId: string) => {
    dispatch({ type: "SET_ARTICLE_LENGTH", payload: lengthId });
  };

  const handleWritingStyleChange = (styleId: string) => {
    dispatch({ type: "SET_WRITING_STYLE", payload: styleId });
  };

  const handlePointOfViewChange = (povId: string) => {
    dispatch({ type: "SET_POINT_OF_VIEW", payload: povId });
  };

  const handleExpertGuidanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExpertGuidance(e.target.value);
  };

  const handleExpertGuidanceSave = () => {
    dispatch({ type: "SET_EXPERT_GUIDANCE", payload: expertGuidance });
  };

  return (
    
      <div className="space-y-10">
        <div>
          <h2 className="text-xl font-medium mb-4">Tailor Your Article</h2>
          <p className="text-gray-600 mb-6">
            Customize your content to perfectly match your audience's needs and your brand's voice.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Article Structure and Length</h3>
            <p className="text-sm text-gray-600">Choose the best format for your content goals.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ARTICLE_LENGTHS.map((option) => {
                const isSelected = state.articleLength === option.id;
                
                return (
                  <button
                    key={option.id}
                    className={`flex items-center p-4 border rounded-lg transition-all ${
                      isSelected 
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/50" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleArticleLengthChange(option.id)}
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "border-gray-300"
                    }`}>
                      {isSelected && <Check className="h-4 w-4" />}
                    </div>
                    <div className="ml-3 text-left">
                      <span className="block text-sm font-medium">{option.name}</span>
                      <div className="mt-1">
                        {option.recommended && (
                          <Badge variant="success" className="text-xs">AI Recommended</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Writing style</h3>
              <p className="text-sm text-gray-600">To ensure your article matches your tone and personality.</p>
              
              <div className="space-y-3">
                {WRITING_STYLES.map((style) => {
                  const isSelected = state.writingStyle === style.id;
                  
                  return (
                    <button
                      key={style.id}
                      className={`flex items-center w-full p-4 border rounded-md transition-all ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleWritingStyleChange(style.id)}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "border-gray-300"
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="ml-3 text-left">
                        <span className="block text-sm font-medium">{style.name}</span>
                        <span className="block text-xs text-gray-500">{style.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Point of view</h3>
              <p className="text-sm text-gray-600">Choose the narrative perspective for your article</p>
              
              <div className="space-y-3">
                {WRITING_POINTS_OF_VIEW.map((pov) => {
                  const isSelected = state.pointOfView === pov.id;
                  
                  return (
                    <button
                      key={pov.id}
                      className={`flex items-center w-full p-4 border rounded-md transition-all ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handlePointOfViewChange(pov.id)}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "border-gray-300"
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="ml-3 text-left">
                        <span className="block text-sm font-medium">{pov.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Expert Guidance (Optional)</h3>
                <Badge variant="secondary">Optional</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Provide any specific details to make your content more tailored to your needs.
              </p>
              
              <div className="space-y-4">
                <textarea
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Make sure the each section starts with a paragraph..."
                  value={expertGuidance}
                  onChange={handleExpertGuidanceChange}
                  onBlur={handleExpertGuidanceSave}
                ></textarea>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="saveGuidance"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="saveGuidance" className="ml-2 block text-sm text-gray-900">
                      Save this guidance for future articles
                    </label>
                  </div>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Load Saved Guidance →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}
