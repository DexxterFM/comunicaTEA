import React, { useState, useRef } from 'react';
import { Camera, RefreshCcw, Sparkles, User, Palette, Check, X } from 'lucide-react';
import { AvatarConfig } from '../types';
import { PictogramSVG } from './PictogramSVG';

interface AvatarCreatorProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onCancel: () => void;
  aiCredits?: number;
}

export const AvatarCreator: React.FC<AvatarCreatorProps> = ({ 
  initialConfig, 
  onSave, 
  onCancel,
  aiCredits = 200
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || {
    skinColor: '#ffdfd0',
    hairColor: '#5c3a21',
    hairStyle: 'short',
    eyeColor: '#111827',
    clothingColor: '#3b82f6',
    accessory: 'none'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const skinColors = ['#ffdfd0', '#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#3d1c02'];
  const hairColors = ['#5c3a21', '#241c11', '#b55239', '#e9b844', '#d6d6d6', '#000000'];
  const eyeColors = ['#111827', '#3b82f6', '#10b981', '#5c3a21', '#6b7280'];
  const clothingColors = ['#3b82f6', '#ec4899', '#10b981', '#ef4444', '#eab308', '#6366f1', '#111827'];
  const hairStyles: AvatarConfig['hairStyle'][] = ['short', 'long', 'spiky', 'curly', 'bald', 'bob'];
  const accessories: AvatarConfig['accessory'][] = ['none', 'glasses', 'hearing-aid', 'headband'];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    // Simulating AI cartunization processing
    setTimeout(() => {
      // In a real scenario, we would send this to an AI API
      // For now, we randomize some traits to show "recognition"
      const randomSkin = skinColors[Math.floor(Math.random() * skinColors.length)];
      const randomHair = hairColors[Math.floor(Math.random() * hairColors.length)];
      const randomStyle = hairStyles[Math.floor(Math.random() * (hairStyles.length - 1))]; // avoid bald
      
      setConfig(prev => ({
        ...prev,
        skinColor: randomSkin,
        hairColor: randomHair,
        hairStyle: randomStyle
      }));
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row border border-gray-100 animate-fade-in">
      {/* Left Side: Preview */}
      <div className="md:w-1/2 bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-slate-900">Prévia do Avatar</h3>
          <p className="text-xs text-gray-500 font-medium">Assim ele aparecerá nos pictogramas</p>
        </div>

        <div className="w-64 h-64 bg-white rounded-[40px] shadow-inner border-4 border-white overflow-hidden flex items-center justify-center p-4">
          <PictogramSVG 
            label="Avatar" 
            avatarConfig={config} 
            className="w-full h-full"
          />
        </div>

        <div className="mt-8 w-full max-w-xs">
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Créditos de IA</span>
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-indigo-900">{aiCredits}</span>
              <span className="text-xs text-indigo-600 font-bold mb-1">disponíveis</span>
            </div>
            <p className="text-[9px] text-indigo-400 mt-2 font-medium">Use a cartunização automática para criar o avatar perfeito em segundos.</p>
          </div>
        </div>
      </div>

      {/* Right Side: Controls */}
      <div className="md:w-1/2 p-8 flex flex-col h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900">Personalizar</h3>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            {isProcessing ? 'Processando...' : 'Cartunizar Foto'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="space-y-6">
          {/* Hair Style */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Estilo de Cabelo</label>
            <div className="grid grid-cols-3 gap-2">
              {hairStyles.map(style => (
                <button
                  key={style}
                  onClick={() => setConfig({ ...config, hairStyle: style })}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold border-2 transition-all ${config.hairStyle === style ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-100 text-slate-500 hover:border-gray-200'}`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Pele</label>
              <div className="flex flex-wrap gap-2">
                {skinColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, skinColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${config.skinColor === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Cabelo</label>
              <div className="flex flex-wrap gap-2">
                {hairColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, hairColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${config.hairColor === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Eye Color & Accessory */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Olhos</label>
              <div className="flex flex-wrap gap-2">
                {eyeColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, eyeColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${config.eyeColor === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Acessório</label>
              <div className="relative">
                <select
                  value={config.accessory}
                  onChange={(e) => setConfig({ ...config, accessory: e.target.value as any })}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  {accessories.map(acc => (
                    <option key={acc} value={acc}>{acc.charAt(0).toUpperCase() + acc.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Clothing Color */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Cor da Roupa</label>
            <div className="flex flex-wrap gap-2">
              {clothingColors.map(color => (
                <button
                  key={color}
                  onClick={() => setConfig({ ...config, clothingColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${config.clothingColor === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={() => onSave(config)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            Salvar Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
