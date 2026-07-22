"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
} from "lucide-react";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/* ==========================================================
   TYPES
========================================================== */

interface MediaUploadProps {

  uploading: boolean;

  onUpload(files: File[]): Promise<void>;

}

/* ==========================================================
   COMPONENT
========================================================== */

export default function MediaUpload({

  uploading,

  onUpload,

}: MediaUploadProps) {

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [dragging, setDragging] =
    useState(false);

  /* --------------------------------------------------------
     OPEN FILE PICKER
  -------------------------------------------------------- */

  function openPicker() {

    inputRef.current?.click();

  }

  /* --------------------------------------------------------
     PROCESS FILE
  -------------------------------------------------------- */

  async function processFiles(files?: FileList | File[]) {
    const imageFiles = Array.from(files ?? []).filter((file) =>
      ALLOWED_TYPES.has(file.type)
    );

    if (imageFiles.length === 0) {

      alert("Only image files are supported.");

      return;

    }

    await onUpload(imageFiles);

  }

  /* --------------------------------------------------------
     DROP
  -------------------------------------------------------- */

  async function onDrop(
    e: React.DragEvent<HTMLDivElement>
  ) {

    e.preventDefault();

    setDragging(false);

    await processFiles(e.dataTransfer.files);

  }

  /* --------------------------------------------------------
     RENDER
  -------------------------------------------------------- */

  return (

    <div className="p-6 h-full">

      <div

        onClick={openPicker}

        onDragOver={(e) => {

          e.preventDefault();

          setDragging(true);

        }}

        onDragLeave={() =>

          setDragging(false)

        }

        onDrop={onDrop}

        className={`
          h-full
          rounded-2xl
          border-2
          border-dashed
          transition-all
          cursor-pointer
          flex
          flex-col
          items-center
          justify-center
          gap-5

          ${
            dragging

              ? "border-blue-500 bg-blue-500/5"

              : "border-white/10 hover:border-white/25"

          }
        `}
      >

        <div
          className="
            h-20
            w-20
            rounded-2xl
            bg-blue-600/10
            flex
            items-center
            justify-center
          "
        >

          <Upload
            size={34}
            className="text-blue-500"
          />

        </div>

        <div className="text-center">

          <h3
            className="
              text-lg
              font-semibold
              text-white
            "
          >
            Upload Images
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-white/60
            "
          >
            Drag & drop images here or click to browse.
          </p>

          <p
            className="
              mt-1
              text-xs
              text-white/35
            "
          >
            JPG, PNG, WebP and AVIF are converted to optimized WebP.
          </p>

        </div>

        {uploading && (

          <div
            className="
              flex
              items-center
              gap-3
              text-sm
              text-blue-400
            "
          >

            <ImageIcon
              size={18}
            />

            Uploading and converting...

          </div>

        )}

      </div>

      <input

        ref={inputRef}

        hidden

        type="file"

        accept="image/*"
        multiple

        onChange={(e) =>

          processFiles(e.target.files ?? undefined)

        }

      />

    </div>

  );

}
