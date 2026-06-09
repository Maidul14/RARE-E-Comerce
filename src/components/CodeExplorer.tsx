import { useState, useEffect } from "react";
import { Folder, FileCode, Search, Copy, Check, Terminal, ExternalLink } from "lucide-react";
import { DotnetFile } from "../types";

export default function CodeExplorer() {
  const [files, setFiles] = useState<DotnetFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DotnetFile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dotnet-code/files")
      .then(res => res.json())
      .then((data: DotnetFile[]) => {
        setFiles(data);
        if (data.length > 0) {
          // Select README.md by default or default CS
          const defaultDoc = data.find(f => f.name.toLowerCase() === "readme.md") || data[0];
          setSelectedFile(defaultDoc);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load .NET codebase explorer", err);
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredFiles = files.filter(f =>
    f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col h-[650px] md:h-[750px]">
      {/* Header Panel */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
            <Terminal size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
              ASP.NET Core .NET 8 MVC Project Explorer
            </h3>
            <p className="text-slate-400 text-xs">Production-ready structured files created perfectly alongside backend</p>
          </div>
        </div>

        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search .NET files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 outline-none rounded-xl py-2 pl-9 pr-4 text-xs font-medium placeholder-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-white transition-all"
          />
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Tree view */}
        <div className="w-64 md:w-80 border-r border-slate-800 bg-slate-950/40 overflow-y-auto flex flex-col">
          <div className="p-4 bg-slate-950/20 border-b border-slate-800/40">
            <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Project Tree (/dotnet-src)</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8 text-xs text-slate-500 gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-500"></span>
              Loading structured workspace...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-6 text-xs text-slate-500 text-center">No files found match query.</div>
          ) : (
            <div className="divide-y divide-slate-900/30">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-4 py-3 text-xs flex items-center gap-3 transition-colors ${
                      isSelected
                        ? "bg-violet-600/10 border-l-2 border-violet-500 text-white"
                        : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                    }`}
                  >
                    <div className="shrink-0 text-violet-500">
                      <FileCode size={16} />
                    </div>
                    <div className="truncate flex-1">
                      <div className="font-semibold text-slate-200 truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{file.path}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Editor Preview */}
        <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative">
          {selectedFile ? (
            <>
              {/* File details banner */}
              <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <span className="font-mono text-[11px] text-slate-300 font-semibold">{selectedFile.path}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-500" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code viewer window */}
              <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed text-slate-300">
                <pre className="whitespace-pre overflow-x-auto tab-size-4">
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Folder size={48} className="text-slate-700 mb-2" />
              <p className="text-sm">Select any file from the workspace explorer to review detailed structure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
