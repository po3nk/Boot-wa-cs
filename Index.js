require('./keep_alive.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Bot CS', 'Chrome', '1.0.0'],
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = '6281215427766';
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("--------------------------------------------------");
            console.log("KODE PAIRING: " + code);
            console.log("--------------------------------------------------");
        }, 5000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Bot terhubung!');
        }
    });
    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();
