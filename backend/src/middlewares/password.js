import { env } from "../config/env.js"

export function requirePassword(req, res, next) {
  const headerPassword = req.header("x-password")
  const queryPassword = req.query?.password
  const provided = headerPassword || queryPassword

  if (!env.PASSWORD) {
    return res.status(500).send("Senha não configurada no servidor.")
  }

  if (provided !== env.PASSWORD) {
    return res.status(401).send("Senha inválida.")
  }

  return next()
}
