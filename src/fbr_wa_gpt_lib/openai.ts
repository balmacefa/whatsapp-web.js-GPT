import OpenAI from "openai";

export interface AssistantManifest {
    assistantId: string;
    threadId?: string | null | undefined;
    name: string;
    description: string;
    functions?: Map<string, Function>;
}


export class OpenAIAssistantWrapperV2 {
    assistantId: string;
    threadId!: string;
    public open_ai_client: OpenAI;
    // private openAIFiles: OpenAIFiles;
    // this is a map of functions that can be called by the assistant
    private functions: Map<string, Function>;

    constructor(args: AssistantManifest) {
        this.assistantId = args.assistantId;
        this.threadId = args.threadId || "";
        this.functions = args.functions || new Map<string, Function>();
        this.open_ai_client = new OpenAI();
    }

    public async get_chat_messages(): Promise<OpenAI.Beta.Threads.Messages.MessagesPage> {
        const msgs = await this.open_ai_client.beta.threads.messages.list(this.threadId, { order: "asc" });
        return msgs;
    }

    public async get_last_message_string(): Promise<string> {
        const msgs = await this.get_chat_messages();
        const last_msg = msgs.data[msgs.data.length - 1];
        const msg_string: string = last_msg.content.map((content: OpenAI.Beta.Threads.Messages.MessageContent) => {
            if (content.type === "text") {
                // const citas = content.text.annotations.map((annotation: OpenAI.Beta.Threads.Messages.Annotation) => { 
                //     if (annotation.type === "file_citation") {
                //         const file_id = annotation.file_citation.file_id;
                //         return annotation.text
                //     }
                // });
                return content.text.value;
            }
            return "";
        }).join("");


        // TODO ADD documentos citados

        return msg_string;
    }

    private async createThread(): Promise<string> {
        const thread: OpenAI.Beta.Threads.Thread = await this.open_ai_client.beta.threads.create();
        return thread.id;
    }

    private async addMessageToThread(content: string): Promise<OpenAI.Beta.Threads.Message> {
        return await this.open_ai_client.beta.threads.messages.create(this.threadId, {
            role: "user",
            content: content,
        });
    }

    private async createRun(): Promise<OpenAI.Beta.Threads.Runs.Run> {
        return await this.open_ai_client.beta.threads.runs.create(this.threadId, {
            assistant_id: this.assistantId,
        });
    }

    private async handleToolCalls(tool_calls: any[], runObject: OpenAI.Beta.Threads.Runs.Run): Promise<void> {
        const promises = tool_calls.map(async (tool_call) => {
            console.log(`Tool call id: ${tool_call.id}`);
            console.log(`Tool type: ${tool_call.type}`);
            console.log(`Tool call function: ${tool_call.function.name}`);
            console.log(`Tool call function arguments: ${tool_call.function.arguments}`);

            const parsedArgs = JSON.parse(tool_call.function.arguments);
            const functionToCall: Function = this.functions.get(tool_call.function.name) || ((args: any) => {
                console.error(`Function not found: ${tool_call.function.name}`);
            });
            const response = await functionToCall(parsedArgs);
            console.log(`Function response: ${response}`);

            return this.open_ai_client.beta.threads.runs.submitToolOutputs(this.threadId, runObject.id, {
                tool_outputs: [
                    {
                        tool_call_id: tool_call.id,
                        output: JSON.stringify(response),
                    },
                ],
                stream: false,
            });
        });

        await Promise.all(promises);
    }

    private async checkStatus(runObject: OpenAI.Beta.Threads.Runs.Run): Promise<boolean> {
        runObject = await this.open_ai_client.beta.threads.runs.retrieve(this.threadId, runObject.id);
        if (runObject.status === 'completed') {
            console.log('Run completed');
            return true;
        } else if (runObject.status === 'requires_action' && runObject.required_action && runObject.required_action.type === 'submit_tool_outputs') {
            console.log('requires_action.. looking for a function');
            console.log('submit tool outputs ...');
            const tool_calls = runObject.required_action.submit_tool_outputs.tool_calls;

            await this.handleToolCalls(tool_calls, runObject);
        }
        return false;
    }

    public async execute_agent(content: string) {
        try {
            if (!this.threadId) {
                this.threadId = await this.createThread();
            }

            await this.addMessageToThread(content);
            let runObject = await this.createRun();

            while (!(await this.checkStatus(runObject))) {
                await new Promise(r => setTimeout(r, 100));
                runObject = await this.open_ai_client.beta.threads.runs.retrieve(this.threadId, runObject.id);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }
}

