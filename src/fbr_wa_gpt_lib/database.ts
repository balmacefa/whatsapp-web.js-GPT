// import { DatabaseSupport } from '@balmacefa/function_tool_kit/src/ChatHTMX/DB/FBR_ChatDBSupport';
// import { MaybePromise } from '@balmacefa/function_tool_kit/src/types';
// import mongoose from 'mongoose';
// import { z } from 'zod';

// export const UserZodSchema = z.object({
//     whatsapp_user_id: z.string().optional(),
//     telegram_user_id: z.string().optional(),
//     current_assistant_id: z.string().optional(),
//     current_chat_id: z.string().optional(),
// });

// export type UserZodSchema_type = z.infer<typeof UserZodSchema>;

// export const UserSchema = new mongoose.Schema<UserZodSchema_type>({
//     whatsapp_user_id: { type: String, required: false },
//     telegram_user_id: { type: String, required: false },
//     current_assistant_id: { type: String, required: false },
//     current_chat_id: { type: String, required: false },
// });


// export class User_DBSupport extends DatabaseSupport<UserZodSchema_type> {

//     static get_collection_name(): string {
//         return 'internal_chat_users';

//     }
//     get_collection_name(): string {
//         return User_DBSupport.get_collection_name();
//     }

//     get_collection_schema(): MaybePromise<mongoose.Schema<UserZodSchema_type>> {
//         return UserSchema; // Assuming FiscaliaSchema is imported or defined within this context
//     }

//     async get_or_create_whatsapp_user(whatsapp_user_id: string): Promise<UserZodSchema_type> {
//         const found = await this.get_one_by_query({ whatsapp_user_id });
//         if (found) {
//             return found;
//         }
//         const new_user = this.create_one({ whatsapp_user_id });
//         return new_user;
//     }

// }


// // AI assistant schema, title, instructions, openapi schema tools. files_knowledge
// export const AssistantZodSchema = z.object({
//     title: z.string(),
//     instructions: z.string(),
//     openapi_schema: z.array(z.string()),
//     open_ai_files: z.array(z.string()),
// });


// export type AssistantZodSchema_type = z.infer<typeof AssistantZodSchema>;

// export const AssistantSchema = new mongoose.Schema<AssistantZodSchema_type>({
//     title: { type: String, required: true },
//     instructions: { type: String, required: true },
//     openapi_schema: { type: [String], required: true },
//     open_ai_files: { type: [String], required: true },
// });

// export class Assistant_DBSupport extends DatabaseSupport<AssistantZodSchema_type> {

//     static get_collection_name(): string {
//         return 'internal_chat_assistants';
//     }

//     get_collection_name(): string {
//         return Assistant_DBSupport.get_collection_name();
//     }

//     get_collection_schema(): MaybePromise<mongoose.Schema<AssistantZodSchema_type>> {
//         return AssistantSchema; // Assuming FiscaliaSchema is imported or defined within this context
//     }


// }







// // this is the link between the user and the assistant, so this saves the user_id and the assistant_id, allong with the thread_id

// export const ChatZodSchema = z.object({
//     user_id: z.string(),
//     assistant_id: z.string(),
//     thread_id: z.string().optional(),
// });

// export type ChatZodSchema_type = z.infer<typeof ChatZodSchema>;

// export const ChatSchema = new mongoose.Schema<ChatZodSchema_type>({
//     user_id: { type: String, required: true },
//     assistant_id: { type: String, required: true },
//     thread_id: { type: String, required: false },
// });

// export class Chat_DBSupport extends DatabaseSupport<ChatZodSchema_type> {

//     static get_collection_name(): string {
//         return 'internal_chat_chats';
//     }

//     get_collection_name(): string {
//         return Chat_DBSupport.get_collection_name();
//     }

//     get_collection_schema(): MaybePromise<mongoose.Schema<ChatZodSchema_type>> {
//         return ChatSchema; // Assuming FiscaliaSchema is imported or defined within this context
//     }

//     async get_or_create_chat(user_id: string, assistant_id: string): Promise<ChatZodSchema_type> {
//         const found = await this.get_one_by_query({ user_id, assistant_id });
//         if (found) {
//             return found;
//         }
//         const new_user = this.create_one({ user_id, assistant_id });
//         return new_user;
//     }

//     async update_session_threadId(id: string, threadId: string | null) {
//         await this.dbModel.findByIdAndUpdate(id, { threadId });
//     }

// }