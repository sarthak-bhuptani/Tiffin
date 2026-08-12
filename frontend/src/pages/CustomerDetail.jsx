import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCustomerById, deleteCustomer } from '../services/customerService';
import { recordPayment } from '../services/paymentService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import CustomerCalendar from '../components/CustomerCalendar';

import {
  ArrowLeft,
  Phone,
  MapPin,
  Plus,
  Trash2,
  MessageCircle,
  Share2,
} from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'upi',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // WhatsApp Bill Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const res = await getCustomerById(id);
      setData(res);
      if (res.stats) {
        setPaymentForm((prev) => ({
          ...prev,
          amount: res.stats.totalPending || '',
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) return;

    try {
      setPaymentSubmitting(true);
      await recordPayment({
        customerId: id,
        customerName: data.customer.name,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes,
      });

      setIsPaymentModalOpen(false);
      setToastMessage('✅ પેમેન્ટ સફળતાપૂર્વક જમા થયું!');
      fetchCustomerDetails();
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleDeleteCustomerConfirm = async () => {
    try {
      await deleteCustomer(id);
      setToastMessage('✅ ગ્રાહક સફળતાપૂર્વક ડીલીટ થયો!');
      setTimeout(() => navigate('/customers'), 1000);
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    }
  };

  // Generate Gujarati WhatsApp Bill Message
  const getWhatsAppBillMessage = () => {
    if (!data || !data.customer || !data.stats) return '';
    const { customer, stats } = data;
    const todayStr = new Date().toLocaleDateString('gu-IN', { month: 'long', year: 'numeric' });

    return (
      `નમસ્તે ${customer.name} જી! 🙏\n\n` +
      `આ મહિનાનો (${todayStr}) ટિફિનનો હિસાબ:\n` +
      `🍱 આપેલ ટિફિન: *${stats.deliveredCount} નંગ*\n` +
      `💵 ટિફિન ભાવ: *₹${customer.defaultPrice}/ટિફિન*\n` +
      `💰 કુલ હિસાબ: *₹${stats.totalBilled}*\n` +
      `✅ જમા કરેલ રકમ: *₹${stats.totalPaid}*\n` +
      `🔴 બાકી નીકળતી રકમ: *₹${stats.totalPending}*\n\n` +
      `📱 GPay / PhonePe / UPI દ્વારા ચુકવણી કરી શકો છો.\n` +
      `ધન્યવાદ! 🍱✨`
    );
  };

  const handleSendWhatsApp = () => {
    const message = getWhatsAppBillMessage();
    const rawPhone = data?.customer?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    let url = '';
    if (cleanPhone.length >= 10) {
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    }

    window.open(url, '_blank');
    setIsWhatsAppModalOpen(false);
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-400 text-sm font-medium">{t('loading')}</div>;
  }

  if (!data || !data.customer) {
    return <div className="py-24 text-center text-slate-400 text-sm font-medium">{t('noCustomers')}</div>;
  }

  const { customer, stats, tiffins } = data;

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-4">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>પાછા જાઓ (Back to Customers)</span>
        </button>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>ડીલીટ કરો (Delete Customer)</span>
        </button>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-orange-600/30">
              {customer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{customer.name}</h2>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                {customer.phone && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.phone}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.area}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 1-Tap WhatsApp Bill Button */}
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/30 transition active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>💬 WhatsApp બિલ</span>
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>{t('recordPayment')}</span>
            </button>
          </div>
        </div>

        {/* Plan summary badge */}
        <div className="p-2.5 rounded-xl bg-orange-50/60 text-xs font-medium text-orange-800 flex items-center justify-between">
          <span>{t('defaultPrice')}: {customer.defaultQuantity} × ₹{customer.defaultPrice} ({customer.planType})</span>
          {customer.notes && <span className="italic text-slate-500 text-[11px]">"{customer.notes}"</span>}
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('totalBilled')}</span>
          <span className="text-base font-bold text-slate-900">₹{stats.totalBilled}</span>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-center">
          <span className="text-[10px] font-bold uppercase text-emerald-600 block">{t('totalPaid')}</span>
          <span className="text-base font-bold text-emerald-800">₹{stats.totalPaid}</span>
        </div>

        <div className="bg-rose-50 rounded-2xl p-3 border border-rose-200 text-center">
          <span className="text-[10px] font-bold uppercase text-rose-600 block">{t('totalPending')}</span>
          <span className="text-base font-bold text-rose-800">₹{stats.totalPending}</span>
        </div>
      </div>

      {/* 31-Day Visual Tiffin Attendance Calendar */}
      <CustomerCalendar tiffins={tiffins} />

      {/* Customer Tiffin History List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">{t('customerHistory')}</h3>
          <span className="text-xs font-semibold text-slate-500">
            {stats.deliveredCount} Delivered | {stats.skippedCount} Skipped
          </span>
        </div>

        {tiffins.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">{t('noEntries')}</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {tiffins.map((item) => (
              <div
                key={item._id}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{item.date}</span>
                  {item.status === 'delivered' ? (
                    <p className="text-slate-600 mt-0.5">
                      {item.quantity} Tiffin • ₹{item.totalAmount}
                    </p>
                  ) : (
                    <p className="text-amber-700 font-semibold mt-0.5">
                      ✕ {t('skipped')} {item.skipReason ? `(${item.skipReason})` : ''}
                    </p>
                  )}
                </div>

                <div>
                  {item.status === 'delivered' && (
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        item.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.paymentStatus === 'PAID' ? t('paid') : t('pending')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Bill Preview Modal */}
      <Modal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} title="💬 WhatsApp બિલ મેસેજ">
        <div className="space-y-4">
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed shadow-xs">
            {getWhatsAppBillMessage()}
          </div>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp ખોલો અને મેસેજ મોકલો (Open WhatsApp & Send)</span>
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Popup */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCustomerConfirm}
        title="ગ્રાહક ડીલીટ કરો (Delete Customer)"
        message={`શું તમે ચોક્કસ ગ્રાહક "${customer.name}" ને કાયમ માટે ડીલીટ કરવા માંગો છો?`}
      />

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={t('recordPayment')}>
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('amount')} (₹)</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 600"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('paymentMethod')}</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="upi">{t('upi')}</option>
                <option value="cash">{t('cash')}</option>
                <option value="bank_transfer">{t('bankTransfer')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('date')}</label>
              <input
                type="date"
                required
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('notes')}</label>
            <input
              type="text"
              placeholder="e.g. Received via GPay"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={paymentSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 transition active:scale-98"
          >
            {paymentSubmitting ? t('loading') : t('save')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDetail;
