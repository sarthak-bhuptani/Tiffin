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
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const Dashboard = () => {
  const { t, language } = useLanguage();
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

  const isGu = language === 'gu';

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-5 font-sans notranslate" translate="no">
      {/* 📲 PWA 1-Tap Mobile App Installer Banner */}
      <PwaInstallPrompt />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-white/80 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-600/25 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center space-x-1.5">
              <Sun className="w-4 h-4 text-amber-200" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-100">
                {t('businessName') || "Mom's Special Tiffin Service"}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Calendar className="w-5 h-5 text-amber-100 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/20 text-white font-extrabold text-base rounded-xl px-2.5 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
              />
            </div>
          </div>

          {/* 🔊 Gujarati Voice Audio Summary Speaker Button */}
          <button
            type="button"
            onClick={handleSpeakSummary}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl font-extrabold text-xs shadow-md transition active:scale-95 ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
            }`}
            title="આવાજથી હિસાબ સાંભળો"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-200" />}
            <span>{isSpeaking ? 'બંધ કરો' : '🔊 હિસાબ સાંભળો'}</span>
          </button>
        </div>

        <div className="pt-1 border-t border-white/20 flex items-center justify-between text-xs text-amber-100">
          <span>{t('activeCustomers')}: <strong className="text-white font-extrabold">{data?.activeCustomersCount || 0} ગ્રાહકો</strong></span>
          <span>આજના આપેલ: <strong className="text-amber-200 font-extrabold">{data?.deliveredCount || 0} ટિફિન</strong></span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-medium">{t('loading')}</div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
          {error}
        </div>
      ) : (
        <>
          {/* Simple Clean Action Cards for Mother */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
              {isGu ? 'મુખ્ય કામગીરી (Daily Action Cards)' : 'Primary Action Cards'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Daily Entry */}
              <button
                type="button"
                onClick={() => navigate('/tiffins/quick')}
                className="p-3.5 rounded-3xl bg-white border border-orange-200 text-slate-900 shadow-xs flex items-center justify-between transition active:scale-98 text-left hover:border-orange-400 hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold shrink-0">
                    🍱
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {isGu ? '1. આજની ટિફિન હાજરી' : '1. Today\'s Attendance'}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {isGu ? 'આજના ટિફિન આપ્યા / રજા નોંધો' : 'Log delivered vs skipped tiffins'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-400 shrink-0" />
              </button>

              {/* Card 2: View Today's List */}
              <button
                type="button"
                onClick={() => navigate('/tiffins/list')}
                className="p-3.5 rounded-3xl bg-white border border-amber-200 text-slate-900 shadow-xs flex items-center justify-between transition active:scale-98 text-left hover:border-amber-400 hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold shrink-0">
                    📋
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {isGu ? '2. આજનું લિસ્ટ જુઓ' : "2. View Today's List"}
                    </h4>
                    <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                      {data.deliveredCount} {isGu ? 'આપ્યા' : 'delivered'} • {data.skippedCount} {isGu ? 'રજા' : 'skipped'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400 shrink-0" />
              </button>

              {/* Card 3: Pending Dues & WhatsApp */}
              <button
                type="button"
                onClick={() => navigate('/accounts')}
                className="p-3.5 rounded-3xl bg-white border border-rose-200 text-slate-900 shadow-xs flex items-center justify-between transition active:scale-98 text-left hover:border-rose-400 hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold shrink-0">
                    🔴
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {isGu ? '3. બાકી પૈસા ઉઘરાણી' : '3. Pending Dues & WhatsApp'}
                    </h4>
                    <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                      ₹{data.pendingPaymentsTotal} {isGu ? 'બાકી • 1-Tap WhatsApp બિલ' : 'pending'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-400 shrink-0" />
              </button>

              {/* Card 4: Record Payment */}
              <button
                type="button"
                onClick={() => navigate('/accounts')}
                className="p-3.5 rounded-3xl bg-white border border-emerald-200 text-slate-900 shadow-xs flex items-center justify-between transition active:scale-98 text-left hover:border-emerald-400 hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold shrink-0">
                    🟢
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {isGu ? '4. રોકડા / UPI પૈસા જમા કરો' : '4. Record Payment'}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                      {isGu ? 'ગ્રાહકના પૈસા ખાતામાં ઉમેરો' : 'Add cash/UPI payments'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-2">
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
              color="amber"
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
              color="rose"
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

          {/* Secondary Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="py-3 px-3 rounded-2xl bg-white border border-orange-200 hover:border-orange-300 text-slate-800 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-rose-600 shrink-0" />
              <span>+ {t('addExpense')}</span>
            </button>

            <button
              onClick={() => navigate('/customers')}
              className="py-3 px-3 rounded-2xl bg-white border border-orange-200 hover:border-orange-300 text-slate-800 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xs transition active:scale-95"
            >
              <Users className="w-4 h-4 text-orange-600 shrink-0" />
              <span>+ {t('addNewCustomer')}</span>
            </button>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={t('addExpense')}>
        <form onSubmit={handleExpenseSubmit} className="space-y-4 font-sans">
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
