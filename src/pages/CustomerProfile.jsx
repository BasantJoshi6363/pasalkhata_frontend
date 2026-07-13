// src/pages/StoreSettings.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLedgerStore } from '../store/useLedgerStore';
import { Save, Building, QrCode, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../utils/axiosConfig';

const CHANNELS = [
  { key: 'esewa', label: 'eSewa', placeholder: 'eSewa ID: 9841XXXXXX' },
  { key: 'khalti', label: 'Khalti', placeholder: 'Khalti ID: 9841XXXXXX' },
  { key: 'bank', label: 'Bank Transfer', placeholder: 'Nabil Bank, A/C: 0123...' }
];

export default function StoreSettings() {
  const { dashboardStats, fetchDashboardStats } = useLedgerStore();
  const [status, setStatus] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      shopName: '',
      paymentType: 'BOTH',
      esewaDetails: '',
      khaltiDetails: '',
      bankDetails: '',
      esewaQr: null,
      khaltiQr: null,
      bankQr: null
    }
  });

  useEffect(() => {
    if (dashboardStats) {
      reset({
        shopName: dashboardStats.shopName || '',
        paymentType: dashboardStats.paymentType || 'BOTH',
        esewaDetails: dashboardStats.paymentChannels?.esewa?.details || '',
        khaltiDetails: dashboardStats.paymentChannels?.khalti?.details || '',
        bankDetails: dashboardStats.paymentChannels?.bank?.details || ''
      });
    } else {
      fetchDashboardStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardStats]);

  // react-hook-form's handleSubmit already guards against re-entrant calls while
  // the previous submission is in-flight (isSubmitting), but we double-check here
  // as an explicit safety net against rapid double-clicks.
  const onSubmit = async (values) => {
    if (isSubmitting) return;
    setStatus({ type: '', text: '' });

    const formData = new FormData();
    formData.append('shopName', values.shopName);
    formData.append('paymentType', values.paymentType);
    formData.append('esewaDetails', values.esewaDetails);
    formData.append('khaltiDetails', values.khaltiDetails);
    formData.append('bankDetails', values.bankDetails);

    if (values.esewaQr?.[0]) formData.append('esewaQr', values.esewaQr[0]);
    if (values.khaltiQr?.[0]) formData.append('khaltiQr', values.khaltiQr[0]);
    if (values.bankQr?.[0]) formData.append('bankQr', values.bankQr[0]);

    try {
      await api.put('/store/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', text: 'Store configurations and QR codes secured!' });
      fetchDashboardStats();
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Error uploading configurations.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Shop Management Control</h2>
        <p className="text-sm text-slate-500">Configure secure channels, options, and payment modes.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

          {status.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {status.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
              <span>{status.text}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <span>Shop Name</span>
            </label>
            <input
              type="text"
              {...register('shopName', { required: true })}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Show To Customers</label>
            <select
              {...register('paymentType')}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none"
            >
              <option value="BANK">Bank Transfers Only</option>
              <option value="WALLET">Digital Wallets (eSewa/Khalti) Only</option>
              <option value="BOTH">Show Both Options</option>
            </select>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5 text-slate-400" />
              <span>Payment Channels</span>
            </label>

            {CHANNELS.map((ch) => (
              <div key={ch.key} className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-700">{ch.label}</p>

                <input
                  type="file"
                  accept="image/*"
                  {...register(`${ch.key}Qr`)}
                  className="w-full p-2 text-xs bg-white border rounded-lg cursor-pointer"
                />
                {dashboardStats?.paymentChannels?.[ch.key]?.qrCodeUrl && (
                  <p className="text-[11px] text-indigo-600 font-medium">✓ QR already uploaded for {ch.label}</p>
                )}

                <textarea
                  rows="2"
                  {...register(`${ch.key}Details`)}
                  placeholder={ch.placeholder}
                  className="w-full p-2 text-xs bg-white border rounded-lg font-mono resize-none"
                />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save & Secure Settings</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
