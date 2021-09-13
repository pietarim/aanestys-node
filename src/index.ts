import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
require('dotenv').config({ path: "./src/.env" })
import * as express from "express";
/* const cookieParser = require("cookie-parser") */
import * as cookieParser from "cookie-parser"
const mongoose = require("mongoose")
import * as cors from "cors"
import { kirjautuminenRouter, accesTokenRouter } from "./router/router";
/* import { accessTokenRouter } from "./router/router" */


/* import { TapahtumaResolver, TunnusResolver } from './resolver/tapahtuma-resolver' */
import { TapahtumaResolver } from "./resolver/multi-resolver";
/* import { TapahtumaResolver, Tapahtuma1Resolver } from "./resolvers/tapahtuma-resolver"; */
import { Server } from "http";

console.log(process.env.salaisuus)

const app = express()
app.use(express.json())

app.use(cookieParser())

app.use(cors())

app.use(kirjautuminenRouter)
app.use(accesTokenRouter)

/* app.get("/", (req, res) => {

    console.log("expressi toimii")

}) */

const uri = process.env.url
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    useFindAndModify: false
}).catch(err => console.log(err.reason))

app.listen(3001, () => {
    console.log("tehty")
})

async function bootstrap() {

    const schema = await buildSchema({
        resolvers: [TapahtumaResolver /* , TunnusResolver */]
    })

    const server = new ApolloServer({ schema })

    const { url } = await server.listen(4000)
    console.log(`Server is running, GraphQL Sandbox available at ${url}`)

}

bootstrap()