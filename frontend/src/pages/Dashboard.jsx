import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getTodayDashboard } from '../services/reportService';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import PwaInstallPrompt from '../components/PwaInstallPrompt';
import { createExpense } from '../services/expenseService';
import { getLocalTodayStr } from '../utils/dateUtils';

import {
  Utensils,
  Plus,
  BookOpen,
  Receipt,
  Users,
  Wallet,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Volume2,
  VolumeX,
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(() => getLocalTodayStr());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Add Expense Modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'vegetables',
    amount: '',
    note: '',
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDashboard = async (targetDate) => {
    try {
      setLoading(true);
      const res = await getTodayDashboard(targetDate);
      setData(res.summary);
    } catch (err) {
      setError(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedDate);
  }, [selectedDate]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert('આ ફોનમાં આવાજ ફીચર સપોર્ટ કરતું નથી.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const totalTiffins = data?.todayTiffins || 0;
    const income = data?.billedIncome || 0;
    const collected = data?.collectedIncome || 0;
    const pending = data?.pendingPaymentsTotal || 0;

    const script = `નમસ્તે! આજે કુલ ${totalTiffins} ટિફિન ગયા છે. ${income} રૂપિયાની આવક થઈ છે, જેમાં ${collected} રૂપિયા જમા થયા છે, અને કુલ ${pending} રૂપિયા બાકી નીકળે છે. ધન્યવાદ!`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = 'gu-IN';
    utterance.rate = 0.88;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return;

    try {
      setExpenseSubmitting(true);
      await createExpense({
        date: selectedDate,
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        note: expenseForm.note,
      });

      setToastMessage(t('expenseSavedSuccess'));
      setIsExpenseModalOpen(false);
      setExpenseForm({ category: 'vegetables', amount: '', note: '' });
      fetchDashboard(selectedDate);
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setExpenseSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-5">
      {/* 📲 PWA 1-Tap Mobile App Installer Banner */}
      <PwaInstallPrompt />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-white/80 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Interactive Title Banner with Date Selector & Gujarati Audio Assistant */}
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-5 text-white shadow-lg shadow-orange-600/20 flex-wrap gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-orange-100 font-semibold">{t('todaysSummary')}</span>
          <div className="flex items-center space-x-2 mt-1">
            <Calendar className="w-5 h-5 text-amber-200" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/20 text-white font-bold text-lg rounded-xl px-2.5 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            />
          </div>
          <p className="text-xs text-orange-100 mt-2">
            {t('activeCustomers')}: <span className="font-bold text-white">{data?.activeCustomersCount || 0}</span>
          </p>
        </div>

        {/* 🔊 Gujarati Voice Audio Summary Speaker Button */}
        <button
          onClick={handleSpeakSummary}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition active:scale-95 ${
            isSpeaking
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
          }`}
          title="આવાજથી હિસાબ સાંભળો"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-200" />}
          <span>{isSpeaking ? 'બંધ કરો (Stop)' : '🔊 હિસાબ સાંભળો'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-medium">{t('loading')}</div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
          {error}
        </div>
      ) : (
        <>
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              title={t('tiffins')}
              value={data.todayTiffins}
              subtext={`${t('delivered')}: ${data.deliveredCount} | ${t('skipped')}: ${data.skippedCount}`}
              icon={Utensils}
              color="orange"
              onClick={() => navigate('/tiffins/list')}
            />

            <StatCard
              title={t('income')}
              value={`₹${data.billedIncome}`}
              subtext={`${t('collectedIncome')}: ₹${data.collectedIncome}`}
              icon={IndianRupee}
              color="emerald"
            />

            <StatCard
              title={t('expenses')}
              value={`₹${data.totalExpenses}`}
              subtext={t('today')}
              icon={Receipt}
              color="rose"
              onClick={() => setIsExpenseModalOpen(true)}
            />

            <StatCard
              title={t('profit')}
              value={`₹${data.netProfitBilled}`}
              subtext={`${t('netProfit')}`}
              icon={TrendingUp}
              color="amber"
            />

            <StatCard
              title={t('pending')}
              value={`₹${data.pendingPaymentsTotal}`}
              subtext={t('pendingPayments')}
              icon={AlertCircle}
              color="blue"
              onClick={() => navigate('/accounts')}
            />

            <StatCard
              title={t('activeCustomers')}
              value={data.activeCustomersCount}
              subtext={t('customers')}
              icon={Users}
              color="orange"
              onClick={() => navigate('/customers')}
            />
          </div>

          {/* Big Mobile Action Buttons */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/tiffins/quick')}
                className="py-4 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-orange-600/30 flex items-center justify-center space-x-2 transition"
              >
                <Plus className="w-5 h-5" />
                <span>+ {t('addTiffin')}</span>
              </button>

              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="py-4 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-rose-600/30 flex items-center justify-center space-x-2 transition"
              >
                <Plus className="w-5 h-5" />
                <span>+ {t('addExpense')}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => navigate('/tiffins/list')}
                className="py-3 px-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center space-y-1 shadow-xs hover:border-orange-300 transition"
              >
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span className="truncate w-full text-center">{t('viewTodaysList')}</span>
              </button>

              <button
                onClick={() => navigate('/accounts')}
                className="py-3 px-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center space-y-1 shadow-xs hover:border-orange-300 transition"
              >
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="truncate w-full text-center">{t('payments')}</span>
              </button>

              <button
                onClick={() => navigate('/customers')}
                className="py-3 px-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center space-y-1 shadow-xs hover:border-orange-300 transition"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="truncate w-full text-center">{t('customers')}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={t('addExpense')}>
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('expenseCategory')}</label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="vegetables">{t('vegetables')}</option>
              <option value="grocery">{t('grocery')}</option>
              <option value="gas">{t('gas')}</option>
              <option value="packaging">{t('packaging')}</option>
              <option value="delivery">{t('delivery')}</option>
              <option value="electricity">{t('electricity')}</option>
              <option value="rent">{t('rent')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('amount')} (₹)</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 420"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-base font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('notes')}</label>
            <input
              type="text"
              placeholder="e.g. Tomato, potato, onion"
              value={expenseForm.note}
              onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={expenseSubmitting}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-600/30 transition active:scale-98"
          >
            {expenseSubmitting ? t('loading') : t('save')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
