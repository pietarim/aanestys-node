import { ObjectType, Field, InputType } from "type-graphql"

@InputType()
export class TunnistautuminenInput {
    @Field()
    tunnus: string
}

@ObjectType()
export class Tunnus {
    @Field()
    tunnus: string
}