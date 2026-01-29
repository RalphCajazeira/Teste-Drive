import crypto from "crypto"

export function generateHash() {
  return crypto.randomBytes(12).toString("hex")
}
