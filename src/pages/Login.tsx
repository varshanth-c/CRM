import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Attempt login via Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Success - Redirect to Dashboard
      navigate('/');

    } catch (err: any) {
      // 3. Handle specific error messages
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Welcome Back</h2>
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-4 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-slate-900 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}