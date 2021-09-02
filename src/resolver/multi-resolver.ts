import {
    Resolver,
    Query,
    Mutation,
    Arg,
} from "type-graphql";
import { tapahtumaModel } from "../schema";
import service from "../db/serviceV2"

import { PalautettavaTapahtuma, Ruokalaji, AaniInput, TapahtumaInput, EhdotusInput, Kirjautuminen } from "../type/tapahtuma";
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

@Resolver(of => PalautettavaTapahtuma)
export class TapahtumaResolver {
    @Query(returns => Kirjautuminen)
    async kirjautuminen(
        @Arg("tapahAvain") tapahAvain: string,
        @Arg("osalAvain") osalAvain: string
    ) {
        const tunnukset = service.kirjautuminen(osalAvain, tapahAvain)
        return tunnukset
    }

    @Query(returns => PalautettavaTapahtuma)
    async dbKaikkiHaku(
        @Arg("token") token: string
    ) {
        /* const id = "6126560c78c8a035544c6146" */
        const data = service.haeKaikki(token)
        return data
    }

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