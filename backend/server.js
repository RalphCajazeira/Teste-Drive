import { app } from "./src/app.js"

const port = app.get("port")
app.listen(port, () => console.log(`Rodando em http://localhost:${port}`))
