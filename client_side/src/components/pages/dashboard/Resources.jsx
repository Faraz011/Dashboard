// src/pages/dashboard/Resources.jsx
import { useEffect, useMemo, useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { api } from "../../../services/api";
import { createResource, listResources, removeResource } from "../../../services/firestore";
import { useAuth } from "../../../hooks/useAuth";

export default function Resources() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const data = await listResources();
    setItems(data);
  }

  useEffect(() => { refresh(); }, []);

  async function onUpload(e) {
    const file = e.target.files?.[0];
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

  async function onDelete(id) {
    if (!window.confirm("Delete this resource?")) return;
    await removeResource(id);
    await refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-900">Resources</div>
          <div className="text-sm text-slate-500">Upload documents and store chunk embeddings.</div>
        </div>

        <label className="inline-flex cursor-pointer">
          <input type="file" className="hidden" accept=".pdf,.txt,.csv,.json" onChange={onUpload} />
          <span className={`rounded-lg px-4 py-2 text-sm font-semibold ${busy ? "bg-slate-200 text-slate-500" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            {busy ? "Processing..." : "Upload"}
          </span>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-slate-900">{r.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {String(r.type || "unknown").toUpperCase()} • {r.chunkCount || 0} chunks
                </div>
                <div className="mt-2 text-xs text-slate-600">Uploaded by: {r.uploadedBy}</div>
              </div>
              <Button variant="danger" onClick={() => onDelete(r.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-8 text-center text-sm text-slate-500">No resources yet. Upload your first file.</div>
      )}
    </div>
  );
}
