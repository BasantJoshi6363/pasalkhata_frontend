// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CustomerProfile from './pages/CustomerProfile';
import StoreSettings from './pages/StoreSettings';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth routes — no Navbar, no protection */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Everything else requires a logged-in user */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-50 text-slate-900">
                <Navbar />
                <main className="max-w-7xl mx-auto p-4 md:p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* Put strict routes first! */}
                    {/* <Route path="/customer/add" element={<AddCustomer />} /> */}
                    <Route path="/customer/:id" element={<CustomerProfile />} />
                    <Route path="/settings" element={<StoreSettings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;