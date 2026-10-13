export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' | 'Aoede';

export type VoiceCategory = 'all' | 'lucky' | 'narrator' | 'energetic' | 'calm' | 'custom';

export interface VoicePersona {
  id: string; // unique ID e.g. "puck_lucky", "charon_grandpa", or custom uuid
  name: string;
  baseVoice: VoiceName;
  category: VoiceCategory;
  gender: 'Чоловічий' | 'Жіночий' | 'Нейтральний' | 'Дитячий';
  tag: string;
  traits: string[];
  descriptionUk: string;
  descriptionEn: string;
  avatarColor: string;
  defaultStyle: string;
  isCustom?: boolean;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  voiceName: VoiceName;
  text: string;
  style?: string;
}

export interface ClipHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  audioBase64: string;
  voiceName: string;
  personaName?: string;
  style?: string;
  isDialogue?: boolean;
  duration?: number;
}
