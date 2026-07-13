
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useLedgerStore } from '../store/useLedgerStore';
import { ArrowLeft, PlusCircle, Calendar, FileText, QrCode, Download, CreditCard, Loader2 } from 'lucide-react';

export default function CustomerProfile() {
  const { id } = useParams();
  const location = useLocation();
  const passedCustomer = location.state?.customer;

  const { 
    currentCustomerTransactions, 
    fetchTransactionHistory, 
    addTransaction, 
    dashboardStats, 
    fetchDashboardStats 
  } = useLedgerStore();

  const [showQR, setShowQR] = useState(false);
  const [activeChannel, setActiveChannel] = useState('esewa'); 
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: { amount: '', description: '' }
  });

  const paymentMethodsConfig = {
    esewa: {
      name: 'eSewa',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp'
    },
    khalti: {
      name: 'Khalti',
      logo: 'https://p7.hiclipart.com/preview/216/915/634/khalti-digital-wallet-payment-gateway-fonepay-nepal-digital-wallet.jpg'
    },
    bank: {
      name: 'Bank Transfer',
      logo: 'bank-icon'
    }
  };

  useEffect(() => {
    fetchTransactionHistory(id);
    if (!dashboardStats) fetchDashboardStats();
  }, [id, fetchTransactionHistory, dashboardStats, fetchDashboardStats]);

  // Guarded against double submission: the button is disabled while isSubmitting
  // is true, and we bail out early here as well in case the handler somehow
  // fires again before React re-renders the disabled state.
  const onSubmitTransaction = async (values) => {
    if (isSubmitting) return;
    setFeedbackMsg('');

    const payload = {
      customerId: id,
      type: 'CREDIT', // Always defaults strictly to credit logs
      amount: parseFloat(values.amount),
      description: values.description
    };

    const res = await addTransaction(payload);
    if (res.success) {
      setFeedbackMsg('Credit logged successfully! Email receipt sent.');
      reset();
    } else {
      setFeedbackMsg(`Error: ${res.error}`);
    }
  };

  const handleDownloadReceipt = (tx) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt-${tx._id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #334155; }
            .receipt-card { max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; }
            .header { text-align: center; border-b: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
            .shop-title { font-size: 24px; font-weight: bold; color: #4f46e5; margin: 0; }
            .meta-row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
            .label { color: #64748b; font-weight: 500; }
            .value { font-weight: 600; color: #0f172a; }
            .amount-box { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin-top: 25px; font-size: 20px; font-weight: bold; }
            .credit-text { color: #dc2626; border: 1px solid #fca5a5; }
            .payment-text { color: #16a34a; border: 1px solid #86efac; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <h1 class="shop-title">${dashboardStats?.shopName || 'Pasal Khata'}</h1>
              <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">Official Transaction Statement Document</p>
            </div>
            
            <div class="meta-row">
              <span class="label">Customer Name:</span>
              <span class="value">${passedCustomer?.name || 'Valued Client'}</span>
            </div>
            <div class="meta-row">
              <span class="label">Account Email:</span>
              <span class="value">${passedCustomer?.email || 'N/A'}</span>
            </div>
            <div class="meta-row">
              <span class="label">Date & Time:</span>
              <span class="value">${new Date(tx.date).toLocaleString()}</span>
            </div>
            <div class="meta-row">
              <span class="label">Transaction Reference:</span>
              <span class="value" style="font-family: monospace; font-size: 12px;">#${tx._id}</span>
            </div>
            
            <div style="margin-top: 20px; border-top: 1px solid #f1f5f9; pt: 15px;">
              <p class="label" style="margin-bottom: 4px; font-size: 12px;">Itemization / Log Entry Details:</p>
              <p class="value" style="font-size: 15px; margin: 0; line-height: 1.4;">${tx.description}</p>
            </div>

            <div class="amount-box ${tx.type === 'CREDIT' ? 'credit-text' : 'payment-text'}">
              ${tx.type === 'CREDIT' ? 'CREDIT BALANCED' : 'PAYMENT RECEIVED'}: Rs. ${tx.amount?.toFixed(2)}
            </div>

            <div class="footer">
              Thank you for your business! For any issues, please reach out to ${dashboardStats?.sellerEmail || 'the vendor'}.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </Link>

        <button 
          onClick={() => setShowQR(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition"
        >
          <QrCode className="h-4 w-4" />
          <span>Show Payment QR</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{passedCustomer?.name || 'Customer Profile'}</h2>
          <p className="text-sm text-slate-500">{passedCustomer?.email} • {passedCustomer?.phone || 'No phone number'}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
          <p className="text-2xl font-black text-rose-600">
            Rs. {passedCustomer?.totalCredit?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LOG NEW ENTRY FORM */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Log New Entry</h3>
          
          {feedbackMsg && (
            <div className="p-3 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium">
              {feedbackMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitTransaction)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Transaction Type</label>
              <div className="w-full py-2 px-3 rounded-lg text-xs font-bold border bg-rose-50 border-rose-300 text-rose-700 inline-flex items-center gap-1.5 select-none">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Give Credit</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (Rs.)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="Enter transaction value"
                {...register('amount', { required: true, min: 0.01 })}
                className="w-full p-2 text-sm bg-slate-50 border rounded-lg focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description / Bought Goods</label>
              <textarea 
                rows="3"
                placeholder="e.g., Bought 5kg Sugar"
                {...register('description', { required: true })}
                className="w-full p-2 text-sm bg-slate-50 border rounded-lg focus:outline-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Process Entry</span>
              )}
            </button>
          </form>
        </div>

        {/* ACCOUNT STATEMENT */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Account Statement</h3>
          </div>

          {currentCustomerTransactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No transactions recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentCustomerTransactions.map((tx) => (
                <div key={tx._id} className="p-4 flex items-center justify-between gap-4 text-sm hover:bg-slate-50/50 transition">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${tx.type === 'CREDIT' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{tx.description}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(tx.date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`font-bold ${tx.type === 'CREDIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'} Rs. {tx.amount?.toFixed(2)}
                    </div>
                    
                    <button 
                      onClick={() => handleDownloadReceipt(tx)}
                      title="Download PDF Receipt"
                      className="p-1.5 bg-slate-50 border text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* PAYMENT SETTLEMENT MODAL */}
      {showQR && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl border shadow-xl text-center space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Shop Settlement Portals</h3>

            <div className="grid grid-cols-3 gap-1.5">
              {Object.keys(paymentMethodsConfig).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveChannel(key)}
                  className={`p-2 rounded-xl text-center border text-[11px] font-bold transition flex flex-col items-center justify-center gap-1.5 ${
                    activeChannel === key
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {paymentMethodsConfig[key].logo === 'bank-icon' ? (
                    <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  ) : (
                    <img
                      src={paymentMethodsConfig[key].logo}
                      alt={paymentMethodsConfig[key].name}
                      className="w-7 h-7 object-contain rounded-full bg-white p-0.5 border border-slate-100"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span>{paymentMethodsConfig[key].name}</span>
                </button>
              ))}
            </div>

            {dashboardStats?.paymentChannels?.[activeChannel]?.qrCodeUrl ? (
              <img
                src={dashboardStats.paymentChannels[activeChannel].qrCodeUrl}
                alt={`${paymentMethodsConfig[activeChannel].name} QR`}
                className="w-48 h-48 mx-auto object-contain border p-2 rounded-xl bg-white"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-slate-100 border border-dashed rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                No QR uploaded for {paymentMethodsConfig[activeChannel].name}
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl border text-xs text-slate-600 text-left font-medium leading-relaxed whitespace-pre-wrap">
              {dashboardStats?.paymentChannels?.[activeChannel]?.details || 'No payment directions configured.'}
            </div>

            <button 
              onClick={() => setShowQR(false)}
              className="w-full py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition"
            >
              Dismiss Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
