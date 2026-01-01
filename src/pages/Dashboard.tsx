import { useEffect, useState } from 'react'; // <--- Removed React default import
import { supabase } from '../lib/supabase';
import { Users, Target, CheckCircle, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, leads: 0, active: 0, closed: 0 });
  const [followUps, setFollowUps] = useState<any[]>([]); // Keeping as any for complex join
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Stats
      const { data: customers } = await supabase.from('customers').select('status');
      if (customers) {
        setStats({
          total: customers.length,
          leads: customers.filter(c => c.status === 'Lead').length,
          active: customers.filter(c => c.status === 'Active').length,
          closed: customers.filter(c => c.status === 'Closed').length,
        });
      }

      // 2. Fetch Upcoming Follow-ups
      const { data: upcoming } = await supabase
        .from('interactions')
        .select(`
          *,
          customers (name, id)
        `)
        .not('follow_up_date', 'is', null)
        .gte('follow_up_date', new Date().toISOString())
        .order('follow_up_date', { ascending: true })
        .limit(5);

      if (upcoming) setFollowUps(upcoming);
      setLoading(false);
    }
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}><Icon size={24} /></div>
    </div>
  );

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value={stats.total} icon={Users} color="bg-slate-100 text-slate-600" />
        <StatCard title="Active Leads" value={stats.leads} icon={Target} color="bg-blue-100 text-blue-600" />
        <StatCard title="Active Clients" value={stats.active} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <StatCard title="Closed Deals" value={stats.closed} icon={Clock} color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Follow-ups Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-slate-400" /> Upcoming Follow-ups
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {followUps.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{item.customers?.name}</p>
                  <p className="text-sm text-slate-500">{new Date(item.follow_up_date).toLocaleDateString()} • {item.type}</p>
                </div>
                <Link to={`/customers/${item.customers?.id}`} className="text-sm font-medium text-slate-900 flex items-center hover:underline">
                  View <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            ))}
            {followUps.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No upcoming follow-ups scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}