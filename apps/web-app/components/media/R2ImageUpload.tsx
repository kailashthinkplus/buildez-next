"use client";

import { useRef, useState } from "react";
import { FolderOpen, ImageIcon, Loader2, Upload, X } from "lucide-react";

type Props = {
  siteId: string;
  label: string;
  value?: string | null;
  onChange(value: string): void;
  purpose?: string;
  accept?: string;
  help?: string;
  endpoint?: string;
  responseKey?: string;
};

export function R2ImageUpload({
  siteId,
  label,
  value,
  onChange,
  purpose = "image",
  accept = "image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml",
  help,
  endpoint = `/api/sites/${siteId}/media`,
  responseKey = "imageUrl",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [assets, setAssets] = useState<Array<{ id: string; url: string; thumbnailUrl?: string | null; filename: string }>>([]);

  async function openLibrary() {
    setLibraryOpen(true);
    if (assets.length) return;
    setLibraryLoading(true);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Media library could not be loaded");
      setAssets(Array.isArray(payload.assets) ? payload.assets : []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Media library could not be loaded");
    } finally { setLibraryLoading(false); }
  }

  async function upload(file?: File) {
    if (!file || uploading) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("purpose", purpose);
      const response = await fetch(endpoint, { method: "POST", body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Image upload failed");
      const uploadedUrl = payload[responseKey];
      if (typeof uploadedUrl !== "string" || !uploadedUrl) throw new Error("Upload did not return an image");
      onChange(uploadedUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="text-xs font-medium dashboard-muted">
      <div className="mb-1.5">{label}</div>
      <div className="flex min-h-24 items-center gap-3 rounded-xl border dashboard-border p-3">
        <div className="grid h-16 w-20 shrink-0 place-items-center overflow-hidden rounded-lg dashboard-subtle">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-5 w-5 opacity-45" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          <button type="button" onClick={() => void openLibrary()} className="ml-2 inline-flex items-center gap-1.5 rounded-lg border dashboard-border px-3 py-2 text-xs font-semibold dashboard-hover"><FolderOpen size={14}/> Library</button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="ml-2 inline-flex items-center gap-1 px-2 py-2 text-rose-500">
              <X size={13} /> Remove
            </button>
          )}
          {help && <p className="mt-2 font-normal dashboard-faint">{help}</p>}
          {error && <p className="mt-2 font-normal text-rose-500">{error}</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} />
      {libraryOpen ? <div className="mt-2 rounded-xl border dashboard-border p-2"><div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-semibold">Media library</span><button type="button" onClick={()=>setLibraryOpen(false)} aria-label="Close media library"><X size={14}/></button></div>{libraryLoading ? <div className="grid h-20 place-items-center"><Loader2 size={16} className="animate-spin"/></div> : assets.length ? <div className="grid max-h-48 grid-cols-3 gap-2 overflow-auto">{assets.map(asset=><button type="button" key={asset.id} title={asset.filename} onClick={()=>{onChange(asset.url);setLibraryOpen(false)}} className="aspect-square overflow-hidden rounded-lg border dashboard-border dashboard-hover"><img src={asset.thumbnailUrl||asset.url} alt={asset.filename} className="h-full w-full object-cover"/></button>)}</div> : <p className="p-4 text-center text-[11px] dashboard-faint">Upload your first image to add it here.</p>}</div> : null}
    </div>
  );
}
