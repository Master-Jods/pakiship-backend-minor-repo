import { useState, useRef, cloneElement, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Save, 
  Camera, Lock, Eye, EyeOff, ShieldCheck, Upload, Bell, 
  MessageSquare, RefreshCw, Activity
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

// Assets
const logoImg = "/assets/d0a94c34a139434e20f5cb9888d8909dd214b9e7.png";

export function EditProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idFileInputRef = useRef<HTMLInputElement>(null);
  
  // --- STATE MANAGEMENT ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [isEditing, setIsEditing] = useState(false);
  
  const [profilePicture, setProfilePicture] = useState<string | null>(
    localStorage.getItem('customerProfilePicture')
  );

  const [formData, setFormData] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || 'guest@pakiship.ph',
    phone: localStorage.getItem('userPhone') || '09123456789',
    address: localStorage.getItem('userAddress') || '123 Ayala Ave, Makati City',
    dob: localStorage.getItem('userDOB') || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: localStorage.getItem('emailNotifications') === 'true',
    smsUpdates: localStorage.getItem('smsUpdates') === 'true',
    autoExtend: localStorage.getItem('autoExtend') === 'true',
  });

  const [passwordData, setPasswordData] = useState({ current: '', new: '' });
  const [idUploaded, setIdUploaded] = useState(localStorage.getItem('discountIdUploaded') === 'true');

  // Customer stats from localStorage or defaults
  const customerStats = [
    { label: 'Total Bookings', value: localStorage.getItem('totalBookings') || '12' },
    { label: 'Active Bookings', value: localStorage.getItem('activeBookings') || '1' },
    { label: 'Saved Vehicles', value: localStorage.getItem('savedVehicles') || '2' },
    { label: 'Account Created', value: localStorage.getItem('accountCreated') || 'Jan 2025' },
  ];

  // Recent activity
  const recentActivity = [
    { text: 'Booked parking slot A-12 at SM Megamall', time: '2 hours ago' },
    { text: 'Updated profile picture', time: '1 day ago' },
    { text: 'Added new vehicle (Toyota Vios - ABC 1234)', time: '3 days ago' },
  ];

  // Initials logic if no photo exists
  const userInitials = formData.name 
    ? formData.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'U';

  // --- HANDLERS ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving changes...');
    
    setTimeout(() => {
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userPhone', formData.phone);
      localStorage.setItem('userAddress', formData.address);
      localStorage.setItem('userDOB', formData.dob);
      
      // Save preferences
      localStorage.setItem('emailNotifications', String(preferences.emailNotifications));
      localStorage.setItem('smsUpdates', String(preferences.smsUpdates));
      localStorage.setItem('autoExtend', String(preferences.autoExtend));
      
      // Dispatch event so other components (like Home) know to update
      window.dispatchEvent(new Event('storage'));
      
      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    }, 1000);
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePicture(base64);
        localStorage.setItem('customerProfilePicture', base64);
        
        // Immediate sync trigger
        window.dispatchEvent(new Event('storage'));
        toast.success('Photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const loadingToast = toast.loading('Uploading ID...');
      setTimeout(() => {
        setIdUploaded(true);
        localStorage.setItem('discountIdUploaded', 'true');
        toast.dismiss(loadingToast);
        toast.success('ID uploaded successfully! Your discount will be applied automatically.');
      }, 1500);
    }
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-[#F0F9F8] text-[#1A5D56] font-sans pb-12">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 border border-[#39B5A8]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#041614]">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
            </div>
            <div className="space-y-4">
              <PasswordField 
                label="Current Password" 
                value={passwordData.current} 
                show={showPass.current} 
                toggle={() => setShowPass({...showPass, current: !showPass.current})} 
                onChange={(v: string) => setPasswordData({...passwordData, current: v})} 
              />
              <PasswordField 
                label="New Password" 
                value={passwordData.new} 
                show={showPass.new} 
                toggle={() => setShowPass({...showPass, new: !showPass.new})} 
                onChange={(v: string) => setPasswordData({...passwordData, new: v})} 
              />
            </div>
            <div className="flex gap-3 mt-8">
              <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1 rounded-xl">Cancel</Button>
              <Button className="flex-1 bg-[#041614] hover:bg-[#123E3A] text-white rounded-xl" onClick={() => {
                toast.success('Password updated successfully!');
                setShowPasswordModal(false);
                setPasswordData({ current: '', new: '' });
              }}>Update</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 border border-[#39B5A8]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#041614]">Enable 2FA</h3>
              <button onClick={() => setShow2FAModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Two-factor authentication adds an extra layer of security to your account. You'll receive a code via SMS when logging in.</p>
            <div className="flex gap-3">
              <Button onClick={() => setShow2FAModal(false)} variant="outline" className="flex-1 rounded-xl">Cancel</Button>
              <Button className="flex-1 bg-[#39B5A8] hover:bg-[#2D8F85] text-white rounded-xl" onClick={() => {
                toast.success('2FA enabled successfully!');
                setShow2FAModal(false);
              }}>Enable 2FA</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-20 bg-white border-b border-[#39B5A8]/10 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[#39B5A8] font-bold hover:bg-[#F0F9F8] px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-xl font-black font-bold text-[#041614]">Customer Profile & Preferences</h1>
        </div>

        {/* PakiSHIP Logo on the Right */}
        <img src={logoImg} alt="PakiSHIP" className="h-9" />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm text-center">
              <div className="relative inline-block">
                <div className="size-32 rounded-[2.5rem] bg-[#1A5D56] overflow-hidden border-4 border-[#F0F9F8] shadow-lg flex items-center justify-center">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-white">{userInitials}</span>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-[#FF6B35] text-white p-3 rounded-2xl shadow-xl hover:bg-[#e55a28] border-2 border-white transition-all">
                  <Camera className="w-5 h-5" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleProfileUpload} className="hidden" accept="image/*" />
              </div>
              <h2 className="mt-6 text-2xl font-black font-bold text-[#041614] truncate">{formData.name || 'New User'}</h2>
              <p className="text-sm text-[#39B5A8] font-bold mt-1">Regular Customer</p>
              <div className="flex flex-col gap-2 mt-4 items-center">
              </div>
            </div>

            {/* Customer Stats */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-[#39B5A8]/10 shadow-sm">
              <h3 className="font-black text-[#041614] mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                Customer Stats
              </h3>
              <div className="space-y-3">
                {customerStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-sm text-[#1A5D56]/70 font-medium">{stat.label}</span>
                    <span className="font-black text-[#1A5D56]">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-[#39B5A8]/10 shadow-sm">
              <h3 className="font-black text-[#041614] mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Lock className="w-4 h-4 text-[#39B5A8]" /> Security
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)} 
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F9F8] transition-all text-left group"
                >
                  <Lock className="w-4 h-4 text-[#39B5A8]" />
                  <span className="text-sm font-bold text-[#1A5D56]">Change Password</span>
                </button>
                <button
                  onClick={() => setShow2FAModal(true)} 
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F9F8] transition-all text-left group"
                >
                  <ShieldCheck className="w-4 h-4 text-[#39B5A8]" />
                  <span className="text-sm font-bold text-[#1A5D56]">Enable 2FA</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-[#39B5A8]/10 shadow-sm">
              <h3 className="font-black text-[#041614] mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Activity className="w-4 h-4 text-[#39B5A8]" /> Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                    <p className="text-sm text-[#1A5D56] font-medium">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#39B5A8]/10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-bold text-[#041614]">Personal Information</h2>
                {!isEditing ? (
                  <Button 
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-[#FF6B35] hover:bg-[#e55a28] text-white px-6 rounded-2xl h-12 font-bold shadow-lg shadow-[#FF6B35]/20"
                  >
                    <User className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="bg-[#39B5A8] hover:bg-[#2D8F85] text-white px-8 rounded-2xl h-12 font-bold shadow-lg shadow-[#39B5A8]/20"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save All
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormInput 
                  icon={<User />} 
                  label="Full Name" 
                  value={formData.name} 
                  onChange={(v: string) => setFormData({...formData, name: v})} 
                  disabled={!isEditing}
                />
                <FormInput 
                  icon={<Mail />} 
                  label="Email" 
                  value={formData.email} 
                  onChange={(v: string) => setFormData({...formData, email: v})} 
                  disabled={!isEditing}
                />
                <FormInput 
                  icon={<Phone />} 
                  label="Phone" 
                  value={formData.phone} 
                  onChange={(v: string) => setFormData({...formData, phone: v})} 
                  disabled={!isEditing}
                />
                <FormInput 
                  icon={<Calendar />} 
                  label="Birth Date" 
                  type="date" 
                  value={formData.dob} 
                  onChange={(v: string) => setFormData({...formData, dob: v})} 
                  disabled={!isEditing}
                  placeholder="dd/mm/yyyy"
                />
                <div className="md:col-span-2">
                  <FormInput 
                    icon={<MapPin />} 
                    label="Address" 
                    value={formData.address} 
                    onChange={(v: string) => setFormData({...formData, address: v})} 
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </form>

            {/* Special Discounts Verification */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#39B5A8]/10 shadow-sm">
              <h2 className="text-2xl font-black font-bold text-[#041614] mb-3">Special Discounts Verification</h2>
              <p className="text-sm text-[#1A5D56]/70 mb-6">
                Upload a valid PWD or Senior Citizen ID to automatically apply discounts to your parking bookings.
              </p>
              
              <div className="border-2 border-dashed border-[#39B5A8]/30 rounded-[2rem] p-8 text-center hover:border-[#39B5A8] transition-all cursor-pointer"
                onClick={() => !idUploaded && idFileInputRef.current?.click()}
              >
                {idUploaded ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="font-bold text-[#1A5D56]">ID Verified</p>
                    <p className="text-xs text-gray-500">Your discount has been applied</p>
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        idFileInputRef.current?.click();
                      }}
                      variant="outline"
                      className="mt-2 rounded-xl border-[#39B5A8]/20"
                    >
                      Upload New ID
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-[#F0F9F8] rounded-2xl flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[#39B5A8]" />
                    </div>
                    <p className="font-bold text-[#1A5D56]">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">Supported formats: PNG, JPG, or PDF (Max 5MB)</p>
                    <Button 
                      type="button"
                      className="mt-3 bg-[#1A5D56] hover:bg-[#123E3A] text-white rounded-2xl"
                    >
                      Upload ID
                    </Button>
                  </div>
                )}
              </div>
              <input 
                ref={idFileInputRef} 
                type="file" 
                onChange={handleIdUpload} 
                className="hidden" 
                accept="image/*,.pdf" 
              />
            </div>

            {/* Account Preferences */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#39B5A8]/10 shadow-sm">
              <h2 className="text-2xl font-black font-bold text-[#041614] mb-6">Account Preferences</h2>
              
              <div className="space-y-5">
                <PreferenceToggle
                  icon={<Bell className="w-5 h-5 text-[#39B5A8]" />}
                  title="Email Notifications"
                  description="Receive booking confirmations"
                  checked={preferences.emailNotifications}
                  onChange={() => togglePreference('emailNotifications')}
                />
                <PreferenceToggle
                  icon={<MessageSquare className="w-5 h-5 text-[#39B5A8]" />}
                  title="SMS Updates"
                  description="Get real-time parking alerts"
                  checked={preferences.smsUpdates}
                  onChange={() => togglePreference('smsUpdates')}
                />
                <PreferenceToggle
                  icon={<RefreshCw className="w-5 h-5 text-[#39B5A8]" />}
                  title="Auto-extend Booking"
                  description="Automatically extend if running late"
                  checked={preferences.autoExtend}
                  onChange={() => togglePreference('autoExtend')}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- INTERNAL HELPERS ---

function FormInput({ icon, label, value, onChange, type = "text", disabled = false, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-[#39B5A8] uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon && cloneElement(icon, { className: "w-4 h-4" })}
        </div>
        <Input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${disabled ? 'bg-[#F0F9F8] border-transparent' : 'bg-white border-[#39B5A8]/30 focus:border-[#39B5A8]'} border-2 rounded-2xl pl-12 pr-4 py-6 text-sm font-bold outline-none transition-all`} 
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, show, toggle, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-600 ml-1">{label}</label>
      <div className="relative">
        <Input 
          type={show ? 'text' : 'password'} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="rounded-xl pr-10 bg-[#F0F9F8] border-transparent focus:border-[#39B5A8]/30" 
        />
        <button 
          type="button" 
          onClick={toggle} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#39B5A8]"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function PreferenceToggle({ icon, title, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#F0F9F8] transition-all">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 bg-[#F0F9F8] rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-[#1A5D56]">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-all ${
          checked ? 'bg-[#39B5A8]' : 'bg-gray-200'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
