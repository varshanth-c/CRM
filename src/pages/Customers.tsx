import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Phone, Mail, Pencil, X } from 'lucide-react';

// Project Imports
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

// --- Types & Constants ---
type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerStatus = 'Lead' | 'Active' | 'Closed';

const STATUS_OPTIONS: CustomerStatus[] = ['Lead', 'Active', 'Closed'];

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  status: 'Lead' as CustomerStatus
};

export default function Customers() {
  const navigate = useNavigate();

  // --- State Management ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // --- Effects ---
  useEffect(() => {
    fetchCustomers();
  }, []);

  // --- Data Fetching ---
  async function fetchCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- Event Handlers ---

  // open the form in "Add" mode
  const handleAddClick = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setShowForm(true);
  };

  // Open the form in "Edit" mode (pre-filling data)
  const handleEditClick = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation(); // Stop row click from navigating
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status as CustomerStatus
    });
    setShowForm(true);
  };

  // Handle Form Submission (Create or Update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();
    
    // Safety check: User must be logged in to modify data
    if (!user || !user.id) {
      alert('Session expired. Please log in again.');
      return;
    }

    let error;

    // 2. Determine if we are updating or creating
    if (editingId) {
      // Update Logic
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
        })
        .eq('id', editingId);
      error = updateError;
    } else {
      // Create Logic
      const { error: insertError } = await supabase
        .from('customers')
        .insert([{
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
        }]);
      error = insertError;
    }

    // 3. Handle Result
    if (!error) {
      setFormData(INITIAL_FORM_STATE);
      setShowForm(false);
      setEditingId(null);
      fetchCustomers(); // Refresh list to show changes
    } else {
      console.error('Error saving customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  }

  // --- Helper Functions ---

  // Filter customers based on search input
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // --- Render ---

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Search Input */}
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
          
          {/* Add Button */}
          <button 
            onClick={handleAddClick}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition shadow-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modal Area */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">
              {editingId ? 'Edit Customer' : 'New Customer Details'}
            </h2>
            <button 
              onClick={() => setShowForm(false)} 
              className="text-slate-400 hover:text-slate-600"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Full Name" 
              required 
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <input 
              placeholder="Email" 
              type="email" 
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            <input 
              placeholder="Phone" 
              type="tel" 
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
            
            <select 
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value as CustomerStatus})}
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer List Table */}
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
              <tr 
                key={customer.id} 
                onClick={() => navigate(`/customers/${customer.id}`)} 
                className="hover:bg-slate-50 transition cursor-pointer group"
              >
                {/* Name Column */}
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{customer.name}</div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </td>

                {/* Contact Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-sm text-slate-600">
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14}/> {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14}/> {customer.phone}
                      </div>
                    )}
                  </div>
                </td>

                {/* Date Column */}
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>

                {/* Actions Column (Edit) */}
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={(e) => handleEditClick(e, customer)} 
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition"
                    title="Edit Customer"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  {searchQuery ? 'No matching customers found.' : 'No customers found. Add your first one above!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}