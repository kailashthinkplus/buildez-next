// apps/web-app/modules/builder/media/image-utils.ts
import sharp from "sharp";

// Convert images to WebP and AVIF formats
export const convertImage = async (inputBuffer: Buffer) => {
  const webpBuffer = await sharp(inputBuffer)
    .webp({ quality: 80 }) // Conversion to WebP format with compression
    .toBuffer();
  const avifBuffer = await sharp(inputBuffer)
    .avif({ quality: 80 }) // Conversion to AVIF format
    .toBuffer();

  return { webpBuffer, avifBuffer };
};
