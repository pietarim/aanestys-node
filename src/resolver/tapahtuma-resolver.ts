import {
    Resolver,
    Query,
    Mutation,
    Arg,
    PubSub,
    Subscription,
    PubSubEngine,
    ResolverFilterData,
    Root,
} from "type-graphql";

import { TapahtumaInput, Tapahtuma, TallennettuTapahtuma, TallennettuAani, AaniInput } from "../type/tapahtuma";
import { TunnistautuminenInput, Tunnus } from "../type/tunnus";
import DatabaseKasittely from "../db/DatabaseKasittely"
import { tapahtumaModel } from "../schema";

const tapahtuma = {
    otsikko: "Kissanristijäise",
    osallistujat: ["Tero", "santeri", "mika", "maria"],
    ehdotukset: [
        { otsikko: "hapankaali", aanet: ["aaa", "aab"] },
        { otsikko: "makkaraa", aanet: ["aaa", "aab", "abb"] }
    ]
}

const tunnistautuminen = tunnus => {
    if (tunnus.tunnus === "a") {
        return { tunnus: "yes" }
    } else {
        return { tunnus: "no" }
    }
}

@Resolver(of => Tapahtuma)
export class TapahtumaResolver {
    @Query(returns => Tapahtuma)
    async tapahtumaHaku() {
        const haettu: any = await DatabaseKasittely.haeKaikki()
        console.log(haettu[0].otsikko)
        console.log(haettu[0])
        const lahetettava = {
            otsikko: haettu[0].otsikko,
            osallistujat: haettu[0].osallistujat,
            ehdotukset: haettu[0].ehdotukset
        }
        console.log(lahetettava)
        return lahetettava
    }

    @Mutation()

    /* @Mutation(of => TallennettuTapahtuma) */
    @Mutation(of => Tapahtuma)
    async tapahtumaLisays(
        @Arg("tapahtuma") tapahtuma: TapahtumaInput
    ): Promise<TallennettuTapahtuma> {
        let arr = []
        tapahtuma.ehdotukset.map((n: any) => arr = arr.concat({ otsikko: n, aanet: [""] }))

        console.log(arr)

        /* const payload: TallennettuTapahtuma = {
            otsikko: tapahtuma.otsikko,
            osallistujat: tapahtuma.osallistujat,
            ehdotukset: tapahtuma.ehdotukset
        } */


        const payload: TallennettuTapahtuma = {
            otsikko: tapahtuma.otsikko,
            osallistujat: tapahtuma.osallistujat,
            ehdotukset: arr
        }
        console.log(payload)
        const tallennettu = await DatabaseKasittely.luominen(payload)
        console.log(tallennettu)
        console.log(payload)
        return payload
    }

    @Mutation(of => TallennettuAani)
    async aanenLisays(
        @Arg("aani") aani: AaniInput
    ): Promise<TallennettuAani> {
        const payload: TallennettuAani = {
            aani: aani.aani
        }
        console.log(aani)
        return payload
    }
}

@Resolver(of => Tunnus)
export class TunnusResolver {

    @Mutation(of => Tunnus)
    async kirjautuminen(
        @Arg("tunnus") tunnus: TunnistautuminenInput
    ): Promise<Tunnus> {
        const payload: Tunnus = {
            tunnus: tunnus.tunnus
        }
        const kirajutuminen = tunnistautuminen(payload)
        console.log(kirajutuminen)
        return kirajutuminen
    }
}