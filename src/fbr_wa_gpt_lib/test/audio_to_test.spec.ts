import path from "path";
import TextOrSpeech from "../TextOrSpeech/TextOrSpeech";
import { isProblemDetails } from "../TS_Error";

describe('TextOrSpeech', () => {
    let textOrSpeech: TextOrSpeech;

    beforeEach(() => {
        textOrSpeech = new TextOrSpeech();
    });

    describe('SpeechToText', () => {
        it('should transcribe audio file to text', async () => {
            const mp3FilePath = path.join(__dirname, 'ttsmaker-italian-01.mp3');
            const expectedTranscription = "Se volete partecipare a maggio si svolgeranno delle gare di muoto qui in piscina.\n";

            const transcription = await textOrSpeech.SpeechToText(mp3FilePath);

            if (isProblemDetails(transcription)) {
                // fail the test if the transcription is a ProblemDetails object

                // Log the error message
                console.error(`Failed to transcribe audio file:: ${transcription}`);
            }
            expect(transcription).toBe(expectedTranscription);
        });


        it('should return ProblemDetails object if the audio file is not found', async () => {
            const mp3FilePath = path.join(__dirname, 'non-existent-file.mp3');

            const transcription = await textOrSpeech.SpeechToText(mp3FilePath);

            expect(isProblemDetails(transcription)).toBe(true);
        });

    });

});