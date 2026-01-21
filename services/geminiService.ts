
import { GoogleGenAI, Modality } from "@google/genai";
import { decodeBase64, decodeAudioData } from "../utils/audioHelpers";
import { Emotion } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-preview-tts';

export class GeminiTTSService {
  private ai: GoogleGenAI;
  private audioContext: AudioContext;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  async generateBengaliSpeech(text: string, voiceName: string, emotion: Emotion): Promise<AudioBuffer> {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please ensure it is configured.");
    }

    // Constructing the prompt to specify Bengali and emotion
    const prompt = `Say in Bengali (${emotion} style): ${text}`;

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("No audio data received from Gemini API.");
      }

      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, this.audioContext, 24000, 1);
      
      return audioBuffer;
    } catch (error: any) {
      console.error("TTS Generation Error:", error);
      throw error;
    }
  }

  getAudioContext() {
    return this.audioContext;
  }
}

export const ttsService = new GeminiTTSService();
