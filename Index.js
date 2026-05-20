const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Mengambil variabel dari Railway/Server
const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function startBot() {
    // Sesi disimpan di folder auth_info
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Bot CS Pintar", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startBot(); // Reconnect otomatis jika putus
            }
        } else if (connection === 'open') {
            console.log('Bot Sudah Terhubung!');
        }
    });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && msg.message?.conversation) {
            // Ambil data panduan dari link Google Drive
            let panduan = "Kamu adalah CS yang ramah.";
            try {
                const response = await axios.get(process.env.LINK_DATA_DRIVE);
                panduan = response.data;
            } catch (err) {
                console.log("Gagal ambil data Drive, pakai mode default.");
            }

            const prompt = `Panduan CS: ${panduan}. Pertanyaan pelanggan: ${msg.message.conversation}`;
            const result = await model.generateContent(prompt);
            await sock.sendMessage(msg.key.remoteJid, { text: result.response.text() });
        }
    });
}

startBot();
