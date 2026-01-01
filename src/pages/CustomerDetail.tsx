import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, MessageSquare, Clock, Trash2, X } from 'lucide-react';

// Project Imports
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

// --- Types & Constants ---
type Customer = Database['public']['Tables']['customers']['Row'];
type Interaction = Database['public']['Tables']['interactions']['Row'];
type InteractionType = 'call' | 'email' | 'meeting';

// Configuration for interaction buttons (Easy to add more types later)
const INTERACTION_TYPES: { id: InteractionType; label: string; icon: any }[] = [
  { id: 'call', label: 'Call', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'meeting', label: 'Meeting', icon: Calendar },
];

// --- Helper Components (For cleaner Main JSX) ---

// 1. Renders the colored status badge (Lead/Active/Closed)
const StatusBadge = ({ status, initial }: { status: string, initial?: boolean }) => {
  const isActive = status === 'Active';
  
  // If we just want the initial letter circle
  if (initial) {
    return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
      }`}>
        {status.charAt(0)}
      </div>
    );
  }

  // The text badge
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold border ${
      isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'
    }`}>
      {status}
    </span>
  );
};

// 2. Renders the icon for the interaction timeline
const InteractionIcon = ({ type }: { type: string }) => {
  const styles = {
    call: 'bg-blue-100 text-blue-600',
    email: 'bg-purple-100 text-purple-600',
    meeting: 'bg-orange-100 text-orange-600',
  };
  
  // Default to blue if unknown type
  const colorClass = styles[type as keyof typeof styles] || styles.call;

  return (
    <div className={`mt-1 p-2 rounded-full h-fit ${colorClass}`}>
      {type === 'call' && <Phone size={16} />}
      {type === 'email' && <Mail size={16} />}
      {type === 'meeting' && <Calendar size={16} />}
    </div>
  );
};

// --- Main Component ---

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- State ---
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form Inputs
  const [note, setNote] = useState('');
  const [type, setType] = useState<InteractionType>('call');
  const [followUpDate, setFollowUpDate] = useState('');

  // --- Effects ---
  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // --- Data Fetching ---
  async function fetchData() {
    try {
      // Fetch Customer
      const { data: custData, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id!)
        .single();
        
      if (custError) throw custError;

      // Fetch History
      const { data: intData, error: intError } = await supabase
        .from('interactions')
        .select('*')
        .eq('customer_id', id!)
        .order('interaction_date', { ascending: false });

      if (intError) throw intError;

      if (custData) setCustomer(custData);
      if (intData) setInteractions(intData);

    } catch (error) {
      console.error("Error loading data:", error);
      alert("Could not load customer details.");
    } finally {
      setLoading(false);
    }
  }

  // --- Event Handlers ---

  async function handleAddInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || !id) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.id) return;

    const { error } = await supabase.from('interactions').insert([{
      customer_id: id,
      user_id: user.id,
      type,
      notes: note,
      interaction_date: new Date().toISOString(),
      follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null
    }]);

    if (!error) {
      setNote('');
      setFollowUpDate('');
      fetchData(); // Refresh list
    } else {
      alert("Failed to save interaction.");
    }
  }

  const handleDeleteCustomer = async () => {
    if (confirm('Are you sure? This will delete the customer and all history.')) {
      await supabase.from('customers').delete().eq('id', id!);
      navigate('/customers');
    }
  };

  // [NEW FEATURE] Delete a specific interaction note
  const handleDeleteInteraction = async (interactionId: string) => {
    if (confirm('Delete this note?')) {
      const { error } = await supabase.from('interactions').delete().eq('id', interactionId);
      if (!error) {
        // Optimistically update UI (remove it from list without reloading page)
        setInteractions(prev => prev.filter(i => i.id !== interactionId));
      }
    }
  };

  // --- Render ---

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  if (!customer) return <div className="p-8 text-center text-slate-500">Customer not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/customers')} 
        className="flex items-center text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to List
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* === LEFT COLUMN: Customer Profile === */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            
            {/* Header: Initial & Badge */}
            <div className="flex justify-between items-start mb-4">
              <StatusBadge status={customer.status} initial />
              <StatusBadge status={customer.status} />
            </div>
            
            {/* Details */}
            <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500 mb-6">
              Member since {new Date(customer.created_at).toLocaleDateString()}
            </p>
            
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Mail size={16} className="text-slate-400" /> 
                {customer.email || 'No email'}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Phone size={16} className="text-slate-400" /> 
                {customer.phone || 'No phone'}
              </div>
            </div>

            {/* Delete Button */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={handleDeleteCustomer} 
                className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 font-medium transition"
              >
                <Trash2 size={14}/> Delete Customer
              </button>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: Interaction History === */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. Log Activity Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare size={18} /> Log Activity
            </h2>
            
            <form onSubmit={handleAddInteraction} className="space-y-4">
              {/* Interaction Type Toggles */}
              <div className="flex gap-2">
                {INTERACTION_TYPES.map((t) => (
                  <button 
                    key={t.id} 
                    type="button" 
                    onClick={() => setType(t.id)} 
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition flex items-center gap-2 ${
                      type === t.id 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {/* Render Icon dynamically if desired, or just text */}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Note Input */}
              <textarea 
                required 
                placeholder="Write your notes here..." 
                className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none min-h-[80px]" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
              />
              
              {/* Date & Submit */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 w-full sm:w-auto">
                   <Calendar size={16} />
                   <span className="whitespace-nowrap">Follow up:</span>
                   <input 
                     type="date" 
                     className="bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-slate-900"
                     value={followUpDate}
                     onChange={(e) => setFollowUpDate(e.target.value)}
                   />
                </div>
                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition"
                >
                  Log Activity
                </button>
              </div>
            </form>
          </div>

          {/* 2. Timeline List */}
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 group">
                {/* Icon Helper */}
                <InteractionIcon type={interaction.type} />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-slate-900 capitalize">{interaction.type}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-xs text-slate-400 gap-1">
                        <Clock size={12} /> {new Date(interaction.interaction_date).toLocaleDateString()}
                      </div>
                      {/* Delete Interaction Button (Visible on Hover) */}
                      <button 
                        onClick={() => handleDeleteInteraction(interaction.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition"
                        title="Delete note"
                      >
                        <X size={14} />
                      </button>
                    </div>
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
            
            {interactions.length === 0 && (
              <div className="text-center py-10 text-slate-400 italic">
                No history yet. Log your first call or email above.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}