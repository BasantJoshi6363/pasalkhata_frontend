
import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useLedgerStore } from '../store/useLedgerStore';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Users, DollarSign, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';

const CustomerCard = React.memo(({ customer }) => (
  <Link 
    to={`/customer/${customer._id}`} 
    state={{ customer }}
    className="p-4 flex items-center justify-between hover:bg-slate-50/80 border border-transparent hover:border-slate-100 rounded-xl transition-all"
  >
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-inner">
        {customer.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 text-sm">{customer.name}</h4>
        <p className="text-xs text-slate-400">{customer.phone || 'No phone logged'}</p>
      </div>
    </div>
    <div className="text-right flex items-center gap-3">
      <div>
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Balance</p>
        <p className={`text-sm font-bold ${customer.totalCredit > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          Rs. {customer.totalCredit?.toFixed(2)}
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-slate-300" />
    </div>
  </Link>
));

CustomerCard.displayName = 'CustomerCard';

export default function Dashboard() {
  // Pull states and actions from Zustand global store
  const { 
    customers, 
    dashboardStats, 
    fetchCustomers, 
    fetchDashboardStats, 
    addCustomer, 
    isLoading 
  } = useLedgerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm({
    defaultValues: { newName: '', newEmail: '', newPhone: '' }
  });

  // Initial Data Lifecycle Hydration
  useEffect(() => {
    fetchCustomers();
    fetchDashboardStats();
  }, [fetchCustomers, fetchDashboardStats]);

  // 🧠 MEMOIZE: Filter operations only recalculate when array updates or user changes query string
  const filteredCustomers = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.phone && c.phone.includes(term))
    );
  }, [customers, searchQuery]);

  // Guarded so a double-click / double-Enter can never fire two create requests:
  // react-hook-form already disables re-entrancy via isSubmitting, and the button
  // itself is disabled while isSubmitting is true, but we keep an explicit check too.
  const onCreateCustomer = async (values) => {
    if (isSubmitting) return;
    setFormMsg({ type: '', text: '' });

    const res = await addCustomer({
      name: values.newName,
      email: values.newEmail,
      phone: values.newPhone
    });

    if (res.success) {
      reset();
      setFormMsg({ type: 'success', text: 'Customer account initiated and welcomed via email!' });
    } else {
      setFormMsg({ type: 'error', text: res.error || 'Failed initialization sequence.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* SECTION 1: CORE STATS SUMMARY SHELF */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Shop Active Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Directory Accounts</p>
            <p className="text-xl font-bold text-slate-800">{dashboardStats?.totalCustomers || 0}</p>
          </div>
        </div>

        {/* Metric 2: Global Debt Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Shop Bookings</p>
            <p className="text-xl font-bold text-rose-600">
              Rs. {dashboardStats?.totalOutstandingCredit?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Metric 3: Highest Active Debt Profiler */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Highest Credit Balance</p>
            <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
              {dashboardStats?.highestCreditUser 
                ? `${dashboardStats.highestCreditUser.name} (Rs. ${dashboardStats.highestCreditUser.amount?.toFixed(2)})`
                : 'Clear records'
              }
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 2: OPERATION MATRIX BINDINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* DIRECTORY LIST PANEL */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* List Search Header */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <h3 className="font-bold text-slate-900 text-sm">Customer Database Directory</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search ledger by name/phone..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 w-full sm:w-60 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Directory Rendering Stream */}
          <div className="p-2 divide-y divide-slate-50">
            {isLoading ? (
              // ⚡ SHIMMER LOADER SKELETON BLOCKS
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="h-14 w-full rounded-xl animate-shimmer" />
                ))}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No active ledger profiles match your search criteria.
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <CustomerCard key={customer._id} customer={customer} />
              ))
            )}
          </div>
        </div>

        {/* ACCOUNT INITIALIZATION BLOCK */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <UserPlus className="h-4 w-4 text-indigo-600" />
            <span>Open New Customer File</span>
          </div>

          {formMsg.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              formMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {formMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onCreateCustomer)} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Customer Name</label>
              <input 
                type="text" 
                placeholder="Full Name" 
                {...register('newName', { required: 'Name is required' })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              {errors.newName && (
                <p className="text-[10px] text-rose-500 mt-1">{errors.newName.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Email (Automated Alerts)</label>
              <input 
                type="email" 
                placeholder="customer@domain.com" 
                {...register('newEmail', { required: 'Email is required' })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              {errors.newEmail && (
                <p className="text-[10px] text-rose-500 mt-1">{errors.newEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Phone Line (Optional)</label>
              <input 
                type="text" 
                placeholder="98XXXXXXXX" 
                {...register('newPhone')}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-[0.99] transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                <span>Initialize Profile Record</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
