// apps/web-app/modules/builder/media/media.service.ts
import { uploadToR2 } from "./cloudflareR2";
import { convertImage } from "./image-utils";

// Handle file upload and conversion
export const handleFileUpload = async (file: Express.Multer.File) => {
  // Convert image to WebP and AVIF
  const { webpBuffer, avifBuffer } = await convertImage(file.buffer);

  // Generate file paths
  const webpPath = `images/${Date.now()}_${file.originalname}.webp`;
  const avifPath = `images/${Date.now()}_${file.originalname}.avif`;

  // Upload converted images to R2
  await uploadToR2(webpBuffer, webpPath, "image/webp");
  await uploadToR2(avifBuffer, avifPath, "image/avif");

  return { webpPath, avifPath };
};
