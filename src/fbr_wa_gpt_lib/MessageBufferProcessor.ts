import WAWebJS, { Client } from "whatsapp-web.js";


export type IMessage = WAWebJS.Message;


export class MessageQueueProcessor {
    private messageQueue: IMessage[] = [];
    private isProcessing: boolean = false;
    client: Client;
    processMessageFn: ProcessMessageFunction

    constructor(client: Client, _processMessageFn: ProcessMessageFunction) {
        this.client = client;
        this.processMessageFn = _processMessageFn;

        setInterval(() => {
            if (!this.isProcessing && this.messageQueue.length > 0) {
                console.log('Starting to process messages...');

                // Aqui se incia el procesamiento de los mensajes, cada 100ms.
                this.startProcessingQueue();
            }
        }, 100);
    }

    enqueueMessage(message: WAWebJS.Message): void {
        try {
            this.messageQueue.push(message);
            console.log('Messages added to the buffer');
        } catch (error) {
            console.error('Error processing event:', error);
        }
    }

    private async startProcessingQueue() {
        this.isProcessing = true;
        await this.processQueue();
        this.isProcessing = false;
    }

    private async processQueue() {
        // webhook event de nuevo mensaje
        console.log('Starting to process messages...');
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                // Aqui se procesa cada mensaje, El cual no debe ser esperado con await, para no detener proceseso de nodejs.
                const promise: Promise<void> = this.processMessageFn(message, this.client);
                promise.then(() => {
                    console.log('Message', message.id, 'has been processed.');
                }).catch((error) => {
                    console.error('Error processing message:', error);
                });
            }
        }
        console.log('All messages have been processed.');
    }

    // private async processMessage(message: IMessage): Promise<void> {
    //     await handleMessage(message, this.client);
    // }
}

type ProcessMessageFunction = (message: IMessage, client: Client) => Promise<void>;
