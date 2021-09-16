import * as express from "express"
import services from "../db/serviceV2"
import { TunnistautuminenInput } from "../type/tunnus"
import * as jwt from "jsonwebtoken"
require('dotenv').config({ path: "./src/.env" })
import { lahetaViesti } from "../message"

export const kirjautuminenRouter = express.Router()
export const accesTokenRouter = express.Router()
export const removeCookieRouter = express.Router()
export const viestiRouter = express.Router()

kirjautuminenRouter.post("/kirjautuminen", async (req, res) => {
    if (!req.body.osallistujaSalasana || !req.body.tapahtumaSalasana) {
        throw Error("kirjautuminen epännistui")
    }
    const token = await services.kirjautuminen(req.body)
    if (token) {
        res.cookie("token", token.token, { httpOnly: true, }).send(token)
    }
    /* res.send("tehty") */
})

function decodeToken(token) {
    try {
        console.log("decodeToken(token)")
        const decodedToken = jwt.verify(token, process.env.salaisuus)
        console.log("decode")
        const lahetettava = { tapahtumaId: decodedToken.tapahtumaId, osallistujaId: decodedToken.osallistujaId }
        console.log("lahetettava lahetettava")
        return lahetettava
    } catch (e) {
        throw Error("Tunnistautuminen epäonnistui")
    }
}

accesTokenRouter.get("/accesToken", async (req, res) => {
    console.log("accecs samantien accecs samantien accecs samantien ")
    console.log("tässä on cookie")
    /* console.log(req.cookies)
    console.log(req.cookies.token) */
    const token = req.cookies.token
    /* console.log(token) */
    const info = decodeToken(token)
    console.log("decoded on hoidettu")
    console.log(info)
    const uusiAccesToken = jwt.sign(info, process.env.salaisuus)
    console.log("tässä on uusiAccestoken")
    console.log(uusiAccesToken)
    res.send(uusiAccesToken)
})

viestiRouter.get("/viesti", async (req, res) => {
    const vaste = lahetaViesti()
    console.log(vaste)
    console.log("viesti pitäisi olla matkalla")
    res.send("viesti pitäisi olla lähtenyt")
})

removeCookieRouter.get("/removeCookie", async (req, res) => {
    try {
        console.log("cookien poistaminen pistetty käyntiin")
        res.clearCookie("token")
        return "poistettu"
    } catch (e) {
        return e.message
    }

})
