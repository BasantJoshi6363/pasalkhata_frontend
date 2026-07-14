
import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import { TrendingUp, PieChart as PieIcon, Users, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = { CREDIT: '#e11d48', PAYMENT: '#10b981' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [monthsRange, setMonthsRange] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await api.get(`/analytics/overview?months=${monthsRange}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load analytics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [monthsRange]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 w-full rounded-2xl animate-shimmer" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  const pieData = data.typeBreakdown.map((t) => ({
    name: t.type === 'CREDIT' ? 'Credit Given' : 'Payments Received',
    value: t.total,
    type: t.type
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Shop Analytics</h2>
          <p className="text-sm text-slate-500">Visual report of your ledger activity.</p>
        </div>
        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonthsRange(m)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                monthsRange === m ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-4">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <span>Credit vs Payments Over Time</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(value) => [`Rs. ${value.toFixed(2)}`, '']}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="credit" name="Credit Given" stroke={COLORS.CREDIT} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="payment" name="Payments Received" stroke={COLORS.PAYMENT} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Type Breakdown Pie */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-4">
            <PieIcon className="h-4 w-4 text-indigo-600" />
            <span>All-Time Breakdown</span>
          </div>
          {pieData.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-16">No transactions logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={(entry) => `Rs. ${entry.value.toFixed(0)}`}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[entry.type]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Rs. ${value.toFixed(2)}`} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Debtors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-4">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>Top Outstanding Balances</span>
          </div>
          {data.topDebtors.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-16">No outstanding credit right now.</p>
          ) : (
            <div className="space-y-3">
              {data.topDebtors.map((c, idx) => {
                const maxVal = data.topDebtors[0].totalCredit || 1;
                const pct = (c.totalCredit / maxVal) * 100;
                return (
                  <div key={c._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{idx + 1}. {c.name}</span>
                      <span className="font-bold text-rose-600">Rs. {c.totalCredit.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Daily Activity Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-4">
          <Activity className="h-4 w-4 text-indigo-600" />
          <span>Last 14 Days — Entries Logged</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.dailyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="count" name="Transactions" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}