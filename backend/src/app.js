import "dotenv/config"
import express from "express"
import path from "path"
import { env } from "./config/env.js"
import { driveRoutes } from "./routes/drive.routes.js"

export const app = express()

import cors from "cors"

const allowedOrigins = env.CORS_ORIGINS

app.use(
  cors({
    origin(origin, callback) {
      // requests sem Origin (Postman/curl/healthcheck) -> libera
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) return callback(null, true)

      return callback(new Error(`CORS bloqueado para: ${origin}`))
    },
    credentials: false,
    methods: ["GET", "POST", "OPTIONS"],
  }),
)

app.set("port", env.PORT)

// estáticos
const frontendPath = path.resolve(process.cwd(), "docs")
app.use(express.static(frontendPath))

// rotas
app.use(driveRoutes)
