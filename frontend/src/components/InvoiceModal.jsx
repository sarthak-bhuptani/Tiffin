import React, { useState } from 'react';
import Modal from './Modal';
import { useLanguage } from '../context/LanguageContext';
import { Printer, Share2, Upload, Download, Loader2 } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, customer, stats, tiffins = [] }) => {
  const { t, language } = useLanguage();
  const [upiId, setUpiId] = useState('9913408222@upi');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
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

  const isGu = language === 'gu';

  const todayStr = new Date().toLocaleDateString(isGu ? 'gu-IN' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const monthStr = new Date().toLocaleDateString(isGu ? 'gu-IN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    try {
      setIsDownloadingPdf(true);
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const safeName = (customer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `Moms_Special_Tiffin_Bill_${safeName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF download error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSendWhatsAppInvoice = () => {
    const text = isGu
      ? `નમસ્તે ${customer.name} જી! 🙏\n\n` +
        `આ આપનું માસિક રસીદ બિલ છે (${monthStr}):\n` +
        `-----------------------------\n` +
        `🍱 આપેલ ટિફિન: *${stats.deliveredCount} નંગ*\n` +
        `💵 દર: *₹${customer.defaultPrice}/ટિફિન*\n` +
        `💰 કુલ રકમ: *₹${stats.totalBilled}*\n` +
        `✅ જમા કરેલ રકમ: *₹${stats.totalPaid}*\n` +
        `🔴 બાકી નીકળતી રકમ: *₹${stats.totalPending}*\n` +
        `-----------------------------\n` +
        `📱 GPay / PhonePe UPI ID: *${upiId}*\n\n` +
        `ધન્યવાદ! 🍱✨`
      : `Hello ${customer.name} Ji! 🙏\n\n` +
        `Monthly Invoice Bill for ${monthStr}:\n` +
        `-----------------------------\n` +
        `🍱 Tiffins Delivered: *${stats.deliveredCount} pcs*\n` +
        `💵 Rate: *₹${customer.defaultPrice}/tiffin*\n` +
        `💰 Total Billed: *₹${stats.totalBilled}*\n` +
        `✅ Amount Paid: *₹${stats.totalPaid}*\n` +
        `🔴 Pending Dues: *₹${stats.totalPending}*\n` +
        `-----------------------------\n` +
        `📱 GPay / PhonePe UPI ID: *${upiId}*\n\n` +
        `Thank you! 🍱✨`;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isGu ? '🧾 ડિજિટલ માસિક બિલ (Invoice Receipt)' : '🧾 Monthly Digital Invoice Receipt'}
    >
      <div className="space-y-4 font-sans">
        {/* Printable Receipt Card */}
        <div id="printable-invoice" className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-orange-600 uppercase tracking-wide">
                🍱 {t('businessName') || "Mom's Special Tiffin Service"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {t('appSubtitle') || 'Hygienic & Delicious Home Cooked Meals'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                {isGu ? 'તારીખ' : 'Date'}
              </span>
              <span className="text-xs font-bold text-slate-700">{todayStr}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-orange-50/60 rounded-2xl p-3 border border-orange-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-orange-800 uppercase block">
                {isGu ? 'ગ્રાહકનું નામ' : 'Customer Name'}
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">{customer.name}</h4>
              <p className="text-slate-500 font-medium mt-0.5">{customer.area} • {customer.phone || 'No phone'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-orange-800 uppercase block">
                {isGu ? 'મહિનો' : 'Month'}
              </span>
              <span className="font-extrabold text-slate-800">{monthStr}</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-100/80 px-3 py-2 grid grid-cols-3 font-extrabold text-slate-700 text-[11px]">
              <span>{isGu ? 'વિગત' : 'Particulars'}</span>
              <span className="text-center">{isGu ? 'ટિફિન નંગ' : 'Tiffins'}</span>
              <span className="text-right">{isGu ? 'રકમ' : 'Amount'}</span>
            </div>

            <div className="p-3 space-y-2">
              <div className="grid grid-cols-3 items-center">
                <div>
                  <span className="font-bold text-slate-800 block">{isGu ? 'ટિફિન હિસાબ' : 'Tiffin Bill'}</span>
                  <span className="text-[10px] text-slate-500">₹{customer.defaultPrice} / {isGu ? 'ટિફિન' : 'tiffin'}</span>
                </div>
                <span className="text-center font-semibold text-slate-700">{stats.deliveredCount}</span>
                <span className="text-right font-bold text-slate-900">₹{stats.totalBilled}</span>
              </div>

              <div className="grid grid-cols-3 items-center pt-2 text-rose-600 border-t border-slate-50">
                <span className="font-medium">{isGu ? 'કેન્સલ / બંધ ટિફિન' : 'Skipped Tiffins'}</span>
                <span className="text-center font-semibold">{stats.skippedCount}</span>
                <span className="text-right font-bold">₹0</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="bg-orange-50/80 p-3 grid grid-cols-2 items-center border-t border-orange-100 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">
                  {isGu ? 'કુલ હિસાબ:' : 'Total Billed:'}
                </span>
                <span className="text-emerald-700 font-semibold">
                  {isGu ? 'જમા કરેલ રકમ: ' : 'Total Paid: '}₹{stats.totalPaid}
                </span>
              </div>
              <div className="text-right">
                {stats.totalPaid > stats.totalBilled ? (
                  <>
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">
                      {isGu ? '🟢 એડવાન્સ જમા' : '🟢 Advance Credit'}
                    </span>
                    <span className="text-lg font-extrabold text-emerald-800">
                      +₹{stats.totalPaid - stats.totalBilled}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-rose-600 uppercase block">
                      {isGu ? 'બાકી નીકળતી રકમ' : 'Pending Dues'}
                    </span>
                    <span className="text-lg font-extrabold text-rose-700">₹{stats.totalPending}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* UPI Scan QR Code Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-3.5 border border-emerald-200 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-emerald-800 block">
                📲 {isGu ? 'GPay / PhonePe સ્કેનર' : 'GPay / PhonePe QR Scanner'}
              </span>
              <p className="text-[10px] text-emerald-700 font-semibold">UPI ID: {upiId}</p>
              <p className="text-[10px] text-slate-500">
                {isGu ? 'સ્કેનર વડે સીધું પેમેન્ટ કરી શકો છો.' : 'Scan to pay directly.'}
              </p>

              {/* Upload Custom QR Standee Button */}
              <label className="inline-flex items-center space-x-1 mt-1 text-[10px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-300 cursor-pointer hover:bg-emerald-100 transition shadow-xs">
                <Upload className="w-3 h-3" />
                <span>{isGu ? '📷 QR સ્કેનર ફોટો અપલોડ કરો' : '📷 Upload QR Scanner Photo'}</span>
                <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
              </label>
            </div>

            <div className="w-24 h-24 bg-white p-1 rounded-xl border border-emerald-300 shrink-0 shadow-xs flex flex-col items-center justify-center">
              <img src={finalQrImg} alt="UPI Payment QR Code Standee" className="w-full h-full object-contain rounded-lg" />
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-[10px] text-slate-400 text-center italic">
            {isGu
              ? 'આપના સાથ સહકાર બદલ ધન્યવાદ! 🙏 (Thank you for your business!)'
              : 'Thank you for your business! 🙏'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            disabled={isDownloadingPdf}
            onClick={handleDownloadPdf}
            className="py-2.5 px-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md shadow-orange-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{isGu ? '📥 PDF' : '📥 Download'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-xs transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isGu ? '🖨️ પ્રિન્ટ' : '🖨️ Print'}</span>
          </button>

          <button
            type="button"
            onClick={handleSendWhatsAppInvoice}
            className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/30 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isGu ? '💬 WhatsApp' : '💬 Send'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
