import * as express from "express"
import services from "../db/serviceV2"
import * as jwt from "jsonwebtoken"
require('dotenv').config({ path: "./src/.env" })
const { check, validationResult } = require('express-validator')

export const kirjautuminenRouter = express.Router()
export const accesTokenRouter = express.Router()
export const removeCookieRouter = express.Router()

const kirjautuminenValidation = [
  check('osallistujaSalasana', "wrong length").isLength({ min: 6, max: 10 }).escape(),
  check('tapahtumaSalasana', "wrong length").isLength({ min: 6, max: 10 }).escape()
]

kirjautuminenRouter.post("/kirjautuminen", kirjautuminenValidation, async (req, res) => {
  if (!req.body.osallistujaSalasana || !req.body.tapahtumaSalasana) {
    throw Error("kirjautuminen epännistui")
  }
  const token = await services.kirjautuminen(req.body)
  if (token) {
    res.cookie("token", token.token, { httpOnly: true, }).send(token)
  }
})

function decodeToken(token) {
  try {
    const decodedToken = jwt.verify(token, process.env.salaisuus)
    const lahetettava = { tapahtumaId: decodedToken.tapahtumaId, osallistujaId: decodedToken.osallistujaId }
    return lahetettava
  } catch (e) {
    throw Error("Tunnistautuminen epäonnistui")
  }
}

accesTokenRouter.get("/accesToken", async (req, res) => {
  const token = req.cookies.token
  const info = decodeToken(token)
  const uusiAccesToken = jwt.sign(info, process.env.salaisuus)
  res.send(uusiAccesToken)
})

removeCookieRouter.get("/removeCookie", async (req, res) => {
  try {
    res.clearCookie("token")
    return "poistettu"
  } catch (e) {
    return e.message
  }
})
