function required(name) {
  const v = process.env[name]
  if (v === undefined || v === null || v === "") {
    throw new Error(`Faltou variável de ambiente: ${name}`)
  }
  return v
}

function parseOrigins(value) {
  // aceita lista separada por vírgula
  // ex: "http://localhost:3000,
  "https://ralphcajazeira.github.io"
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),

  DRIVE_FOLDER_ID: required("DRIVE_FOLDER_ID"),
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
  GOOGLE_REFRESH_TOKEN: required("GOOGLE_REFRESH_TOKEN"),

  // ✅ CORS via env (lista)
  CORS_ORIGINS: parseOrigins(process.env.CORS_ORIGINS),
}

// fallback útil: se não definiu CORS_ORIGINS no dev, libera localhost
if (env.CORS_ORIGINS.length === 0 && env.NODE_ENV !== "production") {
  env.CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
}
