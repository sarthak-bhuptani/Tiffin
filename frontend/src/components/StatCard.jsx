import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'emerald', onClick }) => {
  const colorStyles = {
    emerald: 'bg-emerald-50/90 border-emerald-200/90 text-emerald-800',
    amber: 'bg-amber-50/90 border-amber-200/90 text-amber-900',
    rose: 'bg-rose-50/90 border-rose-200/90 text-rose-800',
    blue: 'bg-indigo-50/90 border-indigo-200/90 text-indigo-900',
    orange: 'bg-orange-50/90 border-orange-200/90 text-orange-900',
  };

  const currentStyle = colorStyles[color] || colorStyles.emerald;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-3xl border ${currentStyle} transition-all duration-200 shadow-xs ${
        onClick ? 'cursor-pointer active:scale-98 hover:shadow-md hover:border-emerald-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center shadow-xs">
            <Icon className="w-4 h-4 text-emerald-600" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
      </div>
      {subtext && <p className="mt-1 text-[11px] text-slate-600 font-bold truncate">{subtext}</p>}
    </div>
  );
};

export default StatCard;
