import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { printTestReceipt } from '../../services/receiptPrint';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

interface SidebarProps {
  filteredNavItems: NavItem[];
  handleNavClick: (item: NavItem, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ filteredNavItems, handleNavClick }) => {
  const location = useLocation();

  const handleTestPrint = () => {
    // Call the service for test print
    printTestReceipt({ store_name: 'Booth Daily Test', address: 'Testing Address', phone: '0000' });
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-[#1A1816] border-r border-stone-200/80 dark:border-stone-800/80 shrink-0 h-full overflow-hidden">
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="px-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">NAVIGASI POS</span>
        </div>
        <nav className="space-y-1">
          {filteredNavItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={e => handleNavClick(item, e)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#3B2A1F] text-[#F7F5F2] shadow-md'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A373]' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Fixed Footer Area - Test Printer & App Info */}
      <div className="p-4 border-t border-stone-200/80 dark:border-stone-800/80 space-y-3 bg-stone-50/50 dark:bg-[#1A1816]">
        <button
          onClick={handleTestPrint}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-[#25221F] hover:bg-stone-200 dark:hover:bg-[#2F2B27] text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Test Printer</span>
        </button>

        <div className="p-3 bg-stone-50 dark:bg-[#23201D] rounded-xl border border-stone-200 dark:border-stone-800 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#C68B59]">BOOTH DAILY V3.0</p>
          <p className="text-[9px] text-stone-400">Tablet Friendly POS System</p>
        </div>
      </div>
    </aside>
  );
};
