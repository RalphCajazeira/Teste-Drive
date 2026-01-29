import "dotenv/config"
import express from "express"
import path from "path"
import { router as imageRoutes } from "./routes/images.routes.js"

const app = express()

app.use(express.static("public"))
app.use("/api", imageRoutes)

app.get("/", (_, res) => {
  res.sendFile(path.resolve("src/views/index.html"))
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Rodando em http://localhost:3000")
})
