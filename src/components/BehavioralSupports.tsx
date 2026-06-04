import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Play, 
  Pause, 
  X, 
  FileText, 
  ChevronRight, 
  Volume2, 
  AlertCircle 
} from 'lucide-react';

const playTimerAlarmSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play a lovely double-chime (Ding-Ding-Dong)
    const playChimeNode = (timeOffset: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.45);
      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.5);
    };
    
    playChimeNode(0, 880);     // A5
    playChimeNode(0.15, 880);  // A5
    playChimeNode(0.3, 1109.73); // C#6
  } catch (e) {
    console.warn('Alarm audio synthesis failed:', e);
  }
};

interface BehavioralSupportsProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeak: (text: string) => void;
  playTactile: () => void;
  highContrast?: boolean;
  timerInitial: number;
  setTimerInitial: (val: number | ((prev: number) => number)) => void;
  timerSecondsLeft: number;
  setTimerSecondsLeft: (val: number | ((prev: number) => number)) => void;
  timerActive: boolean;
  setTimerActive: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const BehavioralSupportsPanel: React.FC<BehavioralSupportsProps> = ({
  isOpen,
  onClose,
  onSpeak,
  playTactile,
  highContrast = false,
  timerInitial,
  setTimerInitial,
  timerSecondsLeft,
  setTimerSecondsLeft,
  timerActive,
  setTimerActive
}) => {
  const [activeTab, setActiveTab] = useState<'first-then' | 'schedule' | 'timer' | 'script'>('first-then');

  // --- 1. FIRST / THEN STATE ---
  const [firstText, setFirstText] = useState('Limpar a mochila ou brinquedos 🧩');
  const [thenText, setThenText] = useState('Brincar livre com blocos de montar 🧱');
  
  const firstThenPresets = [
    { first: 'Fazer atividade de foco e mesa 📝', then: 'Lanche delicioso e suco 🧃' },
    { first: 'Ir escovar os dentes 🪥', then: 'Ouvir sua musiquinha favorita 🎵' },
    { first: 'Terminar sessão de terapia 👩‍⚕️', then: 'Usar o tablet por 5 minutos 📱' },
    { first: 'Arrumar os sapatos e o quarto 🩴', then: 'Brincar no parquinho lá fora 🛝' }
  ];

  // --- 2. MINI SCHEDULE / CRONOGRAMA STATE ---
  const [scheduleItems, setScheduleItems] = useState([
    { id: 1, label: 'Fazer lição com foco', emoji: '📝', completed: false },
    { id: 2, label: 'Lavar bem as mãos com sabão', emoji: '🧼', completed: false },
    { id: 3, label: 'Comer biscoito na mesa', emoji: '🍪', completed: false }
  ]);

  const schedulePresets = {
    hygiene: [
      { id: 1, label: 'Ir ao Banheiro e Privada', emoji: '🚽', completed: false },
      { id: 2, label: 'Lavar as mãos na torneira', emoji: '🧼', completed: false },
      { id: 3, label: 'Escovar bem os dentes', emoji: '🪥', completed: false }
    ],
    therapy: [
      { id: 1, label: 'Atividade sensorial de foco', emoji: '🌀', completed: false },
      { id: 2, label: 'Resolver o quebra-cabeça', emoji: '🧩', completed: false },
      { id: 3, label: 'Ganhar adesivo de campeão', emoji: '🌟', completed: false }
    ],
    school: [
      { id: 1, label: 'Guardar mochila no cabide', emoji: '🎒', completed: false },
      { id: 2, label: 'Prestar atenção no professor', emoji: '👩‍🏫', completed: false },
      { id: 3, label: 'Hora de desenhar e colorir', emoji: '🎨', completed: false }
    ]
  };

  const loadSchedulePreset = (key: 'hygiene' | 'therapy' | 'school') => {
    playTactile();
    setScheduleItems(schedulePresets[key]);
  };

  const toggleScheduleItem = (id: number) => {
    playTactile();
    setScheduleItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState) {
          onSpeak(`${item.label}! Concluído.`);
        }
        return { ...item, completed: nextState };
      }
      return item;
    }));
  };

  // --- 3. VISUAL TIMER STATE ---
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            playTimerAlarmSound();
            onSpeak('O tempo acabou! Transição de atividade concluída.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive]);

  const selectTimerPreset = (minutes: number) => {
    playTactile();
    setTimerActive(false);
    setTimerInitial(minutes * 60);
    setTimerSecondsLeft(minutes * 60);
  };

  const toggleTimer = () => {
    playTactile();
    if (timerSecondsLeft === 0) {
      setTimerSecondsLeft(timerInitial);
    }
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    playTactile();
    setTimerActive(false);
    setTimerSecondsLeft(timerInitial);
  };

  const formatTimerTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerPct = Math.round((timerSecondsLeft / timerInitial) * 100);

  // --- 4. SOCIAL SCRIPTS STATE ---
  const socialScripts = [
    { label: 'Pedir Ajuda', text: 'Eu preciso de ajuda com esta tarefa, por favor.', emoji: '🤝' },
    { label: 'Ir embora', text: 'Terminei minha aula e já gostaria de ir embora, obrigado!', emoji: '🏡' },
    { label: 'Ir ao Banheiro', text: 'Com licença, preciso ir ao banheiro por favor.', emoji: '🚽' },
    { label: 'Mais um pouco', text: 'Gostei muito disto! Posso brincar mais um pouquinho?', emoji: '🤩' },
    { label: 'Pedir Pausa', text: 'Estou cansado e com sobrecarga. Posso ter uma pequena pausa, por favor?', emoji: '🤫' },
    { label: 'Estou com Sede', text: 'Estou com muita sede, posso beber água por favor?', emoji: '🥤' }
  ];

  if (!isOpen) return null;

  const bgStyle = highContrast ? 'bg-zinc-950 text-white border-zinc-800' : 'bg-slate-50 text-slate-900';
  const cardStyle = highContrast ? 'bg-zinc-900 border-zinc-800 text-yellow-300' : 'bg-white border-slate-200 text-slate-800';
  const textTitleStyle = highContrast ? 'text-yellow-405' : 'text-indigo-950';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden overflow-y-auto">
      <div className={`rounded-[32px] p-6 max-w-4xl w-full shadow-2xl relative flex flex-col md:grid md:grid-cols-12 gap-6 my-8 max-h-[92vh] border ${bgStyle}`}>
        
        {/* Close Button */}
        <button 
          onClick={() => {
            playTactile();
            onClose();
          }}
          className="absolute top-4 right-4 bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full cursor-pointer select-none transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar sub-navigation */}
        <div className="md:col-span-4 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r border-slate-200 md:pb-0 pb-3 md:pr-4">
          <div className="hidden md:flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-indigo-600 animate-spin-once" />
            <div>
              <h2 className={`text-base font-black leading-tight ${textTitleStyle}`}>Suportes de Rotina</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase">TD Snap® Regulação</p>
            </div>
          </div>

          <button
            onClick={() => { playTactile(); setActiveTab('first-then'); }}
            className={`flex-1 md:flex-none text-left font-black text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5 transition-all text-center md:text-left ${
              activeTab === 'first-then' 
              ? 'bg-indigo-650 text-white shadow-md transform scale-102 font-extrabold' 
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <ChevronRight className="w-4 h-4 hidden md:inline shrink-0" />
            <span>1. Primeiro ➔ Depois</span>
          </button>

          <button
            onClick={() => { playTactile(); setActiveTab('schedule'); }}
            className={`flex-1 md:flex-none text-left font-black text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5 transition-all text-center md:text-left ${
              activeTab === 'schedule' 
              ? 'bg-indigo-650 text-white shadow-md transform scale-102 font-extrabold' 
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <ChevronRight className="w-4 h-4 hidden md:inline shrink-0" />
            <span>2. Mini-Cronograma</span>
          </button>

          <button
            onClick={() => { playTactile(); setActiveTab('timer'); }}
            className={`flex-1 md:flex-none text-left font-black text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5 transition-all text-center md:text-left ${
              activeTab === 'timer' 
              ? 'bg-indigo-650 text-white shadow-md transform scale-102 font-extrabold' 
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <ChevronRight className="w-4 h-4 hidden md:inline shrink-0" />
            <span>3. Relógio Visual</span>
          </button>

          <button
            onClick={() => { playTactile(); setActiveTab('script'); }}
            className={`flex-1 md:flex-none text-left font-black text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5 transition-all text-center md:text-left ${
              activeTab === 'script' 
              ? 'bg-indigo-650 text-white shadow-md transform scale-102 font-extrabold' 
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <ChevronRight className="w-4 h-4 hidden md:inline shrink-0" />
            <span>4. Roteiros Sociais</span>
          </button>
        </div>

        {/* Main Work Area */}
        <div className="md:col-span-8 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-full pr-1">
          
          {/* TAB 1: FIRST / THEN LAYOUT (PRIMEIRO / DEPOIS) */}
          {activeTab === 'first-then' && (
            <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
              <div>
                <h3 className={`text-sm font-black border-b pb-1.5 mb-3 flex items-center gap-1.5 ${textTitleStyle}`}>
                  <span>Guia Visual: Primeiro ➜ Depois</span>
                  <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 rounded uppercase ml-auto">Fase I e II</span>
                </h3>
                <p className="text-[11px] text-gray-500 leading-normal mb-4 font-semibold">
                  Ajuda a gerenciar meltdowns e resistências estruturando a compensação comportamental em causantes simples:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  {/* Primeiro Block */}
                  <div className={`p-5 rounded-3xl border-2 border-dashed border-indigo-200 flex flex-col justify-between items-center text-center ${cardStyle}`}>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 mb-2">1. PRIMEIRO FAZ:</span>
                    <input 
                      type="text" 
                      value={firstText} 
                      onChange={(e) => setFirstText(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs font-black p-2.5 border border-slate-350 rounded-xl text-center shadow-inner"
                      placeholder="Atividade..."
                    />
                    <button
                      onClick={() => onSpeak(`Primeiro você faz: ${firstText}`)}
                      className="mt-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-950 text-[10px] font-black py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Falar Regra
                    </button>
                  </div>

                  {/* Depois Block */}
                  <div className={`p-5 rounded-3xl border-2 border-indigo-400 flex flex-col justify-between items-center text-center bg-indigo-50/25 ${cardStyle}`}>
                    <span className="text-[10px] uppercase font-black tracking-wider text-indigo-650 mb-2">2. DEPOIS GANHA:</span>
                    <input 
                      type="text" 
                      value={thenText} 
                      onChange={(e) => setThenText(e.target.value)}
                      className="w-full bg-white text-indigo-950 text-xs font-black p-2.5 border border-indigo-305 rounded-xl text-center shadow-inner"
                      placeholder="Reforçador..."
                    />
                    <button
                      onClick={() => onSpeak(`Depois você ganha: ${thenText}`)}
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Falar Regra
                    </button>
                  </div>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="mt-5 border-t pt-4">
                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Carregar Combinação Clínica Comum:</span>
                <div className="grid grid-cols-2 gap-2">
                  {firstThenPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        playTactile();
                        setFirstText(preset.first);
                        setThenText(preset.then);
                        onSpeak(`Atualizado: primeiro ${preset.first}, depois ${preset.then}`);
                      }}
                      className="text-left bg-white hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-[10px] font-bold leading-tight shadow-sm transition-colors text-slate-800"
                    >
                      <p className="text-gray-400 font-extrabold uppercase text-[8px]">Modelo {idx+1}:</p>
                      <p className="truncate"><strong className="text-indigo-900">1º:</strong> {preset.first}</p>
                      <p className="truncate"><strong className="text-emerald-700">2º:</strong> {preset.then}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MINI-CRONOGRAMA (VISUAL ROUTINE SCHEDULE) */}
          {activeTab === 'schedule' && (
            <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
              <div>
                <h3 className={`text-sm font-black border-b pb-1.5 mb-3 flex items-center gap-1.5 ${textTitleStyle}`}>
                  <span>Mini-Cronograma Sequencial</span>
                  <span className="text-[9px] bg-indigo-150 text-indigo-950 font-extrabold px-1.5 py-0.5 rounded uppercase ml-auto">Rotina Linear</span>
                </h3>
                <p className="text-[11px] text-gray-500 leading-normal mb-3 font-semibold">
                  Promove sequenciamento visual e sentimento de conclusão. Toque nas caixas de seleção à medida que cumprir os passos:
                </p>

                {/* Main routine stack */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {scheduleItems.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => toggleScheduleItem(item.id)}
                      className={`p-3 border rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                        item.completed 
                        ? 'bg-emerald-55 border-emerald-300 opacity-60 line-through' 
                        : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl select-none">{item.emoji}</span>
                        <div>
                          <p className="text-[9px] text-gray-400 font-extrabold uppercase">Passo {index + 1}</p>
                          <p className={`text-xs font-black ${item.completed ? 'text-gray-500' : 'text-slate-900'}`}>{item.label}</p>
                        </div>
                      </div>

                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        item.completed 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-slate-300'
                      }`}>
                        {item.completed && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Racks load presets */}
              <div className="border-t pt-4">
                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Preservar Autonomia Diária - Carregar Rotina:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadSchedulePreset('hygiene')}
                    className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 py-1.5 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-colors"
                  >
                    🚽 Higiene Banheiro
                  </button>
                  <button
                    onClick={() => loadSchedulePreset('therapy')}
                    className="flex-1 bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 py-1.5 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-colors"
                  >
                    🌀 Atividades Terapia
                  </button>
                  <button
                    onClick={() => loadSchedulePreset('school')}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 py-1.5 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-colors"
                  >
                    🎒 Entrada Escolar
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: VISUAL TIMER / RELÓGIO DE TRANSIÇÃO */}
          {activeTab === 'timer' && (
            <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
              <div>
                <h3 className={`text-sm font-black border-b pb-1.5 mb-3 flex items-center gap-1.5 ${textTitleStyle}`}>
                  <span>Temporizador Visual de Descompressão</span>
                  <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded uppercase ml-auto">Gerenciador Temporal</span>
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                  {/* Circular visual timer representation */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    {/* Ring background */}
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-slate-100"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-indigo-600 transition-all duration-1000"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - timerPct / 100)}
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="z-10 text-center">
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase leading-none">Falta</p>
                      <p className="text-3xl font-black text-indigo-950 mt-1 leading-none font-mono">
                        {formatTimerTime(timerSecondsLeft)}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons and presets */}
                  <div className="flex-1 space-y-3.5 w-full">
                    <div className="flex gap-2">
                      <button
                        onClick={toggleTimer}
                        className={`flex-1 text-xs font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer ${
                          timerActive 
                          ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                          : 'bg-indigo-650 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {timerActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        <span>{timerActive ? 'Pausar Relógio' : 'Iniciar Relógio'}</span>
                      </button>

                      <button
                        onClick={resetTimer}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2.5 rounded-xl text-xs font-semibold shadow transition-colors flex items-center justify-center cursor-pointer"
                        title="Reiniciar"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Definir Tempo de Transição:</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => selectTimerPreset(1)}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-950 border border-slate-300 py-1 px-1.5 rounded-lg text-xs font-bold text-slate-800 transition-colors"
                        >
                          1 minuto
                        </button>
                        <button
                          onClick={() => selectTimerPreset(2)}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-950 border border-slate-300 py-1 px-1.5 rounded-lg text-xs font-bold text-slate-800 transition-colors"
                        >
                          2 min
                        </button>
                        <button
                          onClick={() => selectTimerPreset(5)}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-950 border border-slate-300 py-1 px-1.5 rounded-lg text-xs font-bold text-slate-800 transition-colors"
                        >
                          5 min
                        </button>
                        <button
                          onClick={() => selectTimerPreset(10)}
                          className="bg-white hover:bg-indigo-50 hover:text-indigo-950 border border-slate-300 py-1 px-1.5 rounded-lg text-xs font-bold text-slate-800 transition-colors"
                        >
                          10 min
                        </button>
                      </div>
                    </div>

                    {timerActive && (
                      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-250 rounded-xl text-[10px] font-semibold animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Contagem ativa de regulação no tablet...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[10px] text-indigo-900 leading-normal flex items-start gap-2 mt-2">
                <Volume2 className="w-4 h-4 text-indigo-705 shrink-0" />
                <p className="font-semibold">
                  <strong>Padrão de Fono:</strong> Quando a contagem se encerra, um sinal sônico fonoaudiológico é sintetizado via hertz duplo, instruindo o autista de maneira segura de que o tempo de lazer ou tarefa se esgotou, minimizando desconfortos.
                </p>
              </div>

            </div>
          )}

          {/* TAB 4: SOCIAL DIALOG SCRIPT (ROTEIROS SOCIAIS DE CONVERSA) */}
          {activeTab === 'script' && (
            <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
              <div>
                <h3 className={`text-sm font-black border-b pb-1.5 mb-3 flex items-center gap-1.5 ${textTitleStyle}`}>
                  <span>Roteiro Social Integrado</span>
                  <span className="text-[9px] bg-pink-100 text-pink-900 border border-pink-300 font-extrabold px-1.5 rounded uppercase ml-auto">Narrativas</span>
                </h3>
                <p className="text-[11px] text-gray-500 leading-normal mb-4 font-semibold">
                  Ensina diálogos adequados, ajudando o paciente em momentos sociais típicos ou descompressão extrema. Tente falar as sentenças estruturadas:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
                  {socialScripts.map((script, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        playTactile();
                        onSpeak(script.text);
                      }}
                      className="p-3.5 bg-white hover:bg-indigo-50/20 border border-slate-200 hover:border-indigo-400 rounded-2xl text-left flex items-start gap-3 shadow-sm transition-all focus:outline-none cursor-pointer group"
                    >
                      <span className="text-3xl shrink-0 border border-slate-100 rounded-xl p-1 bg-slate-50 select-none">{script.emoji}</span>
                      <div className="min-w-0">
                        <span className="block text-xs font-black text-indigo-950 group-hover:text-indigo-700 transition-colors leading-tight">{script.label}</span>
                        <span className="block text-[10px] text-slate-500 font-semibold leading-relaxed mt-0.5 whitespace-pre-wrap">"{script.text}"</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-2xl text-[10px] text-gray-500 leading-normal font-semibold">
                <strong>Orientações Fono:</strong> Os Roteiros (Scripts) treinam a repetição vocal, ajudam na comunicação proativa em ambientes estressantes e garantem autonomia social.
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
