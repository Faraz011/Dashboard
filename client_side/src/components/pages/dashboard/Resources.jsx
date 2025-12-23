// src/pages/dashboard/Resources.jsx
import { useEffect, useMemo, useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import { api } from "../../../services/api";
import { createResource, listResources, removeResource } from "../../../services/firestore";
import { useAuth } from "../../../hooks/useAuth";
import { FileText, FileSpreadsheet, Code, File, Search, Upload, X, Filter, Calendar, User, Database } from "lucide-react";

export default function Resources() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDragOver, setIsDragOver] = useState(false);

  async function refresh() {
    const data = await listResources();
    setItems(data);
  }

  useEffect(() => { refresh(); }, []);

  async function onUpload(e) {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      // 1) backend extracts text + chunks
      const fd = new FormData();
      fd.append("file", file);
      const processed = await api.post("/api/process-file", fd, { headers: { "Content-Type": "multipart/form-data" } });

      // 2) backend embeds chunks
      const embedded = await api.post("/api/embed-resource", { chunks: processed.data.chunks });

      // 3) store in Firestore
      await createResource({
        name: file.name,
        type: processed.data.fileType,
        size: file.size,
        uploadedBy: user?.email || user?.uid,
        text: processed.data.text,
        chunkCount: embedded.data.totalEmbedded,
        chunks: embedded.data.embeddedChunks.map((c) => ({
          index: c.index,
          text: c.text,
          embedding: c.embedding,
        })),
        metadata: {
          processingStatus: "completed",
          embeddingModel: "gemini-embedding-001",
        },
      });

      await refresh();
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function viewResource(resource) {
    setSelectedResource(resource);
  }

  function getFileIcon(type) {
    const fileType = String(type || "unknown").toLowerCase();
    switch (fileType) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "csv":
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case "json":
        return <Code className="w-5 h-5 text-blue-500" />;
      case "txt":
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    onUpload(e);
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [items, searchQuery, filterType]);

  const uniqueTypes = useMemo(() => {
    const types = [...new Set(items.map(item => item.type).filter(Boolean))];
    return types;
  }, [items]);

  const totalChunks = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.chunkCount || 0), 0);
  }, [items]);

  async function onDelete(id) {
    if (!window.confirm("Delete this resource?")) return;
    await removeResource(id);
    await refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="text-3xl font-bold text-slate-900">Resources</div>
                <div className="text-sm text-slate-600 mt-1">Manage and explore your document library</div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4" />
                <span className="font-medium">{items.length} files</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="font-medium">{totalChunks} chunks</span>
              </div>
            </div>
          </div>

          <label className="inline-flex cursor-pointer">
            <input type="file" className="hidden" accept=".pdf,.txt,.csv,.json" onChange={onUpload} />
            <span className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${busy ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"}`}>
              {busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by name or uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((r) => (
          <Card key={r.id} className="group hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-indigo-200">
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getFileIcon(r.type)}
                    <div className="text-sm font-semibold text-slate-900 truncate">{r.name}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
                      {String(r.type || "unknown").toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {r.chunkCount || 0} chunks
                    </span>
                    <span className="flex items-center gap-1">
                      <File className="w-3 h-3" />
                      {formatFileSize(r.size || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-slate-600">
                    <User className="w-3 h-3" />
                    <span>{r.uploadedBy}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => viewResource(r)}
                  className="flex-1"
                >
                  View Content
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onDelete(r.id)}
                  className="px-3"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <File className="w-8 h-8 text-slate-400" />
          </div>
          <div className="text-lg font-semibold text-slate-900 mb-2">No resources yet</div>
          <div className="text-sm text-slate-500 mb-6">Upload your first document to get started</div>
          <label className="inline-flex cursor-pointer">
            <input type="file" className="hidden" accept=".pdf,.txt,.csv,.json" onChange={onUpload} />
            <span className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
              <Upload className="w-4 h-4" />
              Upload First File
            </span>
          </label>
        </div>
      )}

      {items.length > 0 && filteredItems.length === 0 && (
        <div className="text-center py-8">
          <div className="text-lg font-semibold text-slate-900 mb-2">No matching resources</div>
          <div className="text-sm text-slate-500">Try adjusting your search or filter criteria</div>
        </div>
      )}

      <Modal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        title={selectedResource?.name || 'Resource Content'}
      >
        {selectedResource && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto">
            <div className="text-sm text-slate-600 mb-2">
              <span className="font-medium">Type:</span> {selectedResource.type || 'unknown'}
              <span className="mx-2">•</span>
              <span className="font-medium">Size:</span> {formatFileSize(selectedResource.size || 0)}
            </div>
            <div className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border border-slate-200">
              {selectedResource.text || 'No content available'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
