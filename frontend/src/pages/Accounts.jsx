import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getExpenses, createExpense, deleteExpense } from '../services/expenseService';
import { getPayments, recordPayment, deletePayment } from '../services/paymentService';
import { getCustomers } from '../services/customerService';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

import { Wallet, Receipt, Plus, Trash2, Calendar, IndianRupee, Tag } from 'lucide-react';

const Accounts = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'payments'

  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'expense'|'payment', id: string, name: string }

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'vegetables',
    amount: '',
    note: '',
  });

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'upi',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expList, payList, custLst] = await Promise.all([
        getExpenses(),
        getPayments(),
        getCustomers({ active: true }),
      ]);
      setExpenses(expList);
      setPayments(payList);
      setCustomers(custLst);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount) return;

    try {
      await createExpense({
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
      });
      setIsExpenseModalOpen(false);
      setExpenseForm({
        date: new Date().toISOString().split('T')[0],
        category: 'vegetables',
        amount: '',
        note: '',
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount) return;

    try {
      let cName = paymentForm.customerName;
      if (paymentForm.customerId) {
        const found = customers.find((c) => c._id === paymentForm.customerId);
        if (found) cName = found.name;
      }

      await recordPayment({
        customerId: paymentForm.customerId || null,
        customerName: cName,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes,
      });

      setIsPaymentModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'expense') {
        await deleteExpense(itemToDelete.id);
      } else if (itemToDelete.type === 'payment') {
        await deletePayment(itemToDelete.id);
      }
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('errorOccurred'));
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-4">
      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={itemToDelete?.type === 'expense' ? 'ખર્ચ ડીલીટ કરો' : 'પેમેન્ટ જમા ડીલીટ કરો'}
        message={`શું તમે ચોક્કસ "${itemToDelete?.name || ''}" રેકોર્ડ ને ડેટાબેઝમાંથી કાયમ માટે ડીલીટ કરવા માંગો છો?`}
      />

      {/* Tab Selector */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-1.5 border border-orange-100 shadow-xs">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'expenses' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{t('expenses')}</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'payments' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('payments')}</span>
        </button>
      </div>

      {/* Action Add Button */}
      <div className="flex justify-end">
        {activeTab === 'expenses' ? (
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ {t('addExpense')}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ {t('recordPayment')}</span>
          </button>
        )}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-medium">{t('loading')}</div>
      ) : activeTab === 'expenses' ? (
        expenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">{t('noExpenses')}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {expenses.map((exp) => (
              <div
                key={exp._id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md capitalize">
                      {t(exp.category) || exp.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{exp.date}</span>
                  </div>
                  {exp.note && <p className="text-xs font-medium text-slate-700 mt-1">{exp.note}</p>}
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-rose-600">₹{exp.amount}</span>
                  <button
                    onClick={() => setItemToDelete({ type: 'expense', id: exp._id, name: `${exp.category} (₹${exp.amount})` })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="ડેટાબેઝમાંથી ડીલીટ કરો"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        payments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">No payment logs recorded.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {payments.map((pay) => (
              <div
                key={pay._id}
                className="bg-white rounded-2xl p-3.5 border border-emerald-100 shadow-xs flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{pay.customerName || 'Customer'}</h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    <span>{pay.paymentDate}</span>
                    <span>•</span>
                    <span className="uppercase font-semibold text-emerald-700">{pay.paymentMethod}</span>
                  </div>
                  {pay.notes && <p className="text-xs italic text-slate-500 mt-0.5">"{pay.notes}"</p>}
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-emerald-600">₹{pay.amount}</span>
                  <button
                    onClick={() => setItemToDelete({ type: 'payment', id: pay._id, name: `${pay.customerName || 'Payment'} (₹${pay.amount})` })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="ડેટાબેઝમાંથી ડીલીટ કરો"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={t('addExpense')}>
        <form onSubmit={handleExpenseSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('date')}</label>
              <input
                type="date"
                required
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('expenseCategory')}</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('amount')} (₹)</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 500"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-base font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('notes')}</label>
            <input
              type="text"
              placeholder="e.g. Vegetables purchase"
              value={expenseForm.note}
              onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-600/30 transition active:scale-98"
          >
            {t('save')}
          </button>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={t('recordPayment')}>
        <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('customerName')}</label>
            <select
              value={paymentForm.customerId}
              onChange={(e) => setPaymentForm({ ...paymentForm, customerId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none"
            >
              <option value="">-- Select Regular Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.area})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('amount')} (₹)</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 1500"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('paymentMethod')}</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 transition active:scale-98"
          >
            {t('save')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Accounts;
