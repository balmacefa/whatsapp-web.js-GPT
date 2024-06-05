import WAWebJS, { Client } from "whatsapp-web.js";
import { handle_message_user_context_assistant } from "../context/handle_ai_assistant_context";
import { handle_message_user_context_menu } from "../context/handle_menu_context";
import { getClientAssistantId } from "../menu_utils";
import { db_user, getUserContext, type_getUserContext, updateUser } from "../UserContext";
import { clearChatProcessingState, getOrCreateChatProcessingState, setChatProcessingState } from "./common";


/**
 * Handles incoming messages from the user.
 * 
 * @param message - The incoming message object.
 * @param client - The client object used to send messages.
 * @returns A Promise that resolves when the message is handled.
 */
export async function handleMessageWithMenu(message: WAWebJS.Message, client: Client): Promise<void> {

    // webhook event de nuevo mensaje

    console.log('Handling message From -> for send message later to this chat:', message.from);
    console.log('Handling message:', message);

    const chat: WAWebJS.Chat = await message.getChat();
    const userId = chat.id._serialized;

    let default_context: type_getUserContext = {
        userId: userId,
        asistant_id: '',
        mode: 'Menu'
    }
    const client_unique_assistant_id = getClientAssistantId();
    if (client_unique_assistant_id) {
        default_context.mode = 'Assistant';
        default_context.asistant_id = client_unique_assistant_id;
    }
    const userContext: db_user = getUserContext(default_context);

    const is_processing_chat: boolean = getOrCreateChatProcessingState(userId);

    if (is_processing_chat) {
        console.log('Chat is already processing a message, skipping, reacting with emoji of red circle');
        await message.react('🔴');
        return;
    } else {
        console.log('Chat is not processing a message, continuing...');

    }

    setChatProcessingState(userId);

    const requestUuid = message.id._serialized;

    console.log('Received message from', userId, 'with context', userContext, 'and request', requestUuid);
    console.log('Message type:', message.type);
    console.log('Message body:', message.body);

    // keywords to change

    try {

        if (message.body.toLowerCase() === 'menu') {
            userContext.mode = 'Menu';
            userContext.menu_location = '';
            await updateUser(userContext.id, userContext);
            await client.sendMessage(message.from, "Switched to Menu mode. Here are the options:");
        }

        if (userContext.mode === 'Menu') {
            // Invalid mode
            await handle_message_user_context_menu(
                client,
                message,
                chat,
                userContext
            );
        } else if (userContext.mode === 'Assistant') {
            await handle_message_user_context_assistant(client, message, chat, userContext);
        }

    } catch (error) {

        console.error('Error handling message:', error);
        // Send an error message to the user
        await client.sendMessage(message.from, "Error al procesar el mensaje. Intente de nuevo.");
    } finally {
        await clearChatProcessingState(message.from);
        console.log('Message handled successfully!');
    }

}
