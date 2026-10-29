import React, { createContext, useContext, useState } from 'react';
import { ActiveTab } from './AppContext';

export interface WindowInstance {
  id: ActiveTab;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface WindowContextType {
  windows: Record<ActiveTab, WindowInstance>;
  activeWindowId: ActiveTab;
  openWindow: (id: ActiveTab) => void;
  closeWindow: (id: ActiveTab) => void;
  minimizeWindow: (id: ActiveTab) => void;
  toggleMaximizeWindow: (id: ActiveTab) => void;
  focusWindow: (id: ActiveTab) => void;
  startMenuOpen: boolean;
  setStartMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const defaultWindows: Record<ActiveTab, WindowInstance> = {
  dashboard: { id: 'dashboard', title: 'Dashboard', isMinimized: false, isMaximized: true, zIndex: 10 },
  contacts: { id: 'contacts', title: 'Contacts Directory', isMinimized: false, isMaximized: false, zIndex: 1 },
  ledger: { id: 'ledger', title: 'Ledger Khata', isMinimized: false, isMaximized: false, zIndex: 1 },
  reminders: { id: 'reminders', title: 'Reminders & Due', isMinimized: false, isMaximized: false, zIndex: 1 },
  analytics: { id: 'analytics', title: 'Financial Analytics', isMinimized: false, isMaximized: false, zIndex: 1 },
  publicLookup: { id: 'publicLookup', title: 'Public Balance Lookup', isMinimized: false, isMaximized: false, zIndex: 1 },
  backup: { id: 'backup', title: 'Backup & Restore', isMinimized: false, isMaximized: false, zIndex: 1 },
  settings: { id: 'settings', title: 'Settings & Security', isMinimized: false, isMaximized: false, zIndex: 1 },
  androidGuide: { id: 'androidGuide', title: 'Android APK Guide', isMinimized: false, isMaximized: false, zIndex: 1 },
  admin: { id: 'admin', title: 'Security & Admin Control Panel', isMinimized: false, isMaximized: false, zIndex: 1 },
};

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<Record<ActiveTab, WindowInstance>>(defaultWindows);
  const [activeWindowId, setActiveWindowId] = useState<ActiveTab>('dashboard');
  const [topZ, setTopZ] = useState<number>(20);
  const [startMenuOpen, setStartMenuOpen] = useState<boolean>(false);

  const focusWindow = (id: ActiveTab) => {
    setTopZ((prev) => {
      const nextZ = prev + 1;
      setWindows((prevWindows) => ({
        ...prevWindows,
        [id]: {
          ...prevWindows[id],
          isMinimized: false,
          zIndex: nextZ,
        },
      }));
      return nextZ;
    });
    setActiveWindowId(id);
    setStartMenuOpen(false);
  };

  const openWindow = (id: ActiveTab) => {
    focusWindow(id);
  };

  const closeWindow = (id: ActiveTab) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true,
      },
    }));
  };

  const minimizeWindow = (id: ActiveTab) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true,
      },
    }));
  };

  const toggleMaximizeWindow = (id: ActiveTab) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMaximized: !prev[id].isMaximized,
      },
    }));
    focusWindow(id);
  };

  return (
    <WindowContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        toggleMaximizeWindow,
        focusWindow,
        startMenuOpen,
        setStartMenuOpen,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindow = (): WindowContextType => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
};
