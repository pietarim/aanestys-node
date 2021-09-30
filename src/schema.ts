import { Schema, model, Document, PopulatedDoc } from 'mongoose';

interface Tapahtuma {
    otsikko?: string
    vaiheet?: PopulatedDoc<Ehdotus & Document>
    osallistujat?: PopulatedDoc<Osallistuja & Document>
    paivays: number
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
    }],
    salasana: { type: String },
    paivays: { type: Number }
})

tapahtumaSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject._id = returnedObject._id.toStirng
        delete returnedObject.__v
    }
})

const ehdotusSchema = new Schema<Ehdotus>({
    ehdotus: { type: String },
    aanet: { type: [String] },
    ehdottajaId: { type: String }
})

ehdotusSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject._id = returnedObject._id.toStirng
        delete returnedObject.__v
    }
})

const osallistujaSchema = new Schema<Osallistuja>({
    nimi: { type: String },
    salasana: { type: String },
    ehdotuksetId: { type: [String] },
    aanet: [{ vaiheId: { type: String }, ehdotusId: { type: String } }]
})

osallistujaSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject._id = returnedObject._id.toStirng
        delete returnedObject.__v
    }
})

export const tapahtumaModel = model<Tapahtuma>('Tapahtuma', tapahtumaSchema)
export const ehdotusModel = model<Ehdotus>('Ehdotus', ehdotusSchema)
export const osallistujaModel = model<Osallistuja>('Osallistuja', osallistujaSchema)