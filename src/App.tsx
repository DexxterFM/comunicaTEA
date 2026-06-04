import React, { useState, useEffect, useRef } from 'react';
import {
  Smile,
  Heart,
  AlertTriangle,
  Droplet,
  Coffee,
  Users,
  BookOpen,
  Sparkles,
  Frown,
  Plus,
  Trash2,
  Edit,
  Save,
  Lock,
  Unlock,
  Volume2,
  Printer,
  FileText,
  BarChart3,
  Settings,
  User,
  Calendar,
  RotateCcw,
  Upload,
  Play,
  Check,
  Activity,
  PlusCircle,
  X,
  Phone,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Search,
  LogOut,
  Clock,
  LockKeyhole,
  Cloud,
  Palette
} from 'lucide-react';

import { 
  Patient, 
  CommunicationProfile, 
  Board, 
  BoardCategory, 
  CommunicationButton, 
  ButtonUsageLog 
} from './types';

import { PictogramSVG } from './components/PictogramSVG';
import { AvatarCreator } from './components/AvatarCreator';

import { BehavioralSupportsPanel } from './components/BehavioralSupports';

import { 
  pictogramCategories, 
  pictogramImagesDB, 
  searchPictograms, 
  searchByCategory, 
  PictogramItem, 
  PictogramCategory 
} from './pictograms';

// Web Audio API tactile feedback synthesizers
const playTactileFeedback = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5 
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn('Sound synthesis failed (safari policy):', e);
  }
};

const playUnlockSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
    osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.08); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.16); // E5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
};

// Help map custom icons with Lucide React representations dynamically
const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  switch (name) {
    case 'Smile': return <Smile className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'AlertTriangle': return <AlertTriangle className={className} />;
    case 'Droplet': return <Droplet className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Users': return <Users className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Frown': return <Frown className={className} />;
    default: return <Smile className={className} />;
  }
};

