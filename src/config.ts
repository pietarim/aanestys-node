require('dotenv').config({ path: "./src/.env" })

export const PORT = process.env.PORT
export const GQL_PORT = process.env.GQL_PORT

export const VERSIO = process.env.NODE_ENV === "kehitys"
  ? "kehitys"
  : "tuotanto"

export const DB_INTERVALLI = process.env.NODE_ENV === "kehitys"
  ? 6000
  : 21600000

export const DB_TAPAHTUMA_VOIMASSA = process.env.NODE_ENV === "kehitys"
  ? 10800000
  : 604800000