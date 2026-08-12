import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';

const CustomerCalendar = ({ tiffins = [] }) => {
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

  const weekDays = ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'];

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

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-orange-100 shadow-xs space-y-4">
      {/* Calendar Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {monthNamesGu[selectedMonth]} {selectedYear} ({monthNamesEn[selectedMonth]})
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">દૈનિક હાજરી કેલેન્ડર (Monthly Tiffin Calendar)</p>
          </div>
        </div>

        {/* Month Switcher Buttons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
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
            className={`text-xs font-bold ${idx === 0 ? 'text-rose-500' : 'text-slate-500'}`}
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
                isToday ? 'ring-2 ring-orange-500' : ''
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
                  બંધ
                </span>
              ) : (
                <span className="text-[9px] text-slate-300 leading-none pb-0.5">-</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Detail Popover / Badge */}
      {selectedDayDetail && (
        <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200 text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{selectedDayDetail.dateStr}</span>
            <button
              onClick={() => setSelectedDayDetail(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {selectedDayDetail.tiffinRecord ? (
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-bold text-slate-800">
                  {selectedDayDetail.tiffinRecord.status === 'delivered' ? '✓ આપેલ (Delivered)' : '✕ બંધ (Skipped)'}
                </span>
                <p className="text-slate-500">
                  {selectedDayDetail.tiffinRecord.quantity} Tiffin • ₹{selectedDayDetail.tiffinRecord.totalAmount} ({selectedDayDetail.tiffinRecord.mealType || 'lunch'})
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                  selectedDayDetail.tiffinRecord.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedDayDetail.tiffinRecord.paymentStatus}
              </span>
            </div>
          ) : (
            <p className="text-slate-500 pt-0.5">આ તારીખે કોઈ એન્ટ્રી નોંધાયેલ નથી. (No record for this date)</p>
          )}
        </div>
      )}

      {/* Legend Footer */}
      <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>આપેલ (Delivered)</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>બંધ (Skipped)</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-200"></span>
          <span>કોઈ નોંધ નહીં</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCalendar;
