import "dotenv/config"
import express from "express"
import { env } from "./config/env.js"
import { driveRoutes } from "./routes/drive.routes.js"

export const app = express()

app.set("port", env.PORT)

// estáticos
app.use(express.static("public"))

// rotas
app.use(driveRoutes)
