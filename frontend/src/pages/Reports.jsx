import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getMonthlyReport, getCustomReport, resetAllReports } from '../services/reportService';
import StatCard from '../components/StatCard';
import ConfirmModal from '../components/ConfirmModal';

import { BarChart3, Calendar, IndianRupee, TrendingUp, Receipt, PieChart, Users, Trash2 } from 'lucide-react';

const Reports = () => {
  const { t } = useLanguage();

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getMonthlyReport(year, month);
      setReportData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    try {
      setLoading(true);
      await resetAllReports();
      setIsResetModalOpen(false);
      await fetchReport();
    } catch (err) {
      console.error('Error resetting report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [year, month]);

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-4 font-sans notranslate" translate="no">
      {/* Confirm Reset Popup */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="તમામ રિપોર્ટ ડેટા રિસેટ કરો (Clear All Report Data)"
        message="શું તમે ચોક્કસ તમામ જૂનો રિપોર્ટ હિસાબ, ટિફિન અને વપરાશ ડેટા ડિલીટ/રિસેટ કરવા માંગો છો? આનાથી નવો હિસાબ શૂન્ય (₹0) થી શરૂ થશે."
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-4 border border-emerald-100 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{t('reports')}</h2>
          <p className="text-xs text-emerald-700 font-semibold">{t('thisMonth')} {t('netProfit')}</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Reset All Report Data Button */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition"
            title="તમામ ડેટા ડિલીટ કરો"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">રિસેટ હિસાબ</span>
          </button>

          {/* Month Selector */}
          <div className="flex items-center space-x-1 bg-emerald-50 px-2 py-1.5 rounded-2xl border border-emerald-200">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value={1}>Jan</option>
              <option value={2}>Feb</option>
              <option value={3}>Mar</option>
              <option value={4}>Apr</option>
              <option value={5}>May</option>
              <option value={6}>Jun</option>
              <option value={7}>Jul</option>
              <option value={8}>Aug</option>
              <option value={9}>Sep</option>
              <option value={10}>Oct</option>
              <option value={11}>Nov</option>
              <option value={12}>Dec</option>
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-medium">{t('loading')}</div>
      ) : !reportData ? (
        <p className="text-center text-slate-400 text-xs py-8">{t('errorOccurred')}</p>
      ) : (
        <>
          {/* Main Financial Totals Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              title={t('totalBilled')}
              value={`₹${reportData.summary.totalBilled}`}
              subtext={`${reportData.summary.totalTiffinsDelivered} ${t('tiffins')}`}
              icon={IndianRupee}
              color="emerald"
            />

            <StatCard
              title={t('collectedIncome')}
              value={`₹${reportData.summary.totalCollected}`}
              subtext={`${t('pending')}: ₹${reportData.summary.totalPending}`}
              icon={IndianRupee}
              color="emerald"
            />

            <StatCard
              title={t('expenses')}
              value={`₹${reportData.summary.totalExpenses}`}
              subtext={t('thisMonth')}
              icon={Receipt}
              color="rose"
            />

            <StatCard
              title={t('netProfit')}
              value={`₹${reportData.summary.netProfit}`}
              subtext="Billed - Expenses"
              icon={TrendingUp}
              color="amber"
            />
          </div>

          {/* Per-Customer Monthly Billing Table */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span>Monthly Customer Billing Breakdown</span>
            </h3>

            {reportData.customerBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">{t('noCustomers')}</p>
            ) : (
              <div className="space-y-2.5">
                {reportData.customerBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{item.customerName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Delivered: <strong className="text-slate-800">{item.delivered}</strong> | Skipped:{' '}
                        <strong className="text-amber-700">{item.skipped}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">₹{item.totalBilled}</p>
                      <p className="text-[10px] text-slate-500">
                        Paid: <span className="text-emerald-700 font-bold">₹{item.totalPaid}</span> | Pending:{' '}
                        <span className="text-rose-700 font-bold">₹{item.totalPending}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notebook-Style "રૂપિયા - વપરાશ" (Rupees vs Consumption/Expense Analysis) Section */}
          <div className="bg-white rounded-3xl p-5 text-slate-900 shadow-xs space-y-4 border border-orange-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold border border-orange-200 shrink-0">
                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    📖 {t('vaprashKharch') || 'રૂપિયા - વપરાશ / ખર્ચ પત્રક'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">Notebook Accounting & Consumption</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-slate-800 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 whitespace-nowrap inline-flex items-center space-x-1">
                  <span>🍱</span>
                  <span>કુલ ટિફિન: {reportData.summary.totalTiffinsDelivered}</span>
                </span>
              </div>
            </div>

            {/* Quick Summary Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">કુલ ટિફિન મોકલેલ</span>
                <span className="text-sm font-extrabold text-slate-900">{reportData.summary.totalTiffinsDelivered} ટિફિન</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 block uppercase">કુલ આવક</span>
                <span className="text-sm font-extrabold text-emerald-700">₹{reportData.summary.totalBilled}</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-600 block uppercase">કુલ વપરાશ (ખર્ચ)</span>
                <span className="text-sm font-extrabold text-rose-700">₹{reportData.summary.totalExpenses}</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 block uppercase">ચોખ્ખો નફો</span>
                <span className="text-sm font-extrabold text-amber-800">₹{reportData.summary.netProfit}</span>
              </div>
            </div>

            {/* Expense Ratio Progress Indicator */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">વપરાશ / આવક ટકાવારી (Expense Share):</span>
                <span className="text-orange-600">
                  {reportData.summary.totalBilled > 0
                    ? ((reportData.summary.totalExpenses / reportData.summary.totalBilled) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      reportData.summary.totalBilled > 0
                        ? (reportData.summary.totalExpenses / reportData.summary.totalBilled) * 100
                        : 0
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Category Vaprash Items Table */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                વપરાશ વિગતો (Itemized Vaprash Breakdown)
              </h4>

              {Object.keys(reportData.categoryExpenses || {}).length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-3">આ મહિનામાં કોઈ વપરાશ / ખર્ચ નોંધાયેલ નથી.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(reportData.categoryExpenses).map(([cat, amt]) => {
                    const percentage = reportData.summary.totalExpenses > 0
                      ? ((amt / reportData.summary.totalExpenses) * 100).toFixed(1)
                      : 0;
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 capitalize block">{t(cat) || cat}</span>
                          <span className="text-[10px] text-slate-500">{percentage}% of total vaprash</span>
                        </div>
                        <span className="font-extrabold text-rose-600 text-sm">₹{amt}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
