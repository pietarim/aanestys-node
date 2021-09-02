import { Schema, model, connect } from 'mongoose';
import { tapahtumaModel, ehdotusModel, osallistujaModel } from '../schema';
import { Tapahtuma } from '../type/tapahtuma';
import jwt from "jsonwebtoken"
require('dotenv').config({ path: "./src/.env" })

const luominen = async (payload) => {
    console.log("LUOMINEN")
    await osallistujaModel.deleteMany()
    /* await osallistujaModel.deleteOne({ nimi: "Seppo" }) */
    await ehdotusModel.deleteMany()
    await tapahtumaModel.deleteMany()

    const lahetettava = {
        otsikko: payload.tapahtumaNimi,
    }

    let osallistujaIdArr = []

    let PromiseArr = payload.osallistujat.map(n => ihminenLisays(n))
    osallistujaIdArr = await Promise.all(PromiseArr)

    async function ihminenLisays(osallistuja) {
        const osallistujaDoc = new osallistujaModel({ nimi: osallistuja })
        const tallennettu = await osallistujaDoc.save()
        return tallennettu._id
    }

    let rukalajiArr = []
    for (let i in payload.vaiheet) {
        rukalajiArr = rukalajiArr.concat({
            otsikko: payload.vaiheet[i],
            ehdotukset: []
        })
    }

    const tapahtumaDoc = new tapahtumaModel({
        otsikko: payload.tapahtumaNimi,
        vaiheet: rukalajiArr,
        osallistujat: osallistujaIdArr
    })
    const luotuTapahtuma = await tapahtumaDoc.save()

    const ateriaArr = []

    const tapahtuma = {
        nimi: "hei"
    }

    const doc = new tapahtumaModel()
    return "tehty"
}

const kirjautuminen = async (osallistuja, tapahtuma) => {
    const kirjautunutOsallistuja = await osallistujaModel.findOne({ salaSana: osallistuja })
    const kirjautunutTapahtuma = await tapahtumaModel.findOne({ tapahtuma })
    if (!kirjautunutOsallistuja || !kirjautunutTapahtuma) {
        return "fail"
    }
    const token = jwt.sign({ nimi: kirjautunutOsallistuja._id, tahtuna: kirjautunutTapahtuma._id }, process.env.salaisuus)
    return token
}

/* const haeKaikki = async (_id) => {
    const haettu = await tapahtumaModel.findById(_id).populate('osallistujat', { nimi: 1, ehdotukset: 1 })
        .populate('vaiheet.ehdotukset', { ehdotus: 1, aanet: 1, ehdottajaId: 1 })
    haettu.vaiheet.map(n => console.log(n.ehdotukset))
    return haettu
} */

const haeKaikki = async (_id) => {
    const haettu = await tapahtumaModel.findById(_id).populate('osallistujat', { nimi: 1, ehdotukset: 1 })
        .populate('vaiheet.ehdotukset', { ehdotus: 1, aanet: 1, ehdottajaId: 1 })
    haettu.vaiheet.map(n => console.log(n.ehdotukset))
    return haettu
}

const ehdotusLisays = async (payload) => {
    const ehdotusDoc = new ehdotusModel({
        ehdotus: payload.ehdotus,
        aanet: [],
        ehdottajaId: payload.ehdottajaId
    })

    const tallennettava = await ehdotusDoc.save()
    let tapahtuma = await tapahtumaModel.findById(payload.tapahtumaId)
    let idArr = []
    for (let n in tapahtuma.vaiheet) {
        let id = tapahtuma.vaiheet[n]._id
        id = JSON.stringify(id)
        const idLength = id.length - 2
        id = id.substr(1, idLength)
        idArr = idArr.concat(id)
    }
    /* let tapahtuma = await tapahtumaModel.findById('6126829e78d16821406b5cb9') */
    /* let ruokalajit = tapahtuma.ruokalajit
    for (let n in tapahtuma.ruokalajit) {
        if (payload.vaiheId == tapahtuma.ruokalajit[n]._id) {
            tapahtuma.ruokalajit[n].ehdotukset = tapahtuma.ruokalajit[n].ehdotukset.concat(tallennettava._id)
        }
    } */
    /* const vaiheetId = JSON.stringify(tapahtuma.vaiheet[0]._id)
    const length = vaiheetId.length - 2
    const lyhennettyId = vaiheetId.substr(1, length) */
    for (let i in tapahtuma.vaiheet) {
        if (idArr[i] === payload.vaiheId) {
            tapahtuma.vaiheet[i].ehdotukset = tapahtuma.vaiheet[i].ehdotukset.concat(tallennettava._id)
            console.log(tapahtuma.vaiheet[i].ehdotukset)
        }
    }
    /* const paivitettyTapahtuma = new tapahtumaModel(tapahtuma) */

    console.log(ehdotusDoc)
    const paivitettyTapahtuma = await tapahtumaModel.findByIdAndUpdate(payload.tapahtumaId, tapahtuma)
    console.log(paivitettyTapahtuma)
    return "tehty"
}

