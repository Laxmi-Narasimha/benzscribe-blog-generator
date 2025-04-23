
import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { ArticleLayout } from "@/components/layout/ArticleLayout";
import { apiService } from "@/services/apiService";
import { Reference } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Loader2, Plus, Search, X } from "lucide-react";

export function Step3References() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [references, setReferences] = React.useState<Reference[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRefs, setSelectedRefs] = React.useState<string[]>([]);
  const [customUrl, setCustomUrl] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  React.useEffect(() => {
    const fetchReferences = async () => {
      if (!state.topic) return;
      
      setLoading(true);
      try {
        const data = await apiService.fetchReferences(state.topic);
        setReferences(data);
        
        // Auto-select the first 3 references
        const initialSelection = data.slice(0, 3).map(ref => ref.id);
        setSelectedRefs(initialSelection);
        
        // Update the article context
        const selectedReferences = data.filter(ref => initialSelection.includes(ref.id));
        dispatch({ type: "SET_REFERENCES", payload: selectedReferences });
      } catch (error) {
        console.error("Error fetching references:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferences();
  }, [state.topic, dispatch]);

  const filteredReferences = references.filter(ref => 
    ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleReferenceToggle = (refId: string) => {
    let newSelectedRefs: string[];
    
    if (selectedRefs.includes(refId)) {
      newSelectedRefs = selectedRefs.filter(id => id !== refId);
    } else {
      // Limit to 5 selections
      if (selectedRefs.length >= 5) {
        newSelectedRefs = [...selectedRefs.slice(1), refId];
      } else {
        newSelectedRefs = [...selectedRefs, refId];
      }
    }
    
    setSelectedRefs(newSelectedRefs);
    
    // Update the article context
    const selectedReferences = references.filter(ref => newSelectedRefs.includes(ref.id));
    dispatch({ type: "SET_REFERENCES", payload: selectedReferences });
  };

  const handleUrlAdd = () => {
    if (!customUrl || !customUrl.startsWith("http")) return;
    
    const newRef: Reference = {
      id: `custom-${Date.now()}`,
      title: customUrl.slice(0, 50) + (customUrl.length > 50 ? "..." : ""),
      url: customUrl,
      source: "Custom Source"
    };
    
    setReferences(prev => [...prev, newRef]);
    setSelectedRefs(prev => [...prev, newRef.id]);
    setCustomUrl("");
    
    // Update the article context
    dispatch({ type: "SET_REFERENCES", payload: [...state.references, newRef] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Create reference objects for the uploaded files
    const fileRefs: Reference[] = files.map(file => ({
      id: `file-${Date.now()}-${file.name}`,
      title: file.name,
      url: URL.createObjectURL(file),
      source: "Uploaded File"
    }));
    
    setReferences(prev => [...prev, ...fileRefs]);
    setSelectedRefs(prev => [...prev, ...fileRefs.map(ref => ref.id)]);
    
    // Update the article context
    dispatch({ type: "SET_REFERENCES", payload: [...state.references, ...fileRefs] });
    
    // Reset the input
    e.target.value = "";
  };

  const removeFile = (fileId: string) => {
    setSelectedRefs(prev => prev.filter(id => id !== fileId));
    
    // Also remove from uploadedFiles if it's a file
    if (fileId.startsWith("file-")) {
      const fileName = fileId.split("-").slice(2).join("-");
      setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    }
    
    // Update the article context
    dispatch({ 
      type: "SET_REFERENCES", 
      payload: state.references.filter(ref => ref.id !== fileId) 
    });
  };

  const isNextDisabled = selectedRefs.length === 0;

  return (
    <ArticleLayout nextDisabled={isNextDisabled} loading={loading}>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-4">Select References</h2>
          <p className="text-gray-600">
            Choose sources to reference in your article. Select up to 5 references.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search references..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="ml-4 flex items-center">
                  <Badge variant="secondary" className="ml-2">
                    {selectedRefs.length}/5 selected
                  </Badge>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-gray-600">Loading references...</p>
                </div>
              ) : filteredReferences.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-gray-600">No references found for this topic.</p>
                </div>
              ) : (
                filteredReferences.map((ref) => {
                  const isSelected = selectedRefs.includes(ref.id);
                  
                  return (
                    <div 
                      key={ref.id}
                      className={`flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleReferenceToggle(ref.id)}
                    >
                      <div className={`w-6 h-6 flex-shrink-0 rounded-full border flex items-center justify-center ${
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "border-gray-300"
                      }`}>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-sm">{ref.title}</h3>
                        <p className="text-gray-500 text-xs">{ref.source}</p>
                      </div>
                      <a 
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Add Your Own References</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter URL (https://...)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleUrlAdd}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div>
                <label
                  className="flex justify-center w-full h-20 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
                >
                  <span className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="font-medium text-gray-600">
                      Drop files to upload, or
                      <span className="text-blue-600 underline ml-1">browse</span>
                    </span>
                  </span>
                  <input 
                    type="file" 
                    name="file_upload"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => {
                      const fileId = `file-${Date.now()}-${file.name}`;
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <span className="text-sm truncate">{file.name}</span>
                          <button 
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => removeFile(fileId)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ArticleLayout>
  );
}
