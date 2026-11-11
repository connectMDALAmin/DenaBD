import React from 'react';

interface XPBootScreenProps {
  statusText?: string;
}

export const XPBootScreen: React.FC<XPBootScreenProps> = ({
  statusText = 'Starting DenaPawna Digital Ledger...',
}) => {
  return (
    <div className="fixed inset-0 z-[999999] bg-[#000000] text-white flex flex-col justify-between items-center select-none overflow-hidden font-sans">
      {/* Top spacer */}
      <div className="h-12 sm:h-20" />

      {/* Main Center Windows XP Boot Logo & Slider */}
      <div className="flex flex-col items-center max-w-sm px-4">
        {/* Microsoft text */}
        <div className="text-[11px] sm:text-[12px] font-sans font-medium text-[#A6A6A6] tracking-[0.25em] uppercase mb-1.5 self-start pl-6 sm:pl-8">
          Microsoft
        </div>

        {/* Windows XP Logo Lockup */}
        <div className="flex items-center gap-3 sm:gap-4 mb-8">
          {/* Windows XP 4-color wavy flag */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
              {/* Red Pane (Top-Left) */}
              <path
                d="M6 10C10 7.5 16 8.5 21 11.5V23C16 20 10 19 6 21.5V10Z"
                fill="url(#redGrad)"
              />
              {/* Green Pane (Top-Right) */}
              <path
                d="M23 11.5C28 8.5 35 9 41 12V23.5C35 20.5 28 20 23 23V11.5Z"
                fill="url(#greenGrad)"
              />
              {/* Blue Pane (Bottom-Left) */}
              <path
                d="M6 24C10 21.5 16 22.5 21 25.5V37C16 34 10 33 6 35.5V24Z"
                fill="url(#blueGrad)"
              />
              {/* Yellow Pane (Bottom-Right) */}
              <path
                d="M23 25.5C28 22.5 35 23 41 26V37.5C35 34.5 28 34 23 37V25.5Z"
                fill="url(#yellowGrad)"
              />

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="redGrad" x1="6" y1="10" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF4D36" />
                  <stop offset="1" stopColor="#B31D08" />
                </linearGradient>
                <linearGradient id="greenGrad" x1="23" y1="9" x2="41" y2="23.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7CD321" />
                  <stop offset="1" stopColor="#3C850B" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="6" y1="22" x2="21" y2="37" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00A8FF" />
                  <stop offset="1" stopColor="#0052CC" />
                </linearGradient>
                <linearGradient id="yellowGrad" x1="23" y1="23" x2="41" y2="37.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFD000" />
                  <stop offset="1" stopColor="#D98A00" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Windows XP Typography */}
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-4xl font-serif text-white tracking-wide font-normal">
              Windows
            </span>
            <span className="text-xl sm:text-2xl font-sans font-bold italic text-[#F18800] ml-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              xp
            </span>
          </div>
        </div>

        {/* Iconic Windows XP 3-Block Loading Slider Track */}
        <div className="w-56 sm:w-64 h-[18px] bg-[#000000] border-2 border-[#555555] rounded-[3px] p-[2px] relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center">
          <div className="xp-boot-bar-blocks">
            <div className="w-3 h-[10px] bg-gradient-to-r from-[#1752D8] via-[#5EB3FF] to-[#1752D8] rounded-[1px] shadow-[0_0_6px_rgba(94,179,255,0.95)]" />
            <div className="w-3 h-[10px] bg-gradient-to-r from-[#1752D8] via-[#5EB3FF] to-[#1752D8] rounded-[1px] shadow-[0_0_6px_rgba(94,179,255,0.95)]" />
            <div className="w-3 h-[10px] bg-gradient-to-r from-[#1752D8] via-[#5EB3FF] to-[#1752D8] rounded-[1px] shadow-[0_0_6px_rgba(94,179,255,0.95)]" />
          </div>
        </div>

        {/* Subtle Status Text */}
        <div className="mt-4 text-[11px] text-[#888888] font-mono tracking-wide text-center">
          {statusText}
        </div>
      </div>

      {/* Bottom Footer Credits */}
      <div className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#555555] border-t border-[#111111] max-w-4xl">
        <span>DenaPawna Digital Ledger • Cloud Edition</span>
        <span>Copyright © Microsoft Corporation / DenaBD</span>
      </div>
    </div>
  );
};
