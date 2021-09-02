import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
require('dotenv').config({ path: "./src/.env" })
const mongoose = require("mongoose")

/* import { TapahtumaResolver, TunnusResolver } from './resolver/tapahtuma-resolver' */
import { TapahtumaResolver, testiResolver } from "./resolver/multi-resolver";
/* import { TapahtumaResolver, Tapahtuma1Resolver } from "./resolvers/tapahtuma-resolver"; */
import { Server } from "http";

console.log(process.env.salaisuus)

const uri = process.env.url
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    useFindAndModify: false
}).catch(err => console.log(err.reason))

async function bootstrap() {

    const schema = await buildSchema({
        resolvers: [TapahtumaResolver, testiResolver,/* , TunnusResolver */]
    })

    const server = new ApolloServer({ schema })

    const { url } = await server.listen(4000)
    console.log(`Server is running, GraphQL Sandbox available at ${url}`)

}

/* 
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaa
aaaaaaaaaaaaaaa
aaaaaaaaaaaaa
 */

bootstrap()