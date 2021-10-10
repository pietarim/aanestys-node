import { tapahtumaModel, ehdotusModel, osallistujaModel } from '../schema'
import * as jwt from "jsonwebtoken"
require('dotenv').config({ path: "./src/.env" })
import { LuoMsm } from "../message"
import { DB_TAPAHTUMA_VOIMASSA } from "../config"

function decodeToken(token) {
  try {
    const decodedToken = jwt.verify(token, process.env.salaisuus)
    const lahetettava = { tapahtumaId: decodedToken.tapahtumaId, osallistujaId: decodedToken.osallistujaId }
    return lahetettava
  } catch (e) {
    throw Error("Tunnistautuminen epäonnistui")
  }
}

function generatePassword() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = ""
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n))
  }
  return retVal
}

async function ihminenLisays(osallistuja) {
  const salasana = generatePassword()
  const osallistujaDoc = new osallistujaModel({ nimi: osallistuja, salasana })
  const tallennettu = await osallistujaDoc.save()
  return tallennettu._id
}

async function vanhentuneenPoistaminen() {
  let vertausPaiva = Date.now()
  const tapahtuma = await tapahtumaModel.find({})
  if (tapahtuma) {
    tapahtuma.forEach(async n => {
      const vanhenee = n.paivays + DB_TAPAHTUMA_VOIMASSA /* 604800000 */ /* yksi viikko */
      if (vanhenee < vertausPaiva) {
        tapahtumanPoistaminen(n._id)
      }
    })
  }
}

const luominen = async (payload) => {
  const lahetettava = {
    otsikko: payload.tapahtumaNimi,
  }

  let suodatettuOssArr = []
  let osallistujaIdArr = []
  payload.osallistujat.forEach(e => {
    if (e.length > 2) {
      suodatettuOssArr = suodatettuOssArr.concat(e)
    }
  })

  let PromiseArr = suodatettuOssArr.map(n => ihminenLisays(n))
  osallistujaIdArr = await Promise.all(PromiseArr)

  let suodatettuVaiheArr = []
  let rukalajiArr = []

  payload.vaiheet.forEach(e => {
    if (e.length > 2) {
      suodatettuVaiheArr = suodatettuVaiheArr.concat(e)
    }
  })

  for (let i in suodatettuVaiheArr) {
    rukalajiArr = rukalajiArr.concat({
      otsikko: suodatettuVaiheArr[i],
      ehdotukset: []
    })
  }

  const tapahtumaDoc = new tapahtumaModel({
    otsikko: payload.tapahtumaNimi,
    vaiheet: rukalajiArr,
    osallistujat: osallistujaIdArr,
    salasana: generatePassword(),
    paivays: Date.now()
  })
  const luotuTapahtuma = await tapahtumaDoc.save()
  const tapahtumaInfo = await tapahtumaModel.findById(luotuTapahtuma._id)
    .populate('osallistujat', { nimi: 1, ehdotukset: 1, salasana: 1 })
  LuoMsm(tapahtumaInfo, payload.numero)
  return "tehty"
}

const kirjautuminen = async (tunnistautuminen) => {
  const osallistujaLoytyy = await osallistujaModel.exists({ salasana: tunnistautuminen.osallistujaSalasana })
  if (!osallistujaLoytyy) {
    Error("tunnistautuminen epäonnistui")
  }
  const tapahtumaLoytyy = await tapahtumaModel.exists({ salasana: tunnistautuminen.tapahtumaSalasana })
  if (!tapahtumaLoytyy) {
    Error("tunnistautuminen epäonnistui")
  }
  const kirjautunutOsallistuja = await osallistujaModel.findOne({ salasana: tunnistautuminen.osallistujaSalasana })
  const kirjautunutTapahtuma = await tapahtumaModel.findOne({ salasana: tunnistautuminen.tapahtumaSalasana })
  const token = jwt.sign({ osallistujaId: kirjautunutOsallistuja._id, tapahtumaId: kirjautunutTapahtuma._id }, process.env.salaisuus)
  const lahetettava = { token, nimi: kirjautunutOsallistuja.nimi, _id: kirjautunutOsallistuja._id }
  if (!osallistujaLoytyy || !tapahtumaLoytyy) {
    throw Error("kirjautuminen epäonnistui")
  }
  return lahetettava
}


const haeKaikki = async (token) => {
  const tunnus = decodeToken(token)
  const haettu = await tapahtumaModel.findById(tunnus.tapahtumaId)
    .populate('osallistujat', { nimi: 1, ehdotukset: 1, salasana: 1 })
    .populate('vaiheet.ehdotukset', { ehdotus: 1, aanet: 1, ehdottajaId: 1 })
  return haettu
}

