// src/components/Navbar.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Layers, LogOut } from 'lucide-react';
import { useLedgerStore } from '../store/useLedgerStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const { dashboardStats, fetchDashboardStats } = useLedgerStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand/Logo Section */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 tracking-tight">
            <Layers className="h-6 w-6" />
            <span>{dashboardStats?.shopName || "Pasal Khata"}</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link 
              to="/settings" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Shop Settings</span>
            </Link>

            {/* Owner info + logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <span className="hidden sm:inline text-sm font-medium text-slate-500">
                {user?.ownerName}
              </span>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}