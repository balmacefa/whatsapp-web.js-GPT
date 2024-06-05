import { clients_config } from "../configs";
import { db_user } from "./UserContext";


export type ClientConfig = {
    mode: 'assistant' | 'menu';
    assistant: string;
    menu: MenuLocation;
    user_menu_map?: { [key: string]: MenuLocation };
    default_response_style: db_user["set_response_style"];
}

export type MenuLocation = {
    menu_key: string;
    display: string;
    options: MenuOption[];
};

export type MenuActionBase = {
    display: string;
    action_key: string;
    action_type: string;
};
export type MenuAction_SETTINGS = MenuActionBase & {
    display: string;
    action_key: string;
    action_type: "SETTINGS"
};
export type MenuAction_GPT = MenuActionBase & {
    action_type: "GPT";
    gpt_initial_msg: string;
};
export type MenuAction = MenuAction_SETTINGS | MenuAction_GPT;
export type MenuOption = MenuLocation | MenuAction;


// is menu_key
export function isMenuLocation(obj: any): obj is MenuLocation {
    return obj && typeof obj === 'object' && 'menu_key' in obj && 'display' in obj && 'options' in obj;
}

export function isMenuAction(obj: any): obj is MenuAction {
    return obj && typeof obj === 'object' && 'action_key' in obj && 'action_type' in obj;
}


// is MenuAction_GPT
export function isMenuAction_GPT(obj: any): obj is MenuAction_GPT {
    return isMenuAction(obj) && obj.action_type === 'GPT';
}

// is MenuAction_GPT
export function isMenuAction_Settings(obj: any): obj is MenuActionBase {
    return isMenuAction(obj) && obj.action_type === 'SETTINGS';
}


export function getClientAssistantId(): string | null {
    if (clients_config.mode === 'assistant') {
        return clients_config.assistant;
    } else {
        return null;
    }
}

export function get_menu_locations_for_userContext(
    userContext_id: string,
): MenuLocation {
    if (clients_config && 'menu' in clients_config) {
        const menu = clients_config.menu;
        if (clients_config.user_menu_map) {
            const user_menu_map = clients_config.user_menu_map;
            const menu = user_menu_map[userContext_id];
            if (menu) {
                return menu;
            }
        }
        return menu;
    } else {
        console.error(`Client not found:`);
        throw new Error(`Developer Error Client not found:`);
    }
}


/**
 * Represents a menu location.
 */

/**
 * Builds a menu message based on the provided menu location and user context.
 * @param menu The menu object containing the menu options.
 * @param menu_location The key of the menu location to display.
 * @param userContext The user context object.
 * @returns The constructed menu message.
 */
export function buildMenuMessage(menu: MenuLocation, menu_location: string,
    userContext: db_user
): string {

    const location = getMenuLocationByKey(menu, menu_location);
    if (!location) return 'Menu not found';

    let message = location.menu_key + '\n\n' + location.display + '\n';
    if (location.options) {
        location.options.forEach((option, index) => {
            message += `\n*${String.fromCharCode('a'.charCodeAt(0) + index).toUpperCase()}* -> ${option.display.trim()}\n`;
        });

        // Add a back option if not in the main menu
        if (menu_location !== 'main') {
            message += '\n*X* -> _Regresar_\n';
        } else if (userContext.active_chat.asistant_id) {
            // salir del menu y cambiar a modo asistente
            message += '\n*X* -> _Cerrar Menú y Cambiar a Modo Asistente_\n';
        }
        // add feedback UX text
        message += '\n *Escriba la letra correspondiente para seleccionar una opción.*';

    }

    return message;
}



/**
 * Selects an option from a menu based on the provided parameters.
 * @param menu The menu object containing the options.
 * @param menu_location The current location in the menu.
 * @param abc_option The selected option from the menu.
 * @returns An object representing the selected option, or undefined if the option is not found.
 */
export function userSelectOption(menu: MenuLocation, menu_location: string, abc_option: string): UserSelectOption {
    const location = getMenuLocationByKey(menu, menu_location);
    if (!location) return undefined;

    // if abc_option is x, go back to the previous menu location by removing the last part of the key
    if (abc_option.toLowerCase() === 'x') {

        if (menu_location === 'main') {
            return { type: 'options', key: 'main' }
        };

        const parts = menu_location.split(':');
        parts.pop();
        return { type: 'options', key: parts.join(':') };
    }

    const index: number = abc_option.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);

    const selectedOption = location.options?.[index];
    if (!selectedOption) return undefined;

    if (isMenuAction(selectedOption)) {
        return { type: 'action', action: selectedOption };
    } else if ('options' in selectedOption) {

        return { type: 'options', key: selectedOption.menu_key };

    }

    return undefined;
}

export type UserSelectOption__action = {
    type: 'action';
    action: MenuAction;
};

export type UserSelectOption__options = {
    type: 'options';
    key: string;
};

export type UserSelectOption = UserSelectOption__action | UserSelectOption__options | undefined;


/**
 * Retrieves a menu location by its key from a given menu object.
 * 
 * @param menu - The menu object to search in.
 * @param menu_location - The key of the menu location to retrieve.
 * @returns The menu location object if found, otherwise undefined.
 */
export function getMenuLocationByKey(menu: MenuLocation, menu_location: string): MenuLocation | undefined {
    if (!menu) return undefined;

    if ('options' in menu && menu.menu_key === menu_location) return menu;

    if (menu_location === '') return menu;

    // Check options directly in the menu location
    const option = menu.options?.find((opt) => {
        if (isMenuLocation(opt)) {
            return opt.menu_key === menu_location;
        } else { return false; }
    });

    // Check options directly in the menu location
    if (isMenuLocation(option)) return option;

    // Check options within nested content recursively
    for (const subOption of menu.options || []) {
        if ('options' in subOption) {
            const nestedOption = getMenuLocationByKey(subOption, menu_location);
            if (nestedOption) return nestedOption;
        }
    }

    return undefined;
}