const ehdotusLisays = async (payload) => {

  const tunnus = decodeToken(payload.token)
  const ehdotusDoc = new ehdotusModel({
    ehdotus: payload.ehdotus,
    aanet: [],
    ehdottajaId: tunnus.osallistujaId
  })

  let tapahtuma = await tapahtumaModel.findById(tunnus.tapahtumaId)
    .populate('vaiheet.ehdotukset', { ehdotus: 1, aanet: 1, ehdottajaId: 1 })

  let vaiheEhdotusCount = 0

  const vaihe = tapahtuma.vaiheet.find(({ _id }) => _id == payload.vaiheId)
  vaihe.ehdotukset.forEach(e => {
    if ((e.ehdottajaId).toString() === tunnus.osallistujaId) {
      vaiheEhdotusCount += 1
    }
  })

  if (vaiheEhdotusCount > 2) {
    return "max"
  }

  const tallennettava = await ehdotusDoc.save()

  let idArr = []
  for (let n in tapahtuma.vaiheet) {
    let id = tapahtuma.vaiheet[n]._id
    id = JSON.stringify(id)
    const idLength = id.length - 2
    id = id.substr(1, idLength)
    idArr = idArr.concat(id)
  }

  for (let i in tapahtuma.vaiheet) {
    if (idArr[i] === payload.vaiheId) {
      tapahtuma.vaiheet[i].ehdotukset = tapahtuma.vaiheet[i].ehdotukset.concat(tallennettava._id)
      console.log(tapahtuma.vaiheet[i].ehdotukset)
    }
  }

  const paivitettyTapahtuma = await tapahtumaModel.findByIdAndUpdate(tunnus.tapahtumaId, tapahtuma)

  let osallistuja = await osallistujaModel.findById(tunnus.osallistujaId)
  osallistuja.ehdotuksetId = osallistuja.ehdotuksetId.concat(tallennettava._id)

  await osallistujaModel.findByIdAndUpdate(tunnus.osallistujaId, osallistuja)

  return "tehty"
}

const tapahtumanPoistaminen = async (_id) => {
  const haettu = await tapahtumaModel.findById(_id)
  let osallistujaArr = haettu.osallistujat

  for (let i in osallistujaArr) {
    await osallistujaModel.findByIdAndRemove(osallistujaArr[i])
  }

  let poistettavaEhdotusArr = haettu.vaiheet
  let poistettavaEhdotusArrId = []
  poistettavaEhdotusArr.map(n => n.ehdotukset.map(n => poistettavaEhdotusArrId = poistettavaEhdotusArrId.concat(n._id)))

  for (let i in poistettavaEhdotusArrId) {
    await ehdotusModel.findByIdAndRemove(poistettavaEhdotusArrId[i])
  }
  await tapahtumaModel.findByIdAndDelete(_id)
}

const aanestaminen = async (payload) => {
  /* äänen lisääminen ehdotuksiin */
  const decodedToken = decodeToken(payload.token)
  let edeltavaEhdotusId

  /* Ehdotus vanhan äänen poistaminen */

  const tapahtuma = await tapahtumaModel.findById(decodedToken.tapahtumaId)
    .populate('vaiheet.ehdotukset', { aanet: 1 })
  console.log(tapahtuma.vaiheet)
  let vaihe = tapahtuma.vaiheet.find(({ _id }) => _id == payload.vaiheId)
  vaihe.ehdotukset.forEach(e => {
    const aaniLoytyy = e.aanet.find(e => e = decodedToken.osallistujaId)
    if (aaniLoytyy) {
      edeltavaEhdotusId = (e._id).toString()
    }
  })

  if (edeltavaEhdotusId == payload.ehdotusId) {
    console.log("return on käynnistetty")
    return "done"
  }

  /* Onko vanha aani samassa vaiheessa jo */
  let ehdotus = await ehdotusModel.findById(payload.ehdotusId)
  ehdotus.aanet = ehdotus.aanet.concat(decodedToken.osallistujaId)
  const paivitettyEhdotus = new ehdotusModel(ehdotus)
  const tallennettu = await ehdotusModel.findByIdAndUpdate(payload.ehdotusId, ehdotus)

  if (edeltavaEhdotusId) {
    let paivitettyEhdotusAanet = []
    let paivitettyOsallistujaAanet = []
    let vahennettavaEhdotus = await ehdotusModel.findById(edeltavaEhdotusId)
    if (vahennettavaEhdotus.aanet) {
      const ehdotusAaniIndex = vahennettavaEhdotus.aanet.indexOf(edeltavaEhdotusId)
      for (let n in vahennettavaEhdotus.aanet) {
        if (vahennettavaEhdotus.aanet[n]) {
          if (n !== JSON.stringify(ehdotusAaniIndex)) {
            paivitettyEhdotusAanet.concat(vahennettavaEhdotus.aanet[n])
          }
        }
      }
      vahennettavaEhdotus.aanet = paivitettyEhdotusAanet
      await ehdotusModel.findByIdAndUpdate(edeltavaEhdotusId, vahennettavaEhdotus)
    }
    /* ääenen poistaminen osallistujalta */

    let muokattavaOsallistuja = await osallistujaModel.findById(decodedToken.osallistujaId)
    for (let n in muokattavaOsallistuja) {
      if (muokattavaOsallistuja.aanet[n] !== edeltavaEhdotusId) {
        paivitettyOsallistujaAanet.concat(muokattavaOsallistuja.aanet)
      }
    }
    muokattavaOsallistuja.aanet = paivitettyOsallistujaAanet
    await osallistujaModel.findByIdAndUpdate(decodedToken.osallistujaId, muokattavaOsallistuja)
    console.log("osallistuja updaten jälkeen")
  }

  /* äänestämisen lisääminen osallistujaan */
  let osallistuja = await osallistujaModel.findById(decodedToken.osallistujaId)
  osallistuja.aanet = osallistuja.aanet.concat({ vaiheId: payload.vaiheId, ehdotusId: payload.ehdotusId })
  const lahetettava = await osallistujaModel.findByIdAndUpdate(decodedToken.osallistujaId, osallistuja)
  const tilanne = await osallistujaModel.findById(decodedToken.osallistujaId)
  return 'done'
}

export default { luominen, ehdotusLisays, tapahtumanPoistaminen, haeKaikki, aanestaminen, kirjautuminen, vanhentuneenPoistaminen }