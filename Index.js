const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Web server sederhana agar Render tidak mematikan bot
app.get('/', (req, res) => {
    res.send('Bot WhatsApp is Running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// --- KODE BOT ANDA ---
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Bot CS', 'Chrome', '1.0.0'],
    });

    // Pengecekan status pairing
    if (!sock.authState.creds.registered) {
        const phoneNumber = '6281215427766'; 

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log("--------------------------------------------------");
                console.log("MASUKKAN KODE INI DI WHATSAPP ANDA: " + code);
                console.log("--------------------------------------------------");
            } catch (err) {
                console.log("Gagal membuat pairing code, coba cek koneksi atau nomor.");
            }
        }, 5000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Bot berhasil terhubung ke WhatsApp!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();
