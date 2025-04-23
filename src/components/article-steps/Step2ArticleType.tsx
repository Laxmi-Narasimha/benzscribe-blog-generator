
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { ARTICLE_TYPES, RESEARCH_METHODS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Link } from "lucide-react";

export function Step2ArticleType() {
  const { state, dispatch } = useArticle();
  const [selectedResearchMethod, setSelectedResearchMethod] = React.useState(RESEARCH_METHODS[0].id);

  const handleArticleTypeClick = (articleTypeId: string) => {
    dispatch({ type: "SET_ARTICLE_TYPE", payload: articleTypeId });
  };

  const handleResearchMethodSelect = (methodId: string) => {
    setSelectedResearchMethod(methodId);
  };

  const isNextDisabled = !state.articleType;

  return (
    <ArticleLayout nextDisabled={isNextDisabled}>
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium mb-4">Article Type and Research Method</h2>
            <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              <Link className="h-4 w-4 mr-1" />
              Why This matters
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Choose your Article type and how you want to gather information for it
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ARTICLE_TYPES.map((type) => {
                const isSelected = state.articleType === type.id;
                
                return (
                  <button
                    key={type.id}
                    className={`flex items-center p-4 border rounded-md transition-all ${
                      isSelected 
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/50" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleArticleTypeClick(type.id)}
                  >
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium">{type.name}</span>
                    </div>
                    {type.id === 'product' && (
                      <Badge variant="success" className="ml-2">Recommended</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Research Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RESEARCH_METHODS.map((method) => {
                const isSelected = selectedResearchMethod === method.id;
                
                return (
                  <div 
                    key={method.id}
                    className={`border rounded-xl p-6 transition-all ${
                      isSelected 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-lg mb-1">{method.name}</h3>
                        <p className="text-gray-600 text-sm">{method.description}</p>
                      </div>
                      {method.recommended && (
                        <Badge variant="success">Recommended</Badge>
                      )}
                    </div>
                    <ul className="space-y-2 mb-4">
                      {method.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 px-4 rounded-md border text-sm font-medium ${
                        isSelected 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => handleResearchMethodSelect(method.id)}
                    >
                      {isSelected ? "Selected" : "Select Method"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ArticleLayout>
  );
}
