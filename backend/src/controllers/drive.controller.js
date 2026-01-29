import fs from "fs"
import {
  listImages,
  uploadImage,
  streamImage,
  renameImage,
  deleteImage,
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

export async function putRenameImage(req, res) {
  const { id } = req.params
  const { name } = req.body || {}

  if (!name || typeof name !== "string") {
    return res.status(400).send("Informe o novo nome da imagem.")
  }

  try {
    const updated = await renameImage(id, name.trim())
    return res.json({ image: updated })
  } catch (e) {
    console.error(e)
    return res.status(500).send("Erro ao renomear imagem.")
  }
}

export async function deleteImageById(req, res) {
  const { id } = req.params

  try {
    await deleteImage(id)
    return res.status(204).send()
  } catch (e) {
    console.error(e)
    return res.status(500).send("Erro ao apagar imagem.")
  }
}
