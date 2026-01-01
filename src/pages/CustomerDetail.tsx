import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { ArrowLeft, Phone, Mail, Calendar, MessageSquare, Clock, Trash2 } from 'lucide-react';

type Customer = Database['public']['Tables']['customers']['Row'];
type Interaction = Database['public']['Tables']['interactions']['Row'];

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction Form State
  const [note, setNote] = useState('');
  const [type, setType] = useState<'call' | 'email' | 'meeting'>('call');
  const [followUpDate, setFollowUpDate] = useState(''); // <--- NEW: Date State

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  async function fetchData() {
    const { data: custData } = await supabase.from('customers').select('*').eq('id', id).single();
    const { data: intData } = await supabase.from('interactions').select('*').eq('customer_id', id).order('interaction_date', { ascending: false });

    if (custData) setCustomer(custData);
    if (intData) setInteractions(intData);
    setLoading(false);
  }

  async function handleAddInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || !id) return;
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('interactions').insert([{
      customer_id: id,
      user_id: user?.id,
      type,
      notes: note,
      interaction_date: new Date().toISOString(),
      follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null // <--- Save Date
    }]);

    if (!error) {
      setNote('');
      setFollowUpDate('');
      fetchData();
    }
  }

  const handleDeleteCustomer = async () => {
    if (confirm('Are you sure? This will delete the customer and all history.')) {
      await supabase.from('customers').delete().eq('id', id);
      navigate('/customers');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!customer) return <div className="p-8 text-center">Customer not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/customers')} className="flex items-center text-slate-500 hover:text-slate-900">
        <ArrowLeft size={18} className="mr-2" /> Back to List
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{customer.name.charAt(0)}</div>
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${customer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{customer.status}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500 mb-6">Since {new Date(customer.created_at).toLocaleDateString()}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-700"><Mail size={16} className="text-slate-400" /> {customer.email || 'No email'}</div>
              <div className="flex items-center gap-3 text-sm text-slate-700"><Phone size={16} className="text-slate-400" /> {customer.phone || 'No phone'}</div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button onClick={handleDeleteCustomer} className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 font-medium"><Trash2 size={14}/> Delete Customer</button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactions */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare size={18} /> Log Activity</h2>
            <form onSubmit={handleAddInteraction} className="space-y-4">
              <div className="flex gap-2">
                {['call', 'email', 'meeting'].map((t) => (
                  <button key={t} type="button" onClick={() => setType(t as any)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${type === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
                ))}
              </div>
              <textarea required placeholder="Interaction notes..." className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none min-h-[80px]" value={note} onChange={(e) => setNote(e.target.value)} />
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 w-full sm:w-auto">
                   <Calendar size={16} />
                   <span className="whitespace-nowrap">Follow up:</span>
                   <input 
                     type="date" 
                     className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-slate-900"
                     value={followUpDate}
                     onChange={(e) => setFollowUpDate(e.target.value)}
                   />
                </div>
                <button type="submit" className="w-full sm:w-auto bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800">Log & Save</button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                <div className={`mt-1 p-2 rounded-full h-fit ${interaction.type === 'call' ? 'bg-blue-100 text-blue-600' : interaction.type === 'email' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                  {interaction.type === 'call' && <Phone size={16} />}
                  {interaction.type === 'email' && <Mail size={16} />}
                  {interaction.type === 'meeting' && <Calendar size={16} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-slate-900 capitalize">{interaction.type}</p>
                    <div className="flex items-center text-xs text-slate-400 gap-1"><Clock size={12} /> {new Date(interaction.interaction_date).toLocaleDateString()}</div>
                  </div>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{interaction.notes}</p>
                  {interaction.follow_up_date && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                      <Calendar size={12} /> Follow up: {new Date(interaction.follow_up_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}