const tapahtumanPoistaminen = async (_id) => {
    const haettu = await tapahtumaModel.findById(_id)
    let osallistujaArr = haettu.osallistujat
    let poistettavatOsallistujaId = []
    osallistujaArr._id.map(n => poistettavatOsallistujaId.concat(n))

    for (let i in poistettavatOsallistujaId) {
        await osallistujaModel.findByIdAndRemove(poistettavatOsallistujaId[i])
    }
    /* poistettavatOsallistujaId.map(n => osallistujaModel.findByIdAndDelete(n)) */

    let poistettavaEhdotusArr = haettu.vaiheet
    let poistettavaEhdotusArrId = []
    poistettavaEhdotusArr.map(n => n.ehdotukset.map(n => poistettavaEhdotusArrId.concat(n._id)))

    let ehdotusArr = []

    for (let i in poistettavaEhdotusArrId) {
        await ehdotusModel.findByIdAndRemove(poistettavaEhdotusArrId[i])
    }

    /* poistettavaEhdotusArrId.map(n => await osallistujaModel.findByIdAndDelete(n)) */
    await tapahtumaModel.findByIdAndDelete(_id)
}

const aanestaminen = async (payload) => {
    /* äänen lisääminen ehdotuksiin */
    let ehdotus = await ehdotusModel.findById(payload.ehdotusId)
    ehdotus.aanet = ehdotus.aanet.concat(payload.osallistujaId)
    const paivitettyEhdotus = new ehdotusModel(ehdotus)
    const tallennettu = await ehdotusModel.findByIdAndUpdate(payload.ehdotusId, ehdotus)
    let aanetOsallistuja = []

    /* Ehdotus vanhan äänen poistaminen */


    if (payload.edeltavaEhdotusId) {
        let paivitettyEhdotusAanet = []
        let paivitettyOsallistujaAanet = []
        let vahennettavaEhdotus = await ehdotusModel.findById(payload.edeltavaEhdotusId)
        if (vahennettavaEhdotus.aanet) {
            console.log(vahennettavaEhdotus)
            const ehdotusAaniIndex = vahennettavaEhdotus.aanet.indexOf(payload.edeltavaEhdotusId)
            for (let n in vahennettavaEhdotus.aanet) {
                if (vahennettavaEhdotus.aanet[n]) {
                    if (n !== JSON.stringify(ehdotusAaniIndex)) {
                        paivitettyEhdotusAanet.concat(vahennettavaEhdotus.aanet[n])
                    }
                }

            }
            vahennettavaEhdotus.aanet = paivitettyEhdotusAanet
            await ehdotusModel.findByIdAndUpdate(payload.edeltavaEhdotusId, vahennettavaEhdotus)
            console.log("ehdotus update suoritettu")
        }


        /* ääenen poistaminen osallistujalta */

        let muokattavaOsallistuja = await osallistujaModel.findById(payload.osallistujaId)
        console.log('osallistuja hakija')
        console.log(muokattavaOsallistuja)
        /* const indexKayttaja = muokattavaOsallistuja.aanet.indexOf(payload.ehdotusId) */
        for (let n in muokattavaOsallistuja) {
            if (muokattavaOsallistuja.aanet[n] !== payload.edeltavaEhdotusId) {
                paivitettyOsallistujaAanet.concat(muokattavaOsallistuja.aanet)
            }
        }
        muokattavaOsallistuja.aanet = paivitettyOsallistujaAanet
        /* const lahetettavaOsallistuja = new osallistujaModel(muokattavaOsallistuja) */
        console.log("ennen osallistuja modelia")
        await osallistujaModel.findByIdAndUpdate(payload.osallistujaId, muokattavaOsallistuja)
        console.log("osallistuja updaten jälkeen")
    }

    /* äänestämisen lisääminen osallistujaan */
    console.log("finaali")
    let osallistuja = await osallistujaModel.findById(payload.osallistujaId)
    osallistuja.aanet = osallistuja.aanet.concat({ vaiheId: payload.vaiheId, ehdotusId: payload.ehdotusId })
    console.log(osallistuja)
    const lahetettava = await osallistujaModel.findByIdAndUpdate(payload.osallistujaId, osallistuja)
    const tilanne = await osallistujaModel.findById(payload.osallistujaId)
    console.log(tilanne)

    return 'tehty'
}

/* const tapahtuma = await Tapahtuma.findById(payload.tapahtumaId)
let aaniLista = []
const vaiheIndex = tapahtuma.vaihe.indexOf(payload.vaiheId)
tapahtuma[vaiheIndex].aanet.map(n => {
    if (n !== payload.ehdotusId) {
        aaniLista.concat(n)
    }
}
) */
/* const lahetettava = new aaniModel({
    aanestajanId: payload.aanestajanId,
    kohdeEhdotusId: payload.kohdeEhdotusId
})
const talennettu = await lahetettava.save()

const tapahtuma = await ehdotusModel.findById(payload.kohdeEhdotusId)
tapahtuma.aanet.concat(aanestajanId) */



export default { luominen, ehdotusLisays, tapahtumanPoistaminen, haeKaikki, aanestaminen }