import React from 'react';
import { XPIcon } from './XPIcon';

interface XPDesktopIconProps {
  name: React.ComponentProps<typeof XPIcon>['name'];
  label: string;
  sublabel?: string;
  onClick: () => void;
  isActive?: boolean;
}

export const XPDesktopIcon: React.FC<XPDesktopIconProps> = ({
  name,
  label,
  sublabel,
  onClick,
  isActive = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-[3px] w-[74px] sm:w-[82px] text-center cursor-pointer transition select-none ${
        isActive
          ? 'bg-[#0B61FF]/40 border border-[#0B61FF]/60'
          : 'hover:bg-white/20 border border-transparent'
      }`}
    >
      <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center filter drop-shadow-md group-hover:scale-105 transition-transform">
        <XPIcon name={name} size={30} />
      </div>
      <span className="text-[10px] sm:text-[11px] font-semibold text-white mt-0.5 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)] leading-tight tracking-wide px-0.5 rounded line-clamp-2">
        {label}
      </span>
      {sublabel && (
        <span className="text-[8.5px] text-blue-100 opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-none mt-0.5">
          {sublabel}
        </span>
      )}
    </button>
  );
};
