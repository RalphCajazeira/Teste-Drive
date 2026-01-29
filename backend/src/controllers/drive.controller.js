import crypto from "crypto"
import fs from "fs"
import path from "path"
import {
  uploadImage,
  streamImage,
  deleteImage,
  getPublicImageUrl,
} from "../services/drive.service.js"
import {
  getDbPublicUrl,
  loadCatalogDb,
  saveCatalogDb,
} from "../services/catalog.service.js"

function parseAmbientes(value) {
  if (!value) return []
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildCatalogItem({ fileId, fileName, originalName, meta }) {
  const createdAt = new Date().toISOString()
  return {
    id: fileId,
    fileName,
    originalName,
    hash: meta.hash,
    name: meta.name || originalName,
    type: meta.type || "",
    material: meta.material || "",
    ambientes: meta.ambientes || [],
    imageUrl: getPublicImageUrl(fileId),
    driveView: `https://drive.google.com/file/d/${fileId}/view`,
    createdAt,
  }
}

export async function apiListImages(req, res) {
  const { id, db, exists } = await loadCatalogDb({ createIfMissing: false })
  res.json({
    images: db.items || [],
    dbUrl: exists ? getDbPublicUrl(id) : null,
  })
}

export async function postUpload(req, res) {
  if (!req.file)
    return res.status(400).send("Envie um arquivo no campo 'image'.")

  const tmpPath = req.file.path
  try {
    const originalName = path.basename(req.file.originalname)
    const hash = crypto.randomBytes(5).toString("hex")
    const fileName = `${hash}-${originalName}`

    const created = await uploadImage(req.file, fileName)
    const { id: dbId, db } = await loadCatalogDb()

    const item = buildCatalogItem({
      fileId: created.id,
      fileName: created.name,
      originalName,
      meta: {
        hash,
        name: req.body?.name?.trim(),
        type: req.body?.type?.trim(),
        material: req.body?.material?.trim(),
        ambientes: parseAmbientes(req.body?.ambientes),
      },
    })

    const items = db.items || []
    const nextItems = [item, ...items.filter((entry) => entry.id !== item.id)]
    const nextDb = { ...db, items: nextItems }
    await saveCatalogDb(dbId, nextDb)

    fs.unlinkSync(tmpPath)
    res.json({ image: item, dbUrl: getDbPublicUrl(dbId) })
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
  const { name, type, material, ambientes } = req.body || {}

  try {
    const { id: dbId, db, exists } = await loadCatalogDb({
      createIfMissing: false,
    })
    if (!exists) {
      return res.status(404).send("Catálogo não encontrado.")
    }
    const items = db.items || []
    const index = items.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).send("Imagem não encontrada no catálogo.")
    }

    const current = items[index]
    const updated = {
      ...current,
      name: typeof name === "string" && name.trim() ? name.trim() : current.name,
      type: typeof type === "string" ? type.trim() : current.type,
      material: typeof material === "string" ? material.trim() : current.material,
      ambientes:
        typeof ambientes === "string"
          ? parseAmbientes(ambientes)
          : current.ambientes,
    }

    const nextItems = [...items]
    nextItems[index] = updated
    await saveCatalogDb(dbId, { ...db, items: nextItems })
    return res.json({ image: updated, dbUrl: getDbPublicUrl(dbId) })
  } catch (e) {
    console.error(e)
    return res.status(500).send("Erro ao atualizar imagem.")
  }
}

export async function deleteImageById(req, res) {
  const { id } = req.params

  try {
    await deleteImage(id)
    const { id: dbId, db, exists } = await loadCatalogDb({
      createIfMissing: false,
    })
    if (exists) {
      const nextItems = (db.items || []).filter((item) => item.id !== id)
      await saveCatalogDb(dbId, { ...db, items: nextItems })
    }
    return res.status(204).send()
  } catch (e) {
    console.error(e)
    return res.status(500).send("Erro ao apagar imagem.")
  }
}
