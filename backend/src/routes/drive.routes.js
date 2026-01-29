import { Router } from "express"
import { upload } from "../middlewares/upload.js"
import {
  apiListImages,
  postUpload,
  getImageProxy,
} from "../controllers/drive.controller.js"

export const driveRoutes = Router()

driveRoutes.get("/api/images", apiListImages)
driveRoutes.get("/img/:id", getImageProxy)
driveRoutes.post("/upload", upload.single("image"), postUpload)
