import React from 'react';

interface XPIconProps {
  name:
    | 'ledger'
    | 'calculator'
    | 'contact'
    | 'reminders'
    | 'analytics'
    | 'lookup'
    | 'backup'
    | 'settings'
    | 'android'
    | 'user'
    | 'money'
    | 'folder'
    | 'shield'
    | 'print'
    | 'help'
    | 'sync';
  className?: string;
  size?: number;
}

export const XPIcon: React.FC<XPIconProps> = ({ name, className = '', size = 24 }) => {
  switch (name) {
    case 'ledger':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="5" y="4" width="22" height="24" rx="2" fill="#1E50A2" stroke="#0B2F64" strokeWidth="1.5" />
          <path d="M5 4C5 4 8 7 8 16C8 25 5 28 5 28" stroke="#D1E2FF" strokeWidth="2" strokeLinecap="round" />
          <rect x="11" y="9" width="13" height="3" rx="1" fill="#FFCC00" />
          <line x1="11" y1="16" x2="23" y2="16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="11" y1="21" x2="19" y2="21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="21" cy="22" r="4" fill="#00AA00" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M19.5 22L20.5 23L22.5 21" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'calculator':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="6" y="3" width="20" height="26" rx="3" fill="#D3D8E0" stroke="#687284" strokeWidth="1.5" />
          <rect x="9" y="6" width="14" height="6" rx="1" fill="#758866" stroke="#46543D" strokeWidth="1" />
          <text x="21" y="11" fontSize="5" fontFamily="monospace" fill="#1C2317" textAnchor="end">০.০০</text>
          <circle cx="11" cy="16" r="1.5" fill="#3D5A80" />
          <circle cx="16" cy="16" r="1.5" fill="#3D5A80" />
          <circle cx="21" cy="16" r="1.5" fill="#EE6C4D" />
          <circle cx="11" cy="21" r="1.5" fill="#3D5A80" />
          <circle cx="16" cy="21" r="1.5" fill="#3D5A80" />
          <circle cx="21" cy="21" r="1.5" fill="#3D5A80" />
          <circle cx="11" cy="25.5" r="1.5" fill="#3D5A80" />
          <circle cx="16" cy="25.5" r="1.5" fill="#3D5A80" />
          <rect x="19.5" y="24" width="3" height="3" rx="0.5" fill="#293241" />
        </svg>
      );

    case 'contact':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="6" y="4" width="20" height="24" rx="2" fill="#E6A15C" stroke="#A75D18" strokeWidth="1.5" />
          <circle cx="16" cy="12" r="4" fill="#FFE3B3" stroke="#874305" strokeWidth="1" />
          <path d="M10 23C10 19.5 13 18 16 18C19 18 22 19.5 22 23" fill="#FFE3B3" stroke="#874305" strokeWidth="1" />
          <line x1="6" y1="9" x2="4" y2="9" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="6" y1="15" x2="4" y2="15" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="6" y1="21" x2="4" y2="21" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'reminders':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="12" fill="#F4D35E" stroke="#DAA520" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="9" fill="#FFFBEA" />
          <line x1="16" y1="10" x2="16" y2="16" stroke="#D00000" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="16" x2="20" y2="18" stroke="#D00000" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 6L6 9" stroke="#7A6000" strokeWidth="2" strokeLinecap="round" />
          <path d="M23 6L26 9" stroke="#7A6000" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'analytics':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="4" y="5" width="24" height="22" rx="2" fill="#F7F9FC" stroke="#7F9DB9" strokeWidth="1.5" />
          <rect x="7" y="17" width="4" height="7" fill="#43A047" />
          <rect x="14" y="11" width="4" height="13" fill="#1E88E5" />
          <rect x="21" y="8" width="4" height="16" fill="#F4511E" />
          <path d="M7 16L15 10L23 7" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'lookup':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="14" cy="14" r="8" fill="#E1F5FE" stroke="#0288D1" strokeWidth="2" />
          <line x1="20" y1="20" x2="28" y2="28" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
          <circle cx="14" cy="14" r="4" fill="#B3E5FC" />
        </svg>
      );

    case 'backup':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="6" y="5" width="20" height="22" rx="2" fill="#5C6BC0" stroke="#283593" strokeWidth="1.5" />
          <rect x="10" y="5" width="12" height="9" fill="#FAFAFA" />
          <rect x="18" y="7" width="2.5" height="5" fill="#333" />
          <rect x="9" y="18" width="14" height="6" rx="1" fill="#ECEFF1" stroke="#90A4AE" strokeWidth="1" />
          <path d="M16 19V22M14 20.5L16 22L18 20.5" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'settings':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="10" fill="#B0BEC5" stroke="#455A64" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="4" fill="#ECEFF1" stroke="#37474F" strokeWidth="1" />
          <path d="M16 3V7M16 25V29M3 16H7M25 16H29M7 7L10 10M22 22L25 25M7 25L10 22M22 10L25 7" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'android':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="7" y="11" width="18" height="14" rx="2" fill="#3DDC84" />
          <path d="M7 10C7 6 11 3 16 3C21 3 25 6 25 10H7Z" fill="#3DDC84" />
          <circle cx="12" cy="7" r="1" fill="#FFFFFF" />
          <circle cx="20" cy="7" r="1" fill="#FFFFFF" />
          <line x1="10" y1="2" x2="12" y2="4" stroke="#3DDC84" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="2" x2="20" y2="4" stroke="#3DDC84" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="3" y="12" width="3" height="10" rx="1.5" fill="#3DDC84" />
          <rect x="26" y="12" width="3" height="10" rx="1.5" fill="#3DDC84" />
          <rect x="10" y="25" width="3" height="5" rx="1.5" fill="#3DDC84" />
          <rect x="19" y="25" width="3" height="5" rx="1.5" fill="#3DDC84" />
        </svg>
      );

    case 'shield':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <path d="M16 3L5 7V16C5 22.5 9.7 28.5 16 29C22.3 28.5 27 22.5 27 16V7L16 3Z" fill="#1E88E5" stroke="#0D47A1" strokeWidth="1.5" />
          <path d="M16 5V27C21 26 25 21 25 16V8.5L16 5Z" fill="#42A5F5" />
          <path d="M11 16L14.5 19.5L21.5 12.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'money':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="12" fill="#FFC107" stroke="#FF8F00" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="9.5" stroke="#FFE082" strokeWidth="1" strokeDasharray="2 2" />
          <text x="16" y="21" fontSize="13" fontWeight="bold" fontFamily="Hind Siliguri, sans-serif" fill="#5D4037" textAnchor="middle">৳</text>
        </svg>
      );

    case 'user':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="13" fill="#42A5F5" stroke="#1565C0" strokeWidth="1.5" />
          <circle cx="16" cy="12" r="5" fill="#FFFFFF" />
          <path d="M8 25C8 20.5 11.5 19 16 19C20.5 19 24 20.5 24 25" fill="#FFFFFF" />
        </svg>
      );

    case 'sync':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <path d="M6 16C6 10.5 10.5 6 16 6C20 6 23.5 8.5 25 12M25 6V12H19" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 16C26 21.5 21.5 26 16 26C12 26 8.5 23.5 7 20M7 26V20H13" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="6" y="5" width="20" height="22" rx="2" fill="#E0E0E0" stroke="#757575" strokeWidth="1.5" />
        </svg>
      );
  }
};
