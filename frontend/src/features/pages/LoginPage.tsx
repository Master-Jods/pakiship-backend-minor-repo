import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { 
  Lock, Eye, EyeOff, ChevronLeft, 
  Zap, MapPin, ShieldCheck, Star, X, ArrowRight, Check, Mail, Phone, AlertCircle 
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
const logoImg = "/assets/d0a94c34a139434e20f5cb9888d8909dd214b9e7.png";

type LoginRole = "customer" | "driver" | "operator";

export function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<LoginRole>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState(""); 
  const [isEmail, setIsEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Auto-detect if input is email or phone (Strictly for customers)
  useEffect(() => {
    if (role === "customer" && /[a-zA-Z@]/.test(identifier)) {
      setIsEmail(true);
    } else {
      setIsEmail(false);
      if (role !== "customer" && /[a-zA-Z@]/.test(identifier)) {
        setIdentifier(identifier.replace(/\D/g, "").slice(0, 10));
      }
    }
  }, [identifier, role]);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (role === "customer") {
      if (!/[a-zA-Z@]/.test(value)) {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 10) setIdentifier(digits);
      } else {
        setIdentifier(value);
      }
    } else {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 10) setIdentifier(digits);
    }
    
    if (error) setError("");
  };

  const activateGeofence = async (hubId: string) => {
    // Logic: Backend call to set 'is_active' to true for this hub
    // This allows the system to route PUV drivers to this location
    console.log(`Geofence activated for Hub: ${hubId}`);
    localStorage.setItem("hub_status", "active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation for identifier format
    if (role === "customer" && isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        setError("Invalid email or password.");
        return;
      }
    } else {
      if (identifier.length !== 10) {
        setError("Invalid mobile number or password.");
        return;
      }
    }

    // 2. Password format check
    const passRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passRegex.test(password)) {
      setError("Invalid credentials.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          role,
          identifier,
          password,
          keepLoggedIn,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Invalid email/phone or password.");
        return;
      }

      setError("");
      localStorage.setItem("userId", result.user.id);
      localStorage.setItem("user_role", result.user.role);
      localStorage.setItem("userRole", result.user.role);
      localStorage.setItem("userName", result.user.fullName);
      localStorage.setItem("is_logged_in", "true");

      if (result.user.role === "operator") {
        await activateGeofence("HUB_MNL_001");
      }

      navigate(result.redirectPath);
    } catch {
      setError("Unable to log in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9F8] text-[#1A5D56] flex flex-col font-sans overflow-hidden">
      {/* --- HEADER NAVIGATION --- */}
      <nav className="h-20 flex items-center px-8 md:px-16 lg:px-24 bg-white/80 backdrop-blur-md border-b border-[#39B5A8]/10 z-50">
        <Link to="/" className="flex items-center group transition-transform active:scale-95">
          <ChevronLeft className="w-5 h-5 mr-4 text-[#39B5A8] group-hover:-translate-x-1 transition-transform" />
          <img src={logoImg} alt="PakiSHIP Logo" className="h-10 w-auto object-contain" />
        </Link>
      </nav>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-24 py-8 relative">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#39B5A8]/5 rounded-full blur-[120px] -z-10" />
        
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-10 xl:gap-20 items-center">
          
          {/* LEFT COLUMN: Branding & Features */}
          <div className="hidden lg:flex flex-col items-start space-y-8">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-[#39B5A8]/10 border border-[#39B5A8]/20 px-4 py-1.5 rounded-full">
                <span className="text-[10px] font-bold text-[#2D8F85] uppercase tracking-widest">
                  Philippines' #1 Smart Logistics Platform
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-5xl xl:text-6xl font-bold text-[#041614] leading-[1.1] tracking-tight">
                  Hatid Agad, <br />
                  <span className="text-[#39B5A8]">Walang Abala.</span>
                </h1>
                <p className="text-[#1A5D56] text-xl font-medium italic opacity-80">
                  Login to continue managing your deliveries.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-lg">
              <FeatureCard icon={<Zap className="w-5 h-5 text-[#39B5A8]" />} title="Fast Delivery" desc="Get parcels delivered in 30 mins" />
              <FeatureCard icon={<MapPin className="w-5 h-5 text-[#39B5A8]" />} title="Real-time Tracking" desc="Track your parcels live" />
              <FeatureCard icon={<ShieldCheck className="w-5 h-5 text-[#39B5A8]" />} title="Secure & Insured" desc="Your items are protected" />
            </div>
          </div>

          {/* RIGHT COLUMN: Login Card */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-white border border-[#39B5A8]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-[#39B5A8]/5 relative">
              <div className="mb-8 text-left">
                <h2 className="text-3xl font-bold text-[#041614] mb-2">Log In</h2>
                <p className="text-gray-400 font-medium text-sm">
                  {role === "customer" 
                    ? "Welcome back! Login via email or phone." 
                    : `Access your ${role} dashboard.`}
                </p>
              </div>

              {/* Role Switcher */}
              <div className="flex bg-[#F0F9F8] p-1 rounded-xl mb-6 border border-[#39B5A8]/5">
                {(["customer", "driver", "operator"] as LoginRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setError("");
                      setIdentifier("");
                      setPassword("");
                    }}
                    className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all capitalize tracking-wider ${
                      role === r ? "bg-white text-[#39B5A8] shadow-sm" : "text-gray-400 hover:text-[#1A5D56]"
                    }`}
                  >
                    {r === "customer" ? "parcel sender" : r}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs font-bold text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">
                      {role === "customer" ? "Email or Mobile Number" : "Mobile Number"}
                    </label>
                    {!isEmail && identifier.length > 0 && (
                      <span className="text-[9px] font-bold uppercase tracking-tighter text-gray-400">
                        {identifier.length}/10
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isEmail && (
                      <div className="bg-[#F0F9F8] border border-[#39B5A8]/10 rounded-xl px-4 py-3.5 text-[#1A5D56] font-bold text-sm flex items-center select-none animate-in slide-in-from-left-2 duration-200">+63</div>
                    )}
                    <div className="flex-1 relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#39B5A8]/40">
                        {isEmail ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </div>
                      <input 
                        type="text" 
                        value={identifier}
                        onChange={handleIdentifierChange}
                        placeholder={isEmail ? "name@email.com" : "912 345 6789"}
                        className={`w-full bg-[#F0F9F8] border border-[#39B5A8]/10 rounded-xl pl-11 pr-4 py-3.5 text-[#041614] focus:border-[#39B5A8] focus:bg-white outline-none transition-all text-sm font-medium`} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#39B5A8]/40" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-[#F0F9F8] border border-[#39B5A8]/10 rounded-xl pl-11 pr-11 py-3.5 text-[#041614] focus:border-[#39B5A8] focus:bg-white outline-none transition-all text-sm font-medium`} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#39B5A8]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <button 
                    type="button"
                    onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                    className="flex items-center gap-2 group cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                      keepLoggedIn 
                        ? "bg-[#39B5A8] border-[#39B5A8]" 
                        : "border-gray-200 bg-white group-hover:border-[#39B5A8]"
                    }`}>
                      {keepLoggedIn && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-[#1A5D56] transition-colors">
                      Keep me logged in
                    </span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-[#39B5A8] font-bold hover:text-[#2D8F85] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-[#041614] disabled:opacity-40 text-white font-bold py-4 rounded-xl hover:bg-[#123E3A] transition-all shadow-lg active:scale-[0.98] mt-4 text-xs uppercase tracking-[0.2em]">
                  {isSubmitting ? "Signing In..." : "Continue to Dashboard"}
                </button>

                <p className="text-center text-sm font-medium text-gray-400 mt-6">
                  New to PakiSHIP? <Link to="/signup" className="text-[#39B5A8] font-bold hover:underline decoration-2 underline-offset-4">Create Account</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#041614]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => { setShowForgotModal(false); setResetSent(false); setForgotIdentifier(""); }}
              className="absolute right-6 top-6 p-2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!resetSent ? (
              <div className="space-y-6">
                <div className="w-14 h-14 bg-[#F0F9F8] rounded-2xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#39B5A8]" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-[#041614]">Reset Password</h3>
                  <p className="text-gray-400 text-sm font-medium mt-1">
                    {role === "customer" 
                      ? "Enter your registered email or mobile number." 
                      : "Enter your registered mobile number."}
                  </p>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest px-1">
                    {role === "customer" ? "Email or Mobile" : "Mobile Number"}
                  </label>
                  <input 
                    type="text" 
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full bg-[#F0F9F8] border border-[#39B5A8]/10 rounded-xl px-4 py-3.5 text-[#041614] outline-none text-sm font-medium focus:border-[#39B5A8]" 
                  />
                </div>
                <button 
                  onClick={() => forgotIdentifier.length > 5 && setResetSent(true)}
                  disabled={forgotIdentifier.length < 5}
                  className="w-full bg-[#39B5A8] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#39B5A8]/20 flex items-center justify-center gap-2 group transition-all"
                >
                  Send Reset Link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-[#39B5A8]/10 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-[#39B5A8]" />
                </div>
                <h3 className="text-2xl font-bold text-[#041614]">Link Sent!</h3>
                <p className="text-gray-400 text-sm font-medium">Please check your inbox or messages to verify your identity.</p>
                <button 
                  onClick={() => { setShowForgotModal(false); setResetSent(false); }}
                  className="w-full bg-[#041614] text-white font-bold py-4 rounded-xl mt-4"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-[#39B5A8]/5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
      <div className="w-11 h-11 bg-[#F0F9F8] rounded-xl shrink-0 flex items-center justify-center transition-colors group-hover:bg-[#39B5A8]/10">
        {icon}
      </div>
      <div className="flex flex-col text-left">
        <h4 className="font-bold text-[#041614] text-base leading-tight">{title}</h4>
        <p className="text-gray-400 text-xs font-medium leading-tight">{desc}</p>
      </div>
    </div>
  );
}
