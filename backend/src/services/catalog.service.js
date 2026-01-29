import { Readable } from "stream"
import { drive } from "../config/drive.js"
import { env } from "../config/env.js"
import { makePublic } from "./drive.service.js"

const DB_FILE_NAME = "db.json"
const DB_MIME_TYPE = "application/json"

function buildEmptyDb() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    items: [],
  }
}

function normalizeDb(db) {
  if (!db || typeof db !== "object") return buildEmptyDb()
  return {
    version: typeof db.version === "number" ? db.version : 1,
    updatedAt: db.updatedAt || new Date().toISOString(),
    items: Array.isArray(db.items) ? db.items : [],
  }
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    stream.on("error", reject)
  })
}

async function findDbFile() {
  const list = await drive.files.list({
    q: `'${env.DRIVE_FOLDER_ID}' in parents and trashed=false and name='${DB_FILE_NAME}'`,
    fields: "files(id,name,mimeType)",
    pageSize: 1,
  })

  return (list.data.files || [])[0] || null
}

async function createDbFile() {
  const initialDb = buildEmptyDb()
  const file = await drive.files.create({
    requestBody: {
      name: DB_FILE_NAME,
      parents: [env.DRIVE_FOLDER_ID],
      mimeType: DB_MIME_TYPE,
    },
    media: {
      mimeType: DB_MIME_TYPE,
      body: Readable.from([JSON.stringify(initialDb, null, 2)]),
    },
    fields: "id,name",
  })

  await makePublic(file.data.id)
  return { id: file.data.id, db: initialDb }
}

export async function loadCatalogDb() {
  const existing = await findDbFile()
  if (!existing) {
    return createDbFile()
  }

  const file = await drive.files.get(
    { fileId: existing.id, alt: "media", supportsAllDrives: true },
    { responseType: "stream" },
  )

  const content = await streamToString(file.data)
  let parsed = null
  try {
    parsed = JSON.parse(content)
  } catch {
    parsed = buildEmptyDb()
  }

  return { id: existing.id, db: normalizeDb(parsed) }
}

export async function saveCatalogDb(fileId, db) {
  const normalized = normalizeDb(db)
  normalized.updatedAt = new Date().toISOString()

  await drive.files.update({
    fileId,
    media: {
      mimeType: DB_MIME_TYPE,
      body: Readable.from([JSON.stringify(normalized, null, 2)]),
    },
    supportsAllDrives: true,
  })

  return normalized
}

export function getDbPublicUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}
