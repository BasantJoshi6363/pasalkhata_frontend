import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, Store } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, authError } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Pasal Khata</h1>
          <p className="text-sm text-slate-500">Log in to manage your shop's ledger</p>
        </div>

        {authError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg font-medium border border-rose-200">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
            <input
              type="password" name="password" value={form.password} onChange={handleChange}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500" required
            />
          </div>
          <button
            type="submit" disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          New to Pasal Khata?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}