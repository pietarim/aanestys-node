const Vonage = require('@vonage/server-sdk')
require('dotenv').config({ path: "./src/.env" })

export function lahetaViesti() {

    const apiKey = process.env.apiKey
    const apiSecret = process.env.apiSecret

    const vonage = new Vonage({
        apiKey: apiKey,
        apiSecret: apiSecret
    })

    const from = "Pietsk"
    const to = "358449718056"
    const text = 'Haduuken'

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
