export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  recordNumber: string; // Prontuário
  diagnosis: string;
  responsibleName: string;
  responsiblePhone: string;
  createdAt: string;
}

export interface AvatarConfig {
  skinColor: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'spiky' | 'curly' | 'bald' | 'bob';
  eyeColor: string;
  accessory?: 'none' | 'glasses' | 'hearing-aid' | 'headband';
  clothingColor: string;
}

export interface CommunicationProfile {
  id: string;
  patientId: string;
  motorLevel: 'independent' | 'assisted' | 'limited';
  cognitiveLevel: 'symbolic' | 'emergent' | 'presymbolic';
  preferredVoiceGender: 'male' | 'female' | 'neutral';
  preferredVoiceSpeechRate: number;
  preferredVoicePitch: number;
  gridSizeColumns: number;
  gridSizeRows: number;
  highContrast: boolean;
  notes: string;
  updatedAt: string;
  vocabularyFilterEnabled?: boolean;
  vocabularyFilterList?: string;
  pronunciationExceptions?: string; // Serialized JSON string of Pronunciation Exceptions pairs
  acceptanceDelay?: number; // Acceptance Delay in seconds to prevent stray clicks (Hold-to-activate)
  preventDoubleTapsDelay?: number; // Prevent immediate double taps within X seconds
  genderTheme?: 'boy' | 'girl' | 'neutral'; // App/Pictogram Theme: 'boy' (blue), 'girl' (pink), 'neutral' (gray)
  avatarConfig?: AvatarConfig;
  aiCredits?: number;
}

export interface Board {
  id: string;
  patientId: string;
  name: string;
  isDefault: boolean;
  columns: number;
  rows: number;
  createdAt: string;
}

export interface BoardCategory {
  id: string;
  boardId: string;
  name: string; // Quero, Sinto, Dor, Banheiro, Comida, Pessoas, Escola, Terapia, Emoções
  colorClass: string; // e.g. "bg-orange-100 border-orange-300 text-orange-950"
  icon: string; // lucide icon name or emoji
  orderIndex: number;
}

export interface CommunicationButton {
  id: string;
  boardId: string;
  categoryId: string;
  label: string;
  speechText: string;
  imageUrl: string; // emoji, symbol or custom base64 image
  colorClass: string;
  audioUrl?: string; // custom audio upload
  gridX: number;
  gridY: number;
  isVisible: boolean;
  createdAt: string;
}

export interface ButtonUsageLog {
  id: string;
  patientId: string;
  boardId: string;
  buttonId: string;
  buttonLabel: string;
  categoryName: string;
  timestamp: string;
  phraseContext?: string; // if clicked inside sentence bar
}

export interface AACDatabase {
  patients: Patient[];
  communication_profiles: CommunicationProfile[];
  boards: Board[];
  board_categories: BoardCategory[];
  communication_buttons: CommunicationButton[];
  button_usage_logs: ButtonUsageLog[];
}
