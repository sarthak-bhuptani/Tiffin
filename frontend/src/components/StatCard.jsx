import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'orange', onClick }) => {
  const colorStyles = {
    orange: 'bg-orange-50 border-orange-200 text-orange-700 icon-bg-orange-500',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 icon-bg-emerald-500',
    rose: 'bg-rose-50 border-rose-200 text-rose-700 icon-bg-rose-500',
    amber: 'bg-amber-50 border-amber-200 text-amber-700 icon-bg-amber-500',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 icon-bg-blue-500',
  };

  const currentStyle = colorStyles[color] || colorStyles.orange;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border ${currentStyle} transition shadow-sm ${
        onClick ? 'cursor-pointer active:scale-98 hover:shadow' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-xs`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500 font-medium">{subtext}</p>}
    </div>
  );
};

export default StatCard;
