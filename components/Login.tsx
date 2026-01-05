
import React, { useState, useEffect } from 'react';
import { authService, UserProfile } from '../services/authService';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { telephonyService } from '../services/telephonyService';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [stage, setStage] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showOtpNotification, setShowOtpNotification] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/^\+?91?/, '');
    }
    setPhone(value);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('You must accept the rules and regulations of the Government of India.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Please enter your full name as per Government ID.');
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(phone, 'IN');
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError('Please enter a valid Indian mobile number (+91 XXXX-XXXXXX).');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phoneNumber.format('E.164');
      await authService.requestOtp(name, formattedPhone);
      setPhone(formattedPhone);
      setStage('otp');
      
      // Simulate receiving the SMS notification visually for the user
      setTimeout(() => {
        setShowOtpNotification(true);
        // Automatically hide notification after 8 seconds
        setTimeout(() => setShowOtpNotification(false), 8000);
      }, 1500);

    } catch (err) {
      setError('Service connection error. Please check your cellular signal.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.verifyOtp(name, phone, otp);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Invalid code. Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Simulated SMS Notification */}
      {showOtpNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm z-[200] animate-in slide-in-from-top-full duration-500">
          <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 border-l-4 border-indigo-500 flex items-start gap-4">
            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
              <i className="fas fa-comment-sms"></i>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Message • Now</span>
                <button onClick={() => setShowOtpNotification(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
              <p className="text-xs font-bold text-gray-800">AX-SHESHIELD</p>
              <p className="text-sm text-gray-600">Your Government Safety Verification Code is <span className="font-black text-indigo-600">123456</span>. Valid for 10 mins.</p>
            </div>
          </div>
        </div>
      )}

      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="h-16 w-auto" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Government of India</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">SHE SHIELD<span className="text-indigo-600">SOS</span></h1>
          <p className="text-gray-500 text-xs font-medium">National Emergency Response Support System</p>
        </div>

        {stage === 'details' ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name (As per Aadhar)</label>
                <input 
                  type="text" 
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-gray-900 focus:ring-0 transition shadow-sm outline-none"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Mobile Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-gray-900 focus:ring-0 transition shadow-sm font-mono font-bold outline-none"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-1">
              <input 
                id="terms"
                type="checkbox" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-gray-500 leading-relaxed cursor-pointer select-none">
                I agree to the <span className="text-indigo-600 font-bold underline">Rules and Regulations</span> for emergency response and authorize She Shield to use my GPS location during SOS triggers.
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[11px] font-bold flex items-center gap-2 animate-shake">
                <i className="fas fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <span>Send OTP Code</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Enter 6-Digit OTP</label>
                  <button 
                    type="button" 
                    onClick={() => setStage('details')}
                    className="text-[10px] text-indigo-600 font-bold hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <input 
                  autoFocus
                  type="text" 
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em] text-gray-900 focus:ring-2 focus:ring-indigo-500 transition shadow-sm outline-none"
                  disabled={loading}
                  required
                />
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sent via SMS to {phone}</p>
                  <button type="button" className="text-[10px] text-indigo-600 font-bold underline" onClick={() => setShowOtpNotification(true)}>
                    Resend Code
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[11px] font-bold flex items-center gap-2 justify-center animate-shake">
                <i className="fas fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-100 transition active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <span>Verify & Login</span>}
            </button>
          </form>
        )}

        <div className="pt-4 text-center border-t border-gray-100">
          <div className="flex justify-center gap-4 mb-2">
            <img src="https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg" alt="Digital India" className="h-6 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/en/c/c5/Make_in_India_logo.svg" alt="Make in India" className="h-6 opacity-60" />
          </div>
          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest leading-loose">
            Secure Handshake via ERSS India Platform<br/>
            Certified End-to-End Encryption
          </p>
        </div>
      </div>
    </div>
  );
};
