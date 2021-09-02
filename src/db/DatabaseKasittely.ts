import { Schema, model, connect } from 'mongoose';
import { tapahtumaModel } from '../schema';

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