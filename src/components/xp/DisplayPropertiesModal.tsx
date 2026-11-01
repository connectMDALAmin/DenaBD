import React, { useState } from 'react';
import { XPTitleBar } from './XPTitleBar';
import { Monitor, Image as ImageIcon, Check } from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

export type WallpaperPreset = 'bliss' | 'royale' | 'silver' | 'olive' | 'midnight' | 'custom';

export interface WallpaperConfig {
  preset: WallpaperPreset;
  customUrl?: string;
  customColor?: string;
}

interface DisplayPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: WallpaperConfig;
  onApplyConfig: (config: WallpaperConfig) => void;
}

const PRESETS: Array<{ id: WallpaperPreset; nameBn: string; nameEn: string; previewClass: string }> = [
  {
    id: 'bliss',
    nameBn: 'উইন্ডোজ এক্সপি ব্লিস (Windows XP Bliss)',
    nameEn: 'Windows XP Bliss (Classic Hill)',
    previewClass: 'bg-gradient-to-b from-[#1C72D8] via-[#489FFB] to-[#3B9229]',
  },
  {
    id: 'royale',
    nameBn: 'রয়েল এনার্জি ব্লু (Royale Energy Blue)',
    nameEn: 'Royale Energy Blue',
    previewClass: 'bg-gradient-to-br from-[#0B2E76] via-[#1E57CD] to-[#0A1C44]',
  },
  {
    id: 'silver',
    nameBn: 'মেটালিক সিলভার (Metallic Silver)',
    nameEn: 'Windows XP Silver Slate',
    previewClass: 'bg-gradient-to-br from-[#4B5563] via-[#9CA3AF] to-[#374151]',
  },
  {
    id: 'olive',
    nameBn: 'হোমস্টেড অলিভ গ্রিন (Homestead Olive)',
    nameEn: 'Homestead Olive Green',
    previewClass: 'bg-gradient-to-br from-[#2D4A1D] via-[#608038] to-[#1E3612]',
  },
  {
    id: 'midnight',
    nameBn: 'মিডনাইট ডিপ স্পেস (Midnight Deep Navy)',
    nameEn: 'Windows XP Midnight Navy',
    previewClass: 'bg-gradient-to-b from-[#030B1E] via-[#0B1D45] to-[#020611]',
  },
];

export const DisplayPropertiesModal: React.FC<DisplayPropertiesModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApplyConfig,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<WallpaperPreset>(currentConfig.preset);
  const [customUrl, setCustomUrl] = useState<string>(currentConfig.customUrl || '');
  const [customColor, setCustomColor] = useState<string>(currentConfig.customColor || '#1A365D');
  const [activeTab, setActiveTab] = useState<'desktop' | 'themes'>('desktop');

  if (!isOpen) return null;

  const handleApply = () => {
    soundService.playClick();
    onApplyConfig({
      preset: selectedPreset,
      customUrl: customUrl.trim() || undefined,
      customColor: customColor || undefined,
    });
  };

  const handleOk = () => {
    handleApply();
    onClose();
  };

  const renderPreviewBackground = () => {
    if (selectedPreset === 'custom') {
      if (customUrl) {
        return (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${customUrl})` }}
          />
        );
      }
      return <div className="w-full h-full" style={{ backgroundColor: customColor }} />;
    }

    if (selectedPreset === 'bliss') {
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-[#1C72D8] via-[#489FFB] to-[#3B9229] overflow-hidden">
          <div className="absolute top-2 left-4 w-20 h-6 bg-white/30 rounded-full blur-xs" />
          <div className="absolute top-4 right-6 w-16 h-5 bg-white/20 rounded-full blur-xs" />
          <div className="absolute -bottom-4 -left-4 right-0 h-16 bg-gradient-to-t from-[#2E7D32] via-[#43A047] to-[#66BB6A]/80 rounded-[50%_50%_0_0] transform -rotate-1" />
        </div>
      );
    }

    const presetObj = PRESETS.find((p) => p.id === selectedPreset);
    return <div className={`w-full h-full ${presetObj?.previewClass || ''}`} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[8px] xp-window-shadow overflow-hidden flex flex-col font-sans select-none animate-in fade-in zoom-in-95 duration-100">
        {/* Title Bar */}
        <XPTitleBar
          title="Display Properties — Wallpaper Settings"
          iconName="settings"
          onClose={() => {
            soundService.playClick();
            onClose();
          }}
        />

        {/* Tab Headers */}
        <div className="flex items-center px-2 pt-1.5 bg-[#ECE9D8] border-b border-[#7F9DB9] gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`px-3 py-1 rounded-t-[3px] font-semibold border-t border-x cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-white border-[#7F9DB9] -mb-[1px] pb-1.5 text-gray-900 shadow-2xs'
                : 'bg-[#ECE9D8] border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Desktop (ওয়ালপেপার)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`px-3 py-1 rounded-t-[3px] font-semibold border-t border-x cursor-pointer ${
              activeTab === 'themes'
                ? 'bg-white border-[#7F9DB9] -mb-[1px] pb-1.5 text-gray-900 shadow-2xs'
                : 'bg-[#ECE9D8] border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Themes & Colors
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-3 bg-white flex-1 space-y-3 text-xs">
          {/* Monitor Frame Simulation */}
          <div className="flex flex-col items-center">
            {/* CRT Monitor Casing */}
            <div className="w-48 h-32 bg-[#E1DECE] border-2 border-[#707070] rounded-[6px] p-2 flex flex-col items-center shadow-md xp-bevel-outset">
              {/* Screen Inset Bevel */}
              <div className="w-full h-24 bg-black border border-[#404040] rounded-[2px] overflow-hidden xp-bevel-inset">
                {renderPreviewBackground()}
              </div>
              {/* Power Button & LED */}
              <div className="w-full flex items-center justify-between px-2 pt-1">
                <span className="text-[8px] font-mono text-gray-500 font-bold">XP CRT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
              </div>
            </div>
            {/* Monitor Stand Base */}
            <div className="w-16 h-2 bg-[#D1CEBE] border-x border-b border-[#707070] rounded-b-xs shadow-2xs" />
          </div>

          {/* Preset Selector */}
          <div>
            <label className="block text-gray-800 font-bold mb-1">
              Background Wallpaper (ব্যাকগ্রাউন্ড নির্বাচন করুন):
            </label>
            <div className="h-32 overflow-y-auto border border-[#7F9DB9] bg-white rounded-xs p-1 space-y-0.5 xp-bevel-inset">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setSelectedPreset(preset.id);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-xs flex items-center justify-between cursor-pointer text-xs ${
                    selectedPreset === preset.id
                      ? 'bg-[#316AC5] text-white font-semibold'
                      : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-xs border border-gray-400 shrink-0 ${preset.previewClass}`} />
                    <span className="truncate">{preset.nameBn}</span>
                  </div>
                  {selectedPreset === preset.id && <Check size={13} className="shrink-0" />}
                </button>
              ))}

              {/* Custom Image / Color Option */}
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setSelectedPreset('custom');
                }}
                className={`w-full text-left px-2 py-1 rounded-xs flex items-center justify-between cursor-pointer text-xs ${
                  selectedPreset === 'custom'
                    ? 'bg-[#316AC5] text-white font-semibold'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="shrink-0 text-amber-500" />
                  <span>কাস্টম ছবি / রঙ (Custom URL or Color)</span>
                </div>
                {selectedPreset === 'custom' && <Check size={13} className="shrink-0" />}
              </button>
            </div>
          </div>

          {/* Custom URL or Color Inputs */}
          {selectedPreset === 'custom' && (
            <div className="p-2 bg-gray-50 border border-gray-200 rounded-xs space-y-2 animate-in fade-in duration-100">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                  Image URL (ছবির লিঙ্ক):
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/wallpaper.jpg"
                  className="w-full px-2 py-1 bg-white border border-[#7F9DB9] text-xs font-mono outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-gray-700">
                  Solid Color (এক কালার):
                </label>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-8 h-6 p-0 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-[10px] font-mono text-gray-500">{customColor}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-[#ECE9D8] px-3 py-2 border-t border-[#D0CCB8] flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={handleOk}
            className="xp-button-primary px-4 py-1 font-semibold cursor-pointer"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="xp-button px-4 py-1 text-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="xp-button px-4 py-1 text-gray-800 cursor-pointer font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
