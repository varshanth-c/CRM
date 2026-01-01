import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // Security Check: If not logged in, kick to login page
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold text-slate-900">SimpleCRM</span>
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium flex items-center gap-2">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/customers" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium flex items-center gap-2">
                  <Users size={18} /> Customers
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={signOut}
                className="text-slate-500 hover:text-red-600 px-3 py-2 text-sm font-medium flex items-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}