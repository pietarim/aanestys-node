import { ObjectType, Field, InputType } from "type-graphql"

/* Uudestaan alkuperäinen suunnistelma */

@ObjectType()
export class testi {
    @Field()
    nimi: number
    @Field()
    ika: string
}

@ObjectType()
export class PalautettavaTapahtuma {
    @Field()
    otsikko: string
    @Field(type => [Ruokalaji])
    vaiheet: Ruokalaji[]
    @Field(type => [Osallistuja])
    osallistujat: Osallistuja[]
    @Field()
    id: string
}

@ObjectType()
export class Ruokalaji {
    @Field()
    otsikko: string /* alkuruoka, paaruoka ... */
    @Field(type => [Ehdotus])
    ehdotukset: Ehdotus[]
    @Field()
    _id: string
}

@ObjectType()
class Ehdotus {
    @Field({ nullable: true })
    ehdotus: string
    @Field({ nullable: true })
    _id: string /* käytetään aanen antamisen osoitteena */
    @Field(type => [String], { nullable: true })
    aanet: string[]
    @Field({ nullable: true })
    ehdottajaId: string
}

@ObjectType()
class Osallistuja {
    @Field()
    nimi: string
    @Field()
    _id: string /* kaytetaan aanestamiseen ja ehdottamisessa avaimena */
}

@InputType()
export class AaniIniput {
    @Field()
    aanestajanId: string
    @Field()
    kohdeEhdotusId: string
}

@InputType()
export class TapahtumaInput {
    @Field()
    tapahtumaNimi: string
    @Field(type => [String])
    vaiheet: [String]
    @Field(type => [String])
    osallistujat: string[]
}

/* @InputType()
class OsallistujaInput {
    @Field()
    nimi: string
    @Field()
    id: string
}
 */
/* Uudestaan alkuperäinen suunnistelma */

@ObjectType()
export class Tapahtuma {
    @Field()
    otsikko: string;

    @Field(type => [String])
    osallistujat: string[];

    @Field(type => [Ehdotus])
    ehdotukset: Ehdotus[]
}

/* @ObjectType()
class Ehdotus {
    @Field()
    otsikko: string

    @Field(type => [String])
    aanet: string[]
} */


/* @InputType()
export class TapahtumaInput {
    @Field()
    otsikko: string;

    @Field(type => [String])
    osallistujat: string[];

    @Field(type => [String])
    ehdotukset: string[]
} */

@ObjectType()
export class TallennettuTapahtuma {
    @Field()
    otsikko: string;

    @Field(type => [String])
    osallistujat: string[];

    @Field(type => [String])
    ehdotukset: string[]
}

@InputType()
export class AaniInput {
    @Field()
    osallistujaId: string
    @Field()
    vaiheId: string
    @Field()
    ehdotusId: string
    @Field({ nullable: true })
    edeltavaEhdotusId: string
    @Field()
    tapahtumaId: string
}

@ObjectType()
export class TallennettuAani {
    @Field()
    aani: string
}

@InputType()
export class EhdotusInput {
    @Field()
    tapahtumaId: string
    @Field()
    ehdotus: string
    @Field()
    ehdottajaId: string
    @Field()
    /* määränpää osoite */
    vaiheId: string

}