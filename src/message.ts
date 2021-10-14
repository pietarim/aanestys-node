const Vonage = require('@vonage/server-sdk')
require('dotenv').config({ path: "./src/.env" })
import { VERSIO } from "./config"

const urlViestiin = VERSIO === "kehitys" ? process.env.clientUrlTest : process.env.URL


export function LuoMsm(tapahtuma, numero) {
  let viesti = `Tapahtuma ${tapahtuma.otsikko} luotu. Osallistujien tunnukset:
`
  let msmOsallistujalle = ""
  tapahtuma.osallistujat.forEach(osallistuja => {
    msmOsallistujalle += `Tunnus: ${osallistuja.nimi} kirjautuminen: ${urlViestiin}/?k=${osallistuja.salasana}&t=${tapahtuma.salasana}
`
  })
  viesti += msmOsallistujalle
  if (VERSIO === "tuotanto") {
    lahetaViesti(viesti, numero)
  } else if (VERSIO === "kehitys") {
    console.log(viesti)
  }
}

export function lahetaViesti(viesti, numero) {

  const apiKey = process.env.apiKey
  const apiSecret = process.env.apiSecret

  const vonage = new Vonage({
    apiKey: apiKey,
    apiSecret: apiSecret
  })

  const from = "Pietsk"
  const to = numero
  const text = viesti

  vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
      console.log(err)
    } else {
      if (responseData.messages[0]['status'] === "0") {
        /* console.log("Message sent successfully."); */
      } else {
        console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`)
      }
    }
  })
}
