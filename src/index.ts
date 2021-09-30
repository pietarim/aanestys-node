import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
require('dotenv').config({ path: "./src/.env" })
import * as express from "express";
import * as cookieParser from "cookie-parser"
const mongoose = require("mongoose")
import * as cors from "cors"
import { kirjautuminenRouter, accesTokenRouter, removeCookieRouter } from "./router/router";
import { kaikkiPoisRouter, findOneRouter } from "./router/kehitysRouter"
import { TapahtumaResolver } from "./resolver/multi-resolver";
import service from "./db/serviceV2"
import { ErrorInterceptor } from "./middleware/error-logger"

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
}

setInterval(() => {
    service.vanhentuneenPoistaminen()
    /* intervalli pistäisi olla 6 tuntia */
}, 6000/* 21600000 */)

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors(corsOptions))
app.use(kirjautuminenRouter)
app.use(accesTokenRouter)
app.use(removeCookieRouter)
app.use(kaikkiPoisRouter)
app.use(findOneRouter)


const uri = process.env.url
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    useFindAndModify: false
}).catch(err => console.log(err.reason))

app.listen(3001, () => {
    console.log("express on käynnistynyt")
})

async function bootstrap() {

    const schema = await buildSchema({
        resolvers: [TapahtumaResolver],
        globalMiddlewares: [ErrorInterceptor]
    })

    const server = new ApolloServer({ schema })

    const { url } = await server.listen(4000)
    console.log(`Server is running, GraphQL Sandbox available at ${url}`)
}

bootstrap()