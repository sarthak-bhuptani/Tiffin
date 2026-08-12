import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Utensils, Globe } from 'lucide-react';

const Navbar = () => {
  const { lang, toggleLang, t } = useLanguage();

  const todayDisplayStr = new Date().toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-orange-100 shadow-sm px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo & App Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">{t('appName')}</h1>
            <p className="text-xs text-orange-600 font-medium">{todayDisplayStr}</p>
          </div>
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLang}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium text-xs border border-orange-200/60 transition active:scale-95 shadow-xs"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'gu' ? 'English' : 'ગુજરાતી'}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
