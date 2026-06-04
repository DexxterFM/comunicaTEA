import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDB, saveDB, addPatient, initializeDB } from './server/db';
import { Patient, CommunicationProfile, Board, BoardCategory, CommunicationButton, ButtonUsageLog } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON payloads (support large base64 strings for custom images)
  app.use(express.json({ limit: '12mb' }));

  // Ensure DB gets initialized
  initializeDB();

  // --- API ROUTES ---
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // 1. list all patients
  app.get('/api/patients', (req, res) => {
    const db = getDB();
    res.json(db.patients);
  });

  // 2. create a patient (creates patient + auto default profile + auto board with categories/buttons)
  app.post('/api/patients', (req, res) => {
    const { name, birthDate, recordNumber, diagnosis, responsibleName, responsiblePhone, genderTheme, preferredVoiceGender } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nome do paciente é obrigatório" });
    }

    const db = getDB();
    const patientId = `pat-${Date.now()}`;
    const newPatient: Patient = {
      id: patientId,
      name,
      birthDate: birthDate || '',
      recordNumber: recordNumber || `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      diagnosis: diagnosis || 'Transtorno do Espectro Autista (TEA)',
      responsibleName: responsibleName || '',
      responsiblePhone: responsiblePhone || '',
      createdAt: new Date().toISOString()
    };

    const profileGenderTheme = genderTheme || "neutral";
    const newProfile: CommunicationProfile = {
      id: `prof-${Date.now()}`,
      patientId: patientId,
      motorLevel: "independent",
      cognitiveLevel: "symbolic",
      preferredVoiceGender: preferredVoiceGender || (profileGenderTheme === "girl" ? "female" : "male"),
      preferredVoiceSpeechRate: 1.0,
      preferredVoicePitch: 1.0,
      gridSizeColumns: 5,
      gridSizeRows: 3,
      highContrast: false,
      notes: "Paciente recém cadastrado. Prancha padrão gerada automaticamente com categorias PECS essenciais.",
      acceptanceDelay: 0,
      preventDoubleTapsDelay: 0,
      genderTheme: profileGenderTheme,
      aiCredits: 200,
      updatedAt: new Date().toISOString()
    };

    const boardId = `board-${Date.now()}`;
    const newBoard: Board = {
      id: boardId,
      patientId: patientId,
      name: "Prancha Geral",
      isDefault: true,
      columns: 5,
      rows: 3,
      createdAt: new Date().toISOString()
    };

    addPatient(newPatient, newProfile, newBoard);
    res.status(201).json({ patient: newPatient, boardId });
  });

  // 2.5 Backup Restoration and Patient Synchronization Importer
  app.post('/api/patients/backup-import', (req, res) => {
    const { patient, profile, boards } = req.body;
    if (!patient || !patient.name) {
      return res.status(400).json({ error: "Formato do arquivo de backup inválido. Chave 'patient' é obrigatória." });
    }

    const db = getDB();

    // To prevent ID collisions but preserve association, let's generate new unique IDs for import
    const newPatientId = `pat-import-${Date.now()}`;

    // Create the patient structure safely
    const importedPatient: Patient = {
      id: newPatientId,
      name: patient.name,
      birthDate: patient.birthDate || '',
      recordNumber: patient.recordNumber || `PR-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
      diagnosis: patient.diagnosis || 'TEA',
      responsibleName: patient.responsibleName || '',
      responsiblePhone: patient.responsiblePhone || '',
      createdAt: patient.createdAt || new Date().toISOString()
    };
    db.patients.push(importedPatient);

    // Create profile structure safely
    if (profile) {
      const importedProfile = {
        ...profile,
        id: `prof-import-${Date.now()}`,
        patientId: newPatientId,
        updatedAt: new Date().toISOString()
      };
      db.communication_profiles.push(importedProfile);
    } else {
      // Create a default empty profile if none is attached to recovery file
        db.communication_profiles.push({
          id: `prof-${Date.now()}`,
          patientId: newPatientId,
          motorLevel: "independent",
          cognitiveLevel: "symbolic",
          preferredVoiceGender: "male",
          preferredVoiceSpeechRate: 1.0,
          preferredVoicePitch: 1.0,
          gridSizeColumns: 5,
          gridSizeRows: 3,
          highContrast: false,
          vocabularyFilterEnabled: false,
          vocabularyFilterList: "",
          pronunciationExceptions: "{}",
          notes: "Perfil restaurado de arquivo de backup.",
          acceptanceDelay: 0,
          preventDoubleTapsDelay: 0,
          aiCredits: 200,
          updatedAt: new Date().toISOString()
        });
    }

    // Process boards, matching categories and customized cells
    if (Array.isArray(boards)) {
      boards.forEach((b, sIdx) => {
        const newBoardId = `board-import-${Date.now()}-${sIdx}`;
        const boardMeta = b.board || b;
        const oldBoardId = boardMeta.id;

        // Save board metadatas
        db.boards.push({
          id: newBoardId,
          patientId: newPatientId,
          name: boardMeta.name || "Prancha Importada",
          columns: boardMeta.columns || 4,
          rows: boardMeta.rows || 3,
          isDefault: sIdx === 0 ? true : !!boardMeta.isDefault,
          createdAt: boardMeta.createdAt || new Date().toISOString()
        });

        // Save categories with mapped IDs
        if (Array.isArray(b.categories)) {
          b.categories.forEach((cat: any) => {
            const oldCatId = cat.id;
            const newCatId = `${newBoardId}-${oldCatId.split('-').pop()}`;
            db.board_categories.push({
              ...cat,
              id: newCatId,
              boardId: newBoardId
            });

            // Parse Buttons of this specific board and bind them to the correct mapped Category ID
            if (Array.isArray(b.buttons)) {
              b.buttons.filter((btn: any) => btn.categoryId === oldCatId).forEach((btn: any) => {
                db.communication_buttons.push({
                  ...btn,
                  id: `btn-import-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                  boardId: newBoardId,
                  categoryId: newCatId
                });
              });
            }
          });
        }
      });
    }

    saveDB();
    res.status(201).json({ success: true, patientId: newPatientId });
  });

  // 3. update patient
  app.put('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    const { name, birthDate, recordNumber, diagnosis, responsibleName, responsiblePhone } = req.body;

    const db = getDB();
    const patientIdx = db.patients.findIndex(p => p.id === id);
    if (patientIdx === -1) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    db.patients[patientIdx] = {
      ...db.patients[patientIdx],
      name: name || db.patients[patientIdx].name,
      birthDate: birthDate !== undefined ? birthDate : db.patients[patientIdx].birthDate,
      recordNumber: recordNumber !== undefined ? recordNumber : db.patients[patientIdx].recordNumber,
      diagnosis: diagnosis !== undefined ? diagnosis : db.patients[patientIdx].diagnosis,
      responsibleName: responsibleName !== undefined ? responsibleName : db.patients[patientIdx].responsibleName,
      responsiblePhone: responsiblePhone !== undefined ? responsiblePhone : db.patients[patientIdx].responsiblePhone,
    };

    saveDB();
    res.json(db.patients[patientIdx]);
  });

  // 4. delete patient, profile, boards, categories, buttons, and logs
  app.delete('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    const db = getDB();

    db.patients = db.patients.filter(p => p.id !== id);
    db.communication_profiles = db.communication_profiles.filter(p => p.patientId !== id);
    
    // Find boards to remove categories and buttons
    const patientBoards = db.boards.filter(b => b.patientId === id);
    const boardIds = patientBoards.map(b => b.id);

    db.boards = db.boards.filter(b => b.patientId !== id);
    db.board_categories = db.board_categories.filter(c => !boardIds.includes(c.boardId));
    db.communication_buttons = db.communication_buttons.filter(btn => !boardIds.includes(btn.boardId));
    db.button_usage_logs = db.button_usage_logs.filter(l => l.patientId !== id);

    saveDB();
    res.json({ success: true, message: "Paciente e todos os dados de CAA deletados." });
  });

  // 5. get communication profile
  app.get('/api/patients/:patientId/profile', (req, res) => {
    const { patientId } = req.params;
    const db = getDB();
    const profile = db.communication_profiles.find(p => p.patientId === patientId);
    
    if (!profile) {
      return res.status(404).json({ error: "Perfil comunicacional não encontrado" });
    }
    res.json(profile);
  });

  // 6. update communication profile
  app.put('/api/patients/:patientId/profile', (req, res) => {
    const { patientId } = req.params;
    const db = getDB();
    const profileIdx = db.communication_profiles.findIndex(p => p.patientId === patientId);

    if (profileIdx === -1) {
      return res.status(404).json({ error: "Perfil comunicacional não encontrado" });
    }

    const {
      motorLevel, cognitiveLevel, preferredVoiceGender, preferredVoiceSpeechRate,
      preferredVoicePitch, gridSizeColumns, gridSizeRows, highContrast, notes,
      vocabularyFilterEnabled, vocabularyFilterList, pronunciationExceptions,
      acceptanceDelay, preventDoubleTapsDelay, genderTheme, avatarConfig, aiCredits
    } = req.body;

    db.communication_profiles[profileIdx] = {
      ...db.communication_profiles[profileIdx],
      motorLevel: motorLevel || db.communication_profiles[profileIdx].motorLevel,
      cognitiveLevel: cognitiveLevel || db.communication_profiles[profileIdx].cognitiveLevel,
      preferredVoiceGender: preferredVoiceGender || db.communication_profiles[profileIdx].preferredVoiceGender,
      preferredVoiceSpeechRate: preferredVoiceSpeechRate !== undefined ? preferredVoiceSpeechRate : db.communication_profiles[profileIdx].preferredVoiceSpeechRate,
      preferredVoicePitch: preferredVoicePitch !== undefined ? preferredVoicePitch : db.communication_profiles[profileIdx].preferredVoicePitch,
      gridSizeColumns: gridSizeColumns !== undefined ? gridSizeColumns : db.communication_profiles[profileIdx].gridSizeColumns,
      gridSizeRows: gridSizeRows !== undefined ? gridSizeRows : db.communication_profiles[profileIdx].gridSizeRows,
      highContrast: highContrast !== undefined ? highContrast : db.communication_profiles[profileIdx].highContrast,
      notes: notes !== undefined ? notes : db.communication_profiles[profileIdx].notes,
      vocabularyFilterEnabled: vocabularyFilterEnabled !== undefined ? vocabularyFilterEnabled : db.communication_profiles[profileIdx].vocabularyFilterEnabled,
      vocabularyFilterList: vocabularyFilterList !== undefined ? vocabularyFilterList : db.communication_profiles[profileIdx].vocabularyFilterList,
      pronunciationExceptions: pronunciationExceptions !== undefined ? pronunciationExceptions : db.communication_profiles[profileIdx].pronunciationExceptions,
      acceptanceDelay: acceptanceDelay !== undefined ? acceptanceDelay : db.communication_profiles[profileIdx].acceptanceDelay,
      preventDoubleTapsDelay: preventDoubleTapsDelay !== undefined ? preventDoubleTapsDelay : db.communication_profiles[profileIdx].preventDoubleTapsDelay,
      genderTheme: genderTheme !== undefined ? genderTheme : db.communication_profiles[profileIdx].genderTheme,
      avatarConfig: avatarConfig !== undefined ? avatarConfig : db.communication_profiles[profileIdx].avatarConfig,
      aiCredits: aiCredits !== undefined ? aiCredits : db.communication_profiles[profileIdx].aiCredits,
      updatedAt: new Date().toISOString()
    };

    saveDB();
    res.json(db.communication_profiles[profileIdx]);
  });

  // 7. list boards of patient
  app.get('/api/patients/:patientId/boards', (req, res) => {
    const { patientId } = req.params;
    const db = getDB();
    const boards = db.boards.filter(b => b.patientId === patientId);
    res.json(boards);
  });

  // 8. get details of single board (with categories and buttons)
  app.get('/api/boards/:id', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const board = db.boards.find(b => b.id === id);

    if (!board) {
      return res.status(404).json({ error: "Prancha não encontrada" });
    }

    const categories = db.board_categories
      .filter(c => c.boardId === id)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const buttons = db.communication_buttons.filter(btn => btn.boardId === id);

    res.json({
      board,
      categories,
      buttons
    });
  });

  // 9. insert new board
  app.post('/api/boards', (req, res) => {
    const { patientId, name, columns, rows, isDefault } = req.body;
    if (!patientId || !name) {
      return res.status(400).json({ error: "ID do paciente e Nome são obrigatórios" });
    }

    const db = getDB();
    const boardId = `board-${Date.now()}`;

    // If setting as default, remove isDefault from patient's other boards
    if (isDefault) {
      db.boards.forEach(b => {
        if (b.patientId === patientId) b.isDefault = false;
      });
    }

    const newBoard: Board = {
      id: boardId,
      patientId,
      name,
      columns: columns || 4,
      rows: rows || 3,
      isDefault: !!isDefault,
      createdAt: new Date().toISOString()
    };

    db.boards.push(newBoard);

    // Bootstrap basic categories for this board
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
        id: `${boardId}-${c.id}`,
        boardId: boardId,
        name: c.name,
        colorClass: c.colorClass,
        icon: c.icon,
        orderIndex: idx
      });
    });

    saveDB();
    res.status(201).json(newBoard);
  });

  // 10. edit categories (order, names, icons)
  app.put('/api/boards/:boardId/categories', (req, res) => {
    const { boardId } = req.params;
    const categories = req.body as BoardCategory[]; // Full list representing new configs

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "Input categorizado deve ser um array." });
    }

    const db = getDB();
    // Filter out old categories of this board
    db.board_categories = db.board_categories.filter(c => c.boardId !== boardId);
    // Push modern layouts
    db.board_categories.push(...categories);

    saveDB();
    res.json({ success: true, categories });
  });

  // 11. create or update button
  app.post('/api/boards/:boardId/buttons', (req, res) => {
    const { boardId } = req.params;
    const { id, categoryId, label, speechText, imageUrl, colorClass, gridX, gridY, isVisible } = req.body;

    if (!categoryId || !label || !speechText) {
      return res.status(400).json({ error: "Categoria, Legenda e Voz Falada são campos obrigatórios." });
    }

    const db = getDB();
    const btnIdx = db.communication_buttons.findIndex(btn => btn.id === id);

    let targetButton: CommunicationButton;

    if (btnIdx !== -1) {
      // Update
      targetButton = {
        ...db.communication_buttons[btnIdx],
        categoryId,
        label,
        speechText,
        imageUrl: imageUrl !== undefined ? imageUrl : db.communication_buttons[btnIdx].imageUrl,
        colorClass: colorClass !== undefined ? colorClass : db.communication_buttons[btnIdx].colorClass,
        gridX: gridX !== undefined ? gridX : db.communication_buttons[btnIdx].gridX,
        gridY: gridY !== undefined ? gridY : db.communication_buttons[btnIdx].gridY,
        isVisible: isVisible !== undefined ? isVisible : db.communication_buttons[btnIdx].isVisible,
      };
      db.communication_buttons[btnIdx] = targetButton;
    } else {
      // Create new
      targetButton = {
        id: id || `btn-${Date.now()}`,
        boardId,
        categoryId,
        label,
        speechText,
        imageUrl: imageUrl || '💬',
        colorClass: colorClass || 'bg-white border-gray-300 text-gray-900',
        gridX: gridX || 0,
        gridY: gridY || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
        createdAt: new Date().toISOString()
      };
      db.communication_buttons.push(targetButton);
    }

    saveDB();
    res.json(targetButton);
  });

  // 12. delete button
  app.delete('/api/buttons/:id', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    db.communication_buttons = db.communication_buttons.filter(btn => btn.id !== id);
    saveDB();
    res.json({ success: true, message: "Botão removido" });
  });

  // 13. log communication usage
  app.post('/api/patients/:patientId/logs', (req, res) => {
    const { patientId } = req.params;
    const { boardId, buttonId, buttonLabel, categoryName, phraseContext } = req.body;

    if (!buttonId || !buttonLabel || !categoryName) {
      return res.status(400).json({ error: "Dados obrigatórios de log não informados" });
    }

    const db = getDB();
    const log: ButtonUsageLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      patientId,
      boardId: boardId || '',
      buttonId,
      buttonLabel,
      categoryName,
      timestamp: new Date().toISOString(),
      phraseContext
    };

    db.button_usage_logs.push(log);
    saveDB();

    res.status(201).json(log);
  });

  // 14. get patient usage logs
  app.get('/api/patients/:patientId/logs', (req, res) => {
    const { patientId } = req.params;
    const db = getDB();
    const patientLogs = db.button_usage_logs
      .filter(l => l.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(patientLogs);
  });

  // 15. get detailed evolution report for patient
  app.get('/api/patients/:patientId/report', (req, res) => {
    const { patientId } = req.params;
    const db = getDB();
    const patientLogs = db.button_usage_logs.filter(l => l.patientId === patientId);

    // Total expressions/clicks
    const totalUsage = patientLogs.length;

    // Categorized usage breakdown
    const categoryCountMap: { [key: string]: number } = {};
    patientLogs.forEach(l => {
      categoryCountMap[l.categoryName] = (categoryCountMap[l.categoryName] || 0) + 1;
    });

    const categoryStats = Object.keys(categoryCountMap).map(catName => ({
      name: catName,
      count: categoryCountMap[catName],
      percentage: totalUsage > 0 ? Math.round((categoryCountMap[catName] / totalUsage) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Top buttons used
    const buttonCountMap: { [key: string]: { label: string, category: string, count: number } } = {};
    patientLogs.forEach(l => {
      if (!buttonCountMap[l.buttonId]) {
        buttonCountMap[l.buttonId] = { label: l.buttonLabel, category: l.categoryName, count: 0 };
      }
      buttonCountMap[l.buttonId].count++;
    });

    const buttonStats = Object.keys(buttonCountMap).map(btnId => ({
      id: btnId,
      label: buttonCountMap[btnId].label,
      category: buttonCountMap[btnId].category,
      count: buttonCountMap[btnId].count
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Aggregates over last 7 days starting from today down
    const usageByDate: { [key: string]: number } = {};
    const daysArr = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      const str = d.toISOString().split('T')[0];
      usageByDate[str] = 0;
      return str;
    }).reverse();

    patientLogs.forEach(l => {
      const dateStr = l.timestamp.split('T')[0];
      if (usageByDate[dateStr] !== undefined) {
        usageByDate[dateStr]++;
      }
    });

    const historyTimeline = daysArr.map(dStr => {
      const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dateObj = new Date(dStr + 'T12:00:00'); // Prevent timezone shift
      return {
        date: dStr.substring(8, 10) + '/' + dStr.substring(5, 7),
        dayName: weekdayNames[dateObj.getDay()],
        count: usageByDate[dStr]
      };
    });

    // Extract patient's profile details to calculate engagement indicators
    const profile = db.communication_profiles.find(p => p.patientId === patientId);

    // Latest sentence formulations
    const latestSentences = patientLogs
      .filter(l => l.phraseContext && l.phraseContext.includes(' + '))
      .slice(0, 5)
      .map(l => ({
        timestamp: l.timestamp,
        phrase: l.phraseContext
      }));

    res.json({
      totalUsage,
      categoryStats,
      buttonStats,
      historyTimeline,
      latestSentences,
      engagementNotes: profile ? `O perfil comunicacional do paciente possui nível de independência '${profile.motorLevel === 'independent' ? 'Total' : 'Assistida'}' e nível cognitivo '${profile.cognitiveLevel === 'symbolic' ? 'Simbólico' : profile.cognitiveLevel === 'emergent' ? 'Emergente' : 'Pré-simbólico'}'. O cuidador ou terapeuta anotou: "${profile.notes || 'Sem anotações anotadas'}"` : 'Perfil não localizado.'
    });
  });

  // --- VITE MIDDLEWARE BRIDGE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Service static production outputs
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AAC Server running on http://localhost:${PORT}`);
  });
}

startServer();
