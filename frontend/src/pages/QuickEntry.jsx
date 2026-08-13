import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCustomers } from '../services/customerService';
import { createBulkTiffins, parseNotebookImage, getTiffins, deleteTiffin } from '../services/tiffinService';
import { createExpense } from '../services/expenseService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

import { getLocalTodayStr } from '../utils/dateUtils';

import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  Save,
  Calendar,
  Camera,
  Upload,
  Sparkles,
  Loader2,
  Receipt,
} from 'lucide-react';

const QuickEntry = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [date, setDate] = useState(() => getLocalTodayStr());
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notebook photo scan state
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Active entries array acting like a physical notebook sheet
  const [entries, setEntries] = useState([]);
  const [activeEntryIndex, setActiveEntryIndex] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [entryToDeleteIndex, setEntryToDeleteIndex] = useState(null);

  // Tab State: 'tiffins' (Customer Tiffin List) or 'ledger' (Rupees - Vaprash Notebook Ledger)
  const [activeTab, setActiveTab] = useState('tiffins');
  const [dailyLedger, setDailyLedger] = useState([
    { day: 1, rupees: 1880, vaprash: 600 },
    { day: 2, rupees: 1645, vaprash: 110 },
    { day: 3, rupees: 2200, vaprash: 500 },
    { day: 4, rupees: 2100, vaprash: 860 },
    { day: 5, rupees: 2040, vaprash: 455 },
    { day: 6, rupees: 2750, vaprash: 1540 },
    { day: 7, rupees: 910, vaprash: 500 },
    { day: 8, rupees: 2200, vaprash: 950 },
  ]);

  const [loadingDate, setLoadingDate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch regular customers list once
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Whenever selected DATE changes, load existing saved entries for that date
  useEffect(() => {
    if (customers.length > 0 || date) {
      loadDateData(date);
    }
  }, [date, customers]);

  const fetchCustomers = async () => {
    try {
      const list = await getCustomers({ active: true });
      setCustomers(list);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDateData = async (selectedDate) => {
    try {
      setLoadingDate(true);
      setDeletedIds([]);
      const savedTiffins = await getTiffins({ date: selectedDate });

      if (savedTiffins && savedTiffins.length > 0) {
        // Render saved entries for the selected date
        const loadedEntries = savedTiffins.map((tiffin) => ({
          _id: tiffin._id,
          customerId: tiffin.customerId || null,
          customerName: tiffin.customerName,
          area: tiffin.area || 'General',
          quantity: tiffin.quantity,
          unitPrice: tiffin.unitPrice,
          totalAmount: tiffin.totalAmount,
          status: tiffin.status || 'delivered',
          mealType: tiffin.mealType || 'lunch',
          skipReason: tiffin.skipReason || '',
          paymentStatus: tiffin.paymentStatus || 'PAID',
          paidAmount: tiffin.paidAmount || 0,
          notes: tiffin.notes || '',
        }));
        setEntries(loadedEntries);
      } else {
        // No saved entries for selected date: start with clean empty list as requested
        setEntries([]);
      }
    } catch (err) {
      console.error('Error loading tiffins for date:', err);
    } finally {
      setLoadingDate(false);
    }
  };

  // Handle notebook photo file selection with client-side compression
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setSelectedImage(compressedBase64);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // Analyze notebook image & autofill Quick Entry rows and Expenses
  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setAnalyzing(true);
      const resData = await parseNotebookImage({ base64Image: selectedImage });
      const parsedRows = resData?.entries || (Array.isArray(resData) ? resData : []);
      const parsedExpenses = resData?.expenses || [];
      const summary = resData?.summary;

      if (parsedRows && parsedRows.length > 0) {
        const newEntries = parsedRows.map((r) => ({
          customerId: r.customerId || null,
          customerName: r.customerName || 'Notebook Customer',
          area: r.area || 'General',
          quantity: r.quantity || 1,
          unitPrice: r.unitPrice || 60,
          totalAmount: r.status === 'skipped' ? 0 : (r.totalAmount !== undefined ? r.totalAmount : (r.quantity || 1) * (r.unitPrice || 60)),
          status: r.status || 'delivered',
          mealType: r.mealType || 'lunch',
          skipReason: r.skipReason || '',
          paymentStatus: r.paymentStatus || 'PAID',
          paidAmount: r.status === 'skipped' ? 0 : (r.totalAmount !== undefined ? r.totalAmount : (r.quantity || 1) * (r.unitPrice || 60)),
          notes: 'Extracted from Notebook Scan',
        }));

        // Automatically save parsed expenses if present
        if (parsedExpenses && parsedExpenses.length > 0) {
          for (const ex of parsedExpenses) {
            try {
              await createExpense({
                date,
                category: ex.category,
                amount: ex.amount,
                note: ex.note,
              });
            } catch (e) {
              console.error('Error saving extracted expense:', e);
            }
          }
        }

        // Track overridden entries for deletion
        const overwrittenIds = entries
          .filter((e) => e._id)
          .map((e) => e._id);
        if (overwrittenIds.length > 0) {
          setDeletedIds((prev) => [...prev, ...overwrittenIds]);
        }

        // Automatically update daily ledger if parsed from notebook photo
        if (resData?.dailyLedger && resData.dailyLedger.length > 0) {
          setDailyLedger(resData.dailyLedger);
        }

        setEntries(newEntries);
        setIsScanModalOpen(false);
        setSelectedImage(null);

        const summaryText = summary
          ? `આવક: ₹${summary.totalIncome} | ખર્ચ: ₹${summary.totalExpenses} | નફો: ₹${summary.netProfit}`
          : t('ocrSuccess');

        setToastMessage(`📸 ${t('ocrSuccess')} (${summaryText})`);
      }
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setSubmitting(false);
      setAnalyzing(false);
    }
  };

  // Add blank entry row
  const handleAddBlankRow = () => {
    setEntries((prev) => [
      ...prev,
      {
        customerId: null,
        customerName: '',
        area: 'General',
        quantity: 1,
        unitPrice: 60,
        totalAmount: 60,
        status: 'delivered',
        mealType: 'lunch',
        skipReason: '',
        paymentStatus: 'PAID',
        paidAmount: 60,
        notes: '',
      },
    ]);
  };

  // Auto-fill selected customer into active entry or new entry
  const handleSelectCustomer = (customer) => {
    const newEntry = {
      customerId: customer._id,
      customerName: customer.name,
      area: customer.area || 'General',
      quantity: customer.defaultQuantity || 1,
      unitPrice: customer.defaultLunchPrice || customer.defaultPrice || 60,
      totalAmount: (customer.defaultQuantity || 1) * (customer.defaultLunchPrice || customer.defaultPrice || 60),
      status: 'delivered',
      mealType: 'lunch',
      skipReason: '',
      paymentStatus: 'PAID',
      paidAmount: (customer.defaultQuantity || 1) * (customer.defaultLunchPrice || customer.defaultPrice || 60),
      notes: '',
    };

    if (activeEntryIndex !== null && activeEntryIndex < entries.length) {
      const updated = [...entries];
      updated[activeEntryIndex] = newEntry;
      setEntries(updated);
    } else {
      setEntries((prev) => [...prev, newEntry]);
    }

    setIsSearchOpen(false);
    setSearchQuery('');
    setActiveEntryIndex(null);
  };

  const handleUpdateEntry = (index, field, value) => {
    const updated = [...entries];
    const item = { ...updated[index], [field]: value };

    // When mealType changes (lunch -> ₹60, dinner -> ₹80)
    if (field === 'mealType') {
      if (value === 'dinner') {
        item.unitPrice = 80;
      } else if (value === 'lunch') {
        item.unitPrice = 60;
      } else if (value === 'both') {
        item.unitPrice = 140;
      }
      item.totalAmount = item.status === 'skipped' ? 0 : item.quantity * item.unitPrice;
      if (item.paymentStatus === 'PAID') {
        item.paidAmount = item.totalAmount;
      }
    }

    // Automatic calculation of amounts and status rules
    if (field === 'status') {
      if (value === 'skipped') {
        item.totalAmount = 0;
        item.paidAmount = 0;
        item.quantity = 0;
      } else {
        item.quantity = item.quantity === 0 ? 1 : item.quantity;
        item.totalAmount = item.quantity * item.unitPrice;
        if (item.paymentStatus === 'PAID') {
          item.paidAmount = item.totalAmount;
        }
      }
    }

    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      const price = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
      item.totalAmount = item.status === 'skipped' ? 0 : qty * price;
      if (item.paymentStatus === 'PAID') {
        item.paidAmount = item.totalAmount;
      }
    }

    if (field === 'paymentStatus') {
      if (value === 'PAID') {
        item.paidAmount = item.totalAmount;
      } else if (value === 'PENDING') {
        item.paidAmount = 0;
      }
    }

    updated[index] = item;
    setEntries(updated);
  };

  const handleConfirmRemoveEntry = async () => {
    if (entryToDeleteIndex === null) return;
    const index = entryToDeleteIndex;
    const entryToRemove = entries[index];
    if (entryToRemove && entryToRemove._id) {
      setDeletedIds((prev) => [...prev, entryToRemove._id]);
      try {
        await deleteTiffin(entryToRemove._id);
      } catch (err) {
        console.error('Error deleting entry:', err);
      }
    }
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setEntryToDeleteIndex(null);
  };

  // Compute live notebook totals
  const liveTotals = entries.reduce(
    (acc, curr) => {
      if (curr.status === 'delivered') {
        acc.totalTiffins += curr.quantity;
        acc.totalIncome += curr.totalAmount;
        acc.paidAmount += curr.paidAmount;
      }
      return acc;
    },
    { totalTiffins: 0, totalIncome: 0, paidAmount: 0 }
  );

  const ledgerTotals = dailyLedger.reduce(
    (acc, curr) => {
      acc.totalRupees += curr.rupees || 0;
      acc.totalVaprash += curr.vaprash || 0;
      acc.netProfit += (curr.rupees || 0) - (curr.vaprash || 0);
      return acc;
    },
    { totalRupees: 0, totalVaprash: 0, netProfit: 0 }
  );

  const pendingAmount = Math.max(0, liveTotals.totalIncome - liveTotals.paidAmount);

  const handleSaveDay = async () => {
    if (activeTab === 'ledger') {
      try {
        setSubmitting(true);
        const [yearStr, monthStr] = date.split('-');
        for (const row of dailyLedger) {
          if (row.rupees > 0 || row.vaprash > 0) {
            const dayStr = String(row.day).padStart(2, '0');
            const rowDate = `${yearStr}-${monthStr}-${dayStr}`;

            const existingForDate = await getTiffins({ date: rowDate });
            const oldLedgerEntries = (existingForDate || []).filter(
              (t) => t.customerName === 'રોજના હિસાબ (Daily Ledger)' || t.customerName === 'રોજના હિસાબ (Daily Ledger Revenue)'
            );
            const deletedIdsForDate = oldLedgerEntries.map((t) => t._id);

            if (row.vaprash > 0) {
              try {
                await createExpense({
                  date: rowDate,
                  category: 'other',
                  amount: row.vaprash,
                  note: `રોજના વપરાશ (તા. ${row.day})`,
                });
              } catch (e) {
                console.error(e);
              }
            }

            if (row.rupees > 0) {
              try {
                await createBulkTiffins(
                  rowDate,
                  [
                    {
                      customerName: 'રોજના હિસાબ (Daily Ledger)',
                      area: 'General',
                      quantity: 1,
                      unitPrice: row.rupees,
                      totalAmount: row.rupees,
                      status: 'delivered',
                      mealType: 'lunch',
                      paymentStatus: 'PAID',
                      paidAmount: row.rupees,
                      notes: `તા. ${row.day} દૈનિક આવક`,
                    },
                  ],
                  deletedIdsForDate
                );
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
        setToastMessage(`📖 હિસાબ સેવ થઈ ગયો! રિપોર્ટમાં ગણતરી ઉમેરાઈ ગઈ.`);
        setTimeout(() => navigate('/reports'), 1000);
      } catch (err) {
        alert(err.response?.data?.message || t('errorOccurred'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (entries.length === 0 && deletedIds.length === 0) return;

    // Filter valid entries
    const validEntries = entries.filter((e) => e.customerName.trim().length > 0);

    try {
      setSubmitting(true);
      await createBulkTiffins(date, validEntries, deletedIds);
      setToastMessage(t('bulkSavedSuccess'));
      setTimeout(() => navigate('/tiffins/list'), 1000);
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-44 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-3.5">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 sm:p-4 border border-orange-100 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">{t('digitalNotebook')}</h2>
            <p className="text-xs text-slate-500">{t('quickEntry')}</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-1.5 bg-orange-50 px-3 py-2 rounded-xl border border-orange-200 shadow-xs">
          <Calendar className="w-4 h-4 text-orange-600" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Tab Switcher: 📋 Customer Tiffins vs 📖 Daily Rupees & Vaprash Ledger */}
      <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('tiffins')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'tiffins' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📋 ગ્રાહક ટિફિન લિસ્ટ</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'ledger' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>📖 રૂપિયા - વપરાશ ચોપડો</span>
        </button>
      </div>

      {/* Action Bar with Notebook Photo Scan Button */}
      <div className="grid grid-cols-2 sm:flex items-center justify-between gap-2">
        <button
          onClick={() => setIsScanModalOpen(true)}
          className="col-span-2 sm:col-span-1 sm:flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition active:scale-98"
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span className="truncate">📸 {t('scanNotebook')}</span>
        </button>

        <button
          onClick={() => {
            setActiveEntryIndex(entries.length);
            setIsSearchOpen(true);
          }}
          className="flex-1 flex items-center justify-center space-x-1 px-2.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 transition"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('searchCustomer')}</span>
        </button>

        <button
          onClick={handleAddBlankRow}
          className="flex-1 flex items-center justify-center space-x-1 px-2.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">+ {t('addEntry')}</span>
        </button>
      </div>

      {/* Notebook Photo Scan Modal */}
      <Modal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} title={t('scanNotebook')}>
        <div className="space-y-4 text-center py-1">
          {!selectedImage ? (
            <label className="border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition">
              <Upload className="w-10 h-10 text-orange-600 mb-2" />
              <p className="font-bold text-sm text-slate-800">{t('uploadNotebookPhoto')}</p>
              <p className="text-xs text-slate-500 mt-1">Take a photo of paper notebook page or pick image file</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-60 bg-slate-100">
                <img src={selectedImage} alt="Notebook preview" className="w-full h-full object-contain" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={analyzing}
                  className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-600/30 flex items-center justify-center space-x-2 transition"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('analyzingImage')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze & Fill Entries</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Digital Notebook Content */}
      {activeTab === 'ledger' ? (
        /* Daily Ledger Table (રૂપિયા - વપરાશ પત્રક) */
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-orange-600" />
              <span>📖 રૂપિયા - વપરાશ પત્રક (Datewise Ledger)</span>
            </h3>
            <button
              onClick={() => {
                const nextDay = dailyLedger.length + 1;
                setDailyLedger((prev) => [...prev, { day: nextDay, rupees: 0, vaprash: 0 }]);
              }}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition"
            >
              + તારીખ ઉમેરો
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-400 border-b pb-1">
              <span>તારીખ (Day)</span>
              <span>રૂપિયા (Revenue ₹)</span>
              <span>વપરાશ (Kharch ₹)</span>
              <span>બચત (Net Profit ₹)</span>
            </div>

            {dailyLedger.map((row, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 items-center text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-1 justify-center font-bold text-slate-700">
                  <span>તા. {row.day}</span>
                </div>

                <div>
                  <input
                    type="number"
                    value={row.rupees}
                    onChange={(e) => {
                      const updated = [...dailyLedger];
                      updated[idx].rupees = parseFloat(e.target.value) || 0;
                      setDailyLedger(updated);
                    }}
                    className="w-full text-center font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-1 px-1 text-xs"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    value={row.vaprash}
                    onChange={(e) => {
                      const updated = [...dailyLedger];
                      updated[idx].vaprash = parseFloat(e.target.value) || 0;
                      setDailyLedger(updated);
                    }}
                    className="w-full text-center font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg py-1 px-1 text-xs"
                  />
                </div>

                <div className="text-center font-extrabold text-xs">
                  <span className={row.rupees - row.vaprash >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    ₹{row.rupees - row.vaprash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Digital Notebook Entry Table / List */
        <div className="space-y-3">
        {loadingDate ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">{t('loading')}</div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">આ તારીખની કોઈ એન્ટ્રી થઈ નથી. ({date})</p>
            <p className="text-xs text-slate-400 mt-1">No entries recorded for this date.</p>
            <button
              onClick={handleAddBlankRow}
              className="mt-3 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              + {t('addEntry')}
            </button>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-3.5 border transition shadow-xs space-y-3 ${
                entry.status === 'skipped'
                  ? 'border-amber-300 bg-amber-50/30'
                  : entry.paymentStatus === 'PAID'
                  ? 'border-emerald-200'
                  : 'border-rose-200'
              }`}
            >
              {/* Row 1: Name + Status + Remove */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder={t('customerName')}
                    value={entry.customerName}
                    onChange={(e) => handleUpdateEntry(index, 'customerName', e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 focus:outline-none border-b border-transparent focus:border-orange-500 py-0.5"
                  />
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {/* Status Toggle Button */}
                  <select
                    value={entry.status}
                    onChange={(e) => handleUpdateEntry(index, 'status', e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                      entry.status === 'delivered'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-amber-50 border-amber-300 text-amber-700'
                    }`}
                  >
                    <option value="delivered">✓ {t('delivered')}</option>
                    <option value="skipped">✕ {t('skipped')}</option>
                  </select>

                  <button
                    onClick={() => setEntryToDeleteIndex(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Meal Type + Quantity + Price + Payment Status */}
              {entry.status === 'delivered' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block">{t('mealType')}</label>
                    <select
                      value={entry.mealType || 'lunch'}
                      onChange={(e) => handleUpdateEntry(index, 'mealType', e.target.value)}
                      className="w-full font-bold text-slate-800 bg-orange-50/60 border border-orange-200 rounded-lg py-1 px-1 text-[11px] focus:outline-none"
                    >
                      <option value="lunch">{t('lunch')}</option>
                      <option value="dinner">{t('dinner')}</option>
                      <option value="both">{t('both')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block">{t('quantity')}</label>
                    <input
                      type="number"
                      min="1"
                      value={entry.quantity}
                      onChange={(e) => handleUpdateEntry(index, 'quantity', e.target.value)}
                      className="w-full font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block">{t('price')} (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={entry.unitPrice}
                      onChange={(e) => handleUpdateEntry(index, 'unitPrice', e.target.value)}
                      className="w-full font-bold text-slate-900 bg-amber-50 border border-amber-300 rounded-lg py-1 px-1.5 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block">{t('paymentStatus')}</label>
                    <select
                      value={entry.paymentStatus}
                      onChange={(e) => handleUpdateEntry(index, 'paymentStatus', e.target.value)}
                      className={`w-full font-bold py-1 px-1 rounded-lg border text-[11px] focus:outline-none ${
                        entry.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-rose-50 border-rose-300 text-rose-700'
                      }`}
                    >
                      <option value="PAID">{t('paid')}</option>
                      <option value="PENDING">{t('pending')}</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="pt-1 border-t border-amber-100 text-xs">
                  <input
                    type="text"
                    placeholder={t('skipReason') + ' (e.g. Out of town)'}
                    value={entry.skipReason}
                    onChange={(e) => handleUpdateEntry(index, 'skipReason', e.target.value)}
                    className="w-full text-xs text-amber-800 bg-white border border-amber-200 rounded-lg py-1.5 px-3"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    )}

      {/* Customer Search Autocomplete Modal */}
      <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} title={t('searchCustomer')}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('searchCustomer')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">{t('noCustomers')}</p>
            ) : (
              filteredCustomers.map((cust) => (
                <div
                  key={cust._id}
                  onClick={() => handleSelectCustomer(cust)}
                  className="p-2.5 rounded-xl hover:bg-orange-50 cursor-pointer flex items-center justify-between transition"
                >
                  <div>
                    <p className="font-bold text-sm text-slate-900">{cust.name}</p>
                    <p className="text-xs text-slate-500">{cust.area} • Lunch ₹{cust.defaultLunchPrice || 60} | Dinner ₹{cust.defaultDinnerPrice || 80}</p>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">
                    Select
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Popup */}
      <ConfirmModal
        isOpen={entryToDeleteIndex !== null}
        onClose={() => setEntryToDeleteIndex(null)}
        onConfirm={handleConfirmRemoveEntry}
        title="એન્ટ્રી ડીલીટ કરો (Delete Entry)"
        message={
          entryToDeleteIndex !== null && entries[entryToDeleteIndex]
            ? `શું તમે ચોક્કસ એન્ટ્રી "${entries[entryToDeleteIndex].customerName || 'અજ્ઞાત'}" ને ડીલીટ કરવા માંગો છો?`
            : 'શું તમે આ એન્ટ્રી ડીલીટ કરવા માંગો છો?'
        }
      />

      {/* Sticky Bottom Notebook Summary & Save Bar */}
      <div className="fixed bottom-[56px] left-0 right-0 z-30 bg-slate-900 text-white p-3 shadow-2xl max-w-4xl mx-auto rounded-t-2xl border-t border-slate-800">
        {activeTab === 'ledger' ? (
          <div className="grid grid-cols-3 gap-1 items-center justify-between mb-2.5 px-0.5 text-center text-[10px] sm:text-xs">
            <div>
              <span className="text-slate-400 block">કુલ આવક (Revenue)</span>
              <span className="font-bold text-emerald-400 text-xs sm:text-sm">₹{ledgerTotals.totalRupees}</span>
            </div>

            <div>
              <span className="text-slate-400 block">કુલ વપરાશ (Kharch)</span>
              <span className="font-bold text-rose-400 text-xs sm:text-sm">₹{ledgerTotals.totalVaprash}</span>
            </div>

            <div>
              <span className="text-slate-400 block">ચોખ્ખી બચત (Profit)</span>
              <span className={`font-bold text-xs sm:text-sm ${ledgerTotals.netProfit >= 0 ? 'text-amber-400' : 'text-rose-500'}`}>
                ₹{ledgerTotals.netProfit}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1 items-center justify-between mb-2.5 px-0.5 text-center text-[10px] sm:text-xs">
            <div>
              <span className="text-slate-400 block">{t('tiffins')}</span>
              <span className="font-bold text-white text-xs sm:text-sm">{liveTotals.totalTiffins}</span>
            </div>

            <div>
              <span className="text-slate-400 block">{t('income')}</span>
              <span className="font-bold text-emerald-400 text-xs sm:text-sm">₹{liveTotals.totalIncome}</span>
            </div>

            <div>
              <span className="text-slate-400 block">{t('paid')}</span>
              <span className="font-bold text-emerald-300 text-xs sm:text-sm">₹{liveTotals.paidAmount}</span>
            </div>

            <div>
              <span className="text-slate-400 block">{t('pending')}</span>
              <span className="font-bold text-rose-400 text-xs sm:text-sm">₹{pendingAmount}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSaveDay}
          disabled={submitting || (activeTab === 'tiffins' && entries.length === 0 && deletedIds.length === 0)}
          className="w-full py-2.5 sm:py-3 px-4 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{submitting ? t('loading') : (activeTab === 'ledger' ? 'તમામ ચોપડા હિસાબ સેવ કરો' : t('saveDay'))}</span>
        </button>
      </div>
    </div>
  );
};

export default QuickEntry;
