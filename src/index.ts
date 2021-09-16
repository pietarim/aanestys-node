import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
require('dotenv').config({ path: "./src/.env" })
import * as express from "express";
import * as cookieParser from "cookie-parser"
const mongoose = require("mongoose")
import * as cors from "cors"
import { kirjautuminenRouter, accesTokenRouter, removeCookieRouter, viestiRouter } from "./router/router";
import { TapahtumaResolver } from "./resolver/multi-resolver";
import { Server } from "http";

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
}

console.log(process.env.salaisuus)

const app = express()
app.use(express.json())

app.use(cookieParser())

app.use(cors(corsOptions))

app.use(kirjautuminenRouter)
app.use(accesTokenRouter)
app.use(removeCookieRouter)
app.use(viestiRouter)


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
        resolvers: [TapahtumaResolver]
    })

    const server = new ApolloServer({ schema })

    const { url } = await server.listen(4000)
    console.log(`Server is running, GraphQL Sandbox available at ${url}`)

}

bootstrap()