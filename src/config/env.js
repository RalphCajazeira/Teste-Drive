export const env = {
  PORT: Number(process.env.PORT || 3000),
  DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
}

for (const [k, v] of Object.entries(env)) {
  if (v === undefined || v === null || v === "") {
    if (k === "PORT") continue
    throw new Error(`Faltou variável de ambiente: ${k}`)
  }
}
