import fs from 'fs';
import path from 'path';
import { AACDatabase, Patient, CommunicationProfile, Board, BoardCategory, CommunicationButton, ButtonUsageLog } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Ensure database file and directory exist with default seeds
export function initializeDB(): AACDatabase {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data) as AACDatabase;
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
    gridSizeColumns: 4,
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
    columns: 4,
    rows: 3,
    createdAt: new Date().toISOString()
  };

  db.patients.push(p1);
  db.communication_profiles.push(prof1);
  db.boards.push(b1);

  // Seed standard categories for Lucas
  const categoriesList = [
    { id: "cat-quero", name: "Quero", icon: "Smile", colorClass: "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-150" },
    { id: "cat-sinto", name: "Sinto", icon: "Heart", colorClass: "bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-150" },
    { id: "cat-dor", name: "Dor", icon: "AlertTriangle", colorClass: "bg-red-100 text-red-900 border-red-300 hover:bg-red-150" },
    { id: "cat-banheiro", name: "Banheiro", icon: "Droplet", colorClass: "bg-teal-100 text-teal-900 border-teal-300 hover:bg-teal-150" },
    { id: "cat-comida", name: "Comida", icon: "Coffee", colorClass: "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-150" },
    { id: "cat-pessoas", name: "Pessoas", icon: "Users", colorClass: "bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-150" },
    { id: "cat-escola", name: "Escola", icon: "BookOpen", colorClass: "bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-150" },
    { id: "cat-terapia", name: "Terapia", icon: "Sparkles", colorClass: "bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-150" },
    { id: "cat-emocoes", name: "Emoções", icon: "Frown", colorClass: "bg-violet-100 text-violet-900 border-violet-300 hover:bg-violet-150" }
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
  const defaultButtons: { catId: string; label: string; speech: string; image: string; color: string; x: number; y: number }[] = [
    // QUERO
    { catId: "cat-quero", label: "Quero Água", speech: "Eu quero beber água, estou com sede", image: "💧", color: "bg-amber-50 text-amber-950 border-amber-200", x: 0, y: 0 },
    { catId: "cat-quero", label: "Quero Comer", speech: "Eu quero comer alguma coisa, estou com fome", image: "🍎", color: "bg-amber-50 text-amber-950 border-amber-200", x: 1, y: 0 },
    { catId: "cat-quero", label: "Brincar", speech: "Quero brincar agora", image: "🧸", color: "bg-amber-50 text-amber-950 border-amber-200", x: 2, y: 0 },
    { catId: "cat-quero", label: "Dormir", speech: "Estou com sono, quero dormir", image: "💤", color: "bg-amber-50 text-amber-950 border-amber-200", x: 3, y: 0 },
    { catId: "cat-quero", label: "Ir par de Fora", speech: "Quero ir para fora brincar", image: "🌳", color: "bg-amber-50 text-amber-950 border-amber-200", x: 0, y: 1 },
    { catId: "cat-quero", label: "Quero Abraço", speech: "Pode me dar um abraço, por favor", image: "🤗", color: "bg-amber-50 text-amber-950 border-amber-200", x: 1, y: 1 },
    { catId: "cat-quero", label: "Ouvir Música", speech: "Quero ouvir música agora", image: "🎵", color: "bg-amber-50 text-amber-950 border-amber-200", x: 2, y: 1 },
    { catId: "cat-quero", label: "Assistir Vídeo", speech: "Quero assistir um vídeo no tablet", image: "📱", color: "bg-amber-50 text-amber-950 border-amber-200", x: 3, y: 1 },

    // SINTO
    { catId: "cat-sinto", label: "Estou Feliz", speech: "Eu me sinto muito feliz!", image: "😀", color: "bg-purple-50 text-purple-950 border-purple-200", x: 0, y: 0 },
    { catId: "cat-sinto", label: "Estou Triste", speech: "Estou me sentindo um pouco triste", image: "😢", color: "bg-purple-50 text-purple-950 border-purple-200", x: 1, y: 0 },
    { catId: "cat-sinto", label: "Cansado", speech: "Estou cansado e preciso descansar", image: "🥱", color: "bg-purple-50 text-purple-950 border-purple-200", x: 2, y: 0 },
    { catId: "cat-sinto", label: "Bravo", speech: "Estou com raiva agora", image: "😠", color: "bg-purple-50 text-purple-950 border-purple-200", x: 3, y: 0 },
    { catId: "cat-sinto", label: "Agitado", speech: "Estou me sentindo muito agitado", image: "🌀", color: "bg-purple-50 text-purple-950 border-purple-200", x: 0, y: 1 },
    { catId: "cat-sinto", label: "Calmo", speech: "Estou me sentindo calmo e tranquilo", image: "😌", color: "bg-purple-50 text-purple-950 border-purple-200", x: 1, y: 1 },

    // DOR
    { catId: "cat-dor", label: "Dói de Cabeça", speech: "Estou com dor de cabeça", image: "🤕", color: "bg-red-50 text-red-950 border-red-200", x: 0, y: 0 },
    { catId: "cat-dor", label: "Dói de Barriga", speech: "Minha barriga está doendo", image: "🤢", color: "bg-red-50 text-red-950 border-red-200", x: 1, y: 0 },
    { catId: "cat-dor", label: "Dói de Dente", speech: "Meu dente está doendo muito", image: "🦷", color: "bg-red-50 text-red-950 border-red-200", x: 2, y: 0 },
    { catId: "cat-dor", label: "Machucado", speech: "Eu me machuquei aqui", image: "🩹", color: "bg-red-50 text-red-950 border-red-200", x: 3, y: 0 },
    { catId: "cat-dor", label: "Dói o Ouvido", speech: "Meu ouvido está doendo", image: "👂", color: "bg-red-50 text-red-950 border-red-200", x: 0, y: 1 },

    // BANHEIRO
    { catId: "cat-banheiro", label: "Xixi", speech: "Preciso ir ao banheiro fazer xixi", image: "🚽", color: "bg-teal-50 text-teal-950 border-teal-200", x: 0, y: 0 },
    { catId: "cat-banheiro", label: "Cocô", speech: "Preciso ir ao banheiro fazer cocô", image: "💩", color: "bg-teal-50 text-teal-950 border-teal-200", x: 1, y: 0 },
    { catId: "cat-banheiro", label: "Tomar Banho", speech: "Quero tomar banho agora", image: "🧼", color: "bg-teal-50 text-teal-950 border-teal-200", x: 2, y: 0 },
    { catId: "cat-banheiro", label: "Lavar as Mãos", speech: "Quero lavar minhas mãos", image: "🙌", color: "bg-teal-50 text-teal-950 border-teal-200", x: 3, y: 0 },
    { catId: "cat-banheiro", label: "Escovar Dentes", speech: "Quero escovar meus dentes", image: "🪥", color: "bg-teal-50 text-teal-950 border-teal-200", x: 0, y: 1 },

    // COMIDA
    { catId: "cat-comida", label: "Água", speech: "Me dá um copo de água, por favor", image: "🥛", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 0, y: 0 },
    { catId: "cat-comida", label: "Suco", speech: "Quero beber um suco", image: "🧃", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 1, y: 0 },
    { catId: "cat-comida", label: "Fruta", speech: "Quero comer uma fruta deliciosa", image: "🍌", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 2, y: 0 },
    { catId: "cat-comida", label: "Biscoito", speech: "Quero comer um biscoito ou bolacha", image: "🍪", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 3, y: 0 },
    { catId: "cat-comida", label: "Leite", speech: "Quero tomar leite morno", image: "🍼", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 0, y: 1 },
    { catId: "cat-comida", label: "Arroz e Feijão", speech: "Quero comer arroz com feijão no prato", image: "🍛", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 1, y: 1 },

    // PESSOAS
    { catId: "cat-pessoas", label: "Mamãe", speech: "Eu quero falar com a mamãe", image: "👩", color: "bg-sky-50 text-sky-950 border-sky-200", x: 0, y: 0 },
    { catId: "cat-pessoas", label: "Papai", speech: "Eu quero chamar o papai", image: "👨", color: "bg-sky-50 text-sky-950 border-sky-200", x: 1, y: 0 },
    { catId: "cat-pessoas", label: "Terapeuta", speech: "Cadê minha terapeuta?", image: "👩‍⚕️", color: "bg-sky-50 text-sky-950 border-sky-200", x: 2, y: 0 },
    { catId: "cat-pessoas", label: "Professora", speech: "Quero chamar a professora", image: "👩‍🏫", color: "bg-sky-50 text-sky-950 border-sky-200", x: 3, y: 0 },
    { catId: "cat-pessoas", label: "Amigo", speech: "Quero brincar com um amigo", image: "🧒", color: "bg-sky-50 text-sky-950 border-sky-200", x: 0, y: 1 },

    // ESCOLA
    { catId: "cat-escola", label: "Caderno", speech: "Preciso do meu caderno de atividades", image: "📒", color: "bg-indigo-50 text-indigo-950 border-indigo-200", x: 0, y: 0 },
    { catId: "cat-escola", label: "Lápis", speech: "Preciso de um lápis de cor para pintar", image: "✏️", color: "bg-indigo-50 text-indigo-950 border-indigo-200", x: 1, y: 0 },
    { catId: "cat-escola", label: "Livro de Figuras", speech: "Quero olhar o livro de histórias", image: "📚", color: "bg-indigo-50 text-indigo-950 border-indigo-200", x: 2, y: 0 },
    { catId: "cat-escola", label: "Mochila", speech: "Quero arrumar minha mochila", image: "🎒", color: "bg-indigo-50 text-indigo-950 border-indigo-200", x: 3, y: 0 },

    // TERAPIA
    { catId: "cat-terapia", label: "Sala de Sensorial", speech: "Quero ir para a sala sensorial relaxar", image: "🧘", color: "bg-pink-50 text-pink-950 border-pink-200", x: 0, y: 0 },
    { catId: "cat-terapia", label: "Foco", speech: "Preciso do meu brinquedo de foco e estimulação", image: "🌀", color: "bg-pink-50 text-pink-950 border-pink-200", x: 1, y: 0 },
    { catId: "cat-terapia", label: "Massinha", speech: "Quero brincar com massinha de modelar colorida", image: "🥎", color: "bg-pink-50 text-pink-950 border-pink-200", x: 2, y: 0 },
    { catId: "cat-terapia", label: "Pula Pula", speech: "Quero pular no pula pula para gastar energia", image: "🤸", color: "bg-pink-50 text-pink-950 border-pink-200", x: 3, y: 0 },

    // EMOCOES
    { catId: "cat-emocoes", label: "Estou Gostando", speech: "Eu estou gostando muito disso!", image: "💖", color: "bg-violet-50 text-violet-950 border-violet-200", x: 0, y: 0 },
    { catId: "cat-emocoes", label: "Não Estou Gostando", speech: "Não estou gostando desta atividade, por favor pare", image: "❌", color: "bg-violet-50 text-violet-950 border-violet-200", x: 1, y: 0 },
    { catId: "cat-emocoes", label: "Muito Barulho", speech: "Tem muito barulho aqui, está me sufocando", image: "🙉", color: "bg-violet-50 text-violet-950 border-violet-200", x: 2, y: 0 },
    { catId: "cat-emocoes", label: "Assustado", speech: "Estou com medo ou assustado com algo", image: "😨", color: "bg-violet-50 text-violet-950 border-violet-200", x: 3, y: 0 }
  ];

  defaultButtons.forEach((btn, idx) => {
    db.communication_buttons.push({
      id: `btn-lucas-${idx}`,
      boardId: b1.id,
      categoryId: `${b1.id}-${btn.catId}`,
      label: btn.label,
      speechText: btn.speech,
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
    { id: "log-1", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-0", buttonLabel: "Quero Água", categoryName: "Quero", timestamp: generatePastDate(48), phraseContext: "Quero Água" },
    { id: "log-2", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-1", buttonLabel: "Quero Comer", categoryName: "Quero", timestamp: generatePastDate(47), phraseContext: "Quero Comer" },
    { id: "log-3", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-18", buttonLabel: "Xixi", categoryName: "Banheiro", timestamp: generatePastDate(45), phraseContext: "Fazer Xixi" },
    { id: "log-4", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-8", buttonLabel: "Estou Feliz", categoryName: "Sinto", timestamp: generatePastDate(44), phraseContext: "Estou Feliz + Quero Abraço" },
    { id: "log-5", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-5", buttonLabel: "Quero Abraço", categoryName: "Quero", timestamp: generatePastDate(44), phraseContext: "Estou Feliz + Quero Abraço" },
    { id: "log-6", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-14", buttonLabel: "Dói de Barriga", categoryName: "Dor", timestamp: generatePastDate(30), phraseContext: "Dói de Barriga" },
    { id: "log-7", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-2", buttonLabel: "Brincar", categoryName: "Quero", timestamp: generatePastDate(24), phraseContext: "Brincar + Mamãe" },
    { id: "log-8", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-29", buttonLabel: "Mamãe", categoryName: "Pessoas", timestamp: generatePastDate(24), phraseContext: "Brincar + Mamãe" },
    { id: "log-9", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-23", buttonLabel: "Biscoito", categoryName: "Comida", timestamp: generatePastDate(20), phraseContext: "Quero Comer + Biscoito" },
    { id: "log-10", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-36", buttonLabel: "Massinha", categoryName: "Terapia", timestamp: generatePastDate(12), phraseContext: "Massinha + Terapeuta" },
    { id: "log-11", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-31", buttonLabel: "Terapeuta", categoryName: "Pessoas", timestamp: generatePastDate(12), phraseContext: "Massinha + Terapeuta" },
    { id: "log-12", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-0", buttonLabel: "Quero Água", categoryName: "Quero", timestamp: generatePastDate(4), phraseContext: "Quero Água" },
    { id: "log-13", patientId: "pat-lucas", boardId: "board-lucas-1", buttonId: "btn-lucas-10", buttonLabel: "Cansado", categoryName: "Sinto", timestamp: generatePastDate(2), phraseContext: "Cansado" }
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
    gridSizeColumns: 3,
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
    columns: 3,
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

  const defaultButtonsAna = [
    { catId: "cat-quero", label: "Água", speech: "Estou com sede, quero beber água", image: "💧", color: "bg-amber-50 text-amber-950 border-amber-200", x: 0, y: 0 },
    { catId: "cat-quero", label: "Comer", speech: "Quero comer algo gostoso", image: "🍏", color: "bg-amber-50 text-amber-950 border-amber-200", x: 1, y: 0 },
    { catId: "cat-quero", label: "Parque", speech: "Quero ir brincar no parquinho", image: "🛝", color: "bg-amber-50 text-amber-950 border-amber-200", x: 2, y: 0 },
    { catId: "cat-sinto", label: "Feliz", speech: "Estou me sentindo muito feliz!", image: "😊", color: "bg-purple-50 text-purple-950 border-purple-200", x: 0, y: 0 },
    { catId: "cat-comida", label: "Fruta", speech: "Quero comer uma fruta fresquinha", image: "🍓", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 0, y: 0 },
    { catId: "cat-comida", label: "Suco", speech: "Pode me dar um suco?", image: "🧃", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 1, y: 0 },
    { catId: "cat-banheiro", label: "Banheiro", speech: "Preciso ir ao banheiro agora", image: "🚽", color: "bg-teal-50 text-teal-950 border-teal-200", x: 0, y: 0 }
  ];

  defaultButtonsAna.forEach((btn, idx) => {
    db.communication_buttons.push({
      id: `btn-ana-${idx}`,
      boardId: b2.id,
      categoryId: `${b2.id}-${btn.catId}`,
      label: btn.label,
      speechText: btn.speech,
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
    { id: "cat-quero", name: "Quero", icon: "Smile", colorClass: "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-150" },
    { id: "cat-sinto", name: "Sinto", icon: "Heart", colorClass: "bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-150" },
    { id: "cat-dor", name: "Dor", icon: "AlertTriangle", colorClass: "bg-red-100 text-red-900 border-red-300 hover:bg-red-150" },
    { id: "cat-banheiro", name: "Banheiro", icon: "Droplet", colorClass: "bg-teal-100 text-teal-900 border-teal-300 hover:bg-teal-150" },
    { id: "cat-comida", name: "Comida", icon: "Coffee", colorClass: "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-150" },
    { id: "cat-pessoas", name: "Pessoas", icon: "Users", colorClass: "bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-150" },
    { id: "cat-escola", name: "Escola", icon: "BookOpen", colorClass: "bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-150" },
    { id: "cat-terapia", name: "Terapia", icon: "Sparkles", colorClass: "bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-150" },
    { id: "cat-emocoes", name: "Emoções", icon: "Frown", colorClass: "bg-violet-100 text-violet-900 border-violet-300 hover:bg-violet-150" }
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
  const initialButtons = [
    { catId: "cat-quero", label: "Quero Beber", speech: "Quero beber água ou suco, estou voluntário", image: "💧", color: "bg-amber-50 text-amber-950 border-amber-200", x: 0, y: 0 },
    { catId: "cat-quero", label: "Quero Comer", speech: "Quero comer alguma coisa, estou com fome", image: "🍎", color: "bg-amber-50 text-amber-950 border-amber-200", x: 1, y: 0 },
    { catId: "cat-sinto", label: "Estou Feliz", speech: "Estou me sentindo muito feliz!", image: "😀", color: "bg-purple-50 text-purple-950 border-purple-200", x: 0, y: 0 },
    { catId: "cat-dor", label: "Machucado", speech: "Eu me machuquei, está doendo", image: "🩹", color: "bg-red-50 text-red-950 border-red-200", x: 0, y: 0 },
    { catId: "cat-banheiro", label: "Xixi", speech: "Preciso ir ao banheiro fazer xixi", image: "🚽", color: "bg-teal-50 text-teal-950 border-teal-200", x: 0, y: 0 },
    { catId: "cat-comida", label: "Fruta", speech: "Quero comer uma fruta", image: "🍌", color: "bg-emerald-50 text-emerald-950 border-emerald-200", x: 0, y: 0 },
    { catId: "cat-pessoas", label: "Mamãe", speech: "Quero falar com a mamãe", image: "👩", color: "bg-sky-50 text-sky-950 border-sky-200", x: 0, y: 0 }
  ];

  initialButtons.forEach((btn, idx) => {
    currentDB.communication_buttons.push({
      id: `btn-${board.id}-${idx}`,
      boardId: board.id,
      categoryId: `${board.id}-${btn.catId}`,
      label: btn.label,
      speechText: btn.speech,
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
