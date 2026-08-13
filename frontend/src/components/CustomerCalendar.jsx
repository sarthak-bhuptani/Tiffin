import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X, Trash2, Plus, Utensils, Sun, Moon } from 'lucide-react';
import Modal from './Modal';

const CustomerCalendar = ({
  tiffins = [],
  customer = {},
  onSaveSingleEntry,
  onDeleteSingleEntry,
}) => {
  const { language } = useLanguage();
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [activeDateModal, setActiveDateModal] = useState(null); // dateStr string

  // Form state for adding/editing entry on selected date
  const [entryForm, setEntryForm] = useState({
    mealType: 'lunch',
    quantity: 1,
    unitPrice: customer.defaultPrice || 60,
    status: 'delivered',
    paymentStatus: 'PENDING',
    notes: '',
  });

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
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Calendar Math
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  // Create dictionary of tiffins list grouped by YYYY-MM-DD
  const tiffinsByDate = {};
  tiffins.forEach((t) => {
    if (t.date) {
      if (!tiffinsByDate[t.date]) {
        tiffinsByDate[t.date] = [];
      }
      tiffinsByDate[t.date].push(t);
    }
  });

  const handleOpenDateModal = (dateStr) => {
    setActiveDateModal(dateStr);
    setEntryForm({
      mealType: 'lunch',
      quantity: customer.defaultQuantity || 1,
      unitPrice: customer.defaultPrice || 60,
      status: 'delivered',
      paymentStatus: 'PENDING',
      notes: '',
    });
  };

  const handleAddEntryForDate = async (e) => {
    e.preventDefault();
    if (onSaveSingleEntry && activeDateModal) {
      await onSaveSingleEntry({
        date: activeDateModal,
        mealType: entryForm.mealType,
        quantity: parseFloat(entryForm.quantity),
        unitPrice: parseFloat(entryForm.unitPrice),
        status: entryForm.status,
        paymentStatus: entryForm.paymentStatus,
        notes: entryForm.notes,
      });
      setEntryForm({
        mealType: 'dinner',
        quantity: 1,
        unitPrice: customer.defaultPrice || 60,
        status: 'delivered',
        paymentStatus: 'PENDING',
        notes: '',
      });
    }
  };

  const handleDeleteEntry = async (tiffinId) => {
    if (onDeleteSingleEntry) {
      await onDeleteSingleEntry(tiffinId);
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
            <p className="text-[11px] text-slate-500 font-medium">કોઈપણ તારીખ પર ક્લિક કરીને Lunch / Dinner એન્ટ્રીઓ કરો</p>
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
          <div key={`blank-${idx}`} className="h-12 rounded-xl bg-slate-50/40 opacity-40"></div>
        ))}

        {/* Month Days (1 to 31) */}
        {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
          const dayNum = dayIdx + 1;
          const monthFormatted = String(selectedMonth + 1).padStart(2, '0');
          const dayFormatted = String(dayNum).padStart(2, '0');
          const dateStr = `${selectedYear}-${monthFormatted}-${dayFormatted}`;

          const dateEntries = tiffinsByDate[dateStr] || [];
          const isToday =
            today.getDate() === dayNum &&
            today.getMonth() === selectedMonth &&
            today.getFullYear() === selectedYear;

          // Compute daily metrics
          let dayTotalSum = 0;
          let dayTiffinsCount = 0;
          let hasDelivered = false;
          let hasSkipped = false;

          dateEntries.forEach((t) => {
            if (t.status === 'delivered') {
              hasDelivered = true;
              dayTotalSum += t.totalAmount;
              dayTiffinsCount += t.quantity;
            } else if (t.status === 'skipped') {
              hasSkipped = true;
            }
          });

          let bgClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
          if (hasDelivered) {
            bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs';
          } else if (hasSkipped) {
            bgClass = 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs';
          }

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => handleOpenDateModal(dateStr)}
              className={`h-12 rounded-xl border p-1 flex flex-col items-center justify-between cursor-pointer transition relative ${bgClass} ${
                isToday ? 'ring-2 ring-orange-500 font-extrabold' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-bold leading-none">{dayNum}</span>
                {dateEntries.length > 0 && (
                  <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1 rounded-md leading-none">
                    {dateEntries.length}
                  </span>
                )}
              </div>

              {hasDelivered ? (
                <div className="text-center leading-none pb-0.5">
                  <span className="text-[10px] font-extrabold text-emerald-800 block">₹{dayTotalSum}</span>
                  <span className="text-[9px] font-semibold text-emerald-600">({dayTiffinsCount} ટિફિન)</span>
                </div>
              ) : hasSkipped ? (
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

      {/* Date Tiffin Manager Modal */}
      {activeDateModal && (
        <Modal
          isOpen={Boolean(activeDateModal)}
          onClose={() => setActiveDateModal(null)}
          title={`📅 ${activeDateModal} - ટિફિન મેનેજર`}
        >
          <div className="space-y-4">
            {/* Existing Entries List for this Date */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                આ તારીખની વર્તમાન એન્ટ્રીઓ (Current Entries)
              </h4>

              {(!tiffinsByDate[activeDateModal] || tiffinsByDate[activeDateModal].length === 0) ? (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-medium">
                  આ તારીખે હજુ સુધી કોઈ એન્ટ્રી નથી. નીચેથી ઉમેરો!
                </div>
              ) : (
                <div className="space-y-2">
                  {tiffinsByDate[activeDateModal].map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-xs text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        {item.mealType === 'lunch' ? (
                          <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : item.mealType === 'dinner' ? (
                          <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
                        ) : (
                          <Utensils className="w-4 h-4 text-orange-500 shrink-0" />
                        )}
                        <div>
                          <span className="font-extrabold text-slate-900 capitalize">
                            {item.mealType === 'lunch' ? '☀️ બપોર (Lunch)' : item.mealType === 'dinner' ? '🌙 સાંજ (Dinner)' : '🍱 બંને (Both)'}
                          </span>
                          <p className="text-slate-600 font-medium mt-0.5">
                            {item.quantity} ટિફિન × ₹{item.unitPrice} = <strong className="text-emerald-700">₹{item.totalAmount}</strong>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(item._id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="ડીલીટ કરો"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Entry Form for this Date */}
            <form onSubmit={handleAddEntryForDate} className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-200 space-y-3">
              <h4 className="text-xs font-extrabold text-orange-900">
                + નવી ટિફિન એન્ટ્રી ઉમેરો (Add Meal Entry)
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">મેનૂ સમય (Meal)</label>
                  <select
                    value={entryForm.mealType}
                    onChange={(e) => setEntryForm({ ...entryForm, mealType: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
                  >
                    <option value="lunch">☀️ બપોર (Lunch)</option>
                    <option value="dinner">🌙 સાંજ (Dinner)</option>
                    <option value="both">🍱 બંને (Both)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ટિફિન સંખ્યા (Qty)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={entryForm.quantity}
                    onChange={(e) => setEntryForm({ ...entryForm, quantity: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ભાવ (₹ / Tiffin)</label>
                  <select
                    value={entryForm.unitPrice}
                    onChange={(e) => setEntryForm({ ...entryForm, unitPrice: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
                  >
                    <option value="60">₹60 (Standard)</option>
                    <option value="70">₹70 (Medium)</option>
                    <option value="80">₹80 (Special Dinner)</option>
                    <option value="100">₹100 (Full Special)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">સ્ટેટસ</label>
                  <select
                    value={entryForm.status}
                    onChange={(e) => setEntryForm({ ...entryForm, status: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
                  >
                    <option value="delivered">🟢 આપ્યું (Delivered)</option>
                    <option value="skipped">🟡 રજા / બંધ (Skipped)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-600/30 transition active:scale-98"
              >
                + {activeDateModal} ની એન્ટ્રી જમા કરો (Save Entry)
              </button>
            </form>
          </div>
        </Modal>
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
