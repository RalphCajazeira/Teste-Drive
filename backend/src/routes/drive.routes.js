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

driveRoutes.use(requirePassword)
driveRoutes.get("/api/images", apiListImages)
driveRoutes.get("/img/:id", getImageProxy)
driveRoutes.post("/upload", upload.single("image"), postUpload)
driveRoutes.put("/api/images/:id", putRenameImage)
driveRoutes.delete("/api/images/:id", deleteImageById)