export default function App() {
  // Navigation Screens:
  // - 'login': Portal inicial para pacientes e terapeutas
  // - 'patient-grid': Área de uso exclusiva do paciente (purista, focada e sem distrações administráveis)
  // - 'clinician-panel': Área administrativa/clínica isolada para terapeutas
  const [currentView, setCurrentView] = useState<'login' | 'patient-grid' | 'clinician-panel'>('login');
  
  // States inside Clinician Panel:
  // - 'board-editor': Personalizador visual da prancha PECS do paciente ativo
  // - 'profile-settings': Ajustes de acessibilidade, matriz (col x lin) e síntese de voz
  // - 'pictogram-search': Banco de imagens poderoso com orientações terapêuticas de PECS
  // - 'diagnostics-panel': Relatórios de uso, timelines e expressões frequentes
  // - 'patients-registry': Cadastro e expurgo de prontuários
  const [clinicianTab, setClinicianTab] = useState<'board-editor' | 'profile-settings' | 'pictogram-search' | 'diagnostics-panel' | 'patients-registry' | 'google-drive' | 'avatar-creator'>('board-editor');

  // Authentication Settings
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showPinDialog, setShowPinDialog] = useState<boolean>(false);

  // Core Database lists
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<CommunicationProfile | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [boardDetails, setBoardDetails] = useState<{ board: Board; categories: BoardCategory[]; buttons: CommunicationButton[] } | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  
  // Sentence Construction state
  const [sentenceButtons, setSentenceButtons] = useState<CommunicationButton[]>([]);
  
  // Feedback states
  const [loading, setLoading] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [logs, setLogs] = useState<ButtonUsageLog[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);

  // Button Visual Editor Modal states
  const [showButtonModal, setShowButtonModal] = useState<boolean>(false);
  const [editingButton, setEditingButton] = useState<Partial<CommunicationButton> | null>(null);
  const [customImageBase64, setCustomImageBase64] = useState<string>('');
  
  // Powerful Pictogram Library Local Search states inside Modal
  const [modalPicSearchQuery, setModalPicSearchQuery] = useState<string>('');
  const [modalPicCategory, setModalPicCategory] = useState<string>('all');

  // Powerful Pictogram Library Global Explorer States (Dedicated Tab)
  const [globalPicSearch, setGlobalPicSearch] = useState<string>('');
  const [globalPicCategory, setGlobalPicCategory] = useState<string>('all');
  const [selectedGlobalPic, setSelectedGlobalPic] = useState<PictogramItem | null>(null);

  // Patient Creation Form States
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientBirth, setNewPatientBirth] = useState<string>('');
  const [newPatientNumber, setNewPatientNumber] = useState<string>('');
  const [newPatientDiagnosis, setNewPatientDiagnosis] = useState<string>('');
  const [newPatientResp, setNewPatientResp] = useState<string>('');
  const [newPatientPhone, setNewPatientPhone] = useState<string>('');
  const [newPatientTheme, setNewPatientTheme] = useState<'boy' | 'girl' | 'neutral'>('neutral');

  // TD Snap custom states
  const [showBehavioralSupports, setShowBehavioralSupports] = useState<boolean>(false);
  const [vocabFilterEnabled, setVocabFilterEnabled] = useState<boolean>(false);
  const [vocabFilterList, setVocabFilterList] = useState<string>('');
  const [pronunciationExceptionsList, setPronunciationExceptionsList] = useState<{ written: string; phonetic: string }[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'grid' | 'keyboard' | 'quickfires'>('grid');
  const [keyboardText, setKeyboardText] = useState<string>('');
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>('');
  const [showTopbarSearchBar, setShowTopbarSearchBar] = useState<boolean>(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');

  // Motor control holds and cooldown states
  const [holdingButtonId, setHoldingButtonId] = useState<string | null>(null);
  const [holdingProgress, setHoldingProgress] = useState<number>(0);
  const [lastTapTimestamp, setLastTapTimestamp] = useState<number>(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // PWA (Progressive Web App) states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(true);

  // Google Drive Integration States
  const [gdriveClientId, setGdriveClientId] = useState<string>(() => localStorage.getItem('comunicatea_gdrive_client_id') || '');
  const [gdriveAccessToken, setGdriveAccessToken] = useState<string>(() => localStorage.getItem('comunicatea_gdrive_token') || '');
  const [gdriveUser, setGdriveUser] = useState<any>(null);
  const [gdriveFiles, setGdriveFiles] = useState<any[]>([]);
  const [isGdriveLoading, setIsGdriveLoading] = useState<boolean>(false);
  const [isGdriveDemoMode, setIsGdriveDemoMode] = useState<boolean>(() => localStorage.getItem('comunicatea_gdrive_demo') === 'true');
  const [gdriveDemoFiles, setGdriveDemoFiles] = useState<any[]>(() => {
    const saved = localStorage.getItem('comunicatea_gdrive_demo_files');
    return saved ? JSON.parse(saved) : [
      { id: 'demo-file-1', name: 'comunicatea_backup_pedro_henrique_2026.json', size: 14500, modifiedTime: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'demo-file-2', name: 'comunicatea_backup_carla_antunes_2026.json', size: 12400, modifiedTime: new Date(Date.now() - 86400000 * 5).toISOString() }
    ];
  });

  // Monitor dynamic PWA installation events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    window.addEventListener('appinstalled', () => {
      console.log('ComunicaTEA instalado com sucesso!');
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  // Sync TD Snap states when active profile changes
  useEffect(() => {
    if (profile) {
      setVocabFilterEnabled(!!profile.vocabularyFilterEnabled);
      setVocabFilterList(profile.vocabularyFilterList || "Água, Comer, Brincar, Dormir, Banheiro, Xixi, Cocô, Mamãe, Papai, Sim, Não, Dor");
      
      const themeVal = profile.genderTheme || 'neutral';
      window.__comunicateaActiveTheme__ = themeVal;
      localStorage.setItem('comunicatea_active_theme', themeVal);

      try {
        const parsed = JSON.parse(profile.pronunciationExceptions || '{}');
        const list = Object.entries(parsed).map(([written, phonetic]) => ({
          written,
          phonetic: phonetic as string
        }));
        setPronunciationExceptionsList(list);
      } catch (e) {
        setPronunciationExceptionsList([]);
      }
    } else {
      setVocabFilterEnabled(false);
      setVocabFilterList('');
      setPronunciationExceptionsList([]);
    }
  }, [profile]);

  // Global timer states for floating supports (TD Snap Phase 2)
  const [timerInitial, setTimerInitial] = useState<number>(120); // 2 minutes standard
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(120);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Child-safe hold button progress to exit Patient Mode
  const [exitHoldProgress, setExitHoldProgress] = useState<number>(0);
  const exitHoldTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech availability list
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechUnlockedRef = useRef(false);

  // Load browser voices
  useEffect(() => {
    const listSpeechVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    listSpeechVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = listSpeechVoices;
    }
  }, []);

  const unlockSpeechSynthesis = () => {
    if (!('speechSynthesis' in window) || speechUnlockedRef.current) return;
    speechUnlockedRef.current = true;
    window.speechSynthesis.resume();
    setAvailableVoices(window.speechSynthesis.getVoices());
  };

  const requestLandscapeOrientation = async () => {
    const orientation = window.screen?.orientation as ScreenOrientation & {
      lock?: (orientation: 'landscape') => Promise<void>;
    };
    if (!orientation?.lock) return;
    try {
      await orientation.lock('landscape');
    } catch (e) {
      // iOS/Safari and some Android browsers only allow this in installed fullscreen PWAs.
      console.warn('Landscape orientation lock unavailable in this browser mode.', e);
    }
  };

  useEffect(() => {
    if (currentView !== 'patient-grid') return;
    requestLandscapeOrientation();
  }, [currentView]);

  const handlePatientCanvasPointerDown = () => {
    unlockSpeechSynthesis();
    requestLandscapeOrientation();
  };

  // Sync / Refresh Patients Database initially
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (selectIdToActivate?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      setPatients(data);
      if (data.length > 0) {
        const idToSelect = selectIdToActivate || data[0].id;
        setSelectedPatientId(idToSelect);
      } else {
        setSelectedPatientId('');
        setSelectedPatient(null);
        setProfile(null);
        setBoards([]);
        setBoardDetails(null);
      }
    } catch (e) {
      console.error("Clinical error fetching database patients", e);
    } finally {
      setLoading(false);
    }
  };

  // Sync selected patient's AAC profile & PECS boards
  useEffect(() => {
    if (!selectedPatientId) return;
    
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const activePat = patients.find(p => p.id === selectedPatientId);
        if (activePat) setSelectedPatient(activePat);

        // Fetch AAC Profile
        const profRes = await fetch(`/api/patients/${selectedPatientId}/profile?v=${Date.now()}`, { cache: 'no-store' });
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData);
        }

        // Fetch PECS Boards
        const boardsRes = await fetch(`/api/patients/${selectedPatientId}/boards?v=${Date.now()}`, { cache: 'no-store' });
        if (boardsRes.ok) {
          const boardsData = await boardsRes.json();
          setBoards(boardsData);
          const defaultB = boardsData.find((b: Board) => b.isDefault) || boardsData[0];
          if (defaultB) {
            setSelectedBoardId(defaultB.id);
          } else {
            setSelectedBoardId('');
            setBoardDetails(null);
          }
        }

        setSentenceButtons([]);
        setActiveCategoryId('all');
        fetchLogs(selectedPatientId);
      } catch (e) {
        console.error("Clinical communication error mapping sync metrics:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [selectedPatientId, patients]);

  // Load board details when board ID is changed
  useEffect(() => {
    if (!selectedBoardId) return;
    const fetchBoardInfo = async () => {
      try {
        const res = await fetch(`/api/boards/${selectedBoardId}?v=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBoardDetails(data);
        }
      } catch (e) {
        console.error("Database mismatch loading PECS buttons:", e);
      }
    };
    fetchBoardInfo();
  }, [selectedBoardId]);

  // Fetch interactive clinical reports
  const fetchLogs = async (pId: string) => {
    try {
      const logsRes = await fetch(`/api/patients/${pId}/logs`);
      if (logsRes.ok) {
        setLogs(await logsRes.json());
      }
      const reportRes = await fetch(`/api/patients/${pId}/report`);
      if (reportRes.ok) {
        setReportsData(await reportRes.json());
      }
    } catch (e) {
      console.warn("Silent reports load failed:", e);
    }
  };

  // Speaks out the Brazilian Portuguese text cleanly with customized parameters
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();

    // Process pronunciation exceptions from the patient's active profile
    let textToSpeak = text;
    if (profile && profile.pronunciationExceptions) {
      try {
        const exceptions: Record<string, string> = JSON.parse(profile.pronunciationExceptions);
        Object.entries(exceptions).forEach(([written, phonetic]) => {
          if (written.trim()) {
            const escaped = written.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            // Matches whole words exactly, ignoring case
            const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
            textToSpeak = textToSpeak.replace(regex, phonetic);
          }
        });
      } catch (e) {
        console.warn("Error parsing pronunciation exceptions", e);
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';

    if (profile) {
      utterance.rate = profile.preferredVoiceSpeechRate || 1.0;
      utterance.pitch = profile.preferredVoicePitch || 1.0;

      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const ptBRVoices = voices.filter(v => v.lang.includes('pt-BR') || v.lang.includes('pt'));
      
      let matchedVoice: SpeechSynthesisVoice | undefined;
      if (profile.preferredVoiceGender === 'male') {
        matchedVoice = ptBRVoices.find(v => v.name.toLowerCase().includes('masculino') || v.name.toLowerCase().includes('daniel') || !v.name.toLowerCase().includes('helena'));
      } else if (profile.preferredVoiceGender === 'female') {
        matchedVoice = ptBRVoices.find(v => v.name.toLowerCase().includes('feminino') || v.name.toLowerCase().includes('helena') || v.name.toLowerCase().includes('maria'));
      }
      
      if (!matchedVoice && ptBRVoices.length > 0) {
        matchedVoice = ptBRVoices[0];
      }
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }
    window.speechSynthesis.speak(utterance);
  };

  // Helper check for TD Snap Vocabulary Filter (Chapter 8)
  const isButtonFilteredOut = (btn: CommunicationButton) => {
    if (!vocabFilterEnabled || !vocabFilterList.trim()) return false;
    const allowed = vocabFilterList
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);
    if (allowed.length === 0) return false;
    
    const labelLower = btn.label.toLowerCase();
    const speechLower = btn.speechText.toLowerCase();
    
    return !allowed.some(word => labelLower.includes(word) || speechLower.includes(word));
  };

  // Helper action to invoke standard browser PWA install prompt
  const handlePWAInstallClick = async () => {
    playTactileFeedback();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install choice accepted status: ${outcome}`);
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Button clicks trigger tactile feedback, speech, sentence recording, and analytics logging
  const handleAACButtonClick = async (btn: CommunicationButton) => {
    // Check double tap delay limit on immediate / programmatic executions
    const doubleTapDelay = profile?.preventDoubleTapsDelay || 0;
    if (doubleTapDelay > 0) {
      const now = Date.now();
      const elapsed = (now - lastTapTimestamp) / 1000;
      if (elapsed < doubleTapDelay) {
        console.log("Button click mashing rejected.");
        return;
      }
    }

    setLastTapTimestamp(Date.now());
    playTactileFeedback();
    speakText(btn.speechText);

    // Append to phrase builder list (up to 8 visual cards max)
    setSentenceButtons(prev => {
      if (prev.length >= 8) return [...prev.slice(1), btn];
      return [...prev, btn];
    });

    try {
      const activeCat = boardDetails?.categories.find(c => c.id === btn.categoryId);
      const catName = activeCat ? activeCat.name : 'Geral';
      
      await fetch(`/api/patients/${selectedPatientId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: selectedBoardId,
          buttonId: btn.id,
          buttonLabel: btn.label,
          categoryName: catName,
          phraseContext: btn.label
        })
      });
      fetchLogs(selectedPatientId);
    } catch (e) {
      console.warn("Silent log request ignored:", e);
    }
  };

  // Composite Sentence Speech synthesis
  const speakAssembledSentence = async () => {
    if (sentenceButtons.length === 0) return;
    const texts = sentenceButtons.map(b => b.speechText || b.label);
    const jointPhrase = texts.join(' ');
    
    playTactileFeedback();
    speakText(jointPhrase);

    // Register compound sentence block logs
    try {
      const phraseFull = sentenceButtons.map(b => b.label).join(' + ');
      await fetch(`/api/patients/${selectedPatientId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: selectedBoardId,
          buttonId: 'compound-sentence',
          buttonLabel: 'Frase Sintetizada',
          categoryName: 'Combinação',
          phraseContext: phraseFull
        })
      });
      fetchLogs(selectedPatientId);
    } catch (e) {}
  };

  // Exit hold timers to verify adult intention to exit patient's AAC mode
  const startExitHold = () => {
    setExitHoldProgress(0);
    exitHoldTimerRef.current = setInterval(() => {
      setExitHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(exitHoldTimerRef.current!);
          playUnlockSound();
          setExitHoldProgress(0);
          setCurrentView('login');
          return 0;
        }
        return prev + 5; // Takes 2 seconds to loop up to 100 on 100ms ticks
      });
    }, 100);
  };

  const cancelExitHold = () => {
    if (exitHoldTimerRef.current) {
      clearInterval(exitHoldTimerRef.current);
      exitHoldTimerRef.current = null;
    }
    setExitHoldProgress(0);
  };

  // Motor activation hold timers (Acceptance Delay) and double click blockages
  const startButtonHold = (btn: CommunicationButton) => {
    // Check double tap delay limit
    const doubleTapDelay = profile?.preventDoubleTapsDelay || 0;
    if (doubleTapDelay > 0) {
      const now = Date.now();
      const elapsed = (now - lastTapTimestamp) / 1000;
      if (elapsed < doubleTapDelay) {
        console.log("Mashing tap blocked by motor control delay.");
        return;
      }
    }

    const acceptanceDelay = profile?.acceptanceDelay || 0;
    if (acceptanceDelay === 0) {
      // Immediate action if acceptance delay is not configured
      setLastTapTimestamp(Date.now());
      handleAACButtonClick(btn);
      return;
    }

    // Start timer hold loop
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }

    setHoldingButtonId(btn.id);
    setHoldingProgress(1);

    const periodMs = 40; // update progress smooth
    const totalDurationMs = acceptanceDelay * 1000;
    let elapsedMs = 0;

    holdIntervalRef.current = setInterval(() => {
      elapsedMs += periodMs;
      const progress = Math.min((elapsedMs / totalDurationMs) * 100, 100);
      setHoldingProgress(progress);

      if (progress >= 100) {
        if (holdIntervalRef.current) {
          clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
        setHoldingButtonId(null);
        setHoldingProgress(0);
        setLastTapTimestamp(Date.now());
        handleAACButtonClick(btn);
      }
    }, periodMs);
  };

  const cancelButtonHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldingButtonId(null);
    setHoldingProgress(0);
  };

  // Submits the newly registered clinical patient structure
  const handleAddNewPatientRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPatientName,
          birthDate: newPatientBirth,
          recordNumber: newPatientNumber,
          diagnosis: newPatientDiagnosis,
          responsibleName: newPatientResp,
          responsiblePhone: newPatientPhone,
          genderTheme: newPatientTheme
        })
      });

      if (res.ok) {
        const result = await res.json();
        setNewPatientName('');
        setNewPatientBirth('');
        setNewPatientNumber('');
        setNewPatientDiagnosis('');
        setNewPatientResp('');
        setNewPatientPhone('');
        setNewPatientTheme('neutral');
        
        await fetchPatients(result.patient.id);
        triggerToastNotification('Paciente e Prancha PECS inicial configurados com absoluto sucesso!');
      }
    } catch (err) {
      console.error("Clinical management directory failure:", err);
    }
  };

  // Erase patient context
  const deleteActivePatientContext = async () => {
    if (!selectedPatientId || !selectedPatient) return;
    const accept = window.confirm(`ATENÇÃO DE SEGURANÇA: Tem certeza de que quer excluir permanentemente o paciente "${selectedPatient.name}" e todos os dados relacionados? Essa ação apagará pranchas físicas, logs e o histórico e não poderá ser desfeita.`);
    if (accept) {
      try {
        const res = await fetch(`/api/patients/${selectedPatientId}`, { method: 'DELETE' });
        if (res.ok) {
          triggerToastNotification(`Os dados do prontuário do paciente foram excluídos com sucesso do ERP.`);
          fetchPatients();
        }
      } catch (e) {
        console.error("Therapeutic database error during deletion:", e);
      }
    }
  };

  // Local Backup Serialization (Backup, Sincronização & Compartilhamento - Chapter 13)
  const exportPatientBackupJSON = async (targetPatientId: string) => {
    try {
      playTactileFeedback();
      const resPatient = await fetch(`/api/patients`);
      if (!resPatient.ok) return;
      const allPatients = await resPatient.json();
      const patientData = allPatients.find((p: any) => p.id === targetPatientId);
      if (!patientData) return;

      // Get profile
      const resProfile = await fetch(`/api/patients/${targetPatientId}/profile`);
      const profileData = resProfile.ok ? await resProfile.json() : null;

      // Get Board details
      const resBoards = await fetch(`/api/patients/${targetPatientId}/boards`);
      let boardsWithButtons: any[] = [];
      if (resBoards.ok) {
        const patientBoards = await resBoards.json();
        for (const b of patientBoards) {
          const resBDetails = await fetch(`/api/boards/${b.id}`);
          if (resBDetails.ok) {
            boardsWithButtons.push(await resBDetails.json());
          }
        }
      }

      const backupObj = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        patient: patientData,
        profile: profileData,
        boards: boardsWithButtons
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `comunicatea_backup_${patientData.name.toLowerCase().replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      triggerToastNotification('Backup compactado JSON exportado com sucesso!');
    } catch (err) {
      console.error("Backup trigger failed", err);
      alert("Falha ao preparar arquivo de sincronização.");
    }
  };

  const handleImportBackupJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      playTactileFeedback();
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const backupObj = JSON.parse(event.target?.result as string);
          if (!backupObj.patient || !backupObj.patient.name) {
            alert("Estrutura do backup JSON inválida para sincronização de prontuários.");
            return;
          }

          const importRes = await fetch(`/api/patients/backup-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backupObj)
          });

          if (importRes.ok) {
            const result = await importRes.json();
            await fetchPatients(result.patientId);
            triggerToastNotification('Paciente e Pranchas de CAA importados e sincronizados com sucesso!');
          } else {
            const errorMsg = await importRes.text();
            alert(`Falha na restauração do backup: ${errorMsg}`);
          }
        } catch (err) {
          console.error("Parse failed", err);
          alert("Erro catastrófico ao ler arquivo JSON de backup.");
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset file input
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  // Google Drive Integration and Cloud Synchronization Logic
  const handleGdriveLogin = () => {
    if (!gdriveClientId) {
      alert("Por favor, insira o seu Google Client ID de Terapeuta no painel de configurações antes de conectar.");
      return;
    }
    localStorage.setItem('comunicatea_gdrive_client_id', gdriveClientId);
    setIsGdriveDemoMode(false);
    localStorage.removeItem('comunicatea_gdrive_demo');

    const redirectUri = window.location.origin + '/';
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${encodeURIComponent(gdriveClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=gdrive_auth`;

    window.location.href = authUrl;
  };

  const handleGdriveLogout = () => {
    setGdriveAccessToken('');
    setGdriveUser(null);
    setGdriveFiles([]);
    localStorage.removeItem('comunicatea_gdrive_token');
    triggerToastNotification('Sessão do Google Drive encerrada.');
  };

  const fetchGdriveUserProfile = async (token: string) => {
    setIsGdriveLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGdriveUser(data);
        await fetchGdriveFilesList(token);
      } else {
        handleGdriveLogout();
      }
    } catch (err) {
      console.error("Failed to fetch Google User profile:", err);
    } finally {
      setIsGdriveLoading(false);
    }
  };

  const fetchGdriveFilesList = async (token: string) => {
    setIsGdriveLoading(true);
    try {
      const q = encodeURIComponent("name contains 'comunicatea_backup_' and mimeType = 'application/json' and trashed = false");
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,size,modifiedTime)&orderBy=modifiedTime desc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGdriveFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to fetch Google Drive files list:", err);
    } finally {
      setIsGdriveLoading(false);
    }
  };

  const uploadBackupToGdrive = async (targetPatientId: string) => {
    playTactileFeedback();
    setIsGdriveLoading(true);
    try {
      const resPatient = await fetch(`/api/patients`);
      if (!resPatient.ok) throw new Error("Erro ao carregar prontuários clínicos.");
      const allPatients = await resPatient.json();
      const patientData = allPatients.find((p: any) => p.id === targetPatientId);
      if (!patientData) throw new Error("Atenção: Paciente não mapeado no sistema.");

      const resProfile = await fetch(`/api/patients/${targetPatientId}/profile`);
      const profileData = resProfile.ok ? await resProfile.json() : null;

      const resBoards = await fetch(`/api/patients/${targetPatientId}/boards`);
      let boardsWithButtons: any[] = [];
      if (resBoards.ok) {
        const patientBoards = await resBoards.json();
        for (const b of patientBoards) {
          const resBDetails = await fetch(`/api/boards/${b.id}`);
          if (resBDetails.ok) {
            boardsWithButtons.push(await resBDetails.json());
          }
        }
      }

      const backupObj = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        patient: patientData,
        profile: profileData,
        boards: boardsWithButtons
      };

      const safePatientName = patientData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
      const fileName = `comunicatea_backup_${safePatientName}_${Date.now().toString().slice(-4)}.json`;

      if (isGdriveDemoMode) {
        setTimeout(() => {
          const newMockFile = {
            id: `demo-file-${Date.now()}`,
            name: fileName,
            size: JSON.stringify(backupObj).length,
            modifiedTime: new Date().toISOString()
          };
          const updated = [newMockFile, ...gdriveDemoFiles];
          setGdriveDemoFiles(updated);
          localStorage.setItem('comunicatea_gdrive_demo_files', JSON.stringify(updated));
          triggerToastNotification(`Backup "${fileName}" salvo na Nuvem Cooperativa (Demonstração)!`);
          setIsGdriveLoading(false);
        }, 600);
        return;
      }

      if (!gdriveAccessToken) {
        alert("Autenticação necessária. Faça login na sua conta Google Drive.");
        setIsGdriveLoading(false);
        return;
      }

      const metadata = {
        name: fileName,
        mimeType: 'application/json'
      };

      const boundary = 'comunicatea_upload_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartBody = [
        delimiter,
        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
        JSON.stringify(metadata),
        delimiter,
        'Content-Type: application/json\r\n\r\n',
        JSON.stringify(backupObj, null, 2),
        closeDelimiter
      ].join('');

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gdriveAccessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (response.ok) {
        triggerToastNotification(`Cópia em nuvem "${fileName}" criada com sucesso no Google Drive!`);
        await fetchGdriveFilesList(gdriveAccessToken);
      } else {
        const errorText = await response.text();
        console.error("Google Drive upload failure:", errorText);
        alert(`Ocorreu um erro de permissão ou cota na sincronização de arquivos Google API: ${errorText}`);
      }
    } catch (err: any) {
      console.error("Failed to backup to Google Drive:", err);
      alert(`Falha ao sincronizar prontuário: ${err.message || err}`);
    } finally {
      setIsGdriveLoading(false);
    }
  };

  const restoreBackupFromGdrive = async (fileId: string, fileName: string) => {
    const confirmRestore = window.confirm(`ATENÇÃO DE IMPORTAÇÃO: Deseja importar o prontuário e restaurar as pranchas contidos no arquivo de nuvem "${fileName}"? Isso recriará o paciente no sistema.`);
    if (!confirmRestore) return;

    playTactileFeedback();
    setIsGdriveLoading(true);
    try {
      let backupObj: any = null;

      if (isGdriveDemoMode) {
        setTimeout(async () => {
          try {
            const rawName = fileName.replace('comunicatea_backup_', '').replace('.json', '');
            const parsedName = rawName.split('_').slice(0, -1).join(' ');
            const finalName = parsedName ? parsedName.toUpperCase() : "Paciente Demonstrativo Nuvem";

            const mockBackupObj = {
              version: "1.0",
              patient: {
                name: finalName,
                birthDate: "2019-07-22",
                diagnosis: "Transtorno do Espectro Autista (TEA) - Nível de Suporte 2",
                responsibleName: "Carla de Lima",
                responsiblePhone: "(11) 97775-6543"
              },
              profile: {
                motorLevel: "independent",
                cognitiveLevel: "symbolic",
                preferredVoiceGender: "female",
                preferredVoiceSpeechRate: 1.0,
                preferredVoicePitch: 1.0,
                gridSizeColumns: 4,
                gridSizeRows: 3,
                highContrast: false,
                notes: "Restaurado com sucesso de backup de simulação em sandbox escolar.",
                acceptanceDelay: 0,
                preventDoubleTapsDelay: 0
              },
              boards: [
                {
                  board: { name: "Prancha Escolhida Google", columns: 4, rows: 3 },
                  categories: [
                    { id: "cat-cloud-1", name: "Desejos", colorClass: "bg-emerald-100 border-emerald-300 text-emerald-950", icon: "💬" }
                  ],
                  buttons: [
                    { id: "btn-cloud-1", categoryId: "cat-cloud-1", label: "Quero Brincar", speechText: "Eu quero brincar.", imageUrl: "🧩", gridX: 0, gridY: 0, isVisible: true },
                    { id: "btn-cloud-2", categoryId: "cat-cloud-1", label: "Estou cansado", speechText: "Estou cansado.", imageUrl: "🥱", gridX: 1, gridY: 0, isVisible: true }
                  ]
                }
              ]
            };

            const importRes = await fetch(`/api/patients/backup-import`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mockBackupObj)
            });

            if (importRes.ok) {
              const result = await importRes.json();
              await fetchPatients(result.patientId);
              triggerToastNotification(`[DEMO] Prontuário de "${mockBackupObj.patient.name}" importado com sucesso!`);
            } else {
              alert("Falha no salvamento do paciente no banco local.");
            }
          } catch (e) {
            console.error("Demo restoration parsing failed:", e);
          } finally {
            setIsGdriveLoading(false);
          }
        }, 700);
        return;
      }

      if (!gdriveAccessToken) {
        alert("Erro: Sessão do Google Drive expirada. Refaça o login.");
        setIsGdriveLoading(false);
        return;
      }

      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${gdriveAccessToken}` }
      });

      if (!res.ok) {
        throw new Error(`Falha ao obter dados da API Google Drive do arquivo: ${res.statusText}`);
      }

      backupObj = await res.json();

      if (!backupObj.patient || !backupObj.patient.name) {
        alert("Formato de arquivo corrompido ou inadequado para o ERP ComunicaTEA.");
        setIsGdriveLoading(false);
        return;
      }

      const importRes = await fetch(`/api/patients/backup-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupObj)
      });

      if (importRes.ok) {
        const result = await importRes.json();
        await fetchPatients(result.patientId);
        triggerToastNotification(`Paciente "${backupObj.patient.name}" restaurado e integrado ao consultório!`);
      } else {
        const errorMsg = await importRes.text();
        alert(`Erro ao sincronizar backup local: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("Critical Google Drive backup restore fail:", err);
      alert(`Falha na recuperação de prontuário: ${err.message || err}`);
    } finally {
      setIsGdriveLoading(false);
    }
  };

  const deleteBackupFromGdrive = async (fileId: string, fileName: string) => {
    const confirmDelete = window.confirm(`TEM CERTEZA? Deseja excluir permanentemente o arquivo de backup de nuvem "${fileName}"? Cuidado: isso irá apagar a cópia física do Google Drive.`);
    if (!confirmDelete) return;

    playTactileFeedback();
    setIsGdriveLoading(true);
    try {
      if (isGdriveDemoMode) {
        setTimeout(() => {
          const updated = gdriveDemoFiles.filter(f => f.id !== fileId);
          setGdriveDemoFiles(updated);
          localStorage.setItem('comunicatea_gdrive_demo_files', JSON.stringify(updated));
          triggerToastNotification(`[DEMO] Backup removido das simulações de nuvem.`);
          setIsGdriveLoading(false);
        }, 400);
        return;
      }

      if (!gdriveAccessToken) return;

      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${gdriveAccessToken}` }
      });

      if (res.ok) {
        triggerToastNotification('Cópia removida do Google Drive.');
        await fetchGdriveFilesList(gdriveAccessToken);
      } else {
        alert('Falha na exclusão do arquivamento do Google Drive.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGdriveLoading(false);
    }
  };

  const handleActivateDemoMode = () => {
    playTactileFeedback();
    setIsGdriveDemoMode(true);
    localStorage.setItem('comunicatea_gdrive_demo', 'true');
    setGdriveUser({
      name: "Terapeuta Demonstrativo",
      email: "terapeuta.tea.sandbox@gmail.com",
      picture: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
    });
    triggerToastNotification('Modo de Demonstração Interativa do Google Drive calibrado!');
  };

  const handleDeactivateDemoMode = () => {
    playTactileFeedback();
    setIsGdriveDemoMode(false);
    localStorage.removeItem('comunicatea_gdrive_demo');
    if (!gdriveAccessToken) {
      setGdriveUser(null);
    } else {
      fetchGdriveUserProfile(gdriveAccessToken);
    }
    triggerToastNotification('Modo de Sincronização Real Restabelecido.');
  };

  // Google OAuth redirect callback listener check
  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const token = params.get('access_token');
      const state = params.get('state');
      if (token && state === 'gdrive_auth') {
        window.location.hash = '';
        setGdriveAccessToken(token);
        localStorage.setItem('comunicatea_gdrive_token', token);
        setCurrentView('clinician-panel');
        setClinicianTab('google-drive');
        fetchGdriveUserProfile(token);
      }
    }
  }, []);

  // Sync / Restore Google User on mounting
  useEffect(() => {
    if (gdriveAccessToken && !isGdriveDemoMode) {
      fetchGdriveUserProfile(gdriveAccessToken);
    } else if (isGdriveDemoMode) {
      setGdriveUser({
        name: "Terapeuta Demonstrativo",
        email: "terapeuta.tea.sandbox@gmail.com",
        picture: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
      });
    }
  }, []);

  // Update profile parameters (sizes, high contrast, voices)
  const saveProfileSettingsChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !profile) return;

    try {
      const res = await fetch(`/api/patients/${selectedPatientId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        triggerToastNotification('Configurações de acessibilidade física e voz atualizadas no prontuário.');
      }
    } catch (e) {
      console.error("Clinical writing failure:", e);
    }
  };

  // Save customized card trigger to backend db
  const handleSaveButtonDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingButton || !selectedBoardId || !boardDetails) return;

    if (!editingButton.label?.trim() || !editingButton.categoryId) {
      alert("Por favor, informe uma etiqueta e relacione o botão a uma categoria clínica.");
      return;
    }

    const payload = {
      ...editingButton,
      label: editingButton.label.trim(),
      speechText: editingButton.speechText?.trim() || editingButton.label.trim(),
      imageUrl: customImageBase64 || editingButton.imageUrl || '💬'
    };

    try {
      const res = await fetch(`/api/boards/${selectedBoardId}/buttons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setBoardDetails(prev => {
          if (!prev) return prev;
          const updated = [...prev.buttons];
          const idx = updated.findIndex(b => b.id === saved.id);
          if (idx !== -1) {
            updated[idx] = saved;
          } else {
            updated.push(saved);
          }
          return { ...prev, buttons: updated };
        });
        setShowButtonModal(false);
        setEditingButton(null);
        setCustomImageBase64('');
      }
    } catch (e) {
      console.error("PECS compilation directory write error:", e);
    }
  };

  // Delete customized button cell
  const deleteActiveCellButton = async (btnId: string) => {
    if (!window.confirm("Gostaria de apagar este botão de comunicação da prancha ativa?")) return;
    try {
      const res = await fetch(`/api/buttons/${btnId}`, { method: 'DELETE' });
      if (res.ok) {
        setBoardDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            buttons: prev.buttons.filter(b => b.id !== btnId)
          };
        });
        setShowButtonModal(false);
        setEditingButton(null);
      }
    } catch (e) {
      console.error("Administrative button clearing error:", e);
    }
  };

  // Local image files to Base64 translator
  const handleLocalImageBase64Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Arquivo muito pesado para armazenamento tátil de baixa latência. Escolha uma foto de até 2MB.");
      return;
    }
    const r = new FileReader();
    r.onloadend = () => {
      if (typeof r.result === 'string') {
        setCustomImageBase64(r.result);
      }
    };
    r.readAsDataURL(file);
  };

  // PIN security unlocks clinical area
  const loginToClinicalConfigurations = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      playUnlockSound();
      setCurrentView('clinician-panel');
      setPinInput('');
      setPinError('');
      setShowPinDialog(false);
    } else {
      setPinError('PIN de Acesso incorreto! DICA DE USO CLÍNICO: Use o código de desenvolvimento 1234.');
    }
  };

  // Dynamic status triggers for clinical validation alerts
  const triggerToastNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4050);
  };

  // Standard custom visual grid compilation depending on settings
  const highContrastStyle = profile?.highContrast ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-800';

  // Dynamic filter lists for Pictograms modal and explorer
  const modalFilteredPics = pictogramImagesDB.filter(p => {
    const textMatch = p.label.toLowerCase().includes(modalPicSearchQuery.toLowerCase()) || 
                      p.keywords.some(key => key.toLowerCase().includes(modalPicSearchQuery.toLowerCase()));
    const catMatch = modalPicCategory === 'all' || p.category === modalPicCategory;
    return textMatch && catMatch;
  });

  const globalFilteredPics = pictogramImagesDB.filter(p => {
    const textMatch = p.label.toLowerCase().includes(globalPicSearch.toLowerCase()) || 
                      p.keywords.some(key => key.toLowerCase().includes(globalPicSearch.toLowerCase()));
    const catMatch = globalPicCategory === 'all' || p.category === globalPicCategory;
    return textMatch && catMatch;
  });

  return (
    <div id="main-view-container" className={`min-h-screen ${highContrastStyle} font-sans flex flex-col transition-colors duration-200 print:bg-white print:text-black`}>
      
      {/* Toast Alert Success trigger */}
      {successToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-indigo-900 border border-indigo-700 text-white shadow-xl px-5 py-3 rounded-2xl flex items-center gap-3 z-50 animate-bounce tracking-wide text-xs font-semibold print:hidden">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ------------------------------- SCREEN 1: LOGIN PORTAL ------------------------------- */}
      {currentView === 'login' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gradient-to-br from-indigo-50/50 via-slate-100 to-indigo-50/30">
          
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 bg-white rounded-[32px] shadow-xl border border-gray-150 overflow-hidden min-h-[500px]">
            
            {/* Esquerdo: Identidade do Sistema */}
            <div className="md:col-span-4 bg-indigo-950 p-8 flex flex-col justify-between text-white relative">
              <div className="absolute inset-0 bg-indigo-900/40 opacity-70 mix-blend-overlay"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white text-indigo-950 font-black text-2xl rounded-2xl flex items-center justify-center shadow-lg mb-6 tracking-tighter">
                  C
                </div>
                <h1 className="text-xl font-black leading-tight tracking-tight">Portal Clínica TEA</h1>
                <p className="text-indigo-200 text-xs mt-2 font-medium leading-relaxed">
                  Sistema Integrado de Comunicação Alternativa e Ampliada (CAA) de Alta Tecnologia para Autismo e Paralisia Cerebral.
                </p>
              </div>

              <div className="relative z-10 border-t border-indigo-800 pt-6 mt-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-400 fill-current animate-pulse shrink-0" />
                  <div className="text-left text-[11px] text-indigo-200 leading-snug">
                    <p className="font-bold text-white">Prancha PECS Inteligente</p>
                    <p>Estimula vocalização em pt-BR e mede o avanço cognitivo.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Direito: Os dois canais de login isolados */}
            <div className="md:col-span-8 p-8 flex flex-col justify-center gap-8 bg-white">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                
                {/* Canal A: Seleção de Paciente para Uso Prático */}
                <div className="border border-slate-150 rounded-[24px] p-6 bg-slate-50 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-indigo-200">
                  <div className="absolute top-0 right-0 bg-indigo-100 px-3 py-1 rounded-bl-xl font-bold text-[10px] text-indigo-700 uppercase">
                    Comunicação
                  </div>

                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-650 mb-4">
                      <Smile className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-black text-slate-900">Área do Paciente (Uso)</h2>
                    <p className="text-xs text-gray-500 mt-1 lines-clamp-2 leading-relaxed">
                      Especializado apenas nas funções principais para evitar dispersões sensoriais ou toques acidentais.
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Selecione o Prontuário:</label>
                    
                    {patients.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1">
                        {patients.map(p => (
                          <button
                            key={p.id}
                            id={`login-patient-${p.id}`}
                            onClick={() => {
                              setSelectedPatientId(p.id);
                              playTactileFeedback();
                              setCurrentView('patient-grid');
                            }}
                            className="w-full bg-white border border-gray-250 p-2.5 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/20 text-left text-xs font-bold text-slate-900 flex items-center justify-between transition-all"
                          >
                            <div className="truncate">
                              <p className="truncate font-black">{p.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{p.recordNumber}</p>
                            </div>
                            <span className="text-indigo-600 shrink-0 text-xs ml-2">Iniciar →</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 text-yellow-905 rounded-xl text-xs">
                        Nenhum paciente cadastrado. Destrave a Área do Terapeuta para cadastrar.
                      </div>
                    )}
                  </div>
                </div>

                {/* Canal B: Uso Técnico Clínico Administrador */}
                <div className="border border-slate-150 rounded-[24px] p-6 bg-slate-50 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-amber-200">
                  
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                      <LockKeyhole className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-black text-slate-900">Uso Técnico Clínico</h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Configure grades, cadastros, relatórios e use o banco poderoso de de imagens clínicas.
                    </p>
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-4">
                    {showPinDialog ? (
                      <form onSubmit={loginToClinicalConfigurations} className="space-y-3">
                        <label className="block text-[10px] font-black uppercase text-slate-500">Senha PIN do Atendimento:</label>
                        <div className="flex gap-1.5">
                          <input
                            type="password"
                            placeholder="Ex: 1234"
                            maxLength={4}
                            value={pinInput}
                            onChange={(e) => {
                              setPinInput(e.target.value.replace(/\D/g, ''));
                              setPinError('');
                            }}
                            className="bg-white text-slate-950 font-bold border border-gray-300 rounded-xl px-3 py-2 text-center text-sm w-full focus:ring-2 focus:ring-indigo-550 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs px-3.5 rounded-xl shadow-md transition-transform active:scale-95 shrink-0"
                          >
                            Entrar
                          </button>
                        </div>
                        {pinError && (
                          <p className="text-[10px] font-semibold text-red-600 leading-tight">{pinError}</p>
                        )}
                        <p className="text-[9px] text-gray-505">Senha padrão de fábrica: <strong className="text-indigo-600">1234</strong></p>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          playTactileFeedback();
                          setShowPinDialog(true);
                        }}
                        className="w-full bg-indigo-950 hover:bg-slate-900 text-white font-black text-xs py-2.5 rounded-xl shadow-sm text-center transition-all flex items-center justify-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-amber-400 animate-spin-once" />
                        Acessar Área Limitada (Terapeuta)
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* PWA / Web App Installation Promo Banner */}
              {showInstallBanner && (
                <div className="border border-emerald-200 bg-gradient-to-r from-emerald-50/50 via-teal-50/40 to-indigo-50/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in mt-2 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 text-xl font-black">
                      📱
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 leading-none">
                        Dica Clínica: Instale o ComunicaTEA em seu Dispositivo!
                        <span className="text-[9px] bg-emerald-600 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase">PWA</span>
                      </h4>
                      <p className="text-[10.5px] text-gray-500 mt-1 font-medium leading-relaxed max-w-[450px]">
                        Funciona <strong>sem internet (100% off-line)</strong>, abre em tela cheia sem barras de navegador para evitar distrações para a criança, e adiciona um ícone na área de trabalho.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {deferredPrompt ? (
                      <button
                        onClick={handlePWAInstallClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
                      >
                        📲 Instalar Agora (Grátis)
                      </button>
                    ) : (
                      <div className="text-[9.5px] text-slate-800 bg-white border border-neutral-200 px-3 py-2 rounded-xl max-w-[240px] font-bold shadow-sm whitespace-pre-line leading-tight">
                        💡 <strong>No iPad/iPhone:</strong> Toque no ícone de Compartilhar <span className="inline-block border border-gray-300 rounded px-1.5 py-0.5 bg-neutral-100">📤</span> e escolha <strong className="text-indigo-650">"Adicionar à Tela de Início"</strong>.
                      </div>
                    )}
                    <button
                      onClick={() => { playTactileFeedback(); setShowInstallBanner(false); }}
                      className="text-[10px] font-extrabold text-neutral-400 hover:text-neutral-600 transition-colors text-center shrink-0 leading-none py-1.5 px-2 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    >
                      Dispensar dica
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ---------------------------- SCREEN 2: PACIENT EXCLUSIVE AREA ---------------------------- */}
      {currentView === 'patient-grid' && selectedPatient && (
        <div
          id="patient-only-canvas"
          className="flex-1 flex flex-col bg-[#cbd2db] text-slate-950 font-sans h-screen overflow-hidden select-none print:hidden"
          onPointerDown={handlePatientCanvasPointerDown}
        >
          
          {/* 1. TD SNAP HIGH-FIDELITY DARK TOP BAR */}
          <div className="bg-[#1a1c20] text-white py-1.5 px-3 flex items-center justify-between shadow-md select-none shrink-0 border-b border-black">
            <div className="flex items-center gap-3">
              {/* Back Arrow */}
              <button 
                onClick={() => {
                  playTactileFeedback();
                  if (activeSidebarTab !== 'grid') {
                    setActiveSidebarTab('grid');
                  } else {
                    setActiveCategoryId('all');
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors text-white font-extrabold"
                title="Voltar"
              >
                ←
              </button>
              
              {/* Home House Button */}
              <button 
                onClick={() => {
                  playTactileFeedback();
                  setActiveSidebarTab('grid');
                  setActiveCategoryId('all');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors text-white"
                title="Página Inicial"
              >
                🏠
              </button>

              {/* Profile indicator */}
              <div className="flex items-center gap-1 bg-[#2e3138] border border-neutral-700 rounded-full px-3 py-1 cursor-pointer hover:bg-neutral-800"
                   onClick={() => {
                     playTactileFeedback();
                     setShowBehavioralSupports(true);
                   }}
              >
                <span className="text-xs font-bold text-gray-200 truncate max-w-[100px] sm:max-w-[150px]">
                  👤 {selectedPatient.name}
                </span>
              </div>

              {/* Search Magnifying Glass Icon */}
              <button 
                onClick={() => {
                  playTactileFeedback();
                  setShowTopbarSearchBar(!showTopbarSearchBar);
                  if (showTopbarSearchBar) {
                    setPatientSearchQuery('');
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showTopbarSearchBar ? 'bg-indigo-600 text-white' : 'hover:bg-neutral-800 text-white'}`}
                title="Procurar Palavra"
              >
                🔍
              </button>

              {showTopbarSearchBar && (
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  className="bg-[#2e3138] text-white border border-neutral-700 text-xs rounded-lg px-2.5 py-1 w-32 sm:w-44 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  autoFocus
                />
              )}
            </div>

            {/* Folder Header - Active topic name */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#2e3138] px-4 py-1 rounded-full text-xs font-black text-gray-200 border border-neutral-700 shadow-inner">
              <span>📂</span>
              <span className="uppercase tracking-wider">
                {activeSidebarTab === 'keyboard' ? 'Teclado Clínico' :
                 activeSidebarTab === 'quickfires' ? 'Respostas Rápidas' :
                 activeCategoryId === 'all' ? 'Menu Principal' :
                 boardDetails?.categories.find(c => c.id === activeCategoryId)?.name || 'Lista de Palavras'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Active Timer Indicator */}
              {timerActive && (
                <div 
                  onClick={() => {
                    playTactileFeedback();
                    setShowBehavioralSupports(true);
                  }}
                  className="animate-pulse bg-red-600 text-white font-mono text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer shrink-0" 
                  title="Cronômetro Ativo - Clique para ver"
                >
                  <span>⏰</span>
                  <span>
                    {Math.floor(timerSecondsLeft / 60).toString().padStart(2, '0')}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Active Vocabulary Filter Indicator */}
              {vocabFilterEnabled && (
                <span className="text-[9px] bg-amber-500 text-slate-950 font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <span>🔒</span> <span className="hidden xs:inline">Filtro Ativo</span>
                </span>
              )}

              {/* Settings / Gear icon - Open Clinician Unlock Panel */}
              <button 
                onClick={() => {
                  playTactileFeedback();
                  setShowPasscodeModal(true);
                  setPasscodeInput('');
                  setPasscodeError('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors text-white"
                title="Configurações (Terapeuta)"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* 2. BODY OF TD SNAP: NAVIGATION SIDEBAR + MAIN AREA */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT NAVIGATION TOOLBAR (SIDEBAR) */}
            <aside className="w-[125px] sm:w-[155px] bg-[#343b46] flex flex-col p-2 gap-2 shrink-0 border-r border-[#1e2229] justify-between pb-4">
              
              <div className="flex-1 flex flex-col gap-2">
                {/* Back button */}
                <button
                  onClick={() => {
                    playTactileFeedback();
                    if (activeSidebarTab !== 'grid') {
                      setActiveSidebarTab('grid');
                    } else {
                      setActiveCategoryId('all');
                    }
                  }}
                  className="bg-[#ee8555] hover:bg-[#f29a70] text-white font-extrabold flex flex-col items-center justify-center py-2 px-1 rounded-2xl relative select-none cursor-pointer text-center h-[75px] sm:h-[85px] border-b-4 border-[#ce6a38] transition-all active:translate-y-0.5 active:border-b-2 shadow-sm"
                >
                  <span className="absolute top-1.5 right-2 text-[9px] text-[#ffddcc] opacity-75">⟲</span>
                  <span className="text-xl sm:text-2xl mb-1">↩</span>
                  <span className="text-[10px] sm:text-xs tracking-tight uppercase">Voltar</span>
                </button>

                {/* Core Words (Palavras Core / Página Inicial) */}
                <button
                  onClick={() => {
                    playTactileFeedback();
                    setActiveSidebarTab('grid');
                    setActiveCategoryId('all');
                  }}
                  className={`font-extrabold flex flex-col items-center justify-center py-2 px-1 rounded-2xl relative select-none cursor-pointer text-center h-[75px] sm:h-[85px] border-b-4 transition-all active:translate-y-0.5 active:border-b-2 shadow-sm ${
                    activeSidebarTab === 'grid' && activeCategoryId === 'all'
                      ? 'bg-[#d66f36] border-[#bb5720] text-white scale-98'
                      : 'bg-[#ee8555] border-[#ce6a38] text-white hover:bg-[#f29a70]'
                  }`}
                >
                  <span className="absolute top-1.5 right-2 text-[10px] text-[#ffddcc] opacity-75">🎯</span>
                  <span className="text-lg sm:text-2xl mb-1">🎯</span>
                  <span className="text-[10px] sm:text-xs tracking-tight uppercase">Frequentes</span>
                </button>

                {/* QuickFires (Respostas Rápidas) */}
                <button
                  onClick={() => {
                    playTactileFeedback();
                    setActiveSidebarTab('quickfires');
                  }}
                  className={`font-extrabold flex flex-col items-center justify-center py-2 px-1 rounded-2xl relative select-none cursor-pointer text-center h-[75px] sm:h-[85px] border-b-4 transition-all active:translate-y-0.5 active:border-b-2 shadow-sm ${
                    activeSidebarTab === 'quickfires'
                      ? 'bg-[#d66f36] border-[#bb5720] text-white scale-98'
                      : 'bg-[#ee8555] border-[#ce6a38] text-white hover:bg-[#f29a70]'
                  }`}
                >
                  <span className="absolute top-1.5 right-2 text-[10px] text-[#ffddcc] opacity-75">🔥</span>
                  <span className="text-lg sm:text-2xl mb-1">🔥</span>
                  <span className="text-[10px] sm:text-xs tracking-tight uppercase">Rápidas</span>
                </button>

                {/* Topics (Tópicos - Menu Categorias) */}
                <button
                  onClick={() => {
                    playTactileFeedback();
                    setActiveSidebarTab('grid');
                    setActiveCategoryId('all');
                  }}
                  className={`font-extrabold flex flex-col items-center justify-center py-2 px-1 rounded-2xl relative select-none cursor-pointer text-center h-[75px] sm:h-[85px] border-b-4 transition-all active:translate-y-0.5 active:border-b-2 shadow-sm ${
                    activeSidebarTab === 'grid' && activeCategoryId !== 'all'
                      ? 'bg-[#d66f36] border-[#bb5720] text-white scale-98'
                      : 'bg-[#ee8555] border-[#ce6a38] text-white hover:bg-[#f29a70]'
                  }`}
                >
                  <span className="absolute top-1.5 right-2 text-[10px] text-[#ffddcc] opacity-75">💬</span>
                  <span className="text-lg sm:text-2xl mb-1">💬</span>
                  <span className="text-[10px] sm:text-xs tracking-tight uppercase">Tópicos</span>
                </button>

                {/* Keyboard Layout */}
                <button
                  onClick={() => {
                    playTactileFeedback();
                    setActiveSidebarTab('keyboard');
                  }}
                  className={`font-extrabold flex flex-col items-center justify-center py-2 px-1 rounded-2xl relative select-none cursor-pointer text-center h-[75px] sm:h-[85px] border-b-4 transition-all active:translate-y-0.5 active:border-b-2 shadow-sm ${
                    activeSidebarTab === 'keyboard'
                      ? 'bg-[#d66f36] border-[#bb5720] text-white scale-98'
                      : 'bg-[#ee8555] border-[#ce6a38] text-white hover:bg-[#f29a70]'
                  }`}
                >
                  <span className="absolute top-1.5 right-2 text-[10px] text-[#ffddcc] opacity-75">⌨</span>
                  <span className="text-lg sm:text-2xl mb-1">⌨️</span>
                  <span className="text-[10px] sm:text-xs tracking-tight uppercase">Teclado</span>
                </button>
              </div>

              {/* Bottom option inside sidebar: settings / home */}
              <button
                onClick={() => {
                  playTactileFeedback();
                  setShowPasscodeModal(true);
                  setPasscodeInput('');
                  setPasscodeError('');
                }}
                className="bg-[#5a6575] hover:bg-[#6c798c] border-b-4 border-[#3e4854] active:translate-y-0.5 active:border-b-2 text-white font-extrabold flex flex-col items-center justify-center py-2 px-1 rounded-2xl select-none cursor-pointer text-center h-[75px] sm:h-[85px] transition-all shadow-sm"
              >
                <span className="text-xl sm:text-2xl mb-1">⚙️</span>
                <span className="text-[9px] sm:text-[10px] tracking-tight uppercase font-black">Terapeuta</span>
              </button>
            </aside>

            {/* MAIN PORTION ON THE RIGHT */}
            <main className="flex-1 flex flex-col overflow-hidden p-3 bg-[#cbd2db] gap-3">
              
              {/* MESSAGE WINDOW ROW (SENTENCE CONSTRUCTOR) */}
              <div className="flex items-stretch gap-2 shrink-0">
                
                {/* SPEAK BUTTON ON THE LEFT */}
                <button
                  onClick={speakAssembledSentence}
                  disabled={sentenceButtons.length === 0}
                  className="bg-[#4d4d4d] hover:bg-[#5a5a5a] disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold flex flex-col items-center justify-center p-2 rounded-2xl w-[85px] sm:w-[100px] shrink-0 border-b-4 border-[#333333] transition-all active:translate-y-0.5 active:border-b-2 shadow-sm"
                >
                  <Volume2 className="w-6 h-6 mb-1 text-white" />
                  <span className="text-[11.5px] uppercase font-black tracking-tight leading-none text-gray-200">Falar</span>
                  <span className="text-[8px] text-gray-400 font-bold tracking-widest mt-0.5">SPEAK</span>
                </button>

                {/* THE MAIN WHITE ACCUMULATOR BOX */}
                <div className="flex-1 bg-white rounded-2xl border-2 border-neutral-300 p-2 overflow-x-auto flex items-center gap-2 min-h-[75px] shadow-inner relative">
                  {sentenceButtons.length === 0 ? (
                    <p className="text-gray-450 text-[11px] sm:text-xs italic mx-auto text-center select-none font-bold">
                      Toque nos cartões abaixo para construir sentenças...
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      {sentenceButtons.map((btn, index) => (
                        <div 
                          key={`patient-sent-${index}`}
                          className="bg-white border-2 border-neutral-900 rounded-xl p-1.5 flex items-center justify-center w-[78px] h-[78px] shrink-0 text-center relative group shadow-sm transition-transform hover:scale-105"
                          title={btn.label}
                          aria-label={btn.label}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            {btn.imageUrl.startsWith('data:') ? (
                              <img src={btn.imageUrl} alt={btn.label} className="w-full h-full object-contain" />
                            ) : (
                              <PictogramSVG 
                                label={btn.label} 
                                emoji={btn.imageUrl} 
                                category={boardDetails?.categories.find(c => c.id === btn.categoryId)?.name} 
                                avatarConfig={profile?.avatarConfig}
                                className="w-full h-full" 
                              />
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              playTactileFeedback();
                              setSentenceButtons(prev => prev.filter((_, idx) => idx !== index));
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-red-655 hover:bg-red-700 text-white rounded-full p-0.5 shadow transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS ON THE RIGHT */}
                <div className="flex flex-col gap-1.5 w-[85px] sm:w-[100px] shrink-0 justify-between">
                  {/* Desfazer / Delete Word */}
                  <button
                    onClick={() => {
                      playTactileFeedback();
                      setSentenceButtons(prev => prev.slice(0, -1));
                    }}
                    disabled={sentenceButtons.length === 0}
                    className="bg-[#4d4d4d] hover:bg-[#5a5a5a] disabled:opacity-40 disabled:pointer-events-none text-white font-bold p-1 rounded-xl text-[10px] uppercase flex flex-col items-center justify-center flex-1 border-b-3 border-[#333333] transition-all active:translate-y-0.5 shadow-sm"
                  >
                    <span>⌫</span>
                    <span className="font-extrabold tracking-tight mt-0.5 text-gray-200">Apagar</span>
                  </button>

                  {/* Limpar / Clear All */}
                  <button
                    onClick={() => {
                      playTactileFeedback();
                      setSentenceButtons([]);
                    }}
                    disabled={sentenceButtons.length === 0}
                    className="bg-[#4d4d4d] hover:bg-[#5a5a5a] disabled:opacity-40 disabled:pointer-events-none text-white font-bold p-1 rounded-xl text-[10px] uppercase flex flex-col items-center justify-center flex-1 border-b-3 border-[#333333] transition-all active:translate-y-0.5 shadow-sm"
                  >
                    <span>🗑️</span>
                    <span className="font-extrabold tracking-tight mt-0.5 text-gray-200">Limpar</span>
                  </button>
                </div>

              </div>

              {/* 3. WORKING CONTENT MAIN VIEW: SWITCHES AMONG GRID, KEYBOARD, QUICKFIRES */}
              <div className="flex-1 overflow-hidden relative">
                
                {/* VIEW 1: DYNAMIC KEYBOARD SCREEN */}
                {activeSidebarTab === 'keyboard' && (
                  <div className="h-full bg-[#cbd2db] rounded-2xl flex flex-col p-2 gap-2 animate-fade-in">
                    {/* Visual search/typing feedback line bar */}
                    <div className="bg-white rounded-xl p-2.5 flex items-center gap-2 border border-neutral-300 shadow-sm shrink-0">
                      <span className="text-gray-400">⌨️</span>
                      <input 
                        type="text" 
                        value={keyboardText}
                        onChange={(e) => setKeyboardText(e.target.value)}
                        placeholder="Escreva algo para falar..."
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 font-extrabold text-sm"
                      />
                      {keyboardText && (
                        <button 
                          onClick={() => setKeyboardText('')}
                          className="bg-slate-200 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          playTactileFeedback();
                          if (keyboardText.trim()) {
                            speakText(keyboardText);
                            
                            // Append to main sentence constructor
                            setSentenceButtons(prev => {
                              const syntheticButton: CommunicationButton = {
                                id: `typed-${Date.now()}`,
                                boardId: selectedBoardId,
                                categoryId: 'keyboard',
                                label: keyboardText,
                                speechText: keyboardText,
                                imageUrl: '⌨️',
                                colorClass: 'bg-white',
                                gridX: 0,
                                gridY: 0,
                                isVisible: true,
                                createdAt: new Date().toISOString()
                              };
                              if (prev.length >= 8) return [...prev.slice(1), syntheticButton];
                              return [...prev, syntheticButton];
                            });

                            setKeyboardText('');
                          }
                        }}
                        disabled={!keyboardText.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs px-4 py-1.5 rounded-lg shadow"
                      >
                        Falar Texto
                      </button>
                    </div>

                    {/* Highly responsive QWERTY layout optimized for mouse/touch */}
                    <div className="flex-1 flex flex-col justify-between py-1 gap-1.5 max-w-4xl mx-auto w-full font-mono text-slate-900">
                      {/* QWERTY Row 1 */}
                      <div className="flex justify-center gap-1">
                        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((char) => (
                          <button
                            key={char}
                            onClick={() => { playTactileFeedback(); setKeyboardText(prev => prev + char); }}
                            className="bg-white hover:bg-neutral-100 active:scale-95 text-xs sm:text-sm font-black p-2 rounded-xl flex-1 max-w-[55px] min-h-[44px] flex items-center justify-center border-b-2 border-neutral-350 shadow-sm"
                          >
                            {char}
                          </button>
                        ))}
                      </div>

                      {/* QWERTY Row 2 */}
                      <div className="flex justify-center gap-1">
                        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'].map((char) => (
                          <button
                            key={char}
                            onClick={() => { playTactileFeedback(); setKeyboardText(prev => prev + char); }}
                            className="bg-white hover:bg-neutral-100 active:scale-95 text-xs sm:text-sm font-black p-2 rounded-xl flex-1 max-w-[55px] min-h-[44px] flex items-center justify-center border-b-2 border-neutral-350 shadow-sm"
                          >
                            {char}
                          </button>
                        ))}
                      </div>

                      {/* QWERTY Row 3 */}
                      <div className="flex justify-center gap-1">
                        {['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '?'].map((char) => (
                          <button
                            key={char}
                            onClick={() => { playTactileFeedback(); setKeyboardText(prev => prev + char); }}
                            className="bg-white hover:bg-neutral-100 active:scale-95 text-xs sm:text-sm font-black p-2 rounded-xl flex-1 max-w-[55px] min-h-[44px] flex items-center justify-center border-b-2 border-neutral-350 shadow-sm"
                          >
                            {char}
                          </button>
                        ))}
                      </div>

                      {/* Control row with Space, Backspace */}
                      <div className="flex justify-center gap-1 w-full px-4">
                        <button
                          onClick={() => { playTactileFeedback(); setKeyboardText(prev => prev.slice(0, -1)); }}
                          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold px-3 py-2 rounded-xl text-xs sm:text-sm shrink-0 min-h-[44px] flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span>⌫</span>
                          <span>Apagar</span>
                        </button>

                        <button
                          onClick={() => { playTactileFeedback(); setKeyboardText(prev => prev + ' '); }}
                          className="bg-white hover:bg-neutral-100 active:scale-95 text-xs sm:text-sm font-black py-2 rounded-xl flex-1 max-w-[300px] min-h-[44px] flex items-center justify-center border-b-2 border-neutral-350 shadow-sm"
                        >
                          [ Espaço / SPACE ]
                        </button>

                        <button
                          onClick={() => { playTactileFeedback(); setKeyboardText(''); }}
                          className="bg-gray-500 hover:bg-gray-600 active:scale-95 text-white font-extrabold px-3 py-2 rounded-xl text-xs sm:text-sm shrink-0 min-h-[44px] flex items-center justify-center shadow-sm"
                        >
                          Limpar tudo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 2: QUICKFIRES SOUNDBOARD MODE */}
                {activeSidebarTab === 'quickfires' && (
                  <div className="h-full bg-[#cbd2db] rounded-2xl flex flex-col p-2 animate-fade-in overflow-y-auto">
                    <p className="text-[10px] uppercase font-black text-gray-500 mb-2 px-1 tracking-wider">Apoio de Comunicação Rápida Instantânea</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 pb-2">
                      {[
                        { label: 'SIM', text: 'Sim', color: 'bg-emerald-150 hover:bg-emerald-250 border-emerald-400 text-emerald-950 font-black', icon: '🟢' },
                        { label: 'NÃO', text: 'Não', color: 'bg-red-150 hover:bg-red-250 border-red-400 text-red-950 font-black', icon: '🔴' },
                        { label: 'OLÁ / OI', text: 'Olá, tudo bem?', color: 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950 font-black', icon: '👋' },
                        { label: 'TCHAU', text: 'Tchau, até logo!', color: 'bg-blue-105 hover:bg-blue-200 border-blue-300 text-blue-950 font-black', icon: '🙋‍♂️' },
                        { label: 'POR FAVOR', text: 'Por favor', color: 'bg-indigo-105 hover:bg-indigo-200 border-indigo-300 text-indigo-950 font-black', icon: '🙏' },
                        { label: 'OBRIGADO', text: 'Muito obrigado!', color: 'bg-teal-100 hover:bg-teal-200 border-teal-300 text-teal-955 font-black', icon: '✨' },
                        { label: 'ME AJUDA', text: 'Preciso de ajuda, por favor!', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-955 font-black', icon: '🆘' },
                        { label: 'PARE!', text: 'Por favor, pare!', color: 'bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-955 font-black', icon: '🛑' },
                        { label: 'ESTÁ COM DOR?', text: 'Você está sentindo alguma dor?', color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-955 font-black', icon: '🤕' },
                        { label: 'NÃO SEI', text: 'Eu não sei responder', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-950 font-black', icon: '🤷' },
                        { label: 'QUERO SAIR', text: 'Eu quero ir para outro lugar por favor', color: 'bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-950 font-black', icon: '🚪' },
                        { label: 'PARABÉNS!', text: 'Muito bem, parabéns!', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-950 font-black', icon: '🎉' },
                      ].map((item, idx) => (
                        <button
                          key={`quick-${idx}`}
                          onClick={() => {
                            playTactileFeedback();
                            speakText(item.text);
                          }}
                          className="flex items-center justify-center p-2 rounded-xl border-2 border-neutral-950 bg-white shadow-sm transition-all transform hover:scale-102 active:scale-95 text-center min-h-[112px] cursor-pointer"
                          title={item.label}
                          aria-label={item.label}
                        >
                          <PictogramSVG label={item.text} emoji={item.icon} className="w-full h-full" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW 3: STANDARD COMMUNICATION GRID (either categories directory or nested words list) */}
                {activeSidebarTab === 'grid' && (
                  <div className="h-full flex flex-col">
                    {boardDetails && profile ? (
                      
                      <>
                        {/* THE DYNAMIC GRID CONTAINER */}
                        <div className="flex-1">
                          
                          {activeCategoryId === 'all' ? (
                            
                            /* CATEGORIES DIRECTORY NAVIGATION MODE! (The glorious pink folders) */
                          <div 
                              className="grid gap-2 h-full rounded-2xl bg-slate-300 p-2"
                              style={{
                                gridTemplateColumns: `repeat(${profile.gridSizeColumns || 4}, minmax(0, 1fr))`,
                                gridTemplateRows: `repeat(${profile.gridSizeRows || 3}, minmax(0, 1fr))`
                              }}
                            >
                              {/* Map each category into grid-cell or list block */}
                              {boardDetails.categories.map((cat) => {
                                // Filter categories with search query if any
                                if (patientSearchQuery.trim() && !cat.name.toLowerCase().includes(patientSearchQuery.toLowerCase())) {
                                  return null;
                                }

                                const pinkBg = 'bg-[#fbc9d5] hover:bg-[#fab7c7] text-[#1e1e1e] border-2 border-[#f190a6] shadow';
                                
                                return (
                                  <button
                                    key={cat.id}
                                    onClick={() => {
                                      playTactileFeedback();
                                      setActiveCategoryId(cat.id);
                                    }}
                                    className={`relative overflow-hidden flex flex-col items-center justify-between p-3.5 rounded-[22px] cursor-pointer select-none transition-all transform hover:scale-102 active:scale-95 text-center h-full w-full ${pinkBg}`}
                                  >
                                    {/* Directory linkage indicator arrow at TOP RIGHT corner */}
                                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/65 flex items-center justify-center text-[10px] font-black border border-[#e58399]">
                                      ➔
                                    </div>

                                    <div className="flex-1 flex items-center justify-center overflow-hidden my-auto w-full z-0">
                                      <CategoryIcon name={cat.icon} className="w-[7.5vh] h-[7.5vh] max-h-16 max-w-16 text-slate-800 shrink-0" />
                                    </div>
                                    <span className="text-base sm:text-xl font-black mt-1 truncate w-full select-none text-slate-900 capitalize leading-tight">
                                      {cat.name}
                                    </span>
                                  </button>
                                );
                              })}
                              
                              {/* Create spacer placeholder blocks to fill up remaining empty grids */}
                              {Array.from({ length: Math.max(0, (profile.gridSizeColumns * profile.gridSizeRows) - boardDetails.categories.length) }).map((_, placeholderIdx) => (
                                <div 
                                  key={`cat-empty-${placeholderIdx}`} 
                                  className="flex items-center justify-center rounded-[22px] border border-dashed border-gray-300 bg-slate-100/40"
                                >
                                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                </div>
                              ))}
                            </div>

                          ) : (
                            
                            /* WORDS NESTED IN CURRENT CATEGORY VIEW MODE */
                            <div 
                              className="grid gap-3 h-full pb-2"
                              style={{
                                gridTemplateColumns: `repeat(${profile.gridSizeColumns || 4}, minmax(0, 1fr))`,
                                gridTemplateRows: `repeat(${profile.gridSizeRows || 3}, minmax(0, 1fr))`
                              }}
                            >
                              {Array.from({ length: profile.gridSizeRows || 3 }).map((_, y) => {
                                return Array.from({ length: profile.gridSizeColumns || 4 }).map((_, x) => {
                                  const btn = boardDetails.buttons.find(b => {
                                    if (b.categoryId !== activeCategoryId) return false;
                                    // if searching
                                    if (patientSearchQuery.trim() && !b.label.toLowerCase().includes(patientSearchQuery.toLowerCase())) return false;
                                    return b.gridX === x && b.gridY === y;
                                  });

                                  if (btn) {
                                    if (!btn.isVisible) return <div key={`empty-${x}-${y}`} className="opacity-0"></div>;
                                    
                                    const isFiltered = isButtonFilteredOut(btn);
                                    if (isFiltered) {
                                      const placeholderBg = profile.highContrast ? 'border-zinc-800 bg-zinc-950 text-yellow-500' : 'bg-slate-100/40 border-slate-205 text-slate-300';
                                      return (
                                        <div
                                          key={`btn-filtered-${btn.id}`}
                                          className={`flex flex-col items-center justify-center p-3 rounded-[22px] border border-dashed text-center h-full w-full pointer-events-none select-none opacity-20 ${placeholderBg}`}
                                        >
                                          <span className="text-2xl sm:text-4xl filter grayscale select-none opacity-30">🔒</span>
                                          <span className="text-[10px] sm:text-xs font-bold leading-tight tracking-tight mt-1 text-slate-400 select-none truncate w-full">{btn.label}</span>
                                        </div>
                                      );
                                    }
                                    
                                    const isBeingHeld = holdingButtonId === btn.id;
                                    const hasDelay = !!(profile?.acceptanceDelay && profile.acceptanceDelay > 0);
                                    const clickProps = hasDelay ? {
                                      onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); startButtonHold(btn); },
                                      onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); startButtonHold(btn); },
                                      onMouseUp: cancelButtonHold,
                                      onTouchEnd: cancelButtonHold,
                                      onMouseLeave: cancelButtonHold,
                                      onTouchCancel: cancelButtonHold,
                                    } : {
                                      onClick: () => handleAACButtonClick(btn)
                                    };

                                  const cellBorderColor = profile.highContrast 
                                      ? 'border-4 border-yellow-400 bg-neutral-900 text-yellow-300' 
                                      : 'bg-white text-slate-900 border-2 border-neutral-950 shadow-sm hover:shadow-md';

                                    return (
                                      <button
                                        key={btn.id}
                                        id={`patient-btn-${btn.id}`}
                                        {...clickProps}
                                        className={`relative overflow-hidden flex items-center justify-center p-2 sm:p-3 rounded-xl cursor-pointer select-none transition-all transform text-center h-full w-full ${cellBorderColor} ${isBeingHeld ? 'scale-97 ring-4 ring-emerald-500/80 border-transparent shadow-inner' : 'hover:scale-102 active:scale-95'}`}
                                        title={btn.label}
                                        aria-label={btn.label}
                                      >
                                        {/* Radial / bar holding indicator (Acceptance Time) */}
                                        {isBeingHeld && (
                                          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none select-none z-10 flex flex-col justify-end">
                                            <div 
                                              className="bg-emerald-500/35 h-3 text-[8px] font-black text-emerald-950 pr-2 flex items-center justify-end transition-all duration-75"
                                              style={{ width: `${holdingProgress}%` }}
                                            >
                                              {Math.floor(holdingProgress)}%
                                            </div>
                                          </div>
                                        )}

                                        <div className="flex items-center justify-center overflow-hidden w-full h-full z-0">
                                          {btn.imageUrl.startsWith('data:') ? (
                                            <img src={btn.imageUrl} alt={btn.label} className="w-full h-full object-contain rounded-md" />
                                          ) : (
                                            <PictogramSVG label={btn.label} emoji={btn.imageUrl} category={boardDetails?.categories.find(c => c.id === btn.categoryId)?.name} className="w-full h-full" />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  } else {
                                    // Return muted cell placeholder 
                                    const placeholderBg = profile.highContrast ? 'border-neutral-900' : 'bg-slate-100/50 border-gray-200';
                                    return (
                                      <div 
                                        key={`empty-${x}-${y}`} 
                                        className={`flex items-center justify-center rounded-[22px] border border-dashed text-gray-300 ${placeholderBg}`}
                                      >
                                        <div className="w-2.5 h-2.5 rounded-full bg-current opacity-30"></div>
                                      </div>
                                    );
                                  }
                                });
                              })}
                            </div>

                          )}

                        </div>
                      </>

                    ) : (
                      <div className="text-center py-12">
                        <p className="text-slate-400 text-sm">Carregando painel PECS...</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </main>

          </div>

          {/* 4. CLINICIAN PIN / ADVANCED PASSCODE UNLOCK OVERLAY MODAL */}
          {showPasscodeModal && (
            <div className="fixed inset-0 bg-black/75 z-55 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in text-slate-900">
              <div className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-neutral-300 relative">
                <button 
                  onClick={() => setShowPasscodeModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 font-extrabold text-sm"
                >
                  ✕
                </button>
                
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-2 text-xl shadow-inner animate-pulse">
                    🔐
                  </div>
                  <h3 className="text-base font-black tracking-tight text-slate-900">Área Exclusiva do Terapeuta</h3>
                  <p className="text-[11px] text-gray-500 leading-tight mt-1 font-bold">
                    Evite saídas acidentais de crianças configurando um PIN de segurança protetora.
                  </p>
                </div>

                {/* Display Dots */}
                <div className="flex justify-center gap-4 mb-4">
                  {[1, 2, 3, 4].map((dotIndex) => (
                    <div
                      key={`dot-${dotIndex}`}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-100 ${
                        passcodeInput.length >= dotIndex 
                          ? 'bg-indigo-600 border-indigo-600 scale-110 shadow' 
                          : 'bg-slate-100 border-slate-300'
                      }`}
                    ></div>
                  ))}
                </div>

                {passcodeError && (
                  <p className="text-[11px] font-bold text-red-600 text-center mb-3 animate-bounce">{passcodeError}</p>
                )}

                {/* Numeric Keyboard Pad */}
                <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-4 font-mono">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        playTactileFeedback();
                        if (passcodeInput.length < 4) {
                          const val = passcodeInput + num;
                          setPasscodeInput(val);
                          setPasscodeError('');
                          if (val === '1234') {
                            setSuccessToast('Acesso de terapeuta liberado!');
                            setTimeout(() => {
                              setCurrentView('clinician-panel');
                              setShowPasscodeModal(false);
                            }, 400);
                          } else if (val.length === 4) {
                            setTimeout(() => {
                              setPasscodeError('Senha PIN Incorreta! Tente novamente.');
                              setPasscodeInput('');
                            }, 250);
                          }
                        }
                      }}
                      className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-base sm:text-lg font-black py-2.5 rounded-xl border-b-2 border-slate-300 shadow-sm flex items-center justify-center transition-all text-slate-800 cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  
                  {/* Cancel clear */}
                  <button
                    onClick={() => { playTactileFeedback(); setPasscodeInput(''); setPasscodeError(''); }}
                    className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-xs font-bold rounded-xl flex items-center justify-center text-slate-800 font-sans cursor-pointer"
                  >
                    Limpar
                  </button>

                  <button
                    onClick={() => {
                      playTactileFeedback();
                      if (passcodeInput.length < 4) {
                        const val = passcodeInput + '0';
                        setPasscodeInput(val);
                        setPasscodeError('');
                        if (val === '1234') {
                          setSuccessToast('Acesso de terapeuta liberado!');
                          setTimeout(() => {
                            setCurrentView('clinician-panel');
                            setShowPasscodeModal(false);
                          }, 400);
                        } else if (val.length === 4) {
                          setTimeout(() => {
                            setPasscodeError('Senha PIN Incorreta! Tente novamente.');
                            setPasscodeInput('');
                          }, 250);
                        }
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-base sm:text-lg font-black py-2.5 rounded-xl border-b-2 border-slate-300 shadow-sm flex items-center justify-center transition-all text-slate-800 cursor-pointer"
                  >
                    0
                  </button>

                  {/* Directly close */}
                  <button
                    onClick={() => setShowPasscodeModal(false)}
                    className="bg-red-100 hover:bg-red-200 active:scale-95 text-xs font-bold rounded-xl flex items-center justify-center text-red-700 font-sans cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center font-bold mt-1">
                  Senha PIN padrão de fábrica: <strong className="text-indigo-650 font-black">1234</strong>
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --------------------------- SCREEN 3: CLINICIAN DASHBOARD --------------------------- */}
      {currentView === 'clinician-panel' && selectedPatient && (
        <div className="flex-1 flex flex-col md:flex-row print:hidden">
          
          {/* Menu Lateral do Terapeuta (Sub tabs) */}
          <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-950 p-4">
            <div>
              <div className="flex items-center gap-2 px-2 pb-5 border-b border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                  T
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Módulo Técnico</h4>
                  <p className="text-[10px] text-gray-400">Suporte Clínico Integrado</p>
                </div>
              </div>

              {/* Patient Selector Contextual inside Setup Screen */}
              <div className="px-2 mb-6">
                <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1.5">Paciente Ativo:</label>
                <div className="relative">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value);
                      playTactileFeedback();
                    }}
                    className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg text-xs font-bold py-1.5 pl-2 pr-8 focus:outline-none appearance-none"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Sub navigation items list */}
              <nav className="space-y-1">
                
                <button
                  onClick={() => { setClinicianTab('board-editor'); playTactileFeedback(); }}
                  className={`w-full text-left font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${clinicianTab === 'board-editor' ? 'bg-indigo-600 text-white font-black' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Edit className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Personalizar Botões</span>
                </button>

                <button
                  onClick={() => { setClinicianTab('profile-settings'); playTactileFeedback(); }}
                  className={`w-full text-left font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${clinicianTab === 'profile-settings' ? 'bg-indigo-600 text-white font-black' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Acessibilidade e Voz</span>
                </button>

                <button
                  onClick={() => { setClinicianTab('pictogram-search'); playTactileFeedback(); }}
                  className={`w-full text-left font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors relative ${clinicianTab === 'pictogram-search' ? 'bg-indigo-600 text-white font-black' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <BookOpen className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Banco de Pictogramas</span>
                  <span className="absolute right-2 bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    Novo
                  </span>
                </button>

                <button
                  onClick={() => { setClinicianTab('diagnostics-panel'); playTactileFeedback(); }}
                  className={`w-full text-left font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${clinicianTab === 'diagnostics-panel' ? 'bg-indigo-600 text-white font-black' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Estatísticas de Reabilitação</span>
                </button>

                <button
                  onClick={() => { setClinicianTab('patients-registry'); playTactileFeedback(); }}
                  className={`w-full text-left font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${clinicianTab === 'patients-registry' ? 'bg-indigo-600 text-white font-black' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Users className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Registrar Prontuários</span>
                </button>

                <button
                  onClick={() => { setClinicianTab('google-drive'); playTactileFeedback(); }}
                  className={`w-full text-left font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${clinicianTab === 'google-drive' ? 'bg-indigo-600 text-white font-black' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Cloud className="w-4 h-4 shrink-0 text-slate-405" />
                  <span>Nuvem Google Drive</span>
                </button>

                <button
                  onClick={() => { setClinicianTab('avatar-creator'); playTactileFeedback(); }}
                  className={`w-full text-left font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors relative ${clinicianTab === 'avatar-creator' ? 'bg-indigo-600 text-white font-black' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <User className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Criador de Personagem</span>
                  <span className="absolute right-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    Beta
                  </span>
                </button>

              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  playTactileFeedback();
                  setCurrentView('login');
                }}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white font-black text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </aside>

          {/* Main workspace for clinician sub views */}
          <main className="flex-1 bg-slate-50 p-6 overflow-y-auto">
            
            {/* Context bar inside clinician control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Espaço de Configurações Clínicas</span>
                  <span className="text-[10px] uppercase tracking-wider bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded-full">
                    Isolado do Paciente
                  </span>
                </h2>
                <p className="text-xs text-gray-500 font-medium">Você está ajustando parâmetros de: <strong className="text-indigo-600">{selectedPatient.name} ({selectedPatient.recordNumber})</strong></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playTactileFeedback();
                    setCurrentView('patient-grid');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 px-4 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <Smile className="w-4 h-4" />
                  <span>Voltar para Modo Paciente (Uso)</span>
                </button>
              </div>
            </div>

            {/* TAB clinicians/1: BOARD BUTTONS CUSTOM MATRIX EDITOR */}
            {clinicianTab === 'board-editor' && boardDetails && profile && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Grade PECS Editável do Terapeuta</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Altere o tamanho da matriz na aba de acessibilidade. Toque em qualquer cartão para editá-lo ou em um quadrado cinza com o ícone (+) para criar um novo botão na posição selecionada.
                  </p>

                  <div 
                    className="grid gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${profile.gridSizeColumns || 4}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${profile.gridSizeRows || 3}, minmax(0, 1fr))`
                    }}
                  >
                    {Array.from({ length: profile.gridSizeRows || 3 }).map((_, y) => {
                      return Array.from({ length: profile.gridSizeColumns || 4 }).map((_, x) => {
                        const btn = boardDetails.buttons.find(b => b.gridX === x && b.gridY === y);

                        if (btn) {
                          const activeColorClass = boardDetails.categories.find(c => c.id === btn.categoryId)?.colorClass || 'bg-white text-slate-900 border-gray-200';
                          return (
                            <button
                              key={btn.id}
                              onClick={() => {
                                playTactileFeedback();
                                setEditingButton({ ...btn });
                                setCustomImageBase64(btn.imageUrl.startsWith('data:') ? btn.imageUrl : '');
                                setModalPicSearchQuery('');
                                setModalPicCategory('all');
                                setShowButtonModal(true);
                              }}
                              className={`relative aspect-square flex flex-col items-center justify-between p-3.5 rounded-xl border border-current hover:shadow-md cursor-pointer text-center ${activeColorClass} ${!btn.isVisible ? 'opacity-40 border-dashed border-red-300' : ''}`}
                            >
                              <div className="flex-1 flex items-center justify-center overflow-hidden my-auto w-full">
                                {btn.imageUrl.startsWith('data:') ? (
                                  <img src={btn.imageUrl} alt={btn.label} className="max-h-full max-w-full object-contain rounded" />
                                ) : (
                                  <PictogramSVG label={btn.label} emoji={btn.imageUrl} category={boardDetails?.categories.find(c => c.id === btn.categoryId)?.name} className="max-h-full max-w-full" />
                                )}
                              </div>
                              <span className="text-xs font-bold leading-tight truncate w-full mt-1">{btn.label}</span>
                              <div className="absolute top-1 right-1 bg-indigo-900 text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-md">
                                {x},{y}
                              </div>
                              {!btn.isVisible && (
                                <span className="absolute bottom-1 right-1 bg-red-600 text-[8px] text-white px-1 py-0.5 rounded font-black scale-90 uppercase">
                                  Oculto
                                </span>
                              )}
                            </button>
                          );
                        } else {
                          // Clean empty placeholder slot
                          return (
                            <button
                              key={`empty-add-${x}-${y}`}
                              onClick={() => {
                                playTactileFeedback();
                                const firstCat = boardDetails.categories[0]?.id || '';
                                setEditingButton({
                                  id: '',
                                  boardId: selectedBoardId,
                                  categoryId: firstCat,
                                  label: '',
                                  speechText: '',
                                  imageUrl: '💬',
                                  gridX: x,
                                  gridY: y,
                                  isVisible: true
                                });
                                setCustomImageBase64('');
                                setModalPicSearchQuery('');
                                setModalPicCategory('all');
                                setShowButtonModal(true);
                              }}
                              className="aspect-square bg-slate-100 hover:bg-slate-200/60 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center p-2.5 transition-colors cursor-pointer group"
                            >
                              <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-655" />
                              <span className="text-[10px] text-slate-500 font-bold mt-1">Livre ({x},{y})</span>
                            </button>
                          );
                        }
                      });
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB clinicians/2: ACCESSIBILITY AND SPEECH PARAMETERS ADJUSTS */}
            {clinicianTab === 'profile-settings' && profile && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto">
                <form onSubmit={saveProfileSettingsChanges} className="space-y-6">
                  
                  {/* Grid layout sizes */}
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-1.5 border-b border-gray-150 pb-2">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      1. Dimensionamento da Prancha Prática
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                          <span>Colunas da Grade PECS</span>
                          <span className="text-indigo-600">{profile.gridSizeColumns} colunas</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="6"
                          value={profile.gridSizeColumns}
                          onChange={(e) => setProfile({ ...profile, gridSizeColumns: parseInt(e.target.value) })}
                          className="w-full accent-indigo-650 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
                          <span>2 (Simplificado)</span>
                          <span>4 (Padrão)</span>
                          <span>6 (Avançado)</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                          <span>Linhas da Grade PECS</span>
                          <span className="text-indigo-600">{profile.gridSizeRows} linhas</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="5"
                          value={profile.gridSizeRows}
                          onChange={(e) => setProfile({ ...profile, gridSizeRows: parseInt(e.target.value) })}
                          className="w-full accent-indigo-650 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
                          <span>2 (Mínimo)</span>
                          <span>3 (Médio)</span>
                          <span>5 (Máximo)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vocal parameter & Accessibility settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-1.5 border-b border-gray-150 pb-2">
                      <Volume2 className="w-4 h-4 text-indigo-600" />
                      2. Sintetizador Vocal e Pronúncia em pt-BR (TTS)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Gênero Vocálico</label>
                        <select
                          value={profile.preferredVoiceGender}
                          onChange={(e) => setProfile({ ...profile, preferredVoiceGender: e.target.value as any })}
                          className="w-full bg-slate-50 rounded-lg text-xs font-bold p-2 border border-gray-300 text-slate-905"
                        >
                          <option value="male">Masculino (Voz Grave)</option>
                          <option value="female">Feminino (Voz Aguda/Suave)</option>
                          <option value="neutral">Neutro (Padrão do Sistema)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Velocidade ({profile.preferredVoiceSpeechRate}x)</label>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={profile.preferredVoiceSpeechRate}
                          onChange={(e) => setProfile({ ...profile, preferredVoiceSpeechRate: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-650 cursor-pointer mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tom de Voz ({profile.preferredVoicePitch})</label>
                        <input
                          type="range"
                          min="0.6"
                          max="1.6"
                          step="0.1"
                          value={profile.preferredVoicePitch}
                          onChange={(e) => setProfile({ ...profile, preferredVoicePitch: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-650 cursor-pointer mt-1"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-gray-200 gap-2">
                      <span className="text-[10px] text-gray-500 font-semibold">
                        Vozes ativas localizadas: <strong>{availableVoices.filter(v => v.lang.startsWith('pt')).length} vozes pt-BR</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText("Sua nova voz sintetizada foi calibrada para comunicação em tempo real.")}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-950 px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 shrink-0" />
                        Testar Áudio pt-BR
                      </button>
                    </div>
                  </div>

                  {/* Motor Control Accessibility adjustments */}
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-gray-150 pb-2">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      3. Adaptações de Controle Motor (Chapter 5 - TD Snap®)
                    </h3>
                    
                    <p className="text-[10.5px] text-gray-500 font-bold leading-relaxed">
                      Configure atrasos de pressão e filtros de clique repetido. Essencial para pacientes com espasticidade, movimentos involuntários excessivos ou mashing contínuo de botões (estímulo sensorial auditivo repetitivo).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-655 uppercase mb-1">Atraso de Aceitação (Hold-to-Activate)</label>
                        <select
                          value={profile.acceptanceDelay || 0}
                          onChange={(e) => setProfile({ ...profile, acceptanceDelay: parseFloat(e.target.value) })}
                          className="w-full bg-slate-50 rounded-lg text-xs font-bold p-2.5 border border-gray-300 text-slate-900"
                        >
                          <option value="0">Desativado (Toque Imediato)</option>
                          <option value="0.2">0.2 segundos (Muito rápido)</option>
                          <option value="0.5">0.5 segundos (Recomendado para tremores leves)</option>
                          <option value="1">1.0 segundo (Controle motor moderado)</option>
                          <option value="1.5">1.5 segundos (Controle motor tardio)</option>
                          <option value="2">2.0 segundos (Máxima proteção contra toques de arraste)</option>
                        </select>
                        <span className="block text-[9.5px] text-gray-400 font-semibold mt-1">
                          A criança precisa manter o dedo pressionado sobre o cartão pelo tempo configurado para que a fala seja sintetizada. Mostra um progresso circular visual.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-655 uppercase mb-1">Prevenção de Toques Múltiplos (Mashing Guard)</label>
                        <select
                          value={profile.preventDoubleTapsDelay || 0}
                          onChange={(e) => setProfile({ ...profile, preventDoubleTapsDelay: parseFloat(e.target.value) })}
                          className="w-full bg-slate-50 rounded-lg text-xs font-bold p-2.5 border border-gray-300 text-slate-900"
                        >
                          <option value="0">Desativado (Estímulo Contínuo)</option>
                          <option value="0.5">0.5 segundos (Toques consecutivos rápidos)</option>
                          <option value="1">1.0 segundo (Foco e autorregulação)</option>
                          <option value="1.5">1.5 segundos (Evitar ecos sucessivos de som)</option>
                          <option value="2">2.0 segundos (Estabilidade motora avançada)</option>
                          <option value="3">3.0 segundos (Paciente sensível a estímulos recorrentes)</option>
                        </select>
                        <span className="block text-[9.5px] text-gray-400 font-semibold mt-1">
                          Evita mashing excessivo de botões desativando cliques consecutivos rápidos pelo tempo configurado para permitir que o paciente termine de ouvir o feedback auditivo.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* High Contrast layout toggle */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      4. Contraste de Acessibilidade Visual
                    </h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="highContrastCheckbox"
                        checked={profile.highContrast}
                        onChange={(e) => setProfile({ ...profile, highContrast: e.target.checked })}
                        className="w-4.5 h-4.5 text-indigo-600 accent-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                      />
                      <label htmlFor="highContrastCheckbox" className="text-xs text-slate-700 font-bold cursor-pointer">
                        Ativar Modo de Alto Contraste (Fundo escuro, cartões pretos e bordas amarelas para facilitar escaneamento de visão periférica).
                      </label>
                    </div>
                  </div>

                  {/* TD Snap Feature A: Vocab Filter */}
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1.5 font-bold">
                        <LockKeyhole className="w-4 h-4 text-indigo-600" />
                        5. Filtro de Vocabulário Ativo (Chapter 8 - TD Snap®)
                      </h3>
                      <p className="text-[10.5px] text-gray-500 font-bold">
                        Limita temporariamente a visibilidade e ativação de botões ao conjunto léxico pretendido, ocultando os demais para apoiar o foco visual e a aprendizagem motora em etapas.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="vocabFilterCheckbox"
                        checked={!!profile.vocabularyFilterEnabled}
                        onChange={(e) => setProfile({ ...profile, vocabularyFilterEnabled: e.target.checked })}
                        className="w-4.5 h-4.5 text-indigo-600 accent-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                      />
                      <label htmlFor="vocabFilterCheckbox" className="text-xs text-slate-700 font-black cursor-pointer">
                        Ativar Filtro de Vocabulário no Painel do Paciente 🔒
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-600 uppercase">Palavras Permitidas (Separadas por vírgula):</label>
                      <textarea
                        rows={2}
                        value={profile.vocabularyFilterList || ''}
                        onChange={(e) => setProfile({ ...profile, vocabularyFilterList: e.target.value })}
                        placeholder="Ex: Água, Comer, Feliz, Cansado, Banheiro, Xixi, Mamãe..."
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl text-xs py-2 px-3 text-slate-900 font-semibold leading-relaxed"
                        disabled={!profile.vocabularyFilterEnabled}
                      />
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase my-auto">Presets Rápidos:</span>
                        <button
                          type="button"
                          className="bg-slate-105 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-slate-200 disabled:opacity-50 cursor-pointer"
                          disabled={!profile.vocabularyFilterEnabled}
                          onClick={() => {
                            playTactileFeedback();
                            setProfile({ ...profile, vocabularyFilterList: "Sim, Não, Água, Comer, Banheiro, Ajuda, Parar" });
                          }}
                        >
                          🥬 Básico Essencial
                        </button>
                        <button
                          type="button"
                          className="bg-slate-105 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-slate-200 disabled:opacity-50 cursor-pointer"
                          disabled={!profile.vocabularyFilterEnabled}
                          onClick={() => {
                            playTactileFeedback();
                            setProfile({ ...profile, vocabularyFilterList: "Brincar, Sim, Não, Feliz, Triste, Bravo, Foco, Massinha, Pula Pula, Copo" });
                          }}
                        >
                          🧩 Sessão Terapia
                        </button>
                        <button
                          type="button"
                          className="bg-slate-105 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-slate-200 disabled:opacity-50 cursor-pointer"
                          disabled={!profile.vocabularyFilterEnabled}
                          onClick={() => {
                            playTactileFeedback();
                            setProfile({ ...profile, vocabularyFilterList: "Banheiro, Xixi, Cocô, Banho, Lavar as Mãos, Escovar Dentes, Sabão, Frio, Calor" });
                          }}
                        >
                          🚽 Higiene e Autonomia
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TD Snap Feature B: Pronunciation Exceptions */}
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1.5 font-bold">
                        <Volume2 className="w-4 h-4 text-indigo-600" />
                        6. Exceções de Pronúncia Fonológica (Chapter 14.8.4)
                      </h3>
                      <p className="text-[10.5px] text-gray-500 font-bold">
                        Enfrente despronúncias típicas do navegador! Mapeie palavras escritas para transcrições fonéticas para que a voz sintetizada pronuncie de forma personalizada e correta.
                      </p>
                    </div>

                    <div className="bg-slate-50/50 p-4 border border-gray-200 rounded-2xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-500">Palavra como é Escrita:</label>
                          <input 
                            type="text"
                            id="exceptionWrittenInput"
                            placeholder="Ex: dodói"
                            className="w-full bg-white border border-gray-300 rounded-lg text-xs py-1.5 px-2.5 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-500">Como deve ser Falada:</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              id="exceptionPhoneticInput"
                              placeholder="Ex: dorzinha"
                              className="w-full bg-white border border-gray-300 rounded-lg text-xs py-1.5 px-2.5 text-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                playTactileFeedback();
                                const wEl = document.getElementById('exceptionWrittenInput') as HTMLInputElement;
                                const pEl = document.getElementById('exceptionPhoneticInput') as HTMLInputElement;
                                if (wEl && pEl && wEl.value.trim() && pEl.value.trim()) {
                                  const writtenRaw = wEl.value.trim();
                                  const phoneticRaw = pEl.value.trim();
                                  
                                  let currentMap: Record<string, string> = {};
                                  if (profile.pronunciationExceptions) {
                                    try { currentMap = JSON.parse(profile.pronunciationExceptions); } catch(err){}
                                  }
                                  
                                  currentMap[writtenRaw] = phoneticRaw;
                                  setProfile({
                                    ...profile,
                                    pronunciationExceptions: JSON.stringify(currentMap)
                                  });
                                  
                                  wEl.value = '';
                                  pEl.value = '';
                                  triggerToastNotification('Exceção de pronúncia adicionada!');
                                }
                              }}
                              className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black px-4 py-1.5 rounded-lg cursor-pointer shrink-0"
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Render active list */}
                      <div className="pt-2">
                        <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Exceções de Pronúncia Ativas:</span>
                        {profile.pronunciationExceptions && Object.keys(JSON.parse(profile.pronunciationExceptions || '{}')).length > 0 ? (
                          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-[160px] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-100 border-b border-gray-200 text-slate-500">
                                  <th className="p-2 font-black">Escrita</th>
                                  <th className="p-2 font-black">Falada</th>
                                  <th className="p-2 text-right"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(JSON.parse(profile.pronunciationExceptions || '{}') as Record<string, string>).map(([w, p]) => (
                                  <tr key={w} className="border-b border-gray-100 hover:bg-slate-50">
                                    <td className="p-2 font-bold text-slate-800">{w}</td>
                                    <td className="p-2 text-indigo-700 italic font-semibold">{p}</td>
                                    <td className="p-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          playTactileFeedback();
                                          let currentMap: Record<string, string> = {};
                                          try { currentMap = JSON.parse(profile.pronunciationExceptions || '{}'); } catch(err){}
                                          delete currentMap[w];
                                          setProfile({
                                            ...profile,
                                            pronunciationExceptions: JSON.stringify(currentMap)
                                          });
                                          triggerToastNotification('Exceção de pronúncia removida!');
                                        }}
                                        className="text-red-500 hover:text-red-750 font-black p-1 text-[10px] cursor-pointer"
                                      >
                                        Remover
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 font-semibold italic">Nenhuma exceção fonológica customizada cadastrada ainda.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Theme Select Setup */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5 border-b border-gray-150 pb-2">
                      <Palette className="w-4 h-4 text-indigo-600" />
                      7. Tema Visual da Prancha e Estilo de Pictogramas
                    </h3>
                    
                    <p className="text-[10.5px] text-gray-500 font-bold mb-3">
                      Selecione o gênero e o esquema de cores para os pictogramas e a prancha de CAA. Menino aplica tons Azuis, Menina aplica tons Rosas e o Neutro aplica tons de Cinza elegantes. Modificações são aplicadas imediatamente ao salvar o prontuário.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, genderTheme: 'boy' })}
                        className={`py-3 px-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1.5 ${
                          profile.genderTheme === 'boy'
                            ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-200 font-extrabold'
                            : 'bg-slate-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl">👦</span>
                        <span>Menino (Azul)</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, genderTheme: 'girl' })}
                        className={`py-3 px-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1.5 ${
                          profile.genderTheme === 'girl'
                            ? 'bg-pink-50 border-pink-400 text-pink-900 ring-2 ring-pink-200 font-extrabold'
                            : 'bg-slate-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl">👧</span>
                        <span>Menina (Rosa)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, genderTheme: 'neutral' })}
                        className={`py-3 px-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1.5 ${
                          profile.genderTheme === 'neutral' || !profile.genderTheme
                            ? 'bg-slate-200 border-slate-400 text-slate-800 ring-2 ring-slate-300 font-extrabold'
                            : 'bg-slate-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl">⚪</span>
                        <span>Neutro (Cinza)</span>
                      </button>
                    </div>
                  </div>

                  {/* Therapeutic Rehabilitation Notes */}
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-xs font-bold text-slate-655 uppercase mb-1.5">Prontuário — Evolução Médica & Anotações de CAA</label>
                    <textarea
                      rows={4}
                      value={profile.notes}
                      onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                      placeholder="Anote progressos cognitivos, respostas clínicas motores a matriz Pecs ou transições comportamentais..."
                      className="w-full bg-slate-50 border border-gray-350 rounded-xl text-xs py-2 px-3 text-slate-905"
                    />
                  </div>

                  <div className="border-t border-gray-150 pt-5 flex justify-end">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 px-6 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4 shrink-0" />
                      Salvar Ajustes do Prontuário
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* TAB clinicians/7: AVATAR CREATOR SYSTEM */}
            {clinicianTab === 'avatar-creator' && (
              <div className="flex justify-center">
                <AvatarCreator 
                  initialConfig={profile?.avatarConfig}
                  aiCredits={profile?.aiCredits || 200}
                  onCancel={() => setClinicianTab('board-editor')}
                  onSave={async (newConfig) => {
                    if (!profile) return;
                    try {
                      const updatedProfile = { 
                        ...profile, 
                        avatarConfig: newConfig,
                        aiCredits: (profile.aiCredits || 200) - 10 
                      };
                      
                      const res = await fetch(`/api/patients/${selectedPatientId}/profile`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedProfile)
                      });
                      
                      if (res.ok) {
                        setProfile(updatedProfile);
                        setSuccessToast('Avatar personalizado com sucesso! Todos os pictogramas foram atualizados.');
                        playUnlockSound();
                        setClinicianTab('board-editor');
                      }
                    } catch (e) {
                      console.error('Failed to save avatar:', e);
                    }
                  }}
                />
              </div>
            )}

            {/* TAB clinicians/3: POWERFUL PICTOGRAM IMAGE LIBRARY EXPLORER (MANDATORY REQUIREMENT) */}
            {clinicianTab === 'pictogram-search' && (
              <div className="space-y-6">
                
                {/* Search controls of the powerful image bank */}
                <div className="bg-white border border-gray-205 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                        <BookOpen className="w-5 h-5 text-indigo-600 animate-pulse" />
                        Banco de Imagens de Alta Resolução de Pictogramas Clínicos
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">Buscando entre {pictogramImagesDB.length} símbolos integrados desenvolvidos especificamente para PECS.</p>
                    </div>

                    {/* Search bar input widget */}
                    <div className="relative w-full sm:w-80">
                      <input
                        type="text"
                        placeholder="Buscar por nome ou palavra-chave (ex: sono, fome, mae)..."
                        value={globalPicSearch}
                        onChange={(e) => setGlobalPicSearch(e.target.value)}
                        className="w-full bg-slate-50 focus:bg-white text-slate-900 text-xs font-semibold py-2 pl-9 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Category Filter bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 select-none">
                    <button
                      onClick={() => setGlobalPicCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${globalPicCategory === 'all' ? 'bg-indigo-650 border-indigo-700 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-gray-200'}`}
                    >
                      Mostrar Todas
                    </button>
                    {pictogramCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setGlobalPicCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${cat.color} ${globalPicCategory === cat.id ? 'ring-2 ring-indigo-500 border-current' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid layout results paired with inspection panel on click */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Results box occupying leftmost columns */}
                  <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Resultados de busca ({globalFilteredPics.length} símbolos)</p>
                    
                    {globalFilteredPics.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-2">
                        {globalFilteredPics.map(pic => (
                          <button
                            key={pic.emoji}
                            onClick={() => {
                              setSelectedGlobalPic(pic);
                              playTactileFeedback();
                            }}
                            className={`p-3 border rounded-xl hover:shadow-md cursor-pointer flex flex-col items-center justify-between aspect-square transition-all ${selectedGlobalPic?.emoji === pic.emoji ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-400 hover:bg-indigo-50/50 scale-102' : 'border-gray-200 hover:border-indigo-300'}`}
                          >
                            <PictogramSVG label={pic.label} emoji={pic.emoji} category={pic.category} className="max-h-[75%] max-w-[75%] my-auto" />
                            <span className="text-[11px] font-black truncate w-full mt-1.5 text-center text-slate-800">{pic.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-400 text-xs">
                        Nenhum pictograma relacionado encontrado na busca por "{globalPicSearch}". Tente outras keywords ou categorias.
                      </div>
                    )}
                  </div>

                  {/* Inspected side panel with comprehensive therapeutic usage details */}
                  <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm h-fit">
                    {selectedGlobalPic ? (
                      <div className="space-y-4">
                        
                        <div className="flex items-center gap-4 border-b border-gray-150 pb-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center">
                            <PictogramSVG label={selectedGlobalPic.label} emoji={selectedGlobalPic.emoji} category={selectedGlobalPic.category} className="w-full h-full" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{selectedGlobalPic.label}</h4>
                            <span className="inline-block mt-1 bg-indigo-100 text-indigo-750 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              {pictogramCategories.find(c => c.id === selectedGlobalPic.category)?.name}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3.5 text-xs text-slate-755 font-medium leading-relaxed">
                          
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400">Texto de Pronúncia de CAA:</p>
                            <p className="font-bold text-slate-900 italic mt-0.5">"{selectedGlobalPic.speechText}"</p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400">Palavras-Chaves de Busca (Keywords):</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedGlobalPic.keywords.map(k => (
                                <span key={k} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-3 mt-3">
                            <p className="text-[9px] uppercase font-black text-amber-800 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              Guia de Operações de PECS / Reabilitação:
                            </p>
                            <p className="text-[11px] text-slate-700 font-medium leading-relaxed mt-1">
                              {selectedGlobalPic.pecsDescription}
                            </p>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => {
                                playTactileFeedback();
                                speakText(selectedGlobalPic.speechText);
                              }}
                              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
                            >
                              <Volume2 className="w-4 h-4" />
                              Ouvir Pronúncia da Fono
                            </button>
                          </div>

                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-400 flex flex-col justify-center items-center gap-3">
                        <BookOpen className="w-10 h-10 text-slate-300 animate-bounce" />
                        <p className="text-xs max-w-[200px] leading-relaxed">
                          Clique em qualquer pictograma à esquerda para abrir a análise de métodos de reeducação PECS, keywords e simulação sônica vocal.
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB clinicians/4: DIAGNOSTICS & REHABILITATION PROGRESS REPORT */}
            {clinicianTab === 'diagnostics-panel' && reportsData && (
              <div className="space-y-6">
                
                <div className="bg-white border border-gray-200 p-5 rounded-2xl gap-4 grid grid-cols-1 md:grid-cols-3">
                  <div className="border-r border-gray-150 pr-4">
                    <span className="text-[10px] uppercase font-semibold text-gray-400">Total de Usos</span>
                    <h3 className="text-2xl font-black text-indigo-950 mt-1">{reportsData.totalUsage || 0} clicks</h3>
                    <p className="text-[10px] text-gray-500 mt-1 leading-none">Vocalizações registradas pelo tablet.</p>
                  </div>
                  <div className="border-r border-gray-150 px-4">
                    <span className="text-[10px] uppercase font-semibold text-gray-400">Categoria de Maior Foco</span>
                    <h3 className="text-2xl font-black text-indigo-950 mt-1">{reportsData.categoryStats?.[0]?.name || 'Nenhum'}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 leading-none">Representa {reportsData.categoryStats?.[0]?.percentage || 0}% de demandas.</p>
                  </div>
                  <div className="pl-4">
                    <span className="text-[10px] uppercase font-semibold text-gray-400">Fidelização PECS</span>
                    <h3 className="text-2xl font-black text-indigo-950 mt-1">Nível Terapeutico</h3>
                    <p className="text-[10px] text-gray-500 mt-1 leading-none">Uso constante de montador de frases avançado.</p>
                  </div>
                </div>

                {/* Graphs representation built cleanly in responsive inline SVGs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Timeline */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4">Interações por Dia (Últimos 7 dias)</h4>
                    
                    {reportsData.historyTimeline && reportsData.historyTimeline.length > 0 ? (
                      <div className="h-[200px] w-full flex items-end gap-3 pt-6 px-1">
                        {reportsData.historyTimeline.map((day: any, i: number) => {
                          const maxCount = Math.max(...reportsData.historyTimeline.map((h: any) => h.count), 4);
                          const pct = Math.min(100, Math.round((day.count / maxCount) * 100));

                          return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                              {day.count > 0 && (
                                <span className="bg-indigo-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md shadow scale-90 mb-1 select-none">
                                  {day.count}
                                </span>
                              )}
                              <div 
                                className="w-full bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-lg transition-all duration-300 hover:from-indigo-650 cursor-pointer"
                                style={{ height: `${Math.max(6, pct)}%` }}
                              ></div>
                              <div className="text-center font-bold text-[9px] leading-tight text-slate-505 select-none mt-1">
                                <p>{day.dayName}</p>
                                <p className="text-[7.5px] text-gray-400 mt-0.5">{day.date}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-16">Uso sem histórico ativo no período.</p>
                    )}
                  </div>

                  {/* Share progress bars */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4">Uso de Categorias Clínicas</h4>
                    
                    {reportsData.categoryStats && reportsData.categoryStats.length > 0 ? (
                      <div className="space-y-4">
                        {reportsData.categoryStats.map((cat: any, i: number) => {
                          const colors: { [key: string]: string } = {
                            'Quero': 'bg-amber-500',
                            'Sinto': 'bg-purple-500',
                            'Dor': 'bg-red-500',
                            'Banheiro': 'bg-teal-500',
                            'Comida': 'bg-emerald-500',
                            'Pessoas': 'bg-sky-500',
                            'Escola': 'bg-indigo-500',
                            'Terapia': 'bg-pink-500',
                            'Emoções': 'bg-violet-500',
                            'Combinação': 'bg-gray-500'
                          };
                          const barCol = colors[cat.name] || 'bg-indigo-600';

                          return (
                            <div key={i}>
                              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-800">
                                <span>{cat.name}</span>
                                <span className="text-gray-400">{cat.count} clicks ({cat.percentage}%)</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barCol}`} style={{ width: `${cat.percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-16">Nenhum dado categorizado disponível.</p>
                    )}
                  </div>

                </div>

                {/* Sub history listing recent phrases constructed */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-4">
                  <div className="flex justify-between items-center border-b border-gray-150 pb-3 mb-4">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Histórico Recente de Composições Sintetizadas
                    </h4>
                    <button
                      onClick={() => {
                        const sumNotes = `\n\n[Métricas anexadas em ${new Date().toLocaleDateString('pt-BR')}]: Uso total de ${reportsData.totalUsage} canais comunicativos PECS. Principal categoria motivadora: ${reportsData.categoryStats?.[0]?.name || 'Nenhuma'}.`;
                        if (profile) {
                          setProfile({ ...profile, notes: profile.notes + sumNotes });
                          triggerToastNotification('Síntese estatística anexada nas notas de evolução do prontuário.');
                        }
                      }}
                      className="text-[9px] font-black text-indigo-600 hover:text-indigo-850 border border-indigo-200 rounded px-2.5 py-1 bg-indigo-50"
                    >
                      Anexar no Prontuário Médico
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-2">
                    {reportsData.latestSentences && reportsData.latestSentences.length > 0 ? (
                      reportsData.latestSentences.map((s: any, idx: number) => (
                        <div key={idx} className="bg-indigo-50/20 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-indigo-950">"{s.phrase}"</p>
                            <span className="text-[10px] text-indigo-650 font-bold mt-1 inline-block">
                              Montada e dita pelo paciente.
                            </span>
                          </div>
                          <span className="text-[9px] text-gray-400 font-bold shrink-0">{new Date(s.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-10">O paciente ainda não combinou múltiplos termos.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB clinicians/5: PATIENTS CLINICAL CORE RECORDS */}
            {clinicianTab === 'patients-registry' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Registration Form */}
                <div className="lg:col-span-5 bg-white border border-gray-202 rounded-3xl p-5 shadow-sm h-fit">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4 border-b border-gray-150 pb-2">
                    Cadastrar Novo Paciente e Prancha de CAA
                  </h3>

                  <form onSubmit={handleAddNewPatientRecord} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pedro Henrique de Oliveira"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-550"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Data Nascimento</label>
                        <input
                          type="date"
                          value={newPatientBirth}
                          onChange={(e) => setNewPatientBirth(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs py-1.5 px-2 text-slate-905"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Cód. Prontuário</label>
                        <input
                          type="text"
                          placeholder="Ex: PR-2026-X11"
                          value={newPatientNumber}
                          onChange={(e) => setNewPatientNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs py-2 px-2 text-slate-905"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Diagnóstico e Grau de Suporte</label>
                      <input
                        type="text"
                        placeholder="Ex: TEA Nível 2 de Suporte + Apraxia de Fala"
                        value={newPatientDiagnosis}
                        onChange={(e) => setNewPatientDiagnosis(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs py-2 px-3 text-slate-905"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Responsável Legal</label>
                        <input
                          type="text"
                          placeholder="Mãe ou Pai"
                          value={newPatientResp}
                          onChange={(e) => setNewPatientResp(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs py-2 px-3 text-slate-905"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Telefone Celular</label>
                        <input
                          type="text"
                          placeholder="Ex: (11) 98888-7777"
                          value={newPatientPhone}
                          onChange={(e) => setNewPatientPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs py-2 px-3 text-slate-905"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Tema Inicial &amp; Estilo de Pictogramas</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewPatientTheme('boy')}
                          className={`py-2.5 px-2 rounded-xl border text-[10.5px] font-extrabold transition-all flex flex-col items-center gap-1 ${
                            newPatientTheme === 'boy'
                              ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-200'
                              : 'bg-slate-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-base">👦</span>
                          <span>Menino (Azul)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPatientTheme('girl')}
                          className={`py-2.5 px-2 rounded-xl border text-[10.5px] font-extrabold transition-all flex flex-col items-center gap-1 ${
                            newPatientTheme === 'girl'
                              ? 'bg-pink-50 border-pink-400 text-pink-900 ring-2 ring-pink-200'
                              : 'bg-slate-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-base">👧</span>
                          <span>Menina (Rosa)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPatientTheme('neutral')}
                          className={`py-2.5 px-2 rounded-xl border text-[10.5px] font-extrabold transition-all flex flex-col items-center gap-1 ${
                            newPatientTheme === 'neutral'
                              ? 'bg-slate-200 border-slate-400 text-slate-800 ring-2 ring-slate-300'
                              : 'bg-slate-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-base">⚪</span>
                          <span>Neutro (Cinza)</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4 shrink-0" />
                      Cadastrar Paciente no ERP
                    </button>
                  </form>
                </div>

                {/* Patient Roster Checklist */}
                <div className="lg:col-span-7 bg-white border border-gray-202 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 pb-2.5">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                      Prontuários Cadastrados ({patients.length})
                    </h3>
                    
                    <label className="bg-indigo-50 hover:bg-indigo-105 text-indigo-950 font-extrabold text-[9.5px] uppercase px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-1 cursor-pointer transition-all self-start sm:self-auto shadow-xs active:scale-97">
                      📤 Restaurar Backup JSON
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackupJSON}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-2">
                    {patients.map(p => (
                      <div 
                        key={p.id}
                        className={`p-4 border rounded-2xl flex items-center justify-between gap-3 transition-colors ${selectedPatientId === p.id ? 'border-indigo-650 bg-indigo-50/20' : 'border-gray-200'}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900">{p.name}</h4>
                            <span className="bg-slate-100 text-[9px] font-bold border border-slate-205 text-slate-600 px-1.5 py-0.5 rounded">
                              {p.recordNumber}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium mt-1">Diagnóstico: <strong className="text-slate-800">{p.diagnosis}</strong></p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Responsável: {p.responsibleName || 'Não informado'} | Cel: {p.responsiblePhone || 'Nenhum'}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => exportPatientBackupJSON(p.id)}
                            className="bg-slate-50 hover:bg-slate-100 border border-gray-250 text-slate-700 px-2 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                            title="Exportar Prancha e Prontuário para JSON Backup"
                          >
                            <span>📥</span> <span className="hidden xs:inline font-bold text-[9.5px] uppercase">Backup</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPatientId(p.id);
                              playTactileFeedback();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer ${selectedPatientId === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-805'}`}
                          >
                            Ativar
                          </button>
                          
                          {selectedPatientId === p.id && (
                            <button
                              onClick={deleteActivePatientContext}
                              className="text-red-655 hover:text-red-750 p-1.5 rounded bg-red-50 hover:bg-red-100 cursor-pointer"
                              title="Deletar prontuário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB clinicians/6: GOOGLE DRIVE BACKUP & SYNCHRONIZATION DASHBOARD */}
            {clinicianTab === 'google-drive' && (
              <div className="space-y-6">
                
                {/* 1. Introductory Cloud Banner */}
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 leading-none">
                      ☁️ Sincronização em Nuvem do Consultório
                    </h3>
                    <h2 className="text-lg font-black tracking-tight mt-1">Google Drive Sync & Backup Cooperativo</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-[650px] font-medium leading-relaxed">
                      Sincronize fichas médicas, perfis comunicacionais com síntese de voz customizada, dados de acessibilidade e pranchas PECS estruturadas do paciente. Salve ou restaure prontuários inteiros em segundos.
                    </p>
                  </div>
                  
                  {isGdriveLoading && (
                    <div className="flex items-center gap-2 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-700/50">
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
                      <span className="text-[10px] font-mono font-black tracking-widest text-amber-300">PROCESSANDO...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* 2. Left Column: Connection Profile Management */}
                  <div className="lg:col-span-5 bg-white border border-gray-202 rounded-3xl p-5 shadow-sm space-y-5">
                    
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 border-b border-gray-150 pb-2">
                        Perfil de Autenticação Google
                      </h3>
                      <p className="text-[10.5px] text-gray-500 leading-relaxed font-medium">
                        Identifique ou configure sua conta terapêutica Google para habilitar permissões de salvar arquivos no seu armazenamento corporativo.
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300">
                          {gdriveUser?.picture ? (
                            <img src={gdriveUser.picture} alt="Foto de perfil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 leading-tight">
                            {gdriveUser?.name || 'Não Autenticado'}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {gdriveUser?.email || 'Nenhuma conta ativa'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {gdriveAccessToken || isGdriveDemoMode ? (
                          <span className="bg-emerald-50 text-emerald-800 font-black text-[9px] uppercase px-2 py-1 rounded-md border border-emerald-300">
                            ● Conectado
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 font-black text-[9px] uppercase px-2 py-1 rounded-md border border-gray-250">
                            ○ Desconectado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Demo Warning Badge */}
                    {isGdriveDemoMode && (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2 text-amber-900 shadow-inner">
                        <span className="text-sm">💡</span>
                        <div>
                          <h5 className="text-[10px] font-black uppercase leading-tight">Modo Demonstração Ativo (Simulado)</h5>
                          <p className="text-[9.5px] mt-0.5 font-medium leading-normal">
                            Para testar o layout sem um Google Client ID, simulamos o armazenamento encriptado em nuvem de teste escolar do ERP.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Authentication Actions */}
                    {!gdriveAccessToken && !isGdriveDemoMode ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase text-slate-600">Inserir seu Google OAuth 2.0 Client ID:</label>
                          <input
                            type="text"
                            placeholder="Ex: 123456789-abc.apps.googleusercontent.com"
                            value={gdriveClientId}
                            onChange={(e) => setGdriveClientId(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-300 rounded-xl text-xs py-2 px-3 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                          />
                        </div>

                        <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-4 space-y-2.5">
                          <h4 className="text-[10px] font-black uppercase text-indigo-950 flex items-center gap-1">
                            <span>📘</span> Como obter minhas credenciais de nuvem Google:
                          </h4>
                          <ol className="text-[9.5px] text-indigo-900 space-y-1.5 list-decimal pl-4 leading-relaxed font-semibold">
                            <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 hover:text-indigo-850">Google Cloud Console</a> e crie ou escolha seu projeto de ERP.</li>
                            <li>Vá na aba <strong>APIs e Serviços</strong> &gt; <strong>Tela de Consentimento OAuth</strong> e configure seu suporte.</li>
                            <li>Vá em <strong>Credenciais</strong> &gt; <strong>Criar Credenciais</strong> &gt; <strong>ID do cliente OAuth</strong>. Escolha tipo <strong>Aplicativo da Web (SPA)</strong>.</li>
                            <li>Adicione o seguinte em <strong>Origens autorizadas do JavaScript</strong> e <strong>URIs de redirecionamento autorizados</strong>: <code className="bg-white border border-indigo-200 rounded px-1 text-[9px] select-all font-mono py-0.5">{window.location.origin}/</code></li>
                            <li>Copie o Client ID gerado, cole no campo acima e clique em autenticar abaixo para conectar à sua pasta.</li>
                          </ol>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleGdriveLogin}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 px-4 rounded-xl flex-1 shadow transition-all active:scale-97 text-center flex items-center justify-center gap-1.5"
                          >
                            📲 Conectar com Google Drive
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleActivateDemoMode}
                            className="bg-slate-100 hover:bg-slate-205 text-slate-700 font-bold border border-gray-300 text-xs py-2.5 px-3 rounded-xl transition-all active:scale-97 text-center flex items-center justify-center gap-1"
                          >
                            🔬 Modo Demo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div className="bg-emerald-50/30 border border-emerald-200 rounded-2xl p-4 space-y-3 shadow-xs">
                          <h4 className="text-[10.5px] font-black text-slate-800 uppercase flex items-center gap-1.5 leading-none">
                            <span>🔐</span> Sincronizar Prontuário Clínico Ativo:
                          </h4>
                          <p className="text-[10.5px] text-gray-500 font-medium leading-normal">
                            Você pode exportar instantaneamente as configurações de tela física e clínica de <strong>{selectedPatient.name}</strong> para o seu Drive pessoal.
                          </p>

                          <button
                            type="button"
                            onClick={() => uploadBackupToGdrive(selectedPatient.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            ☁️ Criar Novo Ponto de Backup na Nuvem
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={isGdriveDemoMode ? handleDeactivateDemoMode : handleGdriveLogout}
                            className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-650 font-bold text-xs py-2 px-3 rounded-xl border border-gray-300 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>⚠️</span> Encerrar Conexão Google Drive
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* 3. Right Column: Cloud Files List */}
                  <div className="lg:col-span-7 bg-white border border-gray-202 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 pb-2.5">
                        <div>
                          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                            Arquivamentos de Nuvem Disponíveis
                          </h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Selecione qualquer ponto histórico de restauração para clonar ou carregar o prontuário.
                          </p>
                        </div>

                        {/* Reload Files Button */}
                        {(gdriveAccessToken || isGdriveDemoMode) && (
                          <button
                            onClick={() => {
                              playTactileFeedback();
                              if (isGdriveDemoMode) {
                                triggerToastNotification('Atualizando lista de backups simulados.');
                              } else {
                                fetchGdriveFilesList(gdriveAccessToken);
                              }
                            }}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-gray-250 p-1.5 rounded-xl shadow-xs transition-transform active:scale-95 text-xs font-extrabold flex items-center gap-1"
                            title="Recarregar lista"
                          >
                            🔄 Atualizar Nuvem
                          </button>
                        )}
                      </div>

                      {/* File cards collection scroll wrapper */}
                      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2 pb-2">
                        
                        {/* 3.1 GDrive Not authenticated placeholder */}
                        {!gdriveAccessToken && !isGdriveDemoMode && (
                          <div className="p-8 border border-dashed border-gray-300 rounded-2xl text-center space-y-3 bg-neutral-50/50">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl mx-auto font-black shadow-inner">
                              📂
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-805">Acesso Restrito ao Google Drive</h4>
                              <p className="text-[10.5px] text-gray-400 mt-1 max-w-[280px] mx-auto font-medium leading-relaxed">
                                Insira seu Client ID de Terapeuta no menu ao lado para conectar e carregar backups do Drive.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 3.2 List available files - Sandbox or Real */}
                        {(gdriveAccessToken || isGdriveDemoMode) && (
                          <>
                            {/* Empty cloud files screen state */}
                            {((isGdriveDemoMode ? gdriveDemoFiles : gdriveFiles).length === 0) ? (
                              <div className="p-8 border border-dashed border-gray-300 rounded-2xl text-center space-y-3 bg-neutral-50/50">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl mx-auto font-black shadow-inner animate-pulse">
                                  ☁️
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-indigo-900">Seu Google Drive está vazio</h4>
                                  <p className="text-[10.5px] text-gray-400 mt-1 max-w-[320px] mx-auto font-medium leading-relaxed">
                                    Nenhuma cópia de prontuário JSON `comunicatea_backup_` encontrada. Clique em <strong>"Criar Novo Ponto de Backup"</strong> ao lado hoje mesmo para proteger seus dados históricos.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              (isGdriveDemoMode ? gdriveDemoFiles : gdriveFiles).map((file) => (
                                <div
                                  key={file.id}
                                  className="p-3.5 border border-gray-200 hover:border-indigo-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all bg-slate-50/20 hover:shadow-xs"
                                >
                                  <div className="flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-650 shrink-0 text-sm font-black mt-0.5">
                                      💾
                                    </div>
                                    <div className="text-left">
                                      <h4 className="text-xs font-black text-slate-800 break-all leading-tight max-w-[240px] sm:max-w-[320px]">
                                        {file.name}
                                      </h4>
                                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[9.5px] text-gray-400 font-medium">
                                        <span className="font-semibold text-slate-500 font-mono">
                                          Tamanho: {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                        <span>•</span>
                                        <span>
                                          Salvo em: {new Date(file.modifiedTime).toLocaleDateString('pt-BR')} às {new Date(file.modifiedTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 border-t sm:border-t-0 border-neutral-100 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                                    <button
                                      type="button"
                                      onClick={() => restoreBackupFromGdrive(file.id, file.name)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-[9.5px] uppercase shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                                      title="Restaurar este backup do prontuário do paciente no consultório local"
                                    >
                                      📥 Carregar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => deleteBackupFromGdrive(file.id, file.name)}
                                      className="text-red-655 hover:text-red-750 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                      title="Remover este arquivo de backup do Google Drive permanentemente"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        )}

                      </div>
                    </div>

                    <div className="border-t border-gray-150 pt-3 text-[10px] text-gray-400 leading-normal flex items-start gap-1.5 font-medium">
                      <span>🔒</span>
                      <span>
                        Sua privacidade é respeitada por completo: o ERP ComunicaTEA utiliza permissões restritas (escopo `drive.file`) para que o aplicativo possa criar, ler e editar apenas os arquivos de backup JSON que ele mesmo gerar, protegendo todos os seus outros documentos pessoais no Google Drive.
                      </span>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* ----------------------------- CORE BUTTON VISUAL EDITOR MODAL ----------------------------- */}
      {showButtonModal && editingButton && boardDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:hidden overflow-y-auto">
          <div className="bg-white rounded-[28px] p-6 max-w-4xl w-full shadow-2xl relative grid grid-cols-1 lg:grid-cols-12 gap-6 my-8 max-h-[90vh]">
            
            {/* Modal Exit */}
            <button 
              onClick={() => {
                setShowButtonModal(false);
                setEditingButton(null);
                setCustomImageBase64('');
              }}
              className="absolute top-4 right-4 text-gray-405 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column of Modal: Button information triggers */}
            <div className="lg:col-span-5 space-y-4 overflow-y-auto pr-1">
              <h3 className="text-sm font-black text-slate-900 border-b border-gray-100 pb-2 mb-2 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-indigo-700 font-black animate-spin-once shrink-0" />
                <span>{editingButton.id ? 'Editar Cartão CAA' : 'Cadastrar Cartão CAA'}</span>
              </h3>

              <form onSubmit={handleSaveButtonDetails} className="space-y-3.5">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Rotulo (Legenda) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Água"
                      value={editingButton.label || ''}
                      onChange={(e) => setEditingButton({ ...editingButton, label: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs py-2 px-2.5 text-slate-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Pronúncia Falada *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Quero beber água, por favor"
                      value={editingButton.speechText || ''}
                      onChange={(e) => setEditingButton({ ...editingButton, speechText: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs py-2 px-2 text-slate-905"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Categoria</label>
                    <select
                      value={editingButton.categoryId || ''}
                      onChange={(e) => setEditingButton({ ...editingButton, categoryId: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs p-1 text-slate-905 font-medium"
                    >
                      {boardDetails.categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Status Visual</label>
                    <select
                      value={editingButton.isVisible ? 'true' : 'false'}
                      onChange={(e) => setEditingButton({ ...editingButton, isVisible: e.target.value === 'true' })}
                      className="w-full bg-slate-50 border border-gray-300 rounded-lg text-xs p-1 text-slate-905"
                    >
                      <option value="true">Ativo na prancha</option>
                      <option value="false">Oculto (Fase anterior/posterior)</option>
                    </select>
                  </div>
                </div>

                {/* Símbolo visual preview panel */}
                <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-white rounded-lg border border-indigo-200 flex items-center justify-center shrink-0 overflow-hidden select-none text-3xl">
                      {customImageBase64 ? (
                        <img src={customImageBase64} alt="Pre" className="w-full h-full object-cover" />
                      ) : (
                        <PictogramSVG label={editingButton.label} emoji={editingButton.imageUrl || '💬'} category={boardDetails?.categories.find(c => c.id === editingButton.categoryId)?.name} className="w-full h-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-indigo-950 uppercase leading-tight">Símbolo do Botão</p>
                      <p className="text-[9px] text-indigo-650 max-w-[150px] truncate">
                        {customImageBase64 ? 'Foto carregada' : `Emoji tátil: ${editingButton.imageUrl}`}
                      </p>
                    </div>
                  </div>

                  {customImageBase64 && (
                    <button
                      type="button"
                      onClick={() => setCustomImageBase64('')}
                      className="text-[9px] font-black text-red-600 hover:text-red-750 uppercase"
                    >
                      Remover foto
                    </button>
                  )}
                </div>

                {/* File custom uploads option */}
                <div className="border border-gray-200 rounded-xl p-3 bg-slate-50">
                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Importar Imagem do Dispositivo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalImageBase64Upload}
                    className="text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer w-full"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-gray-150">
                  {editingButton.id ? (
                    <button
                      type="button"
                      onClick={() => deleteActiveCellButton(editingButton.id!)}
                      className="text-red-600 hover:text-red-750 font-black text-[11px] uppercase flex items-center gap-1 bg-red-50 hover:bg-red-100/60 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Apagar Botão
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowButtonModal(false);
                        setEditingButton(null);
                        setCustomImageBase64('');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-1.5 px-3.5 rounded-lg"
                    >
                      Sair
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-1.5 px-4 rounded-lg shadow-sm"
                    >
                      Salvar Cartão
                    </button>
                  </div>
                </div>

              </form>
            </div>

            {/* Right Column of Modal: Powerful Pictogram bank browsing in visual modal creator (HIGH CONTENT COMPLIANCE) */}
            <div className="lg:col-span-7 flex flex-col h-[400px] lg:h-full border-l border-gray-150 lg:pl-6 overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 pb-3 border-b border-gray-100">
                <span className="block text-xs font-black text-slate-900 uppercase">
                  🖼️ Banco Poderoso de Pictogramas Clínicos PECS
                </span>
                <p className="text-[10px] text-gray-400 font-semibold mb-3">Busque e clique para preencher automaticamente as legendas, fonéticas e símbolos.</p>

                {/* Autocomplete Input */}
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Filtre e busque (ex: agua, comer, triste, ir)..."
                      value={modalPicSearchQuery}
                      onChange={(e) => setModalPicSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 text-xs py-1.5 pl-8 pr-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    />
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <select
                    value={modalPicCategory}
                    onChange={(e) => setModalPicCategory(e.target.value)}
                    className="bg-slate-50 border border-gray-300 rounded-lg text-[10px] font-bold px-2 py-1 text-slate-850"
                  >
                    <option value="all">Todas as Categorias</option>
                    {pictogramCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid with matching entries search in database and auto triggers fill state */}
              <div className="flex-1 overflow-y-auto pt-3 max-h-[300px]">
                {modalFilteredPics.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pr-1.5">
                    {modalFilteredPics.map(pic => (
                      <button
                        type="button"
                        key={pic.emoji}
                        onClick={() => {
                          playTactileFeedback();
                          setCustomImageBase64(''); // clear uploaded base64
                          setEditingButton(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              imageUrl: pic.emoji,
                              label: pic.label,
                              speechText: pic.speechText
                            };
                          });
                        }}
                        className={`p-2 border rounded-xl hover:bg-indigo-50/20 text-center flex flex-col items-center justify-between aspect-square transition-all ${editingButton.imageUrl === pic.emoji && !customImageBase64 ? 'border-indigo-650 bg-indigo-50/20 ring-2 ring-indigo-400' : 'border-gray-200 hover:border-indigo-300'}`}
                      >
                        <PictogramSVG label={pic.label} emoji={pic.emoji} category={pic.category} className="max-h-[75%] max-w-[75%] my-auto" />
                        <span className="text-[10px] font-black truncate w-full mt-1 text-slate-800 leading-tight">{pic.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-[11px] leading-relaxed">
                    Nenhum pictograma relacionado encontrado na base. Digite outra palavra-chave.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ------------------------- WINDOW PRINT METHOD SPECIFIC STYLING ------------------------- */}
      <div className="hidden print:block p-8 bg-white text-black min-h-screen">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight">Prancha de CAA Física para Comunicação — Clínica TEA</h1>
          <p className="text-sm mt-1">
            Paciente: <strong className="font-extrabold">{selectedPatient?.name}</strong> | Cód. Prontuário: <strong>{selectedPatient?.recordNumber}</strong>
          </p>
          <p className="text-xs italic mt-1 text-gray-500">Impresso diretamente do Módulo Clínico Avançado em {new Date().toLocaleDateString('pt-BR')}.</p>
        </div>

        {boardDetails && (
          <div className="space-y-6">
            <h2 className="text-base font-extrabold uppercase ml-1 block border-b border-black pb-1.5">Mural de Pecs: {boardDetails.board.name}</h2>
            
            <div className="grid grid-cols-4 gap-4">
              {boardDetails.buttons.filter(b => b.isVisible).map(btn => (
                <div key={btn.id} className="border-2 border-slate-900 rounded-2xl p-4 text-center aspect-square flex flex-col justify-between items-center bg-white">
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                    {btn.imageUrl.startsWith('data:') ? (
                      <img src={btn.imageUrl} alt={btn.label} className="w-full h-full object-cover" />
                    ) : (
                      <PictogramSVG label={btn.label} emoji={btn.imageUrl} category={boardDetails?.categories.find(c => c.id === btn.categoryId)?.name} className="w-full h-full" />
                    )}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight mt-1">{btn.label}</h3>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold select-none truncate max-w-[130px]">
                    Pronúncia: "{btn.speechText}"
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400 pt-4 mt-8">
              <h4 className="text-xs font-bold uppercase tracking-wide">Evolução Médica e Guias de Reabilitação:</h4>
              <p className="text-xs leading-relaxed mt-1 whitespace-pre-line text-gray-700 italic">
                {profile?.notes || 'Posicione a prancha física ao alcance confortável das mãos do paciente auxiliado. Estimule o ganho de autonomia associando a figura à ação e repita a fonética auditiva.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------- BEHAVIORAL SUPPORTS MODAL PANEL (TD SNAP) ------------------------- */}
      <BehavioralSupportsPanel
        isOpen={showBehavioralSupports}
        onClose={() => setShowBehavioralSupports(false)}
        onSpeak={speakText}
        playTactile={playTactileFeedback}
        highContrast={profile?.highContrast}
        timerInitial={timerInitial}
        setTimerInitial={setTimerInitial}
        timerSecondsLeft={timerSecondsLeft}
        setTimerSecondsLeft={setTimerSecondsLeft}
        timerActive={timerActive}
        setTimerActive={setTimerActive}
      />

    </div>
  );
}
