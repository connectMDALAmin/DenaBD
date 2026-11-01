import React from 'react';
import { XPIcon } from './XPIcon';

interface XPTitleBarProps {
  title: string;
  iconName?: React.ComponentProps<typeof XPIcon>['name'];
  theme?: 'luna-blue' | 'luna-silver' | 'luna-olive';
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onToggleFullscreen?: () => void;
  isMaximized?: boolean;
  isFullscreen?: boolean;
}

export const XPTitleBar: React.FC<XPTitleBarProps> = ({
  title,
  iconName = 'ledger',
  theme = 'luna-blue',
  onMinimize,
  onMaximize,
  onClose,
  onToggleFullscreen,
  isMaximized = true,
  isFullscreen = false,
}) => {
  const getThemeClass = () => {
    switch (theme) {
      case 'luna-silver':
        return 'xp-titlebar-silver';
      case 'luna-olive':
        return 'xp-titlebar-olive';
      default:
        return 'xp-titlebar-blue text-white';
    }
  };

  return (
    <div
      className={`h-[30px] px-2.5 flex items-center justify-between select-none rounded-t-[7px] font-bold text-[13px] tracking-wide ${getThemeClass()}`}
    >
      {/* Title & Icon */}
      <div className="flex items-center gap-2 overflow-hidden mr-2">
        <XPIcon name={iconName} size={17} className="shrink-0" />
        <span className="truncate">{title}</span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="xp-win-btn xp-win-minmax leading-none hover:cursor-pointer flex items-center justify-center font-bold text-[11px]"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            aria-label="Full Screen"
          >
            {isFullscreen ? '⤦' : '⛶'}
          </button>
        )}
        {onMinimize && (
          <button
            type="button"
            onClick={onMinimize}
            className="xp-win-btn xp-win-minmax leading-none hover:cursor-pointer"
            title="Minimize"
            aria-label="Minimize"
          >
            _
          </button>
        )}
        {onMaximize && (
          <button
            type="button"
            onClick={onMaximize}
            className="xp-win-btn xp-win-minmax leading-none hover:cursor-pointer"
            title={isMaximized ? 'Restore' : 'Maximize'}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? '❐' : '□'}
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="xp-win-btn xp-win-close leading-none hover:cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
