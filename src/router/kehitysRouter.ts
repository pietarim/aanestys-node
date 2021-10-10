import * as express from "express"
import services from "../db/serviceV2"
import { tapahtumaModel, osallistujaModel, ehdotusModel } from "../schema"

export const kaikkiPoisRouter = express.Router()
export const findOneRouter = express.Router()

kaikkiPoisRouter.get("/poies", async (req, res) => {
  try {
    await ehdotusModel.deleteMany()
    await osallistujaModel.deleteMany()
    await tapahtumaModel.deleteMany()
    res.send("suoritettu")
  } catch (e) {
    res.send("poistaminen epäonnistui")
  }
})

findOneRouter.get("/etsi", async (req, res) => {
  const tulos = await osallistujaModel.findOne({ salasana: "BbT5b2kv" })
  res.send(tulos)
})