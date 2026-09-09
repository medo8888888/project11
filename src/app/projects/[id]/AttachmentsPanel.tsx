"use client";

import { useRef, useState } from "react";
import { Paperclip, Download, Trash2, LoaderCircle, Upload } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export type Attachment = {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: { id: string; name: string };
};

export function AttachmentsPanel({
  projectId,
  attachments,
  canUpload,
  currentUserId,
}: {
  projectId: string;
  attachments: Attachment[];
  canUpload: boolean;
  currentUserId: string;
}) {
  const { push } = useToast();
  const [items, setItems] = useState(attachments);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      push("File exceeds the 10MB limit", "error");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/projects/${projectId}/attachments`, { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      push(data.error ?? "Upload failed", "error");
      return;
    }
    setItems((prev) => [data.attachment, ...prev]);
    push("File attached");
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      push("Failed to delete", "error");
      return;
    }
    setItems((prev) => prev.filter((a) => a.id !== id));
    push("Attachment removed");
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Attachments</h2>
        {canUpload && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-ghost px-2 py-1 text-xs"
          >
            {uploading ? <LoaderCircle className="animate-spin" size={13} /> : <Upload size={13} />}
            Upload
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">No files attached yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
              <Paperclip size={14} className="shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-700">{a.fileName}</p>
                <p className="text-[11px] text-gray-400">
                  {formatSize(a.fileSize)} · {a.uploadedBy.name}
                </p>
              </div>
              <a href={`/api/attachments/${a.id}`} className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <Download size={14} />
              </a>
              {(canUpload || a.uploadedBy.id === currentUserId) && (
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  {deletingId === a.id ? <LoaderCircle className="animate-spin" size={14} /> : <Trash2 size={14} />}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
