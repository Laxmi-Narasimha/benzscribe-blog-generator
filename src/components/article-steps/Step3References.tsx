import * as React from "react";
import { useArticle } from "@/context/ArticleContext";
import { apiService } from "@/services/apiService";
import { Reference } from "@/lib/types";
import { AlertCircle, Check, ExternalLink, Loader2, Plus, RefreshCw, Search, X, Upload } from "lucide-react";

export function Step3References() {
  const { state, dispatch } = useArticle();
  const [loading, setLoading] = React.useState(false);
  const [references, setReferences] = React.useState<Reference[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRefs, setSelectedRefs] = React.useState<string[]>([]);
  const [customUrl, setCustomUrl] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isMockData, setIsMockData] = React.useState(false);

  React.useEffect(() => {
    const event = new CustomEvent('step:loading', { detail: { loading } });
    window.dispatchEvent(event);
  }, [loading]);

  const fetchReferences = async (refresh = false) => {
    if (!state.topic) return;
    setLoading(true);
    setError(null);
    setIsMockData(false);
    try {
      const data = await apiService.fetchReferences(state.topic);
      if (data.length === 0) {
        setError("No references found. Try a different topic or add references manually.");
        setReferences([]);
        return;
      }
      const hasMockData = data.some(ref => ref.id.startsWith('mock-ref') || ref.id.startsWith('fallback'));
      setIsMockData(hasMockData);
      setReferences(data);
      if (!refresh || selectedRefs.length === 0) {
        const initialSelection = data.slice(0, 3).map(ref => ref.id);
        setSelectedRefs(initialSelection);
        const selectedReferences = data.filter(ref => initialSelection.includes(ref.id));
        dispatch({ type: "SET_REFERENCES", payload: selectedReferences });
      }
    } catch {
      setError("Failed to fetch competitor articles. Try again or add references manually.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (state.topic) fetchReferences();
  }, [state.topic]);

  React.useEffect(() => {
    if (state.references.length > 0) {
      setSelectedRefs(state.references.map(ref => ref.id));
    }
  }, [state.references]);

  const filteredReferences = references.filter(ref =>
    ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReferenceToggle = (refId: string) => {
    let newSelectedRefs: string[];
    if (selectedRefs.includes(refId)) {
      newSelectedRefs = selectedRefs.filter(id => id !== refId);
    } else {
      if (selectedRefs.length >= 5) {
        newSelectedRefs = [...selectedRefs.slice(1), refId];
      } else {
        newSelectedRefs = [...selectedRefs, refId];
      }
    }
    setSelectedRefs(newSelectedRefs);
    dispatch({ type: "SET_REFERENCES", payload: references.filter(ref => newSelectedRefs.includes(ref.id)) });
  };

  const handleUrlAdd = () => {
    if (!customUrl) return;
    let validUrl = customUrl;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) validUrl = 'https://' + validUrl;
    try {
      new URL(validUrl);
      const newRef: Reference = { id: `custom-${Date.now()}`, title: validUrl.slice(0, 50) + (validUrl.length > 50 ? "..." : ""), url: validUrl, source: "Custom URL" };
      setReferences(prev => [...prev, newRef]);
      setSelectedRefs(prev => [...prev, newRef.id]);
      setCustomUrl("");
      dispatch({ type: "SET_REFERENCES", payload: [...state.references, newRef] });
    } catch {
      setError("Please enter a valid URL");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    const fileRefs: Reference[] = files.map(file => ({ id: `file-${Date.now()}-${file.name}`, title: file.name, url: URL.createObjectURL(file), source: "Uploaded File" }));
    setReferences(prev => [...prev, ...fileRefs]);
    const newSelectableRefs = fileRefs.map(ref => ref.id);
    const canSelectCount = Math.min(5 - selectedRefs.length, newSelectableRefs.length);
    if (canSelectCount > 0) {
      const refsToAdd = newSelectableRefs.slice(0, canSelectCount);
      const newSelectedRefs = [...selectedRefs, ...refsToAdd];
      setSelectedRefs(newSelectedRefs);
      dispatch({ type: "SET_REFERENCES", payload: [...state.references, ...fileRefs.filter(ref => refsToAdd.includes(ref.id))] });
    }
    e.target.value = "";
  };

  const removeFile = (fileId: string) => {
    setSelectedRefs(prev => prev.filter(id => id !== fileId));
    if (fileId.startsWith("file-")) {
      const fileName = fileId.split("-").slice(2).join("-");
      setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    }
    dispatch({ type: "SET_REFERENCES", payload: state.references.filter(ref => ref.id !== fileId) });
  };

  return (
    <div className="space-y-8">
      {/* Search & Controls */}
      <div className="artisan-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input type="text" className="artisan-input pl-11" placeholder="Search references..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg shrink-0">
            {selectedRefs.length}/5
          </span>
          <button className="artisan-btn-ghost" onClick={() => fetchReferences(true)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="px-5 py-3 bg-destructive/5 border-b border-destructive/10 text-sm font-body text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {isMockData && !error && (
          <div className="px-5 py-3 bg-accent border-b border-primary/10 text-sm font-body text-accent-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> Using example references (API fallback).
          </div>
        )}

        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {loading ? (
            <div className="flex flex-col items-center py-14">
              <Loader2 className="h-7 w-7 text-primary animate-spin mb-3" />
              <p className="text-sm font-body text-muted-foreground">Discovering competitor articles...</p>
            </div>
          ) : filteredReferences.length === 0 ? (
            <div className="flex flex-col items-center py-14">
              <p className="text-sm font-body text-muted-foreground">No references found. Try refreshing or adding manually.</p>
            </div>
          ) : (
            filteredReferences.map((ref) => {
              const isSelected = selectedRefs.includes(ref.id);
              return (
                <div key={ref.id} className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-200 ${isSelected ? "bg-accent/50" : "hover:bg-muted/40"}`} onClick={() => handleReferenceToggle(ref.id)}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? "border-primary text-primary" : "border-border"}`}>
                    {isSelected && <Check className="h-3 w-3" style={{ color: 'hsl(38, 75%, 48%)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-body font-medium text-foreground truncate">{ref.title}</h4>
                    <p className="text-xs font-body text-muted-foreground/60">{ref.source}</p>
                  </div>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary transition-colors shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Custom References */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-body font-semibold tracking-[0.12em] uppercase text-muted-foreground">Add Your Own</h3>
        <div className="flex items-center gap-2">
          <input type="text" className="artisan-input flex-1" placeholder="Paste a URL..." value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUrlAdd(); }} />
          <button className="artisan-btn-primary py-3.5" onClick={handleUrlAdd}><Plus className="h-4 w-4" /></button>
        </div>

        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/30 hover:bg-accent/30 transition-all duration-300">
          <Upload className="h-5 w-5 text-muted-foreground/50 mb-2" />
          <span className="text-sm font-body text-muted-foreground">
            Drop files or <span className="text-primary font-medium">browse</span>
          </span>
          <input type="file" className="hidden" onChange={handleFileUpload} multiple />
        </label>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm font-body truncate">{file.name}</span>
                <button className="text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeFile(`file-${Date.now()}-${file.name}`)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
