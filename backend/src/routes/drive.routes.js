import { Router } from "express"
import { upload } from "../middlewares/upload.js"
import { requirePassword } from "../middlewares/password.js"
import {
  apiListImages,
  postUpload,
  getImageProxy,
  putRenameImage,
  deleteImageById,
} from "../controllers/drive.controller.js"

export const driveRoutes = Router()

driveRoutes.get("/api/images", apiListImages)
driveRoutes.get("/img/:id", getImageProxy)
driveRoutes.get("/api/auth", requirePassword, (_req, res) =>
  res.json({ ok: true }),
)
driveRoutes.post("/upload", requirePassword, upload.single("image"), postUpload)
driveRoutes.put("/api/images/:id", requirePassword, putRenameImage)
driveRoutes.delete("/api/images/:id", requirePassword, deleteImageById)
