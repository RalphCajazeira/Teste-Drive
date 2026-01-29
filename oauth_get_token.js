import "dotenv/config"
import readline from "readline"
import { google } from "googleapis"

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env")
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "http://localhost",
)

const SCOPES = ["https://www.googleapis.com/auth/drive"]

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
})

console.log("Abra este link no navegador e autorize o acesso:\n")
console.log(authUrl)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question("\nCole aqui o CODE que o Google mostrar: ", async (code) => {
  rl.close()

  const { tokens } = await oauth2Client.getToken(code.trim())

  console.log("\n=== TOKENS GERADOS ===")
  console.log(JSON.stringify(tokens, null, 2))
})
