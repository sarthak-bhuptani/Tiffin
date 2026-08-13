import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X, Trash2 } from 'lucide-react';

const CustomerCalendar = ({ tiffins = [], defaultPrice = 60, defaultQuantity = 1, onSaveDayEntry }) => {
  const { language } = useLanguage();
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  const monthNamesGu = [
    'જાન્યુઆરી',
    'ફેબ્રુઆરી',
    'માર્ચ',
    'એપ્રિલ',
    'મે',
    'જૂન',
    'જુલાઈ',
    'ઑગસ્ટ',
    'સપ્ટેમ્બર',
    'ઑક્ટોબર',
    'નવેમ્બર',
    'ડિસેમ્બર',
  ];

  const monthNamesEn = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthNames = language === 'gu' ? monthNamesGu : monthNamesEn;

  const weekDays =
    language === 'gu'
      ? ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate Months
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
    setSelectedDayDetail(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
    setSelectedDayDetail(null);
  };

  // Calendar Math
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  // Create dictionary of tiffins by YYYY-MM-DD
  const tiffinsMap = {};
  tiffins.forEach((t) => {
    if (t.date) {
      tiffinsMap[t.date] = t;
    }
  });

  const handleQuickStatusChange = async (dateStr, status) => {
    if (onSaveDayEntry) {
      await onSaveDayEntry(dateStr, status, defaultQuantity, defaultPrice);
      setSelectedDayDetail(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-orange-100 shadow-xs space-y-4 notranslate" translate="no">
      {/* Calendar Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
              {monthNames[selectedMonth]} {selectedYear}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">કોઈપણ તારીખ પર ક્લિક કરીને એન્ટ્રી બદલો</p>
          </div>
        </div>

        {/* Month Switcher Buttons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-2">
        {weekDays.map((day, idx) => (
          <span
            key={idx}
            className={`text-xs font-extrabold ${idx === 0 ? 'text-rose-500' : 'text-slate-600'}`}
          >
            {day}
          </span>
        ))}
      </div>

      {/* 31-Day Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Blank Padding Days */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`blank-${idx}`} className="h-11 rounded-xl bg-slate-50/40 opacity-40"></div>
        ))}

        {/* Month Days (1 to 31) */}
        {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
          const dayNum = dayIdx + 1;
          const monthFormatted = String(selectedMonth + 1).padStart(2, '0');
          const dayFormatted = String(dayNum).padStart(2, '0');
          const dateStr = `${selectedYear}-${monthFormatted}-${dayFormatted}`;

          const tiffinRecord = tiffinsMap[dateStr];
          const isToday =
            today.getDate() === dayNum &&
            today.getMonth() === selectedMonth &&
            today.getFullYear() === selectedYear;

          let bgClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
          let statusDot = null;

          if (tiffinRecord) {
            if (tiffinRecord.status === 'delivered') {
              bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs';
              statusDot = <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>;
            } else if (tiffinRecord.status === 'skipped') {
              bgClass = 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs';
              statusDot = <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>;
            }
          }

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => setSelectedDayDetail(tiffinRecord ? { dateStr, tiffinRecord } : { dateStr, tiffinRecord: null })}
              className={`h-11 rounded-xl border p-1 flex flex-col items-center justify-between cursor-pointer transition relative ${bgClass} ${
                isToday ? 'ring-2 ring-orange-500 font-extrabold' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-bold leading-none">{dayNum}</span>
                {statusDot}
              </div>

              {tiffinRecord && tiffinRecord.status === 'delivered' ? (
                <span className="text-[10px] font-bold text-emerald-700 leading-none pb-0.5">
                  ₹{tiffinRecord.totalAmount}
                </span>
              ) : tiffinRecord && tiffinRecord.status === 'skipped' ? (
                <span className="text-[9px] font-bold text-amber-700 leading-none pb-0.5">
                  {language === 'gu' ? 'બંધ' : 'Skip'}
                </span>
              ) : (
                <span className="text-[9px] text-slate-300 leading-none pb-0.5">+ એડ</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Interactive Quick Action Card */}
      {selectedDayDetail && (
        <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200 text-xs space-y-2.5 animate-in fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 text-sm">📅 તારીખ: {selectedDayDetail.dateStr}</span>
            <button
              onClick={() => setSelectedDayDetail(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-600 font-medium">
            આ તારીખ માટે નીચેનામાંથી વિકલ્પ પસંદ કરો:
          </p>

          {/* Quick Action Toggles */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleQuickStatusChange(selectedDayDetail.dateStr, 'delivered')}
              className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1 transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>✓ આપ્યું (Delivered)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickStatusChange(selectedDayDetail.dateStr, 'skipped')}
              className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1 transition active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>✕ રજા (Skipped)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickStatusChange(selectedDayDetail.dateStr, 'delete')}
              className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center space-x-1 transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>કાઢી નાખો</span>
            </button>
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>આપ્યું (Delivered)</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>રજા (Skipped)</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-200"></span>
          <span>નોંધ નથી</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCalendar;
