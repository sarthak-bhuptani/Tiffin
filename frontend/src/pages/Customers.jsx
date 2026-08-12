import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCustomers, createCustomer, deleteCustomer } from '../services/customerService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

import { Users, Plus, Search, Phone, MapPin, ChevronRight, Trash2, MessageCircle, Share2 } from 'lucide-react';

const Customers = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active'
  const [toastMessage, setToastMessage] = useState('');

  // WhatsApp modal state
  const [whatsAppCustomer, setWhatsAppCustomer] = useState(null);

  // Delete modal state
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    area: 'Sector 6',
    defaultQuantity: 1,
    defaultPrice: 60,
    planType: 'daily',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomersList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'active') params.active = true;
      if (searchQuery) params.search = searchQuery;

      const list = await getCustomers(params);
      setCustomers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersList();
  }, [activeTab]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      await createCustomer(formData);
      setIsAddModalOpen(false);
      setToastMessage('✅ ગ્રાહક સફળતાપૂર્વક ઉમેરાયો! (Customer Added Successfully!)');
      setFormData({
        name: '',
        phone: '',
        address: '',
        area: 'Sector 6',
        defaultQuantity: 1,
        defaultPrice: 60,
        planType: 'daily',
        notes: '',
      });
      fetchCustomersList();
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomer(customerToDelete._id);
      setToastMessage('✅ ગ્રાહક કાયમ માટે ડીલીટ થયો! (Customer Deleted Permanently!)');
      setCustomers((prev) => prev.filter((c) => c._id !== customerToDelete._id));
      setCustomerToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    }
  };

  const getWhatsAppMessage = (cust) => {
    if (!cust) return '';
    const todayStr = new Date().toLocaleDateString('gu-IN', { month: 'long', year: 'numeric' });
    return (
      `આ મહિનાનો (${todayStr}) ટિફિનનો હિસાબ:\n` +
      `🍱 ટિફિન પ્લાન: *${cust.defaultQuantity} નંગ (₹${cust.defaultPrice}/ટિફિન)*\n` +
      `📍 એરિયા: *${cust.area}*\n\n` +
      `📱 GPay / PhonePe / UPI દ્વારા ચુકવણી કરી શકો છો.\n` +
      `Thank YOu! 🍱✨`
    );
  };

  const handleSendWhatsApp = () => {
    if (!whatsAppCustomer) return;
    const message = getWhatsAppMessage(whatsAppCustomer);
    const rawPhone = whatsAppCustomer.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    let url = '';
    if (cleanPhone.length >= 10) {
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    }

    window.open(url, '_blank');
    setWhatsAppCustomer(null);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-4">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('regularCustomers')}</h2>
          <p className="text-xs text-slate-500">{customers.length} {t('customers')}</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>+ {t('addNewCustomer')}</span>
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white rounded-2xl p-3 border border-orange-100 shadow-xs space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('searchCustomer')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomersList()}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center space-x-2 pt-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'all' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'active' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t('active')}
          </button>
        </div>
      </div>

      {/* Customer List Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-medium">{t('loading')}</div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">{t('noCustomers')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {customers.map((cust) => (
            <div
              key={cust._id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-orange-300 transition shadow-xs flex items-center justify-between"
            >
              <div
                onClick={() => navigate(`/customers/${cust._id}`)}
                className="space-y-1 flex-1 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm">{cust.name}</h3>
                  {cust.active ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {t('active')}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {t('inactive')}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  {cust.phone && (
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{cust.phone}</span>
                    </span>
                  )}

                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{cust.area}</span>
                  </span>
                </div>

                <p className="text-xs text-orange-600 font-semibold">
                  Default: {cust.defaultQuantity} × ₹{cust.defaultPrice} ({cust.planType})
                </p>
              </div>

              <div className="flex items-center space-x-1">
                {/* 1-Tap WhatsApp Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setWhatsAppCustomer(cust);
                  }}
                  className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition active:scale-95"
                  title="Send WhatsApp Bill"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomerToDelete(cust);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                  title="Delete Customer Permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight
                  className="w-5 h-5 text-slate-300 cursor-pointer"
                  onClick={() => navigate(`/customers/${cust._id}`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Modal */}
      <Modal isOpen={Boolean(whatsAppCustomer)} onClose={() => setWhatsAppCustomer(null)} title="💬 WhatsApp મેસેજ">
        <div className="space-y-4">
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed shadow-xs">
            {getWhatsAppMessage(whatsAppCustomer)}
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
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="ગ્રાહક ડીલીટ કરો (Delete Customer)"
        message={`શું તમે ચોક્કસ ગ્રાહક "${customerToDelete?.name}" ને કાયમ માટે ડીલીટ કરવા માંગો છો?`}
      />

      {/* Add Customer Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('addNewCustomer')}>
        <form onSubmit={handleAddSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('customerName')} *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('phone')}</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('area')}</label>
              <input
                type="text"
                placeholder="Sector 6"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('defaultQuantity')}</label>
              <input
                type="number"
                min="1"
                value={formData.defaultQuantity}
                onChange={(e) => setFormData({ ...formData, defaultQuantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-2 py-2 rounded-xl border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('defaultPrice')}</label>
              <input
                type="number"
                min="0"
                value={formData.defaultPrice}
                onChange={(e) => setFormData({ ...formData, defaultPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-2 rounded-xl border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('planType')}</label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="daily">{t('daily')}</option>
                <option value="monthly">{t('monthly')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('address')}</label>
            <input
              type="text"
              placeholder="House 12, Block A"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-600/30 transition active:scale-98"
          >
            {submitting ? t('loading') : t('save')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
