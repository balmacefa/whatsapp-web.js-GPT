import qrcode from 'qrcode-terminal';
import WAWebJS, { Client, LocalAuth, WAState } from 'whatsapp-web.js';
import { handleMessageWithMenu } from './message_handlers/handleMessageWithMenu';
import { MessageQueueProcessor } from './MessageBufferProcessor';


export async function main() {

    console.log('Hello, World!');

    const whatsappWebVersion = '2.2412.54';
    const client = new Client({
        puppeteer: {
            headless: true,
            args: ["--no-sandbox"],
        },
        authStrategy: new LocalAuth({
            clientId: "client_01"
        }),
        // authStrategy: new RemoteAuth({
        //   store: store,
        //   backupSyncIntervalMs: 60000,
        // }),
        webVersionCache: {
            type: 'remote',
            remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${whatsappWebVersion}.html`,
        }

    });

    client.on('ready', () => {
        console.log('Client is ready!');

        qrCounter = 0; // Reset QR counter when client is ready

        // envar un mensaje al desarrollador :)
        // client.sendMessage('####@c.us', 'Client is ready!');
    });

    client.on('remote_session_saved', () => {
        console.log('Remote session saved');
    });

    let qrCounter = 0;


    client.on('qr', (qr: string) => {
        qrcode.generate(qr, { small: true });
        qrCounter++;

        if (qrCounter > 4) {
            console.log('QR code generated more than 4 times, restarting client...');
            client.destroy().then(() => client.initialize());
        }
    });



    const messageBufferProcessor = new MessageQueueProcessor(client, handleMessageWithMenu);

    client.on('message', (message: WAWebJS.Message) => messageBufferProcessor.enqueueMessage(message));

    client.on('disconnected', (reason: WAState | "NAVIGATION") => {
        console.log('Client was logged out', reason);
        // Consider reinitializing or handling reconnection here
    });

    client.on('auth_failure', (msg: string) => {
        console.error('Authentication failure:', msg);
    });

    // Start the client
    client.initialize();

}
