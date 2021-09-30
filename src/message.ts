const Vonage = require('@vonage/server-sdk')
require('dotenv').config({ path: "./src/.env" })

export function LuoMsm(tapahtuma, numero) {
    let viesti = `Tapahtuma ${tapahtuma.otsikko} vastaanottajan numero ${numero} luotu. Osallistujien tunnukset:
`
    let msmOsallistujalle = ""
    tapahtuma.osallistujat.forEach(osallistuja => {
        msmOsallistujalle += `Tunnus: ${osallistuja.nimi} kirjautuminen: ${process.env.clientUrlTest}/?k=${osallistuja.salasana}&t=${tapahtuma.salasana}
`
    });
    viesti += msmOsallistujalle
    console.log('VIESTI VIESTI VIESTI VIESTI')
    console.log(viesti)
    /* lahetaViesti(viesti, numero) */
    /* tulevaisuudessa lahetaViesti() niin lähtee tekstiviesti eteenpäin */
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
            console.log(err);
        } else {
            if (responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })
}
