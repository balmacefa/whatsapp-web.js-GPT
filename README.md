# whatsapp-web.js-GPT

This project, `whatsapp-web.js-GPT`, integrates WhatsApp with OpenAI's GPT to provide a multilingual conversational interface. The key functionalities include connecting a personal user account with Chat GPT via WhatsApp, translating voice notes to text, and converting assistant text to audio responses.

## Key Features

1. **WhatsApp Integration**: Utilizing `whatsapp-web.js` to connect and interact with WhatsApp.
2. **OpenAI Integration**: Leveraging `openai` for chat completions, translating voice notes to text, and converting text to speech.
3. **Message Buffer Processing**: Implementing `MessageBufferProcessor` to handle multiple incoming messages without blocking the main thread of Node.js. This is crucial to ensure that the application can process a high volume of messages efficiently without performance degradation.


## Installation

To get started, clone the repository and install the dependencies:

```sh
git clone [https://github.com/your-username/WA_GPT_IDIOMAS.git](https://github.com/balmacefa/whatsapp-web.js-GPT/tree/main)
cd whatsapp-web.js-GPT
pnpm install
```

## Scripts

- `build`: Cleans the `dist` directory and compiles TypeScript files.
- `dev`: Starts the development server with environment variables and TypeScript support.
- `start`: Runs the compiled JavaScript files.
- `test`: Runs the test suite with coverage.
- `lint`: Lints the TypeScript and JavaScript files.
- `test-types`: Checks for type errors.

## Usage
Configuration
Clone the Repository:
Edit the Configuration File: Modify the `src/config.ts` file to set the mode to either menu or assistant and set the assistant's IDs.

```typescript
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
                    action_key: 'asst_01aaabbbccc',
                    action_type: 'GPT',
                    gpt_initial_msg: 'Start the conversation with Chat GPT assistant 01'
                },
            ]
        },
        {
            display: '📚 GPT 02',
            action_key: 'asst_02aaabbbccc',
            action_type: 'GPT',
            gpt_initial_msg: 'Start the conversation with Chat GPT assistant 02'
        },
        {
            menu_key: 'menu:settings',
            display: '⚙️ Configure response by: \nText and/or audio',
            options: [
                { display: 'Text', action_key: 'set_response_style:text', action_type: 'SETTINGS' },
                { display: 'Audio', action_key: 'set_response_style:audio', action_type: 'SETTINGS' },
                { display: 'Text + Audio', action_key: 'set_response_style:text_audio', action_type: 'SETTINGS' },
                { display: 'Audio + Text', action_key: 'set_response_style:audio_text', action_type: 'SETTINGS' },
            ]
        }
    ]
};

export const clients_config: ClientConfig = {
    mode: 'menu', // 'menu' or 'assistant'
    menu: menu_locations_es,
    user_menu_map: {
        '###@c.us': menu_locations_es
    },
    assistant: 'asst_01aaabbbccc',
    default_response_style: 'text_audio',
}
```
### Set Environment Variables:
Configure the .env-cmdrc file with necessary environment variables. If deploying using Docker, set the OPENAI_API_KEY environment variable.

### Docker Deployment:
Ensure a volume is mounted to /app/.wwebjs_auth to save the WhatsApp web browser session between deployments.

### Running the Application:
Once the app is deployed, a QR code will appear in the console. Scan this code using the WhatsApp "Link Device" feature. The client will then be ready for incoming messages.

## Contributing
Feel free to open issues or submit pull requests for any bugs or suggestions.

## License
This project is licensed under the ISC License.

This project is still under development. Contributions and feedback are welcome!

For more information, refer to the source code and the provided scripts.

## Contact

For any questions, suggestions, or support, feel free to reach out to me at:

**Email**: fabianbalmace2@gmail.com


