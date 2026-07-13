// src/pages/StoreSettings.jsx
import React, { useState, useEffect } from 'react';
import { useLedgerStore } from '../store/useLedgerStore';
import { Save, Building, QrCode, ClipboardList, CheckCircle2 } from 'lucide-react';
import api from '../utils/axiosConfig';

const CHANNELS = [
  { key: 'esewa', label: 'eSewa', placeholder: 'eSewa ID: 9841XXXXXX' },
  { key: 'khalti', label: 'Khalti', placeholder: 'Khalti ID: 9841XXXXXX' },
  { key: 'bank', label: 'Bank Transfer', placeholder: 'Nabil Bank, A/C: 0123...' }
];

export default function StoreSettings() {
  const { dashboardStats, fetchDashboardStats } = useLedgerStore();

  const [shopName, setShopName] = useState('');
  const [paymentType, setPaymentType] = useState('BOTH');
  const [channelDetails, setChannelDetails] = useState({ esewa: '', khalti: '', bank: '' });
  const [channelFiles, setChannelFiles] = useState({ esewa: null, khalti: null, bank: null });
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    if (dashboardStats) {
      setShopName(dashboardStats.shopName || '');
      setPaymentType(dashboardStats.paymentType || 'BOTH');
      setChannelDetails({
        esewa: dashboardStats.paymentChannels?.esewa?.details || '',
        khalti: dashboardStats.paymentChannels?.khalti?.details || '',
        bank: dashboardStats.paymentChannels?.bank?.details || ''
      });
    } else {
      fetchDashboardStats();
    }
  }, [dashboardStats, fetchDashboardStats]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    const formData = new FormData();
    formData.append('shopName', shopName);
    formData.append('paymentType', paymentType);
    formData.append('esewaDetails', channelDetails.esewa);
    formData.append('khaltiDetails', channelDetails.khalti);
    formData.append('bankDetails', channelDetails.bank);
    if (channelFiles.esewa) formData.append('esewaQr', channelFiles.esewa);
    if (channelFiles.khalti) formData.append('khaltiQr', channelFiles.khalti);
    if (channelFiles.bank) formData.append('bankQr', channelFiles.bank);

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
        <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">

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
              type="text" value={shopName} onChange={(e) => setShopName(e.target.value)}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Show To Customers</label>
            <select
              value={paymentType} onChange={(e) => setPaymentType(e.target.value)}
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
                  type="file" accept="image/*"
                  onChange={(e) => setChannelFiles((prev) => ({ ...prev, [ch.key]: e.target.files[0] }))}
                  className="w-full p-2 text-xs bg-white border rounded-lg cursor-pointer"
                />
                {dashboardStats?.paymentChannels?.[ch.key]?.qrCodeUrl && (
                  <p className="text-[11px] text-indigo-600 font-medium">✓ QR already uploaded for {ch.label}</p>
                )}

                <textarea
                  rows="2"
                  value={channelDetails[ch.key]}
                  onChange={(e) => setChannelDetails((prev) => ({ ...prev, [ch.key]: e.target.value }))}
                  placeholder={ch.placeholder}
                  className="w-full p-2 text-xs bg-white border rounded-lg font-mono resize-none"
                />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm">
              <Save className="h-4 w-4" />
              <span>Save & Secure Settings</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}