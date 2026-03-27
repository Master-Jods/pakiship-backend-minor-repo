import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, User, Mail, Phone, Camera, Lock, Eye, EyeOff,
  Save, Edit2, Bike, Star, Package, CheckCircle2, MapPin, Shield,
  X, AlertCircle, Upload, Bell, MessageSquare, DollarSign, Clock, Activity
} from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
const logoImg = "/assets/d0a94c34a139434e20f5cb9888d8909dd214b9e7.png";

export function DriverProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseFileInputRef = useRef<HTMLInputElement>(null);
  const registrationFileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(
    localStorage.getItem('driverProfilePicture')
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('driverName') || 'Pedro Reyes',
    email: localStorage.getItem('driverEmail') || 'pedro@pakiship.ph',
    phone: localStorage.getItem('driverPhone') || '+63 934 567 8901',
    vehicleType: localStorage.getItem('driverVehicle') || 'Motorcycle',
    plateNumber: localStorage.getItem('driverPlate') || 'ABC-1234',
    licenseNumber: localStorage.getItem('driverLicense') || 'N03-12-345678',
    driverId: localStorage.getItem('driverId') || 'DRV-2026-0042',
    bankAccount: localStorage.getItem('driverBank') || '1234567890',
    emergencyContact: localStorage.getItem('driverEmergency') || '+63 912 345 6789',
  });

  const [preferences, setPreferences] = useState({
    jobNotifications: localStorage.getItem('driverJobNotifications') === 'true',
    smsAlerts: localStorage.getItem('driverSmsAlerts') === 'true',
    autoAcceptJobs: localStorage.getItem('driverAutoAcceptJobs') === 'true',
  });

  const [passwordData, setPasswordData] = useState({
    current: '', new: '', confirm: '',
  });

  const [documentsUploaded, setDocumentsUploaded] = useState({
    license: localStorage.getItem('driverLicenseUploaded') === 'true',
    registration: localStorage.getItem('driverRegistrationUploaded') === 'true',
  });

  const userInitials = profileData.name
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const driverStats = [
    { label: 'Total Deliveries', value: localStorage.getItem('totalDeliveries') || '1,284' },
    { label: 'Completed Jobs', value: localStorage.getItem('completedJobs') || '1,251' },
    { label: 'Avg. Rating', value: localStorage.getItem('avgRating') || '4.9 ★' },
    { label: 'Member Since', value: localStorage.getItem('memberSince') || 'Mar 2025' },
  ];

  const earningsStats = [
    { label: 'Today', value: '₱2,450', color: 'text-emerald-600' },
    { label: 'This Week', value: '₱18,900', color: 'text-blue-600' },
    { label: 'This Month', value: '₱65,230', color: 'text-purple-600' },
  ];

  const recentActivity = [
    { text: 'Completed delivery #DL-2456 to BGC', time: '30 mins ago' },
    { text: 'Updated vehicle registration', time: '2 days ago' },
    { text: 'Received 5-star rating from customer', time: '1 week ago' },
  ];

  const handleSave = () => {
    toast.loading('Saving changes...');
    setTimeout(() => {
      localStorage.setItem('driverName', profileData.name);
      localStorage.setItem('driverEmail', profileData.email);
      localStorage.setItem('driverPhone', profileData.phone);
      localStorage.setItem('driverVehicle', profileData.vehicleType);
      localStorage.setItem('driverPlate', profileData.plateNumber);
      localStorage.setItem('driverLicense', profileData.licenseNumber);
      localStorage.setItem('driverBank', profileData.bankAccount);
      localStorage.setItem('driverEmergency', profileData.emergencyContact);
      
      // Save preferences
      localStorage.setItem('driverJobNotifications', String(preferences.jobNotifications));
      localStorage.setItem('driverSmsAlerts', String(preferences.smsAlerts));
      localStorage.setItem('driverAutoAcceptJobs', String(preferences.autoAcceptJobs));
      
      window.dispatchEvent(new Event('storage'));
      toast.dismiss();
      toast.success('Profile updated!');
      setIsEditing(false);
    }, 1200);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePicture(base64);
        localStorage.setItem('driverProfilePicture', base64);
        window.dispatchEvent(new Event('storage'));
        toast.success('Photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (type: 'license' | 'registration') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const loadingToast = toast.loading(`Uploading ${type}...`);
      setTimeout(() => {
        setDocumentsUploaded(prev => ({ ...prev, [type]: true }));
        localStorage.setItem(`driver${type.charAt(0).toUpperCase() + type.slice(1)}Uploaded`, 'true');
        toast.dismiss(loadingToast);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
      }, 1500);
    }
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.loading('Updating password...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Password changed successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
      setShowPasswordModal(false);
    }, 1200);
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
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 border border-[#39B5A8]/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#041614]">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Current Password', val: passwordData.current, key: 'current', show: showCurrentPass, toggle: () => setShowCurrentPass(p => !p) },
                { label: 'New Password', val: passwordData.new, key: 'new', show: showNewPass, toggle: () => setShowNewPass(p => !p) },
                { label: 'Confirm New Password', val: passwordData.confirm, key: 'confirm', show: showConfirmPass, toggle: () => setShowConfirmPass(p => !p) },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-[#1A5D56] uppercase tracking-widest mb-2">{field.label}</label>
                  <div className="relative">
                    <Input
                      type={field.show ? 'text' : 'password'}
                      value={field.val}
                      onChange={(e) => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                      className="pr-10 bg-[#F0F9F8] border-[#39B5A8]/20 focus:border-[#39B5A8] rounded-xl"
                    />
                    <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#39B5A8]">
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-[#F0F9F8] border border-[#39B5A8]/20 rounded-xl p-3">
                <p className="text-xs text-[#1A5D56]/70 font-medium flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-[#39B5A8]" />
                  Minimum 8 characters with letters and numbers.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1 rounded-xl border-[#39B5A8]/20">Cancel</Button>
              <Button onClick={handleChangePassword} className="flex-1 bg-[#39B5A8] hover:bg-[#2D8F85] rounded-xl">Change Password</Button>
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
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/driver')} className="flex items-center gap-2 text-[#39B5A8] font-bold hover:bg-[#F0F9F8] px-4 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-xl font-black text-[#041614]">Driver Profile</h1>
        </div>
        
        <img src={logoImg} alt="PakiSHIP" className="h-9" />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Sidebar */}
          <div className="space-y-6">

            {/* Profile Picture Card */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm text-center">
              <div className="relative inline-block">
                <div className="size-32 rounded-[2.5rem] bg-[#1A5D56] overflow-hidden border-4 border-[#F0F9F8] shadow-lg flex items-center justify-center">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-white">{userInitials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-[#FF6B35] text-white p-3 rounded-2xl shadow-xl hover:bg-[#e55a28] border-2 border-white transition-all"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <h2 className="mt-6 text-2xl font-black text-[#041614] truncate">{profileData.name}</h2>
              <p className="text-sm text-[#39B5A8] font-bold mt-1">{profileData.vehicleType} Rider</p>
              <div className="flex flex-col gap-2 mt-4 items-center">
                <span className="px-4 py-1.5 rounded-full bg-[#F0F9F8] text-[#39B5A8] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Driver
                </span>
                <span className="text-[11px] text-slate-400 font-bold">{profileData.driverId}</span>
              </div>
            </div>

            {/* Driver Stats */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-[#39B5A8]/10 shadow-sm">
              <h3 className="font-black text-[#041614] mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-[#39B5A8]" /> Driver Stats
              </h3>
              <div className="space-y-3">
                {driverStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
                    <span className="font-black text-[#1A5D56]">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-[#39B5A8]/10 shadow-sm">
              <h3 className="font-black text-[#041614] mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#39B5A8]" /> Earnings
              </h3>
              <div className="space-y-3">
                {earningsStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#F0F9F8] rounded-xl">
                    <span className="text-sm text-slate-600 font-medium">{stat.label}</span>
                    <span className={`font-black ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-[#39B5A8]/10 shadow-sm">
              <h3 className="font-black text-[#041614] mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#39B5A8]" /> Security
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F9F8] transition-all text-left"
                >
                  <Lock className="w-4 h-4 text-[#39B5A8]" />
                  <span className="text-sm font-bold text-[#1A5D56]">Change Password</span>
                </button>
                <button
                  onClick={() => setShow2FAModal(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F9F8] transition-all text-left"
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

          {/* Right: Main Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Info */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#041614]">Personal Information</h2>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-[#FF6B35] hover:bg-[#e55a28] rounded-2xl px-6 gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="rounded-2xl border-[#39B5A8]/20">Cancel</Button>
                    <Button onClick={handleSave} className="bg-[#39B5A8] hover:bg-[#2D8F85] rounded-2xl gap-2">
                      <Save className="w-4 h-4" /> Save
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { icon: <User />, label: 'Full Name', key: 'name', type: 'text' },
                  { icon: <Mail />, label: 'Email Address', key: 'email', type: 'email' },
                  { icon: <Phone />, label: 'Phone Number', key: 'phone', type: 'tel' },
                  { icon: <Phone />, label: 'Emergency Contact', key: 'emergencyContact', type: 'tel' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-[#39B5A8] uppercase tracking-[0.2em] ml-1">{field.label}</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">{field.icon}</div>
                      <Input
                        type={field.type}
                        value={(profileData as any)[field.key]}
                        onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                        disabled={!isEditing}
                        className={`pl-11 rounded-2xl py-5 text-sm font-bold border-2 transition-all ${!isEditing ? 'bg-[#F0F9F8] border-transparent' : 'bg-white border-[#39B5A8]/30 focus:border-[#39B5A8]'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle & License Info */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[#F0F9F8] rounded-xl">
                  <Bike className="w-5 h-5 text-[#39B5A8]" />
                </div>
                <h2 className="text-2xl font-black text-[#041614]">Vehicle & License</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { icon: <Bike />, label: 'Vehicle Type', key: 'vehicleType', disabled: !isEditing },
                  { icon: <MapPin />, label: 'Plate Number', key: 'plateNumber', disabled: !isEditing },
                  { icon: <Shield />, label: "Driver's License No.", key: 'licenseNumber', disabled: !isEditing },
                  { icon: <Package />, label: 'Driver ID', key: 'driverId', disabled: true },
                  { icon: <DollarSign />, label: 'Bank Account', key: 'bankAccount', disabled: !isEditing },
                ].map(field => (
                  <div key={field.key} className={field.key === 'bankAccount' ? 'md:col-span-2' : ''}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#39B5A8] uppercase tracking-[0.2em] ml-1">{field.label}</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">{field.icon}</div>
                        <Input
                          value={(profileData as any)[field.key]}
                          onChange={(e) => !field.disabled && setProfileData({ ...profileData, [field.key]: e.target.value })}
                          disabled={field.disabled}
                          className={`pl-11 rounded-2xl py-5 text-sm font-bold ${field.disabled || !isEditing ? 'bg-[#F0F9F8] border-transparent' : 'bg-white border-2 border-[#39B5A8]/30 focus:border-[#39B5A8]'}`}
                        />
                      </div>
                      {field.disabled && field.key === 'driverId' && (
                        <p className="text-[10px] text-slate-400 font-medium ml-1">Contact support to update this field.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Verification */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm">
              <h2 className="text-2xl font-black text-[#041614] mb-3">Document Verification</h2>
              <p className="text-sm text-[#1A5D56]/70 mb-6">
                Upload your driver's license and vehicle registration for verification.
              </p>
              
              <div className="grid md:grid-cols-2 gap-5">
                {/* License Upload */}
                <div>
                  <label className="text-[10px] font-black text-[#39B5A8] uppercase tracking-[0.2em] ml-1 mb-3 block">Driver's License</label>
                  <div 
                    className="border-2 border-dashed border-[#39B5A8]/30 rounded-[1.5rem] p-6 text-center hover:border-[#39B5A8] transition-all cursor-pointer"
                    onClick={() => !documentsUploaded.license && licenseFileInputRef.current?.click()}
                  >
                    {documentsUploaded.license ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <p className="text-sm font-bold text-[#1A5D56]">Verified</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-[#39B5A8]" />
                        <p className="text-sm font-bold text-[#1A5D56]">Upload</p>
                      </div>
                    )}
                  </div>
                  <input ref={licenseFileInputRef} type="file" onChange={handleDocumentUpload('license')} className="hidden" accept="image/*,.pdf" />
                </div>

                {/* Registration Upload */}
                <div>
                  <label className="text-[10px] font-black text-[#39B5A8] uppercase tracking-[0.2em] ml-1 mb-3 block">Vehicle Registration</label>
                  <div 
                    className="border-2 border-dashed border-[#39B5A8]/30 rounded-[1.5rem] p-6 text-center hover:border-[#39B5A8] transition-all cursor-pointer"
                    onClick={() => !documentsUploaded.registration && registrationFileInputRef.current?.click()}
                  >
                    {documentsUploaded.registration ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <p className="text-sm font-bold text-[#1A5D56]">Verified</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-[#39B5A8]" />
                        <p className="text-sm font-bold text-[#1A5D56]">Upload</p>
                      </div>
                    )}
                  </div>
                  <input ref={registrationFileInputRef} type="file" onChange={handleDocumentUpload('registration')} className="hidden" accept="image/*,.pdf" />
                </div>
              </div>
            </div>

            {/* Account Preferences */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-[#39B5A8]/10 shadow-sm">
              <h2 className="text-2xl font-black text-[#041614] mb-6">Account Preferences</h2>
              
              <div className="space-y-5">
                <PreferenceToggle
                  icon={<Bell className="w-5 h-5 text-[#39B5A8]" />}
                  title="Job Notifications"
                  description="Receive alerts for new delivery jobs"
                  checked={preferences.jobNotifications}
                  onChange={() => togglePreference('jobNotifications')}
                />
                <PreferenceToggle
                  icon={<MessageSquare className="w-5 h-5 text-[#39B5A8]" />}
                  title="SMS Alerts"
                  description="Get real-time job status updates"
                  checked={preferences.smsAlerts}
                  onChange={() => togglePreference('smsAlerts')}
                />
                <PreferenceToggle
                  icon={<Clock className="w-5 h-5 text-[#39B5A8]" />}
                  title="Auto-accept Jobs"
                  description="Automatically accept nearby jobs"
                  checked={preferences.autoAcceptJobs}
                  onChange={() => togglePreference('autoAcceptJobs')}
                />
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-[#39B5A8]/10 shadow-sm">
              <h3 className="text-sm font-black text-[#041614] uppercase tracking-wider mb-5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#39B5A8]" /> Verification Status
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { label: "Driver's License", status: "Verified" },
                  { label: "Vehicle Registration", status: "Verified" },
                  { label: "Background Check", status: "Verified" },
                  { label: "Insurance", status: "Active" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <p className="text-sm font-bold text-slate-700">{item.label}</p>
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper component for preference toggles
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
