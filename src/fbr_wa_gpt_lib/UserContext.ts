import { clients_config } from '../configs';
import { OpenAIAssistantWrapperV2 } from "./openai";

export type db_user = {
    id: string;
    mode: 'Menu' | 'Assistant';
    menu_location: string;
    active_chat:
    {
        assistant_runnable?: OpenAIAssistantWrapperV2;
        asistant_id: string;
    },
    set_response_style: "text" | "audio" | "text_audio" | "audio_text";
};


let users: { [key: string]: db_user } = {};



export type type_getUserContext = {
    userId: string;
    asistant_id: string;
    mode: 'Menu' | 'Assistant';
}

export function getUserContext(args: type_getUserContext) {
    const { userId, asistant_id, mode } = args;
    if (!users[userId]) {
        users[userId] = {
            id: userId,
            mode: mode,
            menu_location: '',
            active_chat: {
                asistant_id: asistant_id,
                assistant_runnable: undefined,
            },
            set_response_style: clients_config.default_response_style
        }; // Default mode
    }
    return users[userId];
}

export function updateUser(userId: string, update: Partial<db_user>): Promise<db_user> {
    users[userId] = { ...users[userId], ...update };
    return Promise.resolve(users[userId]);
}