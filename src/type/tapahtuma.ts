import { ObjectType, Field, InputType } from "type-graphql"

@ObjectType()
export class PalautettavaTapahtuma {
  @Field()
  otsikko: string
  @Field(type => [Ruokalaji])
  vaiheet: Ruokalaji[]
  @Field(type => [Osallistuja])
  osallistujat: Osallistuja[]
  @Field()
  _id: string
}

@ObjectType()
export class Kirjautuminen {
  @Field()
  token: string
  @Field()
  nimi: string
  @Field()
  _id: string
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
  @Field()
  ehdotuksetId: string
}

@InputType()
export class KirjautuminenInput {
  @Field()
  tapahtumaSalasana: string
  @Field()
  osallistujaSalasana: string
}

@InputType()
export class TapahtumaInput {
  @Field()
  token: string
  @Field()
  tapahtumaNimi: string
  @Field(type => [String])
  vaiheet: [String]
  @Field(type => [String])
  osallistujat: string[]
}

@InputType()
export class TapahtumaLuominenInput {
  @Field()
  tapahtumaNimi: string
  @Field()
  numero: string
  @Field(type => [String])
  vaiheet: [String]
  @Field(type => [String])
  osallistujat: string[]
}

@ObjectType()
export class Tapahtuma {
  @Field()
  otsikko: string

  @Field(type => [String])
  osallistujat: string[]

  @Field(type => [Ehdotus])
  ehdotukset: Ehdotus[]
}

@ObjectType()
export class TallennettuTapahtuma {
  @Field()
  otsikko: string

  @Field(type => [String])
  osallistujat: string[]

  @Field(type => [String])
  ehdotukset: string[]
}

@InputType()
export class AaniInput {
  @Field()
  token: string
  @Field()
  osallistujaId: string
  @Field()
  vaiheId: string
  @Field()
  ehdotusId: string
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
  token: string
  @Field()
  ehdotus: string
  @Field()
  ehdottajaId: string
  @Field()
  vaiheId: string
}