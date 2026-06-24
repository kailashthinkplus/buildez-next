"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

import type { GenerateImageRequest } from "../types";

interface MediaAIGeneratorProps {
  generating: boolean;

  onGenerate(
    request: GenerateImageRequest
  ): Promise<any>;

  onFinished(): Promise<void>;
}

const styles = [
  "photorealistic",
  "illustration",
  "3d",
  "minimal",
  "flat",
  "glassmorphism",
];

const aspectRatios = [
  {
    label: "Landscape",
    value: "landscape",
  },
  {
    label: "Portrait",
    value: "portrait",
  },
  {
    label: "Square",
    value: "square",
  },
];

export default function MediaAIGenerator({
  generating,
  onGenerate,
  onFinished,
}: MediaAIGeneratorProps) {

  const [prompt, setPrompt] =
    useState("");

  const [negativePrompt, setNegativePrompt] =
    useState("");

  const [style, setStyle] =
    useState("photorealistic");

  const [size, setSize] =
    useState<
      "square" |
      "portrait" |
      "landscape"
    >("landscape");

  const [count, setCount] =
    useState(4);

  async function generate() {

    if (!prompt.trim()) return;

    await onGenerate({

      prompt,

      negativePrompt,

      style,

      size,

      numberOfImages: count,

    });

    await onFinished();

  }

  return (

    <div className="p-6 overflow-y-auto h-full">

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Prompt */}

        <div>

          <label className="text-xs font-medium text-white/70">

            Prompt

          </label>

          <textarea

            rows={5}

            value={prompt}

            onChange={(e)=>

              setPrompt(e.target.value)

            }

            placeholder="Describe the image..."

            className="
              mt-2
              w-full
              rounded-xl
              border
              border-white/10
              bg-[#111827]
              p-4
              text-white
              outline-none
              resize-none
              focus:border-blue-500
            "

          />

        </div>

        {/* Negative */}

        <div>

          <label className="text-xs font-medium text-white/70">

            Negative Prompt

          </label>

          <textarea

            rows={2}

            value={negativePrompt}

            onChange={(e)=>

              setNegativePrompt(e.target.value)

            }

            placeholder="What should NOT appear?"

            className="
              mt-2
              w-full
              rounded-xl
              border
              border-white/10
              bg-[#111827]
              p-4
              text-white
              outline-none
              resize-none
              focus:border-blue-500
            "

          />

        </div>

        {/* Controls */}

        <div className="grid grid-cols-3 gap-5">

          <div>

            <label className="text-xs text-white/70">

              Style

            </label>

            <select

              value={style}

              onChange={(e)=>

                setStyle(e.target.value)

              }

              className="
                mt-2
                h-11
                w-full
                rounded-lg
                border
                border-white/10
                bg-[#111827]
                px-3
              "

            >

              {styles.map((item)=>(

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              ))}

            </select>

          </div>

          <div>

            <label className="text-xs text-white/70">

              Aspect Ratio

            </label>

            <select

              value={size}

              onChange={(e)=>

                setSize(
                  e.target.value as any
                )

              }

              className="
                mt-2
                h-11
                w-full
                rounded-lg
                border
                border-white/10
                bg-[#111827]
                px-3
              "

            >

              {aspectRatios.map((item)=>(

                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>

              ))}

            </select>

          </div>

          <div>

            <label className="text-xs text-white/70">

              Images

            </label>

            <select

              value={count}

              onChange={(e)=>

                setCount(
                  Number(e.target.value)
                )

              }

              className="
                mt-2
                h-11
                w-full
                rounded-lg
                border
                border-white/10
                bg-[#111827]
                px-3
              "

            >

              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>

            </select>

          </div>

        </div>

        {/* Generate */}

        <button

          disabled={
            generating ||
            !prompt.trim()
          }

          onClick={generate}

          className="
            h-12
            rounded-xl
            bg-blue-600
            hover:bg-blue-700
            disabled:opacity-50
            flex
            items-center
            justify-center
            gap-2
            px-6
            font-medium
            transition-colors
          "

        >

          {generating ? (

            <Loader2
              size={18}
              className="animate-spin"
            />

          ) : (

            <Sparkles
              size={18}
            />

          )}

          {generating

            ? "Generating..."

            : "Generate Images"

          }

        </button>

      </div>

    </div>

  );

}