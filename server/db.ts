import fs from 'fs';
import path from 'path';
import { AACDatabase, Patient, CommunicationProfile, Board, BoardCategory, CommunicationButton, ButtonUsageLog } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

const CORE_PERSONAL_BUTTONS: { catId: string; label: string; speech: string; image: string; color: string; x: number; y: number }[] = [
  { catId: "cat-quero", label: "Quero", speech: "Quero", image: "quero", color: "bg-amber-50 text-amber-950 border-amber-200", x: 0, y: 0 },
  { catId: "cat-quero", label: "Mais", speech: "Mais", image: "mais", color: "bg-amber-50 text-amber-950 border-amber-200", x: 1, y: 0 },
  { catId: "cat-quero", label: "Acabou", speech: "Acabou", image: "acabou", color: "bg-amber-50 text-amber-950 border-amber-200", x: 2, y: 0 },
  { catId: "cat-quero", label: "Sim", speech: "Sim", image: "sim", color: "bg-amber-50 text-amber-950 border-amber-200", x: 3, y: 0 },
  { catId: "cat-quero", label: "Nao", speech: "Nao", image: "nao", color: "bg-amber-50 text-amber-950 border-amber-200", x: 4, y: 0 },
  { catId: "cat-quero", label: "Ajuda", speech: "Ajuda", image: "ajuda", color: "bg-amber-50 text-amber-950 border-amber-200", x: 0, y: 1 },
  { catId: "cat-quero", label: "Falar", speech: "Falar", image: "falar", color: "bg-amber-50 text-amber-950 border-amber-200", x: 1, y: 1 },
  { catId: "cat-quero", label: "Ver", speech: "Ver", image: "ver", color: "bg-amber-50 text-amber-950 border-amber-200", x: 2, y: 1 },
  { catId: "cat-quero", label: "Ouvir", speech: "Ouvir", image: "ouvir", color: "bg-amber-50 text-amber-950 border-amber-200", x: 3, y: 1 },
  { catId: "cat-quero", label: "Sentar", speech: "Sentar", image: "sentar", color: "bg-amber-50 text-amber-950 border-amber-200", x: 4, y: 1 },
  { catId: "cat-comida", label: "Comer", speech: "Comer", image: "comer", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 0, y: 0 },
  { catId: "cat-comida", label: "Beber", speech: "Beber", image: "beber", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 1, y: 0 },
  { catId: "cat-comida", label: "Agua", speech: "Agua", image: "agua", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 2, y: 0 },
  { catId: "cat-comida", label: "Suco", speech: "Suco", image: "suco", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 3, y: 0 },
  { catId: "cat-comida", label: "Leite", speech: "Leite", image: "leite", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 4, y: 0 },
  { catId: "cat-comida", label: "Almocar", speech: "Almocar", image: "almocar", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 0, y: 1 },
  { catId: "cat-comida", label: "Banana", speech: "Banana", image: "banana", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 1, y: 1 },
  { catId: "cat-comida", label: "Maca", speech: "Maca", image: "maca", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 2, y: 1 },
  { catId: "cat-comida", label: "Pao", speech: "Pao", image: "pao", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 3, y: 1 },
  { catId: "cat-comida", label: "Biscoito", speech: "Biscoito", image: "biscoito", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 4, y: 1 },
  { catId: "cat-necessidades", label: "Banheiro", speech: "Banheiro", image: "banheiro", color: "bg-cyan-50 text-cyan-950 border-cyan-200", x: 0, y: 0 },
  { catId: "cat-necessidades", label: "Dormir", speech: "Dormir", image: "dormir", color: "bg-cyan-50 text-cyan-950 border-cyan-200", x: 1, y: 0 },
  { catId: "cat-necessidades", label: "Dor", speech: "Dor", image: "dor", color: "bg-cyan-50 text-cyan-950 border-cyan-200", x: 2, y: 0 },
  { catId: "cat-necessidades", label: "Quente", speech: "Quente", image: "quente", color: "bg-cyan-50 text-cyan-950 border-cyan-200", x: 3, y: 0 },
  { catId: "cat-necessidades", label: "Frio", speech: "Frio", image: "frio", color: "bg-cyan-50 text-cyan-950 border-cyan-200", x: 4, y: 0 },
  { catId: "cat-emocoes", label: "Feliz", speech: "Feliz", image: "feliz", color: "bg-violet-50 text-violet-950 border-violet-200", x: 0, y: 0 },
  { catId: "cat-emocoes", label: "Triste", speech: "Triste", image: "triste", color: "bg-violet-50 text-violet-950 border-violet-200", x: 1, y: 0 },
  { catId: "cat-emocoes", label: "Bravo", speech: "Bravo", image: "bravo", color: "bg-violet-50 text-violet-950 border-violet-200", x: 2, y: 0 },
  { catId: "cat-emocoes", label: "Medo", speech: "Medo", image: "medo", color: "bg-violet-50 text-violet-950 border-violet-200", x: 3, y: 0 },
  { catId: "cat-lazer", label: "Brincar", speech: "Brincar", image: "brincar", color: "bg-pink-50 text-pink-950 border-pink-200", x: 0, y: 0 },
  { catId: "cat-lazer", label: "Bola", speech: "Bola", image: "bola", color: "bg-pink-50 text-pink-950 border-pink-200", x: 1, y: 0 },
  { catId: "cat-lazer", label: "Cantar", speech: "Cantar", image: "cantar", color: "bg-pink-50 text-pink-950 border-pink-200", x: 2, y: 0 },
  { catId: "cat-lazer", label: "Tablet", speech: "Tablet", image: "tablet", color: "bg-pink-50 text-pink-950 border-pink-200", x: 3, y: 0 },
  { catId: "cat-lazer", label: "Ursinho", speech: "Ursinho", image: "ursinho", color: "bg-pink-50 text-pink-950 border-pink-200", x: 4, y: 0 },
  { catId: "cat-lazer", label: "Parque", speech: "Parque", image: "parque", color: "bg-pink-50 text-pink-950 border-pink-200", x: 0, y: 1 },
  { catId: "cat-lazer", label: "Correr", speech: "Correr", image: "correr", color: "bg-pink-50 text-pink-950 border-pink-200", x: 1, y: 1 },
  { catId: "cat-escola", label: "Escola", speech: "Escola", image: "escola", color: "bg-indigo-50 text-indigo-950 border-indigo-200", x: 0, y: 0 },
  { catId: "cat-escola", label: "Escrever", speech: "Escrever", image: "escrever", color: "bg-indigo-50 text-indigo-950 border-indigo-200", x: 1, y: 0 },
  { catId: "cat-escola", label: "Pintar", speech: "Pintar", image: "pintar", color: "bg-indigo-50 text-indigo-950 border-indigo-200", x: 2, y: 0 },
  { catId: "cat-locais", label: "Casa", speech: "Casa", image: "casa", color: "bg-sky-50 text-sky-950 border-sky-200", x: 0, y: 0 },
  { catId: "cat-locais", label: "Clinica", speech: "Clinica", image: "clinica", color: "bg-sky-50 text-sky-950 border-sky-200", x: 1, y: 0 },
  { catId: "cat-rotina", label: "Escovar os dentes", speech: "Escovar os dentes", image: "escovar-dentes", color: "bg-orange-50 text-orange-950 border-orange-200", x: 0, y: 0 }
];

