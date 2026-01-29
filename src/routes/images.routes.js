import express from "express"
import multer from "multer"
import fs from "fs"
import { generateHash } from "../lib/hash.js"
import { uploadToDrive } from "../lib/drive.js"
import { prisma } from "../lib/prisma.js"

const upload = multer({ dest: "tmp/" })
export const router = express.Router()

router.post("/upload", upload.single("image"), async (req, res) => {
  const file = req.file

  const hash = generateHash()
  const finalName = `${hash}-${file.originalname}`

  const driveData = await uploadToDrive({
    filePath: file.path,
    fileName: finalName,
    mimeType: file.mimetype,
  })

  await prisma.image.create({
    data: {
      hash,
      originalName: file.originalname,
      fileName: finalName,
      mimeType: file.mimetype,
      driveFileId: driveData.driveFileId,
      publicUrl: driveData.publicUrl,
    },
  })

  fs.unlinkSync(file.path)

  res.redirect("/")
})

router.get("/images", async (req, res) => {
  const images = await prisma.image.findMany({
    orderBy: { createdAt: "desc" },
  })

  res.json(images)
})
