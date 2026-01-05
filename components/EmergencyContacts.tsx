
import React, { useState } from 'react';
import { Contact } from '../types';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface EmergencyContactsProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onRemoveContact: (id: string) => void;
  disabled: boolean;
  dispatchProgress?: Record<string, 'pending' | 'sending' | 'sent' | 'error' | undefined>;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ 
  contacts, 
  onAddContact, 
  onRemoveContact, 
  disabled,
  dispatchProgress = {}
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+91');
  const [error, setError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/^\+?91?/, '');
    }
    setNewPhone(value);
  };

  const validatePhone = (phone: string) => {
    const phoneNumber = parsePhoneNumberFromString(phone, 'IN');
    
    if (!phoneNumber || !phoneNumber.isValid()) {
      return { 
        valid: false, 
        message: 'Invalid mobile number. Please enter a valid 10-digit Indian number.' 
      };
    }

    const digits = phoneNumber.number.replace(/\D/g, '');
    if (/^(\d)\1+$/.test(digits)) {
      return { valid: false, message: 'This looks like a dummy number.' };
    }

    return { valid: true, formatted: phoneNumber.format('E.164') };
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = newName.trim();
    if (trimmedName.length < 2) {
      setError('Contact name must be at least 2 characters.');
      return;
    }

    const validation = validatePhone(newPhone);
    if (!validation.valid) {
      setError(validation.message || 'Invalid phone number.');
      return;
    }

    const isDuplicate = contacts.some(
      c => c.phone === validation.formatted
    );
    if (isDuplicate) {
      setError('This number is already in your trusted contacts.');
      return;
    }

    onAddContact({
      id: Date.now().toString(),
      name: trimmedName,
      phone: validation.formatted!
    });

    setNewName('');
    setNewPhone('+91');
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl transition-all h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Trusted Contacts</h3>
        {!disabled && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline active:scale-95 transition"
          >
            <i className="fas fa-plus-circle"></i> Add New
          </button>
        )}
      </div>

      {isAdding && !disabled && (
        <form onSubmit={handleAdd} className="mb-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top duration-300">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-indigo-400 mb-1">Contact Name</label>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Brother" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white rounded-xl border-none p-3 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-indigo-400 mb-1">Mobile Number</label>
              <input 
                type="tel" 
                placeholder="+91 XXXXX XXXXX" 
                value={newPhone}
                onChange={handlePhoneChange}
                className="w-full bg-white rounded-xl border-none p-3 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono font-bold outline-none"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 animate-pulse">
                <i className="fas fa-exclamation-circle mt-0.5 text-xs"></i>
                <p className="text-[10px] font-bold uppercase leading-tight">{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button 
                type="submit"
                className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition active:scale-95 text-sm shadow-md"
              >
                Save Contact
              </button>
              <button 
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setError('');
                }}
                className="px-4 bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-300 transition active:scale-95 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
      
      <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar">
        {contacts.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-400">
            <i className="fas fa-users-slash text-3xl mb-2 opacity-20"></i>
            <p className="text-sm">No contacts added yet</p>
          </div>
        )}
        
        {contacts.map((contact) => {
          const status = dispatchProgress[contact.id];
          
          return (
            <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group transition-all hover:bg-gray-100 animate-in fade-in duration-300">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${status === 'sent' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {status === 'sending' ? (
                    <i className="fas fa-spinner fa-spin text-xs"></i>
                  ) : status === 'sent' ? (
                    <i className="fas fa-check text-xs"></i>
                  ) : (
                    contact.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-tight">{contact.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{contact.phone}</p>
                </div>
              </div>

              {!disabled ? (
                <button 
                  onClick={() => onRemoveContact(contact.id)}
                  className="h-8 w-8 flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:bg-red-50 rounded-full"
                  title="Remove contact"
                >
                  <i className="fas fa-trash-alt text-sm"></i>
                </button>
              ) : (
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-full transition-all ${
                  status === 'sent' ? 'bg-green-50 text-green-500' : 
                  status === 'sending' ? 'bg-indigo-50 text-indigo-500 animate-pulse' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  <i className={`fas ${status === 'sent' ? 'fa-check-circle' : status === 'sending' ? 'fa-clock' : 'fa-circle-notch'}`}></i>
                  {status === 'sent' ? 'Notified' : status === 'sending' ? 'Sending...' : 'Pending'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[10px] text-gray-400 text-center font-medium leading-relaxed">
        Emergency protocol automatically dispatches Cloud Alerts to all trusted contacts simultaneously.
      </p>
    </div>
  );
};
