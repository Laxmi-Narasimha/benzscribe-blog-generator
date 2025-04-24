import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { apiService } from "@/services/apiService";
import { Reference } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, ExternalLink, Info, Loader2, Plus, RefreshCw, Search, Server, X } from "lucide-react";

export function Step3References() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [references, setReferences] = React.useState<Reference[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRefs, setSelectedRefs] = React.useState<string[]>([]);
  const [customUrl, setCustomUrl] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isMockData, setIsMockData] = React.useState(false);

  // Emit loading state changes to the parent component
  React.useEffect(() => {
    const event = new CustomEvent('step:loading', { 
      detail: { loading } 
    });
    window.dispatchEvent(event);
  }, [loading]);

  const fetchReferences = async (refresh = false) => {
    if (!state.topic) return;
    
    setLoading(true);
    setError(null);
    setIsMockData(false);
    
    try {
      console.log(`${refresh ? 'Refreshing' : 'Fetching'} references for topic:`, state.topic);
      const data = await apiService.fetchReferences(state.topic);
      
      if (data.length === 0) {
        setError("No references found. Try a different topic or add references manually.");
        setReferences([]);
        return;
      }
      
      // Check if these are mock/fallback references by looking at the IDs
      const hasMockData = data.some(ref => 
        ref.id.startsWith('mock-ref') || ref.id.startsWith('fallback')
      );
      setIsMockData(hasMockData);
      
      setReferences(data);
      
      // Only auto-select if not refreshing or if no current selections
      if (!refresh || selectedRefs.length === 0) {
        // Auto-select the first 3 references
        const initialSelection = data.slice(0, 3).map(ref => ref.id);
        setSelectedRefs(initialSelection);
        
        // Update the article context
        const selectedReferences = data.filter(ref => initialSelection.includes(ref.id));
        dispatch({ type: "SET_REFERENCES", payload: selectedReferences });
      }
    } catch (error) {
      console.error("Error fetching references:", error);
      setError("Failed to fetch competitor articles. Try again or add references manually.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load of references
  React.useEffect(() => {
    if (state.topic) {
      fetchReferences();
    }
  }, [state.topic]);

  // Update selected refs when references in state change
  React.useEffect(() => {
    if (state.references.length > 0) {
      setSelectedRefs(state.references.map(ref => ref.id));
    }
  }, [state.references]);

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

  const handleRefreshReferences = () => {
    setRetryCount(prev => prev + 1);
    fetchReferences(true);
  };

  const handleUrlAdd = () => {
    if (!customUrl) return;
    
    // Validate URL format
    let validUrl = customUrl;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }
    
    try {
      // Check if it's a valid URL
      new URL(validUrl);
      
      const newRef: Reference = {
        id: `custom-${Date.now()}`,
        title: validUrl.slice(0, 50) + (validUrl.length > 50 ? "..." : ""),
        url: validUrl,
        source: "Custom URL"
      };
      
      setReferences(prev => [...prev, newRef]);
      setSelectedRefs(prev => [...prev, newRef.id]);
      setCustomUrl("");
      
      // Update the article context
      dispatch({ type: "SET_REFERENCES", payload: [...state.references, newRef] });
    } catch (e) {
      setError("Please enter a valid URL");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    try {
      const files = Array.from(e.target.files);
      
      // Check for valid file types
      const validFileTypes = ['application/pdf', 'text/plain', 'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      const invalidFiles = files.filter(file => !validFileTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        setError(`Invalid file type: ${invalidFiles[0].name}. Please upload PDF, TXT, or DOC files.`);
        setTimeout(() => setError(null), 4000);
        return;
      }
      
      setUploadedFiles(prev => [...prev, ...files]);
      
      // Create reference objects for the uploaded files
      const fileRefs: Reference[] = files.map(file => ({
        id: `file-${Date.now()}-${file.name}`,
        title: file.name,
        url: URL.createObjectURL(file),
        source: "Uploaded File"
      }));
      
      setReferences(prev => [...prev, ...fileRefs]);
      
      // Only select files up to the 5 reference limit
      const newSelectableRefs = fileRefs.map(ref => ref.id);
      const currentSelections = selectedRefs.length;
      const canSelectCount = Math.min(5 - currentSelections, newSelectableRefs.length);
      
      if (canSelectCount > 0) {
        const refsToAdd = newSelectableRefs.slice(0, canSelectCount);
        const newSelectedRefs = [...selectedRefs, ...refsToAdd];
        setSelectedRefs(newSelectedRefs);
        
        // Update the article context with only the selected references
        const selectedFileRefs = fileRefs.filter(ref => refsToAdd.includes(ref.id));
        dispatch({ type: "SET_REFERENCES", payload: [...state.references, ...selectedFileRefs] });
      }
      
      // Reset the input
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading files:", error);
      setError("Failed to upload files. Please try again.");
      setTimeout(() => setError(null), 3000);
      // Reset the input
      e.target.value = "";
    }
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

  return (
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
            <div className="flex items-center justify-between">
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
              <div className="ml-4 flex items-center space-x-2">
                <Badge variant="secondary">
                  {selectedRefs.length}/5 selected
                </Badge>
                <button
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md"
                  onClick={handleRefreshReferences}
                  disabled={loading}
                  title="Refresh references"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-b border-red-100 p-3 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          {isMockData && !error && (
            <div className="bg-amber-50 border-b border-amber-100 p-3 text-sm text-amber-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Using example references due to API connectivity issues. These are still useful for demonstration.
            </div>
          )}

          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                <p className="text-gray-600">Loading competitor articles from search data...</p>
              </div>
            ) : filteredReferences.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8">
                <p className="text-gray-600">No references found for this topic. Try refreshing or adding references manually.</p>
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
                aria-label="Add URL reference"
                title="Add URL reference"
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
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                />
              </label>
            </div>
            
            {/* Display uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={`file-${index}`}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => removeFile(`file-${Date.now()}-${file.name}`)}
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

