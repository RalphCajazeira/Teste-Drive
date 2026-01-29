import fs from "fs"
import {
  listImages,
  uploadImage,
  streamImage,
} from "../services/drive.service.js"

export async function apiListImages(req, res) {
  const images = await listImages()
  res.json({ images })
}

export async function postUpload(req, res) {
  if (!req.file)
    return res.status(400).send("Envie um arquivo no campo 'image'.")

  const tmpPath = req.file.path
  try {
    await uploadImage(req.file)
    fs.unlinkSync(tmpPath)
    res.redirect("/")
  } catch (e) {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
    } catch {}
    console.error(e)
    res.status(500).send("Erro no upload. Veja o console.")
  }
}

export async function getImageProxy(req, res) {
  try {
    const { meta, stream } = await streamImage(req.params.id)

    res.setHeader("Content-Type", meta.mimeType || "application/octet-stream")
    res.setHeader("Cache-Control", "public, max-age=300")

    stream.on("error", () => res.status(500).end())
    stream.pipe(res)
  } catch (e) {
    console.error(e?.message || e)
    res.status(404).send("Imagem não encontrada ou sem permissão.")
  }
}
