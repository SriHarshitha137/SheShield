
export interface UserProfile {
  name: string;
  phone: string;
  id: string;
  createdAt: string;
}

export const authService = {
  requestOtp: async (name: string, phone: string): Promise<string> => {
    console.log(`[API] Generating OTP for ${phone}...`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const mockOtp = "123456"; 
    console.log(`[MOCK SMS] To ${phone}: Your She Shield verification code is ${mockOtp}`);
    return mockOtp;
  },

  verifyOtp: async (name: string, phone: string, otp: string): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp !== "123456") {
      throw new Error("Invalid verification code. Please try again.");
    }

    const user: UserProfile = {
      name,
      phone,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('sheshield_user', JSON.stringify(user));
    return user;
  },

  // Security Lock Methods
  setSecurityPin: (pin: string) => {
    // In real Android: Store in EncryptedSharedPreferences
    localStorage.setItem('sheshield_secure_pin', btoa(pin)); // Simple base64 "hash" for demo
  },

  verifySecurityPin: (pin: string): boolean => {
    const saved = localStorage.getItem('sheshield_secure_pin');
    return btoa(pin) === saved;
  },

  hasPinSet: (): boolean => {
    return !!localStorage.getItem('sheshield_secure_pin');
  },

  getCurrentUser: (): UserProfile | null => {
    const saved = localStorage.getItem('sheshield_user');
    return saved ? JSON.parse(saved) : null;
  },

  logout: () => {
    localStorage.removeItem('sheshield_user');
  }
};