function normalizeCorePhraseButtons(db: AACDatabase): boolean {
  let changed = false;
  const coreLayouts: Record<string, Array<Partial<CommunicationButton> & { id: string }>> = {
    'board-lucas-1': CORE_PERSONAL_BUTTONS.map((btn, idx) => ({
      id: `btn-lucas-${idx}`,
      label: btn.label,
      speechText: btn.label,
      imageUrl: btn.image,
      gridX: btn.x,
      gridY: btn.y,
      categoryId: `board-lucas-1-${btn.catId}`,
      colorClass: btn.color
    })),
    'board-ana-1': CORE_PERSONAL_BUTTONS.map((btn, idx) => ({
      id: `btn-ana-${idx}`,
      label: btn.label,
      speechText: btn.label,
      imageUrl: btn.image,
      gridX: btn.x,
      gridY: btn.y,
      categoryId: `board-ana-1-${btn.catId}`,
      colorClass: btn.color
    })),
  };

  db.communication_profiles.forEach((profile) => {
    if (profile.gridSizeColumns < 5) {
      profile.gridSizeColumns = 5;
      changed = true;
    }
    if (profile.gridSizeRows < 3) {
      profile.gridSizeRows = 3;
      changed = true;
    }
  });

  db.boards.forEach((board) => {
    if (board.columns < 5) {
      board.columns = 5;
      changed = true;
    }
    if (board.rows < 3) {
      board.rows = 3;
      changed = true;
    }
  });

  const coreCategories = [
    { id: "cat-quero", name: "Essenciais", icon: "Smile", colorClass: "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-150" },
    { id: "cat-comida", name: "Comida", icon: "Coffee", colorClass: "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-150" },
    { id: "cat-necessidades", name: "Necessidades", icon: "Droplet", colorClass: "bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-150" },
    { id: "cat-emocoes", name: "Emocoes", icon: "Heart", colorClass: "bg-violet-100 text-violet-900 border-violet-300 hover:bg-violet-150" },
    { id: "cat-lazer", name: "Lazer", icon: "Sparkles", colorClass: "bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-150" },
    { id: "cat-escola", name: "Escola", icon: "BookOpen", colorClass: "bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-150" },
    { id: "cat-locais", name: "Locais", icon: "Users", colorClass: "bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-150" },
    { id: "cat-rotina", name: "Rotina", icon: "Activity", colorClass: "bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-150" }
  ];

  Object.entries(coreLayouts).forEach(([boardId, buttons]) => {
    const allowedCategoryIds = new Set(coreCategories.map((category) => `${boardId}-${category.id}`));
    const beforeCategoryFilterCount = db.board_categories.length;
    db.board_categories = db.board_categories.filter((category) => {
      if (category.boardId !== boardId) return true;
      return allowedCategoryIds.has(category.id);
    });
    if (db.board_categories.length !== beforeCategoryFilterCount) {
      changed = true;
    }

    coreCategories.forEach((category, orderIndex) => {
      const categoryId = `${boardId}-${category.id}`;
      let boardCategory = db.board_categories.find((cat) => cat.id === categoryId);
      if (!boardCategory) {
        db.board_categories.push({
          id: categoryId,
          boardId,
          name: category.name,
          colorClass: category.colorClass,
          icon: category.icon,
          orderIndex
        });
        changed = true;
        return;
      }
      Object.entries({ name: category.name, colorClass: category.colorClass, icon: category.icon, orderIndex }).forEach(([key, value]) => {
        if ((boardCategory as any)[key] !== value) {
          (boardCategory as any)[key] = value;
          changed = true;
        }
      });
    });

    const allowedIds = new Set(buttons.map((button) => button.id));
    const beforeFilterCount = db.communication_buttons.length;
    db.communication_buttons = db.communication_buttons.filter((button) => {
      if (button.boardId !== boardId) return true;
      return allowedIds.has(button.id);
    });
    if (db.communication_buttons.length !== beforeFilterCount) {
      changed = true;
    }

    buttons.forEach((update) => {
      let button = db.communication_buttons.find((btn) => btn.id === update.id);
      if (!button) {
        button = {
          id: update.id,
          boardId,
          categoryId: update.categoryId || `${boardId}-cat-quero`,
          label: update.label || '',
          speechText: update.speechText || update.label || '',
          imageUrl: update.imageUrl || '',
          colorClass: update.colorClass || 'bg-amber-50 text-amber-950 border-amber-200',
          gridX: update.gridX || 0,
          gridY: update.gridY || 0,
          isVisible: true,
          createdAt: new Date().toISOString()
        };
        db.communication_buttons.push(button);
        changed = true;
      }
      Object.entries(update).forEach(([key, value]) => {
        if ((button as any)[key] !== value) {
          (button as any)[key] = value;
          changed = true;
        }
      });
    });
  });

  db.communication_buttons.forEach((button) => {
    if (button.speechText !== button.label) {
      button.speechText = button.label;
      changed = true;
    }
  });

  db.button_usage_logs.forEach((log) => {
    if (log.phraseContext === 'Quero Comer + Biscoito') {
      log.phraseContext = 'Quero + Comer + Biscoito';
      changed = true;
    }
    if (log.buttonLabel === 'Quero Agua' || log.buttonLabel === 'Quero Água') {
      log.buttonLabel = 'Quero';
      log.phraseContext = 'Quero + Beber';
      changed = true;
    }
    if (log.buttonLabel === 'Quero Comer') {
      log.buttonLabel = 'Comer';
      log.phraseContext = 'Quero + Comer';
      changed = true;
    }
  });

  return changed;
}

