import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech";
import * as tmp from 'tmp';
import { ProblemDetails, StatusCode } from '../TS_Error';

// Ensure you have the types for fluent-ffmpeg. If not, you might need to use any as a fallback for its types.
// Function to convert Base64 audio to MP3, with automatic cleanup
export class TextOrSpeech {
    private openai: OpenAI;

    constructor(openai?: OpenAI) {
        this.openai = openai || new OpenAI();
    }

    public async SpeechToText(mp3_voice_file_path: string): Promise<string | ProblemDetails> {

        try {

            console.log("Transcribing audio file::", mp3_voice_file_path);

            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(mp3_voice_file_path),
                model: "whisper-1",
                response_format: "text",
            });

            if (typeof transcription === 'string' || transcription instanceof String) {
                return transcription as unknown as string;
            } else {
                return transcription.text;
            }
        } catch (error) {

            console.error("Failed to transcribe audio file::", mp3_voice_file_path, error);
            const problemDetails = new ProblemDetails({
                title: "Failed to transcribe audio.",
                detail: "An error occurred while transcribing the audio file, please try again later.",
                status: StatusCode.ServerErrorBadGateway,
                instance: `file::${mp3_voice_file_path}`,
                type: "#transcription_error",
            });

            return problemDetails;
        }
    }

    public async TextToSpeech(args: { input_text: string, voice_type?: SpeechCreateParams['voice'], hd_audio?: boolean }): Promise<{
        base64: string;
        mime_type: string;
    }> {
        const input_text = args.input_text;
        const voice_type = args.voice_type || "shimmer";
        const mp3 = await this.openai.audio.speech.create({
            model: args.hd_audio ? "tts-1-hd" : "tts-1",
            voice: voice_type,
            input: input_text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const base64 = buffer.toString('base64');
        return {
            base64,
            mime_type: "audio/mpeg",
        };
    }

    

    convertBase64_ogg_AudioToMP3(base64Audio: string): Promise<{ mp3_file_path: string, removeFile: () => void }> {
        const audioBuffer = Buffer.from(base64Audio, 'base64');
        const tempOggFile = tmp.fileSync({ postfix: '.ogg' });
        fs.writeFileSync(tempOggFile.name, audioBuffer);

        return new Promise((resolve, reject) => {
            const tempMp3File = tmp.tmpNameSync({ postfix: '.mp3' });
            ffmpeg(tempOggFile.name)
                .setFfmpegPath(ffmpegStatic as string)
                .toFormat('mp3')
                .on('error', (err) => {
                    console.error('An error occurred: ' + err.message);
                    tempOggFile.removeCallback();
                    reject(err);
                })
                .on('end', async () => {
                    console.log('Conversion finished!');
                    // const mp3Buffer = fs.readFileSync(tempMp3File);
                    tempOggFile.removeCallback();
                    // fs.unlinkSync(tempMp3File); // Cleanup MP3 temporary file

                    // // const mp3File = new File([mp3Buffer], "audio.mp3", { type: 'audio/mpeg', lastModified: new Date().getTime() });

                    // const mp3File = await toFile(mp3Buffer, 'audio.mp3');

                    resolve({ mp3_file_path: tempMp3File, removeFile: () => fs.unlinkSync(tempMp3File) });
                })
                .save(tempMp3File);
        });
    }

    deleteFile(file_path: string) {
        fs.unlinkSync(file_path);
    }
}

export default TextOrSpeech;
