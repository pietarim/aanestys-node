import { Schema, model, connect } from 'mongoose';
import { tapahtumaModel, osallistujaModel } from '../schema';

async function kirjautuminen(tunnus) {
    const onkoTapahtuma = await tapahtumaModel.exists({ salasana: tunnus.tapahtuma })
    const onkoOsallistuja = await osallistujaModel.exists({ salasana: tunnus.osallistuja })
    if (onkoTapahtuma && onkoOsallistuja) {
        return true
    } else {
        return false
    }
}

const luominen = async (payload) => {

    const doc = new tapahtumaModel(
        payload
    )

    /* const doc1 = new tapahtumaModel{
        otsikko
    } */

    console.log("nyt ollaan mongoose käsittelyssä")
    console.log(payload)

    const tallennettu = await doc.save()
    return payload
}

const haeKaikki = async () => {

    const doc = await tapahtumaModel.find({})
    return doc
}

const poistaminen = async () => {
    const poistattu = tapahtumaModel.remove({})
}

export default { luominen, haeKaikki, poistaminen }