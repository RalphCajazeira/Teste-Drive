import "dotenv/config"
import express from "express"
import path from "path"
import { env } from "./config/env.js"
import { driveRoutes } from "./routes/drive.routes.js"

export const app = express()

import cors from "cors"
app.use(cors({ origin: "*" }))

app.set("port", env.PORT)

// estáticos
const frontendPath = path.resolve(process.cwd(), "docs")
app.use(express.static(frontendPath))

// rotas
app.use(driveRoutes)