// Ensure database file and directory exist with default seeds
export function initializeDB(): AACDatabase {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data) as AACDatabase;
      if (normalizeCorePhraseButtons(parsed)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
      }
      return parsed;
    } catch (e) {
      console.error("Error reading database, recreating seeds...", e);
    }
  }

  // Create Seed Data
  const db: AACDatabase = {
    patients: [],
    communication_profiles: [],
    boards: [],
    board_categories: [],
    communication_buttons: [],
    button_usage_logs: []
  };

  // Seed Patient 1
  const p1: Patient = {
    id: "pat-lucas",
    name: "Lucas Souza (Lucas)",
    birthDate: "2018-05-12",
    recordNumber: "PR-2026-0042",
    diagnosis: "Transtorno do Espectro Autista (TEA) - Nível 3 de Suporte",
    responsibleName: "Mariana Souza",
    responsiblePhone: "(11) 98765-4321",
    createdAt: new Date().toISOString()
  };

  // Seed Profile Patient 1
  const prof1: CommunicationProfile = {
    id: "prof-lucas",
    patientId: "pat-lucas",
    motorLevel: "assisted",
    cognitiveLevel: "emergent",
    preferredVoiceGender: "neutral",
    preferredVoiceSpeechRate: 0.9,
    preferredVoicePitch: 1.1,
    gridSizeColumns: 5,
    gridSizeRows: 3,
    highContrast: false,
    notes: "Lucas apresenta boa resposta a estímulos visuais de alto contraste, mas prefere a interface padrão. Responde muito bem a feedbacks de voz sintetizada com entonação amigável.",
    vocabularyFilterEnabled: false,
    vocabularyFilterList: "Água, Comer, Brincar, Dormir, Banheiro, Xixi, Cocô, Mamãe, Papai, Sim, Não, Dor",
    pronunciationExceptions: "{\"dodói\":\"dorzinha\",\"TEA\":\"tê ê a\",\"PECS\":\"pex\"}",
    acceptanceDelay: 0,
    preventDoubleTapsDelay: 0,
    updatedAt: new Date().toISOString()
  };

  // Seed Board Patient 1 (Main/Default Board)
  const b1: Board = {
    id: "board-lucas-1",
    patientId: "pat-lucas",
    name: "Prancha Principal diária Lucas",
    isDefault: true,
    columns: 5,
    rows: 3,
    createdAt: new Date().toISOString()
  };

  db.patients.push(p1);
  db.communication_profiles.push(prof1);
  db.boards.push(b1);

  // Seed standard categories for Lucas
  const categoriesList = [
    { id: "cat-quero", name: "Essenciais", icon: "Smile", colorClass: "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-150" },
    { id: "cat-comida", name: "Comida", icon: "Coffee", colorClass: "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-150" },
    { id: "cat-necessidades", name: "Necessidades", icon: "Droplet", colorClass: "bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-150" },
    { id: "cat-emocoes", name: "Emocoes", icon: "Heart", colorClass: "bg-violet-100 text-violet-900 border-violet-300 hover:bg-violet-150" },
    { id: "cat-lazer", name: "Lazer", icon: "Sparkles", colorClass: "bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-150" },
    { id: "cat-escola", name: "Escola", icon: "BookOpen", colorClass: "bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-150" },
    { id: "cat-locais", name: "Locais", icon: "Users", colorClass: "bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-150" },
    { id: "cat-rotina", name: "Rotina", icon: "Activity", colorClass: "bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-150" }
  ];

  categoriesList.forEach((c, idx) => {
    db.board_categories.push({
      id: `${b1.id}-${c.id}`,
      boardId: b1.id,
      name: c.name,
      colorClass: c.colorClass,
      icon: c.icon,
      orderIndex: idx
    });
  });

  // Helper code to inject buttons for Category 1 (Quero)
  const defaultButtons = CORE_PERSONAL_BUTTONS;

  defaultButtons.forEach((btn, idx) => {
    db.communication_buttons.push({
      id: `btn-lucas-${idx}`,
      boardId: b1.id,
      categoryId: `${b1.id}-${btn.catId}`,
      label: btn.label,
      speechText: btn.label,
      imageUrl: btn.image,
      colorClass: btn.color,
      gridX: btn.x,
      gridY: btn.y,
      isVisible: true,
      createdAt: new Date().toISOString()
    });
  });

  // Seed historic usage logs to display a cool charts initially!
  const now = new Date();
  const generatePastDate = (hoursAgo: number) => {
    const d = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return d.toISOString();
  };

  const logs: ButtonUsageLog[] = [
    { id: "log-1", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-0", buttonLabel: "Quero", categoryName: "Quero", timestamp: generatePastDate(48), phraseContext: "Quero + Beber" },
    { id: "log-2", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-1", buttonLabel: "Comer", categoryName: "Quero", timestamp: generatePastDate(47), phraseContext: "Quero + Comer" },
    { id: "log-3", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-2", buttonLabel: "Beber", categoryName: "Quero", timestamp: generatePastDate(45), phraseContext: "Quero + Beber" },
    { id: "log-4", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-5", buttonLabel: "Banheiro", categoryName: "Quero", timestamp: generatePastDate(44), phraseContext: "Banheiro" },
    { id: "log-5", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-6", buttonLabel: "Dor", categoryName: "Quero", timestamp: generatePastDate(30), phraseContext: "Dor" },
    { id: "log-6", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-7", buttonLabel: "Brincar", categoryName: "Quero", timestamp: generatePastDate(24), phraseContext: "Quero + Brincar" },
    { id: "log-7", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-11", buttonLabel: "Banana", categoryName: "Quero", timestamp: generatePastDate(20), phraseContext: "Quero + Comer + Banana" },
    { id: "log-8", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-9", buttonLabel: "Ajuda", categoryName: "Quero", timestamp: generatePastDate(12), phraseContext: "Ajuda" },
    { id: "log-9", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-4", buttonLabel: "Acabou", categoryName: "Quero", timestamp: generatePastDate(4), phraseContext: "Acabou" },
    { id: "log-10", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-14", buttonLabel: "Nao", categoryName: "Quero", timestamp: generatePastDate(2), phraseContext: "Nao" }
  ];

  db.button_usage_logs = logs;

  // Add a generic second patient "Ana Carolina" to show how profile switching works instantly
  const p2: Patient = {
    id: "pat-ana",
    name: "Ana Carolina (Aninha)",
    birthDate: "2019-10-05",
    recordNumber: "PR-2026-0089",
    diagnosis: "Transtorno do Espectro Autista (TEA) - Nível 2 + Apraxia da Fala",
    responsibleName: "Roberto Silveira",
    responsiblePhone: "(11) 99911-2233",
    createdAt: new Date().toISOString()
  };

  const prof2: CommunicationProfile = {
    id: "prof-ana",
    patientId: "pat-ana",
    motorLevel: "independent",
    cognitiveLevel: "symbolic",
    preferredVoiceGender: "female",
    preferredVoiceSpeechRate: 1.0,
    preferredVoicePitch: 1.2,
    gridSizeColumns: 5,
    gridSizeRows: 3,
    highContrast: true, // Showcases high contrast layout!
    notes: "Ana possui diagnóstico associado de Apraxia da Fala Infantil. É altamente independente no uso da prancha visual. Utiliza muito as categorias Comida e Emoções de forma autônoma.",
    vocabularyFilterEnabled: false,
    vocabularyFilterList: "Água, Comer, Parque, Feliz, Fruta, Suco, Banheiro",
    pronunciationExceptions: "{}",
    updatedAt: new Date().toISOString()
  };

  const b2: Board = {
    id: "board-ana-1",
    patientId: "pat-ana",
    name: "Prancha Geral Aninha",
    isDefault: true,
    columns: 5,
    rows: 3,
    createdAt: new Date().toISOString()
  };

  db.patients.push(p2);
  db.communication_profiles.push(prof2);
  db.boards.push(b2);

  // Categories and default buttons for Ana
  categoriesList.forEach((c, idx) => {
    db.board_categories.push({
      id: `${b2.id}-${c.id}`,
      boardId: b2.id,
      name: c.name,
      colorClass: c.colorClass,
      icon: c.icon,
      orderIndex: idx
    });
  });

  const defaultButtonsAna = CORE_PERSONAL_BUTTONS;

  defaultButtonsAna.forEach((btn, idx) => {
    db.communication_buttons.push({
      id: `btn-ana-${idx}`,
      boardId: b2.id,
      categoryId: `${b2.id}-${btn.catId}`,
      label: btn.label,
      speechText: btn.label,
      imageUrl: btn.image,
      colorClass: btn.color,
      gridX: btn.x,
      gridY: btn.y,
      isVisible: true,
      createdAt: new Date().toISOString()
    });
  });

  // Write default db to file
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  return db;
}

// Database helper functions memory-backed and hot-saved
let currentDB = initializeDB();

export function getDB(): AACDatabase {
  return currentDB;
}

export function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(currentDB, null, 2), 'utf8');
}

export function addPatient(patient: Patient, profile: CommunicationProfile, board: Board): AACDatabase {
  currentDB.patients.push(patient);
  currentDB.communication_profiles.push(profile);
  currentDB.boards.push(board);

  // Auto populate default categories for new patient's default board
  const categoriesList = [
    { id: "cat-quero", name: "Essenciais", icon: "Smile", colorClass: "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-150" },
    { id: "cat-comida", name: "Comida", icon: "Coffee", colorClass: "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-150" },
    { id: "cat-necessidades", name: "Necessidades", icon: "Droplet", colorClass: "bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-150" },
    { id: "cat-emocoes", name: "Emocoes", icon: "Heart", colorClass: "bg-violet-100 text-violet-900 border-violet-300 hover:bg-violet-150" },
    { id: "cat-lazer", name: "Lazer", icon: "Sparkles", colorClass: "bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-150" },
    { id: "cat-escola", name: "Escola", icon: "BookOpen", colorClass: "bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-150" },
    { id: "cat-locais", name: "Locais", icon: "Users", colorClass: "bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-150" },
    { id: "cat-rotina", name: "Rotina", icon: "Activity", colorClass: "bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-150" }
  ];

  categoriesList.forEach((c, idx) => {
    currentDB.board_categories.push({
      id: `${board.id}-${c.id}`,
      boardId: board.id,
      name: c.name,
      colorClass: c.colorClass,
      icon: c.icon,
      orderIndex: idx
    });
  });

  // Insert standard helpful simple starter buttons
  const initialButtons = CORE_PERSONAL_BUTTONS;

  initialButtons.forEach((btn, idx) => {
    currentDB.communication_buttons.push({
      id: `btn-${board.id}-${idx}`,
      boardId: board.id,
      categoryId: `${board.id}-${btn.catId}`,
      label: btn.label,
      speechText: btn.label,
      imageUrl: btn.image,
      colorClass: btn.color,
      gridX: btn.x,
      gridY: btn.y,
      isVisible: true,
      createdAt: new Date().toISOString()
    });
  });

  saveDB();
  return currentDB;
}
