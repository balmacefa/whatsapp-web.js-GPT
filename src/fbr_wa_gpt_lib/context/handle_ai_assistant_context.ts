// handle_message_assistant_context.ts

import WAWebJS, { Client, MessageMedia, MessageTypes } from "whatsapp-web.js";
import { OpenAIAssistantWrapperV2 } from "../openai";
import TextOrSpeech from "../TextOrSpeech/TextOrSpeech";
import { isProblemDetails } from "../TS_Error";
import { db_user } from "../UserContext";

const _TextOrSpeech = new TextOrSpeech();


/**
 * Handles the incoming message in the Assistant mode for a specific user context.
 * 
 * @param client - The client object used to send messages.
 * @param message - The incoming message object.
 * @param chat - The chat object associated with the message.
 * @param userContext - The user context object containing the user's information.
 * @returns A Promise that resolves to void.
 */
export async function handle_message_user_context_assistant(client: Client, message: WAWebJS.Message, chat: WAWebJS.Chat, userContext: db_user): Promise<void> {

    const uuid_request = message.id._serialized;

    if (userContext.mode !== 'Assistant') {
        // Invalid mode
        console.error('Entered Assistant mode with invalid mode for user:', userContext);
        return;
    }

    console.log('handle_message_user_context_assistant');
    message.react('⏳');
    // acknowledge the user that the message is being processed, by reacting to the message with a time emoji

    // At this point, we are in assistant mode and a assistant_id has been selected.
    // We can now send the message to the assistant and get the response.

    if (!userContext.active_chat.assistant_runnable) {
        console.log('Creating assistant for user:', userContext);
        userContext.active_chat.assistant_runnable = new OpenAIAssistantWrapperV2({
            assistantId: userContext.active_chat.asistant_id,
            name: 'Assistant',
            description: 'Assistant',
        });
    } else {
        console.log('Using existing assistant for user:', userContext);
    }


    const text_message: string = await get_message_text(message);
    const response_text: string = await execute_agent(userContext, text_message);


    const props = {
        response_text,
        client,
        message,
    }
    // check if user has audio response enabled
    switch (userContext.set_response_style) {
        case 'audio':
            await execute_response_audio(props);
            break;
        case 'text_audio':
            await execute_response_text(props);
            await execute_response_audio(props);
            break;
        case 'audio_text':
            await execute_response_audio(props);
            await execute_response_text(props);
            break;
        case 'text':
            await execute_response_text(props);
            break;
    }

    // acknowledge the user that the message has been processed, by reacting to the message with a check mark emoji
    console.log('Message handled successfully for', userContext.id, 'with context', userContext, 'and request', uuid_request);
    message.react('✅');

}


async function execute_response_text(args: {
    response_text: string,
    client: Client,
    message: WAWebJS.Message,
}): Promise<void | Error> {
    const { response_text, client, message } = args;
    try {
        // send the response to the user
        await client.sendMessage(message.from, response_text);
        console.log('Response sent:', response_text);

    } catch (error) {
        throw error;
    }
}

async function execute_response_audio(args: {
    response_text: string,
    client: Client,
    message: WAWebJS.Message,
}): Promise<void> {
    const { response_text, client, message } = args;

    // Create a promise that resolves in 3 minutes (180000 milliseconds)
    const ms_timeout = 3 * 60 * 1000;
    const fn_timeout = new Promise<string>((resolve) =>
        setTimeout(async () => {
            console.log('Timeout: Operation took longer than 3 minutes');
            resolve("TIMEOUT");
        }, ms_timeout)
    );

    try {
        const race_result: string = await Promise.race([
            (async () => {
                const ia_audio = await _TextOrSpeech.TextToSpeech({ input_text: response_text });
                const msg = new MessageMedia(ia_audio.mime_type, ia_audio.base64);
                await client.sendMessage(message.from, msg, { sendAudioAsVoice: true });
                console.log('Audio response sent!');
                return Promise.resolve("Audio response sent!");
            })(),
            fn_timeout
        ]);

        if (race_result === "TIMEOUT") {
            const msg = await client.sendMessage(message.from, "Ocurrio algo y no se pudo generar la respuesta de audio en el tiempo esperado.");
            await msg.react('🔇');
        }

        console.log(race_result);


    } catch (error) {
        console.error('Error:', error);
    }
}


async function execute_agent(
    user_context: db_user,
    content: string): Promise<string> {

    try {

        const assistant = user_context.active_chat.assistant_runnable;
        if (!assistant) {
            console.error('No assistant found in user context:', user_context);
            throw new Error('No assistant found in user context');
        }
        console.log('Executing agent with content:', content);


        await assistant.execute_agent(content);

        const response: string = await assistant.get_last_message_string();
        return response;
    } catch (error) {
        console.error('Error executing agent:', error);
        throw error;
    }

}


async function get_message_text(message: WAWebJS.Message): Promise<string | never> {

    console.log('Getting message text, from message body or voice message');
    if (message.type === MessageTypes.VOICE) {
        // TODO maybe add multiple voice message with wait time to concatenate them
        console.log('Voice message received');
        const media = await message.downloadMedia();

        const mp3_voice_file = await _TextOrSpeech.convertBase64_ogg_AudioToMP3(media.data);
        const voice_text = await _TextOrSpeech.SpeechToText(mp3_voice_file.mp3_file_path);

        if (isProblemDetails(voice_text)) {
            console.error('Failed to transcribe audio file:', voice_text);
            return Promise.resolve('');
        }

        console.log('Voice message transcribed:', voice_text);
        return Promise.resolve(voice_text);
    }
    console.log('Text message received');
    return Promise.resolve(message.body);
}
