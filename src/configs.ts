import { ClientConfig, MenuLocation } from "./fbr_wa_gpt_lib/menu_utils";

export const menu_locations_es: MenuLocation = {
    menu_key: 'menu',
    display: "📄 Main Menu 🤖\n Select your Chat GPT assistant.\nSending the *letter* corresponding to the menu option:",
    options: [
        {
            menu_key: 'menu:sub_menu_1',
            display: 'Sub Menu 1',
            options: [
                {
                    display: '📚 GPT 01',
                    // https://platform.openai.com/assistants/asst_01aaabbbccc
                    action_key: 'asst_01aaabbbccc',
                    action_type: 'GPT',
                    gpt_initial_msg: 'Start the conversation with Chat GPT assistant 01'
                },
            ]
        },
        {
            display: '📚 GPT 02',
            // https://platform.openai.com/assistants/asst_01aaabbbccc
            action_key: 'asst_02aaabbbccc',
            action_type: 'GPT',
            gpt_initial_msg: 'Start the conversation with Chat GPT assistant 02'
        },
        // settings
        {
            menu_key: 'menu:settings',
            display: '⚙️ Configure response by: \nText and/or audio',
            options: [
                {
                    display: 'Text',
                    action_key: 'set_response_style:text',
                    action_type: 'SETTINGS',
                },
                {
                    display: 'Audio',
                    action_key: 'set_response_style:audio',
                    action_type: 'SETTINGS',
                },
                {
                    display: 'Text + Audio',
                    action_key: 'set_response_style:text_audio',
                    action_type: 'SETTINGS',
                },
                {
                    display: 'Audio + Text',
                    action_key: 'set_response_style:audio_text',
                    action_type: 'SETTINGS',
                },
            ]
        }
    ]
};



// set mode to 'menu' to use menu system, 'assistant' to use one assistant directly
export const clients_config: ClientConfig = {
    mode: 'menu', // 'menu' or 'assistant'
    menu: menu_locations_es,
    user_menu_map: {
        '###@c.us': menu_locations_es
    },
    assistant: 'asst_01aaabbbccc',
    default_response_style: 'text_audio',
}
