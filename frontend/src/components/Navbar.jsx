import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Utensils, Globe, Calendar } from 'lucide-react';

const Navbar = () => {
  const { lang, toggleLang, t } = useLanguage();

  const isGu = lang === 'gu';

  const todayDisplayStr = new Date().toLocaleDateString(isGu ? 'gu-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100/90 shadow-xs px-4 py-3 notranslate" translate="no">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo & App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-base text-slate-900 leading-tight">
                {t('businessName') || "Mom's Special Tiffin Service"}
              </h1>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="Live Online"></span>
            </div>
            <p className="text-[11px] text-orange-700 font-semibold flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-orange-600 inline shrink-0" />
              <span>{todayDisplayStr}</span>
            </p>
          </div>
        </div>

        {/* Language Switcher Pill */}
        <button
          type="button"
          onClick={toggleLang}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-800 font-extrabold text-xs border border-orange-200/80 transition active:scale-95 shadow-xs"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-orange-600" />
          <span>{isGu ? '🇬🇧 English' : '🇮🇳 ગુજરાતી'}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
