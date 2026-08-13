import React, { useRef } from 'react';
import Modal from './Modal';
import { Printer, Share2, Download, CheckCircle2, Utensils } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, customer, stats, tiffins = [] }) => {
  const invoiceRef = useRef(null);

  if (!customer || !stats) return null;

  const monthYearStr = new Date().toLocaleDateString('gu-IN', { month: 'long', year: 'numeric' });
  const invoiceNo = `TFN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${customer._id?.slice(-4).toUpperCase() || '1001'}`;

  // Generate UPI QR Code URL for GPay / PhonePe / Paytm
  const upiId = '9913408222@upi';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent('Tiffin Service')}&am=${stats.totalPending}&cu=INR`;
  const qrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text =
      `🧾 *ટિફિન બિલ પહોંચ (Monthly Invoice)*\n` +
      `📌 બિલ નં: *${invoiceNo}*\n` +
      `👤 ગ્રાહક: *${customer.name}*\n` +
      `📅 મહિનો: *${monthYearStr}*\n\n` +
      `🍱 આપેલ ટિફિન: *${stats.deliveredCount}*\n` +
      `💵 ભાવ: *₹${customer.defaultPrice}/ટિફિન*\n` +
      `💰 કુલ હિસાબ: *₹${stats.totalBilled}*\n` +
      `✅ જમા કરેલ: *₹${stats.totalPaid}*\n` +
      `🔴 બાકી નીકળતી રકમ: *₹${stats.totalPending}*\n\n` +
      `📱 UPI ID: *${upiId}*\n` +
      `GPay / PhonePe પર ચુકવણી કરી શકો છો. ધન્યવાદ! 🍱✨`;

    const rawPhone = customer.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = formattedPhone ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧾 ડિજિટલ બિલ રસીદ (Monthly Bill Invoice)">
      <div className="space-y-4">
        {/* Printable Bill Container */}
        <div
          ref={invoiceRef}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 font-sans text-slate-800 print:border-none print:shadow-none"
        >
          {/* Invoice Header */}
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-600/30">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base leading-tight">ટિફિન સર્વિસ (Tiffin Service)</h3>
                <p className="text-[11px] text-orange-600 font-semibold">મેનેજર મંથલી રસીદ (Monthly Invoice)</p>
              </div>
            </div>

            <div className="text-right text-[11px]">
              <span className="font-bold text-slate-900 block">{invoiceNo}</span>
              <span className="text-slate-500">{monthYearStr}</span>
            </div>
          </div>

          {/* Customer Info Box */}
          <div className="bg-orange-50/60 rounded-2xl p-3.5 border border-orange-100 flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-600 block">ગ્રાહકની વિગત (Customer Details)</span>
              <p className="font-extrabold text-slate-900 text-sm">{customer.name}</p>
              <p className="text-slate-600 mt-0.5">{customer.area} {customer.phone ? `• ${customer.phone}` : ''}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">પ્લાન (Plan)</span>
              <span className="font-bold text-slate-800 uppercase">{customer.planType || 'daily'}</span>
            </div>
          </div>

          {/* Billing Breakdown Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-50 p-2.5 font-bold text-slate-700 grid grid-cols-3 border-b border-slate-100 text-[11px]">
              <span>વિગત (Item)</span>
              <span className="text-center">નંગ (Qty)</span>
              <span className="text-right">રકમ (Amount)</span>
            </div>

            <div className="p-3 divide-y divide-slate-100 space-y-2">
              <div className="grid grid-cols-3 items-center">
                <div>
                  <span className="font-bold text-slate-900 block">ટિફિન સર્વિસ</span>
                  <span className="text-[10px] text-slate-500">₹{customer.defaultPrice} / ટિફિન</span>
                </div>
                <span className="text-center font-semibold text-slate-700">{stats.deliveredCount}</span>
                <span className="text-right font-bold text-slate-900">₹{stats.totalBilled}</span>
              </div>

              <div className="grid grid-cols-3 items-center pt-2 text-rose-600">
                <span className="font-medium">કેન્સલ / બંધ ટિફિન</span>
                <span className="text-center font-semibold">{stats.skippedCount}</span>
                <span className="text-right font-bold">₹0</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="bg-orange-50/80 p-3 grid grid-cols-2 items-center border-t border-orange-100 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">કુલ હિસાબ (Total Billed):</span>
                <span className="text-emerald-700 font-semibold">જમા રકમ (Paid): ₹{stats.totalPaid}</span>
              </div>
              <div className="text-right">
                {stats.totalPaid > stats.totalBilled ? (
                  <>
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">🟢 એડવાન્સ જમા (Advance)</span>
                    <span className="text-lg font-extrabold text-emerald-800">+₹{stats.totalPaid - stats.totalBilled}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-rose-600 uppercase block">બાકી નીકળતી રકમ (Pending)</span>
                    <span className="text-lg font-extrabold text-rose-700">₹{stats.totalPending}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* UPI Scan QR Code Section */}
          {stats.totalPending > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-3.5 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 block">📲 Scan to Pay via GPay / PhonePe</span>
                <p className="text-[10px] text-emerald-700 font-semibold">UPI ID: {upiId}</p>
                <p className="text-[10px] text-slate-500">QR કોડ સ્કેન કરીને રૂ. {stats.totalPending} ચૂકવો.</p>
              </div>

              <div className="w-20 h-20 bg-white p-1 rounded-xl border border-emerald-300 shrink-0 shadow-xs">
                <img src={qrCodeImg} alt="UPI Payment QR Code" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Footer Note */}
          <p className="text-[10px] text-slate-400 text-center italic">
            આપના સાથ સહકાર બદલ ધન્યવાદ! 🙏 (Thank you for your business!)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>પ્રિન્ટ / PDF ડાઉનલોડ</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/30 transition active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp પર મોકલો</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
