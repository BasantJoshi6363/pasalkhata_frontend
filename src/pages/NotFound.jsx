// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      
      {/* Visual Identity Block */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-60 scale-120 animate-pulse"></div>
        <div className="relative bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-indigo-600">
          <ShieldAlert className="h-12 w-12" />
        </div>
      </div>

      {/* Primary Context Messaging */}
      <div className="space-y-2 max-w-md mx-auto mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Route Not Found</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The dashboard parameters or record files you are searching for might have been shifted, deleted, or entered with an invalid URL string.
        </p>
      </div>

      {/* Navigation Return Directives */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button 
          onClick={() => window.history.back()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>

        <Link 
          to="/" 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
        >
          <Home className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>

    </div>
  );
}