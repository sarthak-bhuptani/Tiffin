import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getMonthlyReport, getCustomReport } from '../services/reportService';
import StatCard from '../components/StatCard';

import { BarChart3, Calendar, IndianRupee, TrendingUp, Receipt, PieChart, Users } from 'lucide-react';

const Reports = () => {
  const { t } = useLanguage();

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchReport();
  }, [year, month]);

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-orange-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('reports')}</h2>
          <p className="text-xs text-slate-500">{t('thisMonth')} {t('netProfit')}</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-1 bg-orange-50 px-2 py-1.5 rounded-xl border border-orange-200">
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

          {/* Expense Category Breakdown */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-orange-600" />
              <span>{t('expenseCategory')} Breakdown</span>
            </h3>

            {Object.keys(reportData.categoryExpenses || {}).length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No expenses recorded for this month.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(reportData.categoryExpenses).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-700 capitalize">{t(cat) || cat}</span>
                    <span className="font-bold text-rose-600">₹{amt}</span>
                  </div>
                ))}
              </div>
            )}
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
        </>
      )}
    </div>
  );
};

export default Reports;
