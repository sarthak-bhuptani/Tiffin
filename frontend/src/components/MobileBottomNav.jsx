import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, BookOpen, Users, Wallet, BarChart3 } from 'lucide-react';

const MobileBottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/tiffins/quick', label: t('quickEntry'), icon: BookOpen },
    { to: '/customers', label: t('customers'), icon: Users },
    { to: '/accounts', label: t('payments'), icon: Wallet },
    { to: '/reports', label: t('reports'), icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-orange-100 px-2 py-1.5 shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-xl transition ${
                  isActive ? 'text-orange-600 bg-orange-50 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight text-center truncate w-full">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
