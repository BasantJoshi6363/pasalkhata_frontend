// src/pages/Register.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore';
import { UserPlus, Store, Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, authError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm({
    defaultValues: { shopName: '', ownerName: '', email: '', password: '' }
  });

  // Same double-submit guard pattern as Login: isSubmitting disables the button
  // for the entire async request, plus an explicit early return as a backstop.
  const onSubmit = async (values) => {
    if (isSubmitting) return;
    const res = await registerUser(values);
    if (res.success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Create Your Shop</h1>
          <p className="text-sm text-slate-500">Set up your Pasal Khata account</p>
        </div>

        {authError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg font-medium border border-rose-200">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Shop Name</label>
            <input
              type="text"
              {...register('shopName', { required: 'Shop name is required' })}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500"
            />
            {errors.shopName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.shopName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Your Name</label>
            <input
              type="text"
              {...register('ownerName', { required: 'Your name is required' })}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500"
            />
            {errors.ownerName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.ownerName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500"
            />
            {errors.email && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' }
              })}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500"
            />
            {errors.password ? (
              <p className="text-[11px] text-rose-500 mt-1">{errors.password.message}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">At least 6 characters</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
