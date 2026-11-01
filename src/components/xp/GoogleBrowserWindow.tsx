import React, { useState } from 'react';
import { XPTitleBar } from './XPTitleBar';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Globe, X, ExternalLink } from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

interface GoogleBrowserWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleBrowserWindow: React.FC<GoogleBrowserWindowProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com/search?igu=1');
  const [inputUrl, setInputUrl] = useState('https://www.google.com/search?igu=1');
  const [isMaximized, setIsMaximized] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundService.playClick();
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = `https://www.google.com/search?igu=1&q=${encodeURIComponent(url)}`;
      }
    }
    setCurrentUrl(url);
    setInputUrl(url);
    setIframeKey((k) => k + 1);
  };

  const handleRefresh = () => {
    soundService.playClick();
    setIframeKey((k) => k + 1);
  };

  const handleHome = () => {
    soundService.playClick();
    const home = 'https://www.google.com/search?igu=1';
    setInputUrl(home);
    setCurrentUrl(home);
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/40 backdrop-blur-2xs">
      <div
        className={`flex flex-col bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[8px] xp-window-shadow overflow-hidden transition-all duration-150 ${
          isMaximized
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-4xl h-[80vh] min-h-[480px]'
        }`}
      >
        {/* Title Bar */}
        <XPTitleBar
          title="Internet Explorer — Google Search"
          iconName="browser"
          onClose={() => {
            soundService.playClick();
            onClose();
          }}
          onMaximize={() => setIsMaximized((prev) => !prev)}
          onMinimize={() => onClose()}
          onToggleFullscreen={() => {
            soundService.playClick();
            setIsMaximized(true);
            try {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            } catch (_) {}
          }}
          isMaximized={isMaximized}
        />

        {/* Browser Toolbar */}
        <div className="bg-[#ECE9D8] border-b border-[#D0CCB8] p-1.5 flex flex-col gap-1.5 select-none text-xs">
          {/* Navigation Buttons Row */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleHome}
              title="Home (Google Search)"
              className="px-2 py-1 hover:bg-white/60 active:bg-black/10 rounded flex items-center gap-1 text-gray-800 cursor-pointer border border-transparent hover:border-[#7F9DB9]"
            >
              <Home size={14} className="text-[#0055EA]" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh page"
              className="px-2 py-1 hover:bg-white/60 active:bg-black/10 rounded flex items-center gap-1 text-gray-800 cursor-pointer border border-transparent hover:border-[#7F9DB9]"
            >
              <RotateCw size={14} className="text-green-700" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <a
              href="https://www.google.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Google in new browser tab"
              className="ml-auto px-2 py-1 text-blue-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Open in New Tab</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* URL Address Bar */}
          <form onSubmit={handleNavigate} className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gray-700 shrink-0">Address:</span>
            <div className="relative flex-1">
              <Globe size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://www.google.com/search?igu=1 or search term"
                className="w-full pl-7 pr-3 py-1 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs font-mono outline-none focus:border-[#0055EA]"
              />
            </div>
            <button
              type="submit"
              className="xp-button px-3 py-1 text-xs font-semibold text-gray-900 cursor-pointer flex items-center gap-1"
            >
              <Search size={12} />
              <span>Go</span>
            </button>
          </form>
        </div>

        {/* Browser Iframe Body */}
        <div className="flex-1 w-full bg-white relative overflow-hidden">
          <iframe
            key={iframeKey}
            src={currentUrl}
            title="Google Search"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="w-full h-full border-0"
          />
        </div>

        {/* Status Bar */}
        <div className="h-6 px-3 bg-[#ECE9D8] border-t border-[#D0CCB8] flex items-center justify-between text-[11px] text-[#444444] select-none shrink-0">
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-blue-700" />
            <span className="truncate max-w-[280px] sm:max-w-md">{currentUrl}</span>
          </div>
          <span className="font-mono text-[10px] text-gray-500">
            Internet Explorer | Protected Mode: Active
          </span>
        </div>
      </div>
    </div>
  );
};
