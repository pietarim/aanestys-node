import * as express from "express"
import services from "../db/serviceV2"
import { TunnistautuminenInput } from "../type/tunnus"
import * as jwt from "jsonwebtoken"
require('dotenv').config({ path: "./src/.env" })

export const kirjautuminenRouter = express.Router()
export const accesTokenRouter = express.Router()

kirjautuminenRouter.post("/kirjautuminen", async (req, res) => {
    const tunnus = req.body.osallistujaSalasana
    console.log("tunnus tunnus")
    console.log(req.body)
    const token = await services.kirjautuminen(req.body)
    console.log("lahetettava lahetettava ")
    console.log(token)
    res.cookie("token", token.token, { httpOnly: true, })
    res.send(token)
})

function decodeToken(token) {
    try {
        console.log("process.env.salaisuus process.env.salaisuus process.env.salaisuus")
        console.log(process.env.salaisuus)
        const decodedToken = jwt.verify(token, process.env.salaisuus)
        const lahetettava = { tapahtumaId: decodedToken.tapahtumaId, osallistujaId: decodedToken.osallistujaId }
        console.log(lahetettava)
        return lahetettava
    } catch (e) {
        throw Error("Tunnistautuminen epäonnistui")
    }
}

accesTokenRouter.get("/accesToken", async (req, res) => {
    const token = req.cookies.token
    console.log(token)
    const info = decodeToken(token)
    const uusiAccesToken = jwt.sign(info, process.env.salaisuus)
    return uusiAccesToken
})
