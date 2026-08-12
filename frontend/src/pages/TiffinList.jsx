import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTiffins, updateTiffin, deleteTiffin } from '../services/tiffinService';
import { Utensils, Calendar, Search, Filter, CheckCircle2, XCircle, Trash2, IndianRupee } from 'lucide-react';

const TiffinList = () => {
  const { t } = useLanguage();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = { date };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (searchQuery) params.search = searchQuery;

      const list = await getTiffins(params);
      setTiffins(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [date, statusFilter, paymentFilter]);

  const handleTogglePayment = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
      await updateTiffin(id, { paymentStatus: nextStatus });
      fetchList();
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tiffin record?')) return;
    try {
      await deleteTiffin(id);
      fetchList();
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">{t('viewTodaysList')}</h2>

          <div className="flex items-center space-x-1.5 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
            <Calendar className="w-4 h-4 text-orange-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="relative col-span-2 sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('searchCustomer')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchList()}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-2 rounded-xl border border-slate-200 font-medium text-slate-700 bg-white"
          >
            <option value="">{t('filterStatus')}: All</option>
            <option value="delivered">{t('delivered')}</option>
            <option value="skipped">{t('skipped')}</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs py-2 px-2 rounded-xl border border-slate-200 font-medium text-slate-700 bg-white"
          >
            <option value="">{t('paymentStatus')}: All</option>
            <option value="PAID">{t('paid')}</option>
            <option value="PENDING">{t('pending')}</option>
          </select>
        </div>
      </div>

      {/* Tiffin Cards List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-medium">{t('loading')}</div>
      ) : tiffins.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">{t('noEntries')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tiffins.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl p-3.5 border transition shadow-xs flex items-center justify-between ${
                item.status === 'skipped'
                  ? 'border-amber-200 bg-amber-50/20'
                  : item.paymentStatus === 'PAID'
                  ? 'border-emerald-200'
                  : 'border-rose-200'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm">{item.customerName}</h4>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.area}
                  </span>
                </div>

                <div className="mt-1 flex items-center space-x-3 text-xs text-slate-600">
                  {item.status === 'delivered' ? (
                    <>
                      <span>
                        {item.quantity} × ₹{item.unitPrice} = <strong className="text-slate-900">₹{item.totalAmount}</strong>
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-700 font-semibold">
                      ✕ {t('skipped')} {item.skipReason ? `(${item.skipReason})` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Action Badge */}
              <div className="flex items-center space-x-2">
                {item.status === 'delivered' && (
                  <button
                    onClick={() => handleTogglePayment(item._id, item.paymentStatus)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition ${
                      item.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    {item.paymentStatus === 'PAID' ? `✓ ${t('paid')}` : `! ${t('pending')}`}
                  </button>
                )}

                <button onClick={() => handleDelete(item._id)} className="p-1 text-slate-300 hover:text-rose-600 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TiffinList;
