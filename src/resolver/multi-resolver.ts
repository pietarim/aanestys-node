import {
    Resolver,
    Query,
    Mutation,
    Arg,
} from "type-graphql";
import { tapahtumaModel } from "../schema";
import service from "../db/serviceV2"

import { PalautettavaTapahtuma, Ruokalaji, AaniInput, TapahtumaInput, testi, EhdotusInput } from "../type/tapahtuma";
/* import { service } from 'db/service' */
import jwt from "jsonwebtoken"

const henkilo = {
    nimi: "make",
    ika: 34
}

const aaa = {
    tapahtumaNimi: "Häät",
    ruokalajit: [
        {
            vaihe: "alkuruoka",
            ehdotukset: [
                {
                    nimi: "makkaraperunat",
                    id: "3243",
                    aanet: ["fdsa", "adsf"]
                },
                {
                    nimi: "bruchetta",
                    id: "3244",
                    aanet: ["fdsa", "adsf"]
                }
            ]
        },
        {
            vaihe: "pääruoka",
            ehdotukset: [
                {
                    nimi: "pekoni",
                    id: "3246",
                    aanet: ["fdsa", "adsf"]
                },
                {
                    nimi: "tomaattikeitto",
                    id: "3246",
                    aanet: ["fdsa", "adsf"]
                }
            ]
        }
    ],
    osallistujat: [
        {
            nimi: "sami",
            id: "afasd"
        },
        {
            nimi: "Marke",
            id: "adfadfs"
        }
    ]
}

@Resolver(of => testi)
export class testiResolver {
    @Query(returns => testi)
    async testiHaku() {
        console.log(testi)
        return henkilo
    }
}

@Resolver(of => PalautettavaTapahtuma)
export class TapahtumaResolver {
    @Query(returns => PalautettavaTapahtuma)
    async tapahtumahaku() {
        /* db kasittely tänne */
        return aaa
    }

    @Query(returns => String)
    async kirjautuminen(
        @Arg("tapahtuma") tapahAvain: string,
        @Arg("osallistuja") osalAvain: string
    ) {

        return "tehty"
    }

    @Query(returns => PalautettavaTapahtuma)
    async dbKaikkiHaku(
        @Arg("id") id: string
    ) {
        /* const id = "6126560c78c8a035544c6146" */
        const data = service.haeKaikki(id)
        return data
    }

    /* @Query(returns => PalautettavaTapahtuma)
    async dbKaikkiHaku() {
        const id = "6126560c78c8a035544c6146"
        const data = service.haeKaikki(id)
        return data
    } */

    @Mutation(of => String)
    async lisaaTapahtuma(
        @Arg("tapahtuma") tapahtuma: TapahtumaInput
    ): Promise<String> {
        const payload = tapahtuma
        const palaute = await service.luominen(payload)
        return "hei"
    }

    @Mutation(of => String)
    async ehdottaminen(
        @Arg("ehdotus") ehdotus: EhdotusInput
    ): Promise<String> {
        const payload = ehdotus
        const palaute = await service.ehdotusLisays(payload)
        console.log(palaute)
        return "hei"
    }

    @Mutation(of => String)
    async aanestaminen(
        @Arg("aani") aani: AaniInput
    ): Promise<String> {
        const payload = aani
        const lahetettyAani = service.aanestaminen(payload)
        return "hei"
    }
}