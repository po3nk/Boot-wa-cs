const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Bot CS', 'Chrome', '1.0.0'],
    });

    // Bagian ini akan memunculkan kode 8 digit di log
    if (!sock.authState.creds.registered) {
        const phoneNumber = '6281215427766'; // <--- GANTI dengan nomor WA Anda (contoh: 628123456789)

        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("--------------------------------------------------");
            console.log("MASUKKAN KODE INI DI WHATSAPP ANDA: " + code);
            console.log("--------------------------------------------------");
        }, 5000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('Bot berhasil terhubung ke WhatsApp!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();
