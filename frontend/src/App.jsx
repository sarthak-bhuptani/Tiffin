import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';

import Dashboard from './pages/Dashboard';
import QuickEntry from './pages/QuickEntry';
import TiffinList from './pages/TiffinList';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Accounts from './pages/Accounts';
import Reports from './pages/Reports';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-orange-50/40 text-slate-800">
      <Navbar />
      <main>{children}</main>
      <MobileBottomNav />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tiffins/quick" element={<QuickEntry />} />
              <Route path="/tiffins/list" element={<TiffinList />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
