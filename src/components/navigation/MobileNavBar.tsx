import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { LayoutDashboard, Users, BookOpen, Clock, Menu } from 'lucide-react';

interface MobileNavBarProps {
  onOpenMenu: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ onOpenMenu }) => {
  const { activeTab, setActiveTab } = useApp();
  const { t } = useI18n();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('navDashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'ledger', label: t('navLedger'), icon: <BookOpen size={18} /> },
    { id: 'contacts', label: t('navContacts'), icon: <Users size={18} /> },
    { id: 'reminders', label: t('navReminders'), icon: <Clock size={18} /> },
  ];

  return (
    <nav className="sm:hidden fixed bottom-[32px] left-0 right-0 h-14 bg-[#ECE9D8] border-t-2 border-white shadow-[0_-2px_6px_rgba(0,0,0,0.15)] flex items-center justify-around z-40 px-1">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-[4px] cursor-pointer transition ${
              isActive
                ? 'text-[#0055EA] font-bold bg-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 truncate max-w-[64px]">{item.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center flex-1 py-1 text-gray-700 hover:text-black cursor-pointer"
      >
        <Menu size={18} />
        <span className="text-[10px] mt-0.5">মেনু</span>
      </button>
    </nav>
  );
};
