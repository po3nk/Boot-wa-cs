const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Bot CS Pintar', 'Chrome', '1.0.0'],
    });

    // Menangani proses pairing code jika bot belum terhubung
    if (!sock.authState.creds.registered) {
        const phoneNumber = '6281215427766'; // <--- GANTI dengan nomor WhatsApp bot Anda (format internasional, contoh: 628123456789)
        
        // Jeda waktu agar sistem stabil sebelum meminta kode
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("--------------------------------------------------");
            console.log("KODE PAIRING WHATSAPP ANDA: " + code);
            console.log("--------------------------------------------------");
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
