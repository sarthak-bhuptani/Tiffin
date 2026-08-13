import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Printer, Share2, Download, Upload, Image as ImageIcon } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, customer, stats, tiffins = [] }) => {
  const [upiId, setUpiId] = useState('9913408222@upi');
  const [customQrImg, setCustomQrImg] = useState(() => {
    return localStorage.getItem('tiffin_custom_qr_code') || '';
  });

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Img = reader.result;
        setCustomQrImg(base64Img);
        localStorage.setItem('tiffin_custom_qr_code', base64Img);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!customer || !stats) return null;

  const todayStr = new Date().toLocaleDateString('gu-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const monthStr = new Date().toLocaleDateString('gu-IN', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppInvoice = () => {
    const text =
      `નમસ્તે ${customer.name} જી! 🙏\n\n` +
      `આ આપનું મહિનાનું રસીદ બિલ છે (${monthStr}):\n` +
      `-----------------------------\n` +
      `🍱 આપેલ ટિફિન: *${stats.deliveredCount} નંગ*\n` +
      `💵 દર: *₹${customer.defaultPrice}/ટિફિન*\n` +
      `💰 કુલ રકમ: *₹${stats.totalBilled}*\n` +
      `✅ જમા કરેલ રકમ: *₹${stats.totalPaid}*\n` +
      `🔴 બાકી નીકળતી રકમ: *₹${stats.totalPending}*\n` +
      `-----------------------------\n` +
      `📱 GPay / PhonePe UPI ID: *${upiId}*\n\n` +
      `ધન્યવાદ! 🍱✨`;

    const rawPhone = customer.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    let url = '';
    if (cleanPhone.length >= 10) {
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const generatedQrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(customer.name)}&am=${stats.totalPending}&cu=INR`
  )}`;

  const finalQrImg = customQrImg || generatedQrCodeImg;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧾 ડિજિટલ માસિક બિલ (Invoice Receipt)">
      <div className="space-y-4 font-sans">
        {/* Printable Receipt Card */}
        <div id="printable-invoice" className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-orange-600 uppercase tracking-wide">
                🍱 શ્રીનાથજી ટિફિન સર્વિસ
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">ઘર જેવું ચોખ્ખું અને સ્વાદિષ્ટ ભોજન</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">તારીખ</span>
              <span className="text-xs font-bold text-slate-700">{todayStr}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-orange-50/60 rounded-2xl p-3 border border-orange-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-orange-800 uppercase block">ગ્રાહકનું નામ</span>
              <h4 className="font-extrabold text-slate-900 text-sm">{customer.name}</h4>
              <p className="text-slate-500 font-medium mt-0.5">{customer.area} • {customer.phone || 'No phone'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-orange-800 uppercase block">મહિનો</span>
              <span className="font-extrabold text-slate-800">{monthStr}</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-100/80 px-3 py-2 grid grid-cols-3 font-extrabold text-slate-700 text-[11px]">
              <span>વિગત</span>
              <span className="text-center">ટિફિન નંગ</span>
              <span className="text-right">રકમ</span>
            </div>

            <div className="p-3 space-y-2">
              <div className="grid grid-cols-3 items-center">
                <div>
                  <span className="font-bold text-slate-800 block">ટિફિન હિસાબ</span>
                  <span className="text-[10px] text-slate-500">₹{customer.defaultPrice} / ટિફિન</span>
                </div>
                <span className="text-center font-semibold text-slate-700">{stats.deliveredCount}</span>
                <span className="text-right font-bold text-slate-900">₹{stats.totalBilled}</span>
              </div>

              <div className="grid grid-cols-3 items-center pt-2 text-rose-600 border-t border-slate-50">
                <span className="font-medium">કેન્સલ / બંધ ટિફિન</span>
                <span className="text-center font-semibold">{stats.skippedCount}</span>
                <span className="text-right font-bold">₹0</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="bg-orange-50/80 p-3 grid grid-cols-2 items-center border-t border-orange-100 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">કુલ હિસાબ (Total Billed):</span>
                <span className="text-emerald-700 font-semibold">જમા કરેલ રકમ (Paid): ₹{stats.totalPaid}</span>
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
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-3.5 border border-emerald-200 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-emerald-800 block">📲 GPay / PhonePe સ્કેનર</span>
              <p className="text-[10px] text-emerald-700 font-semibold">UPI ID: {upiId}</p>
              <p className="text-[10px] text-slate-500">સ્કેનર વડે સીધું પેમેન્ટ કરી શકો છો.</p>

              {/* Upload Custom QR Standee Button */}
              <label className="inline-flex items-center space-x-1 mt-1 text-[10px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-300 cursor-pointer hover:bg-emerald-100 transition shadow-xs">
                <Upload className="w-3 h-3" />
                <span>📷 તમારો QR સ્કેનર ફોટો અપલોડ કરો</span>
                <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
              </label>
            </div>

            <div className="w-24 h-24 bg-white p-1 rounded-xl border border-emerald-300 shrink-0 shadow-xs flex flex-col items-center justify-center">
              <img src={finalQrImg} alt="UPI Payment QR Code Standee" className="w-full h-full object-contain rounded-lg" />
            </div>
          </div>

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
            onClick={handleSendWhatsAppInvoice}
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
