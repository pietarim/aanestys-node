import { Schema, model, Document, PopulatedDoc } from 'mongoose';

/* interface Tapahtuma {
    otsikko: string
    osallistujat: string[]
    ehdotukset: ehdotukset
} */

interface Tapahtuma {
    otsikko?: string
    vaiheet?: PopulatedDoc<Ehdotus & Document>
    osallistujat?: PopulatedDoc<Osallistuja & Document>
}

interface Ehdotus {
    ehdotus: string
    aanet: string[]
    ehdottajaId: string
}

interface Osallistuja {
    nimi: string
    salasana: string
    ehdotuksetId: string[]
    aanet: aanilista[]
}

interface aanilista {
    vaiheId: string
    ehdotusId: string
}

/* interface Aani {
    aanestajanId: string
    kohdeEhdotusId: string
} */

/* interface ehdotukset {
    otsikko: string,
    aanet: string[]
} */

/* const aaniSchema = new Schema<Aani>({
    aanestajanId: { type: String },
    kohdeEhdotusId: { type: String }
}) */

const tapahtumaSchema = new Schema<Tapahtuma>({
    otsikko: { type: String },
    vaiheet: [{
        otsikko: { type: String },
        ehdotukset: [{
            type: 'ObjectId',
            ref: 'Ehdotus'
        }]
    }],
    osallistujat: [{
        type: 'ObjectId',
        ref: 'Osallistuja'
    }]
})

const ehdotusSchema = new Schema<Ehdotus>({
    ehdotus: { type: String },
    aanet: { type: [String] },
    ehdottajaId: { type: String }
})

const osallistujaSchema = new Schema<Osallistuja>({
    nimi: { type: String },
    salasana: { type: String },
    ehdotuksetId: { type: [String] },
    aanet: [{ vaiheId: { type: String }, ehdotusId: { type: String } }]
})



/* const schema = new Schema<Tapahtuma>({
    otsikko: { type: String, required: true },
    osallistujat: { type: [String], required: true },
    ehdotukset: [{
        otsikko: { type: String },
        aanet: { type: [String] }
    }] */
/* ehdotukset: { type: ehdotuksetSchema } */
/* }) */

export const tapahtumaModel = model<Tapahtuma>('Tapahtuma', tapahtumaSchema)
export const ehdotusModel = model<Ehdotus>('Ehdotus', ehdotusSchema)
export const osallistujaModel = model<Osallistuja>('Osallistuja', osallistujaSchema)