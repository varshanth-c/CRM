import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Plus, Search, Phone, Mail, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Customer = Database['public']['Tables']['customers']['Row'];

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form & Edit State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'Lead' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCustomers(data);
    setLoading(false);
  }

  // Filter Logic
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status
    });
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', status: 'Lead' });
    setShowForm(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // STRICT CHECK: Ensure user exists before proceeding
    if (!user || !user.id) {
      alert('You must be logged in');
      return;
    }

    let error;
    const currentStatus = formData.status as 'Lead' | 'Active' | 'Closed';

    if (editingId) {
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: currentStatus,
        })
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('customers')
        .insert([{
          user_id: user.id, // TS now knows this is definitely a string
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: currentStatus,
        }]);
      error = insertError;
    }

    if (!error) {
      setFormData({ name: '', email: '', phone: '', status: 'Lead' });
      setShowForm(false);
      setEditingId(null);
      fetchCustomers();
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading customers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={handleAddClick}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition shadow-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">{editingId ? 'Edit Customer' : 'New Customer Details'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Full Name" required className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Email" type="email" className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input placeholder="Phone" type="tel" className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <select className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">{editingId ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Added</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} onClick={() => navigate(`/customers/${customer.id}`)} className="hover:bg-slate-50 transition cursor-pointer group">
                <td className="px-6 py-4"><div className="font-medium text-slate-900">{customer.name}</div></td>
                <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(customer.status)}`}>{customer.status}</span></td>
                <td className="px-6 py-4"><div className="flex flex-col gap-1 text-sm text-slate-600">
                  {customer.email && <div className="flex items-center gap-2"><Mail size={14}/> {customer.email}</div>}
                  {customer.phone && <div className="flex items-center gap-2"><Phone size={14}/> {customer.phone}</div>}
                </div></td>
                <td className="px-6 py-4 text-slate-400 text-sm">{new Date(customer.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={(e) => handleEditClick(e, customer)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition"><Pencil size={16} /></button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}