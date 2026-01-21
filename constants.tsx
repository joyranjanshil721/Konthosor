
import { VoiceOption, Emotion } from './types';

export const VOICES: VoiceOption[] = [
  { id: 'Kore', name: 'কাকন (মেয়ে)', description: 'Balanced and clear voice' },
  { id: 'Puck', name:  'পার্থ (ছেলে)', description: 'Youthful and energetic' },
  { id: 'Charon', name: 'জয় (ছেলে)', description: 'Deep and authoritative' },
  { id: 'Leda', name: 'হেমা (মেয়ে)', description: 'Soft and soothing' },
  { id: 'Fenrir', name: 'বাধন (ছেলে)', description: 'Strong and resonant' },
];

export const EMOTIONS: { label: string; value: Emotion }[] = [
  { label: 'সাধারণ (Neutral)', value: Emotion.NEUTRAL },
  { label: 'খুশি (Happy)', value: Emotion.HAPPY },
  { label: 'দুঃখিত (Sad)', value: Emotion.SAD },
  { label: 'উত্তেজিত (Excited)', value: Emotion.EXCITED },
  { label: 'শান্ত (Calm)', value: Emotion.CALM },
];

export const EXAMPLE_PHRASES = [
  "শুভ সকাল! আজ দিনটি আপনার জন্য কেমন কাটছে?",
  "বাংলার সংস্কৃতি ও ঐতিহ্য অত্যন্ত সমৃদ্ধ এবং বৈচিত্র্যময়।",
  "বই পড়া মানুষের মনকে আলোকিত করে এবং জ্ঞানের পরিধি বাড়ায়।",
  "প্রকৃতির সৌন্দর্য উপভোগ করা মনের শান্তির জন্য অপরিহার্য।"
];
