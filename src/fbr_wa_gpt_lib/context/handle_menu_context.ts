import WAWebJS, { Client } from "whatsapp-web.js";
import { buildMenuMessage, get_menu_locations_for_userContext, isMenuAction_GPT, isMenuAction_Settings, MenuAction_GPT, UserSelectOption, userSelectOption, UserSelectOption__action } from "../menu_utils";
import { db_user, updateUser } from "../UserContext";

/**
 * Handles the user context menu for messages.
 * @param client - The client object for sending messages.
 * @param message - The message object received from the user.
 * @param chat - The chat object associated with the message.
 * @param userContext - The user context object containing user-specific information.
 * @returns A promise that resolves when the menu handling is complete.
 */


export async function handle_message_user_context_menu(client: Client,
    message: WAWebJS.Message, chat: WAWebJS.Chat, userContext: db_user): Promise<void> {

    if (userContext.mode !== 'Menu') {
        // Invalid mode
        console.log('Invalid mode, skipping menu mode.');
        return;
    }

    // wait emoji
    await message.react('⏳');

    // base of the user context . menu location, display the message and options, and handle the user's response
    // to either change the menu location or perform an action.
    // menu options will be displayed as text buttons in the chat message mapeed to a, b, c,d,... to select and option to continue.
    const user_selected_option = message.body.toLowerCase();

    if (user_selected_option === 'x'
        && userContext.active_chat.asistant_id
        && (userContext.menu_location === '' || userContext.menu_location === 'menu')) {

        userContext.mode = 'Assistant';
        await updateUser(userContext.id, userContext);

        // Send a message to the user to confirm the action
        await client.sendMessage(message.from, "Cambiado a modo asistente. Puede escribir 'menu' para cambiar de modo.");

        await message.react('✅');
        return;
    }

    // Here we are in menu mode
    // Get the current menu location
    if (userContext.menu_location === '') {
        // Set the menu location to the menu menu
        userContext.menu_location = 'menu';
        await updateUser(userContext.id, { menu_location: userContext.menu_location });

        // set the Initial menu location message
        const menu_message = buildMenuMessage(
            get_menu_locations_for_userContext(userContext.id),
            userContext.menu_location,
            userContext
        );

        await client.sendMessage(message.from, menu_message);
        await message.react('✅');
        return;
    } else {
        // At this point, the menu menu has been displayed and the user has to selected an option.
        const result: UserSelectOption = userSelectOption(
            get_menu_locations_for_userContext(userContext.id),
            userContext.menu_location,
            user_selected_option
        );

        // lets check if this is a valid option, if is a letter from a to z or A to Z, include a. and A.
        if (!result) {
            // Invalid option
            await message.react('❌');

            await client.sendMessage(message.from, "❌ Opción inválida. Intente de nuevo 🔄");
            // show the menu again
            const menu_message: string = buildMenuMessage(
                get_menu_locations_for_userContext(userContext.id),
                userContext.menu_location,
                userContext
            );
            await client.sendMessage(message.from, menu_message);

            return;
        }

        if (result.type === 'options') {
            // Update the user context with the new menu location
            userContext.menu_location = result.key;
            updateUser(userContext.id, { menu_location: userContext.menu_location });

            const menu_message = buildMenuMessage(
                get_menu_locations_for_userContext(userContext.id),
                userContext.menu_location,
                userContext
            );

            await client.sendMessage(message.from, menu_message);
            await message.react('✅');
            return;
        } else if (result.type === 'action') {
            // Perform the action
            // Update the user context with the new menu location
            if (isMenuAction_GPT(result.action)) {
                const gpt_action: MenuAction_GPT = result.action;
                userContext.menu_location = '';
                userContext.mode = 'Assistant';
                userContext.active_chat.asistant_id = gpt_action.action_key;
                userContext.active_chat.assistant_runnable = undefined;

                await updateUser(userContext.id, userContext);

                // Send a message to the user to confirm the action
                // send a message to the user to tell them to start the conversation with the assistant
                await client.sendMessage(message.from, "Escriba un mensaje para iniciar la conversación con el asistente.");
                await client.sendMessage(message.from, gpt_action.gpt_initial_msg);
                await message.react('✅');
            } else if (isMenuAction_Settings(result.action)) {
                await handler_settings_actions(
                    result,
                    userContext,
                    client,
                    message);
                await message.react('✅');
            }
        }
    }
}


async function handler_settings_actions(
    result: UserSelectOption__action,
    userContext: db_user,
    client: Client,
    message: WAWebJS.Message
) {
    if (result.action.action_key.includes('set_response_style')) {
        userContext.set_response_style = result.action.action_key.split(':')[1] as db_user['set_response_style'];
        await updateUser(userContext.id, { set_response_style: userContext.set_response_style });
        await client.sendMessage(message.from, "Estilo de respuesta actualizado.");
        // show the menu again
        // update the menu location to the menu menu
        userContext.menu_location = '';
        await updateUser(userContext.id, { menu_location: userContext.menu_location });
        const menu_message: string = buildMenuMessage(
            get_menu_locations_for_userContext(userContext.id),
            userContext.menu_location,
            userContext
        );
        await client.sendMessage(message.from, menu_message);
        return;
    }
}

