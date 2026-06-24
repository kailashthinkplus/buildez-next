// apps/web-app/modules/builder/media/media.controller.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import { handleFileUpload } from "./media.service";

const upload = multer(); // In-memory upload middleware
const router = Router();

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const result = await handleFileUpload(req.file); // Process and upload the file
    res.status(200).json(result); // Return paths of the uploaded images (WebP/AVIF)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File upload failed" });
  }
});

export default router;
