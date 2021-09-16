import { Schema, model, connect } from 'mongoose';
import { tapahtumaModel, ehdotusModel, osallistujaModel } from '../schema';
import { Tapahtuma } from '../type/tapahtuma';
import * as jwt from "jsonwebtoken"
require('dotenv').config({ path: "./src/.env" })

async function Kirjautuminen2(tunnus) {
    const tapahtuma = await tapahtumaModel.find({ salasana: tunnus.salasana })
    const osallistuja = await osallistujaModel.findOne({ salasana: tunnus.salasana })
}

function decodeToken(token) {
    try {
        const decodedToken = jwt.verify(token, process.env.salaisuus)
        const lahetettava = { tapahtumaId: decodedToken.tapahtumaId, osallistujaId: decodedToken.osallistujaId }
        console.log(lahetettava)
        return lahetettava
    } catch (e) {
        throw Error("Tunnistautuminen epäonnistui")
    }
}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

async function ihminenLisays(osallistuja) {
    const salasana = generatePassword()
    const osallistujaDoc = new osallistujaModel({ nimi: osallistuja, salasana })
    const tallennettu = await osallistujaDoc.save()
    return tallennettu._id
}

const luominen = async (payload) => {
    console.log("LUOMINEN")
    /* await osallistujaModel.deleteMany() */
    /* await osallistujaModel.deleteOne({ nimi: "Seppo" }) */
    /* await ehdotusModel.deleteMany()
    await tapahtumaModel.deleteMany()
 */
    const lahetettava = {
        otsikko: payload.tapahtumaNimi,
    }

    let osallistujaIdArr = []

    let PromiseArr = payload.osallistujat.map(n => ihminenLisays(n))
    osallistujaIdArr = await Promise.all(PromiseArr)

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
        osallistujat: osallistujaIdArr,
        salasana: generatePassword()
    })
    const luotuTapahtuma = await tapahtumaDoc.save()
    console.log(luotuTapahtuma)
    return "tehty"
}

const kirjautuminen = async (tunnistautuminen) => {
    console.log(tunnistautuminen)
    const osallistujaLoytyy = await osallistujaModel.exists({ salasana: tunnistautuminen.osallistujaSalasana })
    console.log("Löytyykö osallisttuja ", osallistujaLoytyy)
    if (osallistujaLoytyy) {
        console.log("ei löytynyt")
    }
    const tapahtumaLoytyy = await tapahtumaModel.exists({ salasana: tunnistautuminen.tapahtumaSalasana })
    if (tapahtumaLoytyy) {
        console.log("ei löytynyt")
    }
    const kirjautunutOsallistuja = await osallistujaModel.findOne({ salasana: tunnistautuminen.osallistujaSalasana })
    const kirjautunutTapahtuma = await tapahtumaModel.findOne({ salasana: tunnistautuminen.tapahtumaSalasana })
    console.log("databasen hakemisen jälkeen")
    console.log(kirjautunutOsallistuja)
    console.log(kirjautunutTapahtuma)
    /* if (!kirjautunutTapahtuma || !kirjautunutOsallistuja) {
        throw Error("kirjautuminen epäonnistui")
    } */
    const token = jwt.sign({ osallistujaId: kirjautunutOsallistuja._id, tapahtumaId: kirjautunutTapahtuma._id }, process.env.salaisuus)
    const lahetettava = { token, nimi: kirjautunutOsallistuja.nimi, _id: kirjautunutOsallistuja._id }
    if (!osallistujaLoytyy || !tapahtumaLoytyy) {
        throw Error("kirjautuminen epäonnistui")
    }
    return lahetettava
}

const kasitteleAccesToken = async (token) => {

}

const haeKaikki = async (token) => {
    const tunnus = decodeToken(token)
    console.log("haeKaikki")
    const haettu = await tapahtumaModel.findById(tunnus.tapahtumaId).populate('osallistujat', { nimi: 1, ehdotukset: 1 })
        .populate('vaiheet.ehdotukset', { ehdotus: 1, aanet: 1, ehdottajaId: 1 })
    haettu.vaiheet.map(n => console.log(n.ehdotukset))
    return haettu
}

const ehdotusLisays = async (payload) => {
    const tunnus = decodeToken(payload.token)
    const ehdotusDoc = new ehdotusModel({
        ehdotus: payload.ehdotus,
        aanet: [],
        ehdottajaId: tunnus.osallistujaId
    })

    const tallennettava = await ehdotusDoc.save()
    let tapahtuma = await tapahtumaModel.findById(tunnus.tapahtumaId)
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
    const paivitettyTapahtuma = await tapahtumaModel.findByIdAndUpdate(tunnus.tapahtumaId, tapahtuma)

    let osallistuja = await osallistujaModel.findById(tunnus.osallistujaId)
    osallistuja.ehdotuksetId = osallistuja.ehdotuksetId.concat(tallennettava._id)

    await osallistujaModel.findByIdAndUpdate(tunnus.osallistujaId, osallistuja)


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
    const decodedToken = decodeToken(payload.token)
    let ehdotus = await ehdotusModel.findById(payload.ehdotusId)
    ehdotus.aanet = ehdotus.aanet.concat(decodedToken.osallistujaId)
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

        let muokattavaOsallistuja = await osallistujaModel.findById(decodedToken.osallistujaId)
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
        await osallistujaModel.findByIdAndUpdate(decodedToken.osallistujaId, muokattavaOsallistuja)
        console.log("osallistuja updaten jälkeen")
    }

    /* äänestämisen lisääminen osallistujaan */
    console.log("finaali")
    let osallistuja = await osallistujaModel.findById(decodedToken.osallistujaId)
    osallistuja.aanet = osallistuja.aanet.concat({ vaiheId: payload.vaiheId, ehdotusId: payload.ehdotusId })
    console.log(osallistuja)
    const lahetettava = await osallistujaModel.findByIdAndUpdate(decodedToken.osallistujaId, osallistuja)
    const tilanne = await osallistujaModel.findById(decodedToken.osallistujaId)
    console.log(tilanne)

    return 'done'
}


export default { luominen, ehdotusLisays, tapahtumanPoistaminen, haeKaikki, aanestaminen, kirjautuminen }