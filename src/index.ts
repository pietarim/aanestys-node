import "reflect-metadata"
import { ApolloServer } from "apollo-server"
import { buildSchema } from "type-graphql"
import * as express from "express"
import * as cookieParser from "cookie-parser"
const mongoose = require("mongoose")
import * as cors from "cors"
import { kirjautuminenRouter, accesTokenRouter, removeCookieRouter } from "./router/router"
import { kaikkiPoisRouter, findOneRouter } from "./router/kehitysRouter"
import { TapahtumaResolver } from "./resolver/multi-resolver"
import service from "./db/serviceV2"
import { ErrorInterceptor } from "./middleware/error-logger"
import { PORT, GQL_PORT, VERSIO, DB_INTERVALLI } from "./config"

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
}

setInterval(() => {
  service.vanhentuneenPoistaminen()
  /* intervalli pistäisi olla 6 tuntia */
}, DB_INTERVALLI)

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors(corsOptions))
app.use("/api", kirjautuminenRouter)
app.use("/api", accesTokenRouter)
app.use("/api", removeCookieRouter)
app.use("/api", kaikkiPoisRouter)
app.use("/api", findOneRouter)


const uri = process.env.url
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  useFindAndModify: false
}).catch(err => console.log(err.reason))

app.listen(PORT, () => {
  console.log("express on käynnistynyt")
})

async function bootstrap() {

  const schema = await buildSchema({
    resolvers: [TapahtumaResolver],
    globalMiddlewares: [ErrorInterceptor]
  })

  const server = new ApolloServer({ schema })

  const { url } = await server.listen(GQL_PORT)
  if (VERSIO === "kehitys") {
    console.log("kehtysversio käynnissä")
  }
  console.log(`Server is running, GraphQL Sandbox available at ${url}`)
}

bootstrap()