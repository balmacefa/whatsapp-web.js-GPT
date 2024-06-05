// this map chat_id with is processing a message
const chatProcessingState = new Map<string, boolean>();


// this function await for n milliseconds before continue
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function getOrCreateChatProcessingState(chat_id: string): boolean {
    const default_value = false;
    const p = chatProcessingState.get(chat_id);
    if (!p) {
        chatProcessingState.set(chat_id, default_value);
    }
    return p || default_value;
}

export function setChatProcessingState(chat_id: string): void {
    chatProcessingState.set(chat_id, true);
}

export async function clearChatProcessingState(chat_id: string): Promise<void> {
    await sleep(500);
    chatProcessingState.delete(chat_id);
}