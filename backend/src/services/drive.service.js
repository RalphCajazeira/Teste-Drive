import fs from "fs"
import { drive } from "../config/drive.js"
import { env } from "../config/env.js"

export async function listImages() {
  const list = await drive.files.list({
    q: `'${env.DRIVE_FOLDER_ID}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,createdTime)",
    orderBy: "createdTime desc",
    pageSize: 200,
  })

  return (list.data.files || [])
    .filter((f) => (f.mimeType || "").startsWith("image/"))
    .map((f) => ({
      id: f.id,
      name: f.name,
      driveView: `https://drive.google.com/file/d/${f.id}/view`,
    }))
}

export async function makePublic(fileId) {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { type: "anyone", role: "reader" },
    })
  } catch {}
}

export async function uploadImage(file) {
  const created = await drive.files.create({
    requestBody: { name: file.originalname, parents: [env.DRIVE_FOLDER_ID] },
    media: { mimeType: file.mimetype, body: fs.createReadStream(file.path) },
    fields: "id,name",
  })

  const fileId = created.data.id
  await makePublic(fileId)
  return { id: fileId, name: created.data.name }
}

export async function streamImage(fileId) {
  const meta = await drive.files.get({
    fileId,
    fields: "id,name,mimeType",
    supportsAllDrives: true,
  })

  const file = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "stream" },
  )

  return { meta: meta.data, stream: file.data }
}

export async function renameImage(fileId, name) {
  const updated = await drive.files.update({
    fileId,
    requestBody: { name },
    fields: "id,name",
    supportsAllDrives: true,
  })

  return { id: updated.data.id, name: updated.data.name }
}

export async function deleteImage(fileId) {
  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  })
}
