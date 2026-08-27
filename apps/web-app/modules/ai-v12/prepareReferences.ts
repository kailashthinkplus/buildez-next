import sharp from "sharp";

import {
  getAgentAttachmentKind,
  getAgentAttachmentMimeType,
} from "./attachments";

type ReferenceInput = Record<string, unknown>;

export type PreparedAgentReferences = {
  inputs: ReferenceInput[];
  originalBytes: number;
  preparedBytes: number;
  imageSegments: number;
  cropSources: PreparedImageCropSource[];
};

export type PreparedImageCropSource = {
  sourceFileName: string;
  segmentIndex: number;
  width: number;
  height: number;
  buffer: Buffer;
};

const MAX_STANDARD_WIDTH = 1800;
const MAX_STANDARD_HEIGHT = 2400;
const MAX_TALL_WIDTH = 1440;
const SEGMENT_HEIGHT = 1800;
const SEGMENT_OVERLAP = 120;
const MAX_SEGMENTS_PER_IMAGE = 12;

function dataUrl(mimeType: string, buffer: Buffer) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function segmentRanges(height: number) {
  const stride = SEGMENT_HEIGHT - SEGMENT_OVERLAP;
  const expectedSegments = Math.ceil(
    Math.max(1, height - SEGMENT_OVERLAP) / stride,
  );
  const segmentHeight = expectedSegments > MAX_SEGMENTS_PER_IMAGE
    ? Math.ceil(
        (height + SEGMENT_OVERLAP * (MAX_SEGMENTS_PER_IMAGE - 1))
        / MAX_SEGMENTS_PER_IMAGE,
      )
    : SEGMENT_HEIGHT;
  const segmentStride = segmentHeight - SEGMENT_OVERLAP;
  const ranges: Array<{ top: number; height: number }> = [];

  for (let top = 0; top < height; top += segmentStride) {
    ranges.push({ top, height: Math.min(segmentHeight, height - top) });
    if (top + segmentHeight >= height) break;
  }

  return ranges.slice(0, MAX_SEGMENTS_PER_IMAGE);
}

async function prepareImage(file: File, buffer: Buffer) {
  const source = sharp(buffer).rotate();
  const metadata = await source.metadata();
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  const isTall = height / width >= 2.5 || height > 4200;

  if (!isTall) {
    const optimized = await source
      .resize({
        width: Math.min(width, MAX_STANDARD_WIDTH),
        height: Math.min(height, MAX_STANDARD_HEIGHT),
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 86, chromaSubsampling: "4:4:4", progressive: true })
      .toBuffer();
    const optimizedMetadata = await sharp(optimized).metadata();

    return {
      inputs: [
        {
          type: "input_text",
          text: `Visual reference: ${file.name}`,
        },
        {
          type: "input_image",
          image_url: dataUrl("image/jpeg", optimized),
          detail: "high",
        },
      ],
      preparedBytes: optimized.byteLength,
      imageSegments: 1,
      cropSources: [{
        sourceFileName: file.name,
        segmentIndex: 1,
        width: optimizedMetadata.width || Math.min(width, MAX_STANDARD_WIDTH),
        height: optimizedMetadata.height || Math.min(height, MAX_STANDARD_HEIGHT),
        buffer: optimized,
      }],
    };
  }

  const normalized = await source
    .resize({
      width: Math.min(width, MAX_TALL_WIDTH),
      withoutEnlargement: true,
    })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4", progressive: true })
    .toBuffer();
  const normalizedMetadata = await sharp(normalized).metadata();
  const normalizedWidth = normalizedMetadata.width || Math.min(width, MAX_TALL_WIDTH);
  const normalizedHeight = normalizedMetadata.height || Math.round(
    height * normalizedWidth / width,
  );
  const ranges = segmentRanges(normalizedHeight);
  const segments = await Promise.all(
    ranges.map(({ top, height: cropHeight }) =>
      sharp(normalized)
        .extract({
          left: 0,
          top,
          width: normalizedWidth,
          height: cropHeight,
        })
        .jpeg({ quality: 86, chromaSubsampling: "4:4:4", progressive: true })
        .toBuffer()
    ),
  );
  const inputs = segments.flatMap((segment, index) => [
    {
      type: "input_text",
      text: `${file.name} — vertical segment ${index + 1} of ${segments.length}, in top-to-bottom order${index ? " with a small overlap from the previous segment" : ""}.`,
    },
    {
      type: "input_image",
      image_url: dataUrl("image/jpeg", segment),
      detail: "high",
    },
  ]);

  return {
    inputs,
    preparedBytes: segments.reduce(
      (total, segment) => total + segment.byteLength,
      0,
    ),
    imageSegments: segments.length,
    cropSources: segments.map((segment, index) => ({
      sourceFileName: file.name,
      segmentIndex: index + 1,
      width: normalizedWidth,
      height: ranges[index]?.height || normalizedHeight,
      buffer: segment,
    })),
  };
}

export async function prepareAgentReferences(
  files: readonly File[],
): Promise<PreparedAgentReferences> {
  const prepared: PreparedAgentReferences = {
    inputs: [],
    originalBytes: files.reduce((total, file) => total + file.size, 0),
    preparedBytes: 0,
    imageSegments: 0,
    cropSources: [],
  };

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = getAgentAttachmentKind(file);

    if (kind === "image") {
      const image = await prepareImage(file, buffer);
      prepared.inputs.push(...image.inputs);
      prepared.preparedBytes += image.preparedBytes;
      prepared.imageSegments += image.imageSegments;
      prepared.cropSources.push(...image.cropSources);
      continue;
    }

    const mimeType = getAgentAttachmentMimeType(file);
    prepared.inputs.push({
      type: "input_file",
      filename: file.name,
      file_data: dataUrl(mimeType, buffer),
      ...(mimeType === "application/pdf" ? { detail: "high" } : {}),
    });
    prepared.preparedBytes += buffer.byteLength;
  }

  return prepared;
}
