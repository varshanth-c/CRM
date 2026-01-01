import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, CheckCircle, Clock, Calendar, ArrowRight, type LucideIcon } from 'lucide-react';

// Project Imports
import { supabase } from '../lib/supabase';

// --- Types ---

interface DashboardStats {
  total: number;
  leads: number;
  active: number;
  closed: number;
}

// Defines the structure of the data returning from the join query
interface FollowUpInteraction {
  id: string;
  type: string;
  follow_up_date: string;
  customers: {
    id: string;
    name: string;
  } | null; // It's possible (though rare) the customer was deleted, so we handle null
}

// --- Helper Components ---

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
}

// Reusable card component for the top stats row
const StatCard = ({ title, value, icon: Icon, colorClass }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

// --- Main Component ---

export default function Dashboard() {
  
  // --- State ---
  const [stats, setStats] = useState<DashboardStats>({ total: 0, leads: 0, active: 0, closed: 0 });
  const [followUps, setFollowUps] = useState<FollowUpInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // We run both queries in parallel for faster loading
      const [customersResponse, followUpsResponse] = await Promise.all([
        supabase.from('customers').select('status'),
        
        supabase
          .from('interactions')
          .select(`
            id,
            type,
            follow_up_date,
            customers ( name, id )
          `)
          .not('follow_up_date', 'is', null) // Only get items with a date
          .gte('follow_up_date', new Date().toISOString()) // Only future dates
          .order('follow_up_date', { ascending: true })
          .limit(5)
      ]);

      // 1. Process Stats
      if (customersResponse.data) {
        const data = customersResponse.data;
        setStats({
          total: data.length,
          leads: data.filter(c => c.status === 'Lead').length,
          active: data.filter(c => c.status === 'Active').length,
          closed: data.filter(c => c.status === 'Closed').length,
        });
      }

      // 2. Process Follow-ups
      if (followUpsResponse.data) {
        // We cast this safely because we defined the interface above
        setFollowUps(followUpsResponse.data as unknown as FollowUpInteraction[]);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- Render ---

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Customers" 
          value={stats.total} 
          icon={Users} 
          colorClass="bg-slate-100 text-slate-600" 
        />
        <StatCard 
          title="Active Leads" 
          value={stats.leads} 
          icon={Target} 
          colorClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Active Clients" 
          value={stats.active} 
          icon={CheckCircle} 
          colorClass="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Closed Deals" 
          value={stats.closed} 
          icon={Clock} 
          colorClass="bg-purple-100 text-purple-600" 
        />
      </div>

      {/* Content Grid (Follow-ups + Potential Future Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming Follow-ups Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-slate-400" /> 
              Upcoming Follow-ups
            </h2>
          </div>
          
          <div className="divide-y divide-slate-100">
            {followUps.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between group">
                <div>
                  <p className="font-medium text-slate-900">
                    {item.customers?.name || 'Unknown Customer'}
                  </p>
                  <p className="text-sm text-slate-500 capitalize">
                    {new Date(item.follow_up_date).toLocaleDateString()} • {item.type}
                  </p>
                </div>
                
                {/* View Link (Only visible if we have a customer ID) */}
                {item.customers?.id && (
                  <Link 
                    to={`/customers/${item.customers.id}`} 
                    className="text-sm font-medium text-slate-900 flex items-center hover:underline opacity-60 group-hover:opacity-100 transition"
                  >
                    View <ArrowRight size={16} className="ml-1" />
                  </Link>
                )}
              </div>
            ))}

            {/* Empty State */}
            {followUps.length === 0 && (
              <div className="p-8 text-center text-slate-500 italic">
                No upcoming follow-ups scheduled.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}