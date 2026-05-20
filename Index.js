const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function connectToWhatsApp() {
    // Membuat sesi autentikasi agar bot tidak perlu scan ulang setiap kali restart
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }), // Menyembunyikan log error yang tidak perlu
        auth: state,
        browser: ['Bot CS Pintar', 'Chrome', '1.0.0'], // Identitas bot di WhatsApp
    });

    // Menangani proses pairing code jika bot belum terhubung
    if (!sock.authState.creds.registered) {
        const phoneNumber = '628xxxxxxxxxx'; // <-- GANTI dengan nomor WA Anda (contoh: 628123456789)
        
        // Jeda waktu agar sistem stabil sebelum meminta kode
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("--------------------------------------------------");
            console.log("KODE PAIRING WHATSAPP ANDA: " + code);
            console.log("--------------------------------------------------");
        }, 5000);
    }

    // Menangani update koneksi (koneksi putus/terhubung)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Koneksi terputus, mencoba menghubungkan kembali...');
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Bot berhasil terhubung ke WhatsApp!');
        }
    });

    // Menyimpan kredensial agar login tidak hilang
    sock.ev.on('creds.update', saveCreds);
}

// Menjalankan fungsi utama
connectToWhatsApp();

