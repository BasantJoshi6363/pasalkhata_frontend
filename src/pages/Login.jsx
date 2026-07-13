
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, Store, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, authError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm({
    defaultValues: { email: '', password: '' }
  });

  // formState.isSubmitting is true for the full duration of the async login()
  // call below, so the button stays disabled the whole time a request is in
  // flight — a second click/Enter before that resolves can't fire it again.
  const onSubmit = async (values) => {
    if (isSubmitting) return;
    const res = await login(values);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {...register('password', { required: 'Password is required' })}
              className="w-full p-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-500"
            />
            {errors.password && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.password.message}</p>
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
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Log In</span>
              </>
            )}
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
