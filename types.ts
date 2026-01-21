
export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export interface GeneratedAudio {
  id: string;
  text: string;
  voice: string;
  audioBuffer: AudioBuffer;
  timestamp: number;
}

export enum Emotion {
  NEUTRAL = 'সাধারণ',
  HAPPY = 'খুশি',
  SAD = 'দুঃখিত',
  EXCITED = 'উত্তেজিত',
  CALM = 'শান্ত',
}
