import "dotenv/config"
import express from "express"
import path from "path"
import { env } from "./config/env.js"
import { driveRoutes } from "./routes/drive.routes.js"

export const app = express()

app.set("port", env.PORT)

// estáticos
const frontendPath = path.resolve(process.cwd(), "frontend")
app.use(express.static(frontendPath))

// rotas
app.use(driveRoutes)
