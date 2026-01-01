import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Menu, X } from 'lucide-react';

// Project Imports
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // --- Helper: Check Active Route ---
  const isActive = (path: string) => location.pathname === path;

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // --- Security Check ---
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* === Navigation Bar === */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo & Desktop Links */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">
                  S
                </div>
                <span className="text-xl font-bold text-slate-900">SimpleCRM</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition ${
                    isActive('/') 
                      ? 'bg-slate-100 text-slate-900' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                
                <Link 
                  to="/customers" 
                  className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition ${
                    isActive('/customers') 
                      ? 'bg-slate-100 text-slate-900' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users size={18} /> Customers
                </Link>
              </div>
            </div>
            
            {/* Logout Button (Desktop) */}
            <div className="hidden md:flex items-center">
              <span className="text-sm text-slate-500 mr-4">
                {user.email}
              </span>
              <button 
                onClick={signOut}
                className="text-slate-500 hover:text-red-600 px-3 py-2 text-sm font-medium flex items-center gap-2 transition"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-500 hover:text-slate-900 p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                  isActive('/') ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
                }`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link 
                to="/customers" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                  isActive('/customers') ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
                }`}
              >
                <Users size={18} /> Customers
              </Link>
              <button 
                onClick={signOut}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 flex items-center gap-2 hover:bg-red-50"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* === Main Page Content === */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}