import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Package, MapPin, Navigation, Clock, Bell, User, X,
  CheckCircle2, TrendingUp, Truck, Star, Phone, Map, HelpCircle,
  ArrowRight, ArrowLeft, LogOut, Camera, Info, RefreshCw, AlertTriangle
} from "lucide-react";
import { ProfileDropdown } from "../components/ProfileDropdown";
import { clearClientSession, getTutorialStorageKey } from "@/lib/client-auth";
const logoImg = "/assets/d0a94c34a139434e20f5cb9888d8909dd214b9e7.png";
const mascotImg = "/assets/873d403bd2add17b06645c58ef3cc7daba517b30.png";
const sadMascotImg = "https://i.imgur.com/6bx4yV2.png";
const mascotWavingImg = "https://i.imgur.com/G4RbCRo.png";
const mascotPhoneImg = "https://i.imgur.com/HHNarFY.png";
const mascotMoneyImg = "https://i.imgur.com/F4duNR4.png";
const mascotBoxImg = "https://i.imgur.com/a6gHhtu.png";
const mascotChecklistImg = "https://i.imgur.com/4Xgmx8D.png";
const mascotThinkingImg = "https://i.imgur.com/gDo17NY.png";
import { useJobs, Job } from "./JobsContext";

function CallModal({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#041614]/60 flex items-end sm:items-center justify-center z-[70] p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#39B5A8] flex items-center justify-center text-white font-black text-3xl mb-3 shadow-lg shadow-[#39B5A8]/30">
            {job.customerName.charAt(0)}
          </div>
          <h2 className="text-xl font-black text-[#041614]">{job.customerName}</h2>
          <p className="text-[#39B5A8] font-bold text-sm mt-1">{job.customerPhone}</p>
          <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Customer</span>
        </div>
        <a href={`tel:${job.customerPhone}`}
          className="w-full bg-[#39B5A8] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#39B5A8]/20 hover:bg-[#2D8F85] transition-all active:scale-95 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          Call Now
        </a>
        <button onClick={onClose} className="w-full py-3 text-gray-400 font-bold text-sm hover:text-[#041614] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function DriverHomePage() {
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<"available" | "in-progress" | "completed">("available");
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [callJob, setCallJob] = useState<Job | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem('driverProfilePicture')
  );
  const [userName, setUserName] = useState("Pedro");

  const notificationRef = useRef<HTMLDivElement>(null);
  const onlineToggleRef = useRef<HTMLDivElement>(null);
  const statsCardsRef = useRef<HTMLDivElement>(null);
  const activeDeliveryRef = useRef<HTMLDivElement>(null);
  const jobsSectionRef = useRef<HTMLDivElement>(null);
  const guideButtonRef = useRef<HTMLButtonElement>(null);

  const activeJob = jobs.find(j => j.status === "in-progress");

  const handleLogout = async () => {
    if (activeJob) {
      alert("Cannot logout while a delivery is in progress. Please complete your current job first.");
      setShowLogoutModal(false);
      return;
    }
    try {
      setIsOnline(false);
      clearClientSession();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    const storedName = localStorage.getItem('driverName') || localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    const storedPhoto = localStorage.getItem('driverProfilePicture');
    if (storedPhoto) setProfileImage(storedPhoto);
    const hasShownTutorial = localStorage.getItem(getTutorialStorageKey("driver"));
    if (hasShownTutorial) setShowTutorial(false);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const storedPhoto = localStorage.getItem('driverProfilePicture');
      const storedName = localStorage.getItem('driverName') || localStorage.getItem('userName');
      if (storedPhoto) setProfileImage(storedPhoto);
      if (storedName) setUserName(storedName);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const completedJobs = jobs.filter(j => j.status === "completed");
  const completedToday = completedJobs.length;
  const totalEarnings = completedJobs.reduce((sum, job) => {
    const amount = parseInt(job.earnings.replace(/[₱,]/g, "")) || 0;
    return sum + amount;
  }, 0);
  const activeJobEarnings = activeJob ? (parseInt(activeJob.earnings.replace(/[₱,]/g, "")) || 0) : 0;

  return (
    <div className="min-h-screen bg-[#F0F9F8] text-[#1A5D56] font-sans">
      {showTutorial && (
        <Tutorial
          step={tutorialStep}
          onNext={() => setTutorialStep(tutorialStep + 1)}
          onPrev={() => setTutorialStep(tutorialStep - 1)}
          onClose={() => {
            setShowTutorial(false);
            setTutorialStep(0);
            localStorage.setItem(getTutorialStorageKey("driver"), "true");
          }}
          onlineToggleRef={onlineToggleRef}
          statsCardsRef={statsCardsRef}
          activeDeliveryRef={activeDeliveryRef}
          jobsSectionRef={jobsSectionRef}
          guideButtonRef={guideButtonRef}
        />
      )}

      {callJob && <CallModal job={callJob} onClose={() => setCallJob(null)} />}

      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#39B5A8]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <img src={logoImg} alt="PakiSHIP Logo" className="h-10" />
          
          <div className="flex items-center gap-4">
            <button ref={guideButtonRef} onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#39B5A8]/5 border border-[#39B5A8]/20 rounded-xl transition-colors text-[#39B5A8] font-bold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:inline">Guide</span>
            </button>
            <div className="flex items-center gap-2 bg-[#E6F4F2] rounded-full px-4 py-2 border border-[#39B5A8]/10" ref={onlineToggleRef}>
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
              <button onClick={() => setIsOnline(!isOnline)} className="text-xs font-bold text-[#041614]">
                {isOnline ? "Online" : "Offline"}
              </button>
            </div>
            <div className="relative" ref={notificationRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-[#39B5A8]/5 rounded-full transition-colors">
                <Bell className="w-5 h-5 text-[#39B5A8]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#39B5A8] rounded-full border-2 border-white"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#39B5A8]/10 py-3 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-black text-[#041614]">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <NotificationItem title="New Job Available" message="A new delivery job in your area is waiting!" time="2 mins ago" type="info" />
                    <NotificationItem title="Payment Received" message="₱120 has been added to your wallet." time="1 hour ago" type="success" />
                    <NotificationItem title="Rating Updated" message="You received a 5-star rating from Juan Reyes!" time="3 hours ago" type="star" />
                  </div>
                </div>
              )}
            </div>

            <ProfileDropdown
              profileImage={profileImage}
              userName={userName}
              onProfileClick={() => navigate("/driver/profile")}
              onSettingsClick={() => navigate("/driver/settings")}
              onLogoutClick={() => setShowLogoutModal(true)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#041614] mb-2">Ready to Earn, {userName}!</h1>
          <p className="text-[#39B5A8] font-medium">You're doing great today. Hatid Agad, Walang Abala.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" ref={statsCardsRef}>
          <StatCard icon={<span className="text-lg font-black leading-none">₱</span>} label="Today's Earnings" value={`₱${totalEarnings.toLocaleString()}`} trend={activeJobEarnings > 0 ? `+₱${activeJobEarnings} in progress` : completedToday > 0 ? `+₱${completedJobs[completedJobs.length-1]?.earnings} last job` : "No earnings yet"} color="primary" />
          <StatCard icon={<Package className="w-5 h-5" />} label="Deliveries Today" value={String(completedToday + (activeJob ? 1 : 0))} trend={activeJob ? "+1 in progress" : "All done!"} />
          <StatCard icon={<Star className="w-5 h-5" />} label="Rating" value="4.8" trend="Excellent" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Online Time" value="5h 32m" trend="Active" />
        </div>

        {activeJob && (
          <div className="bg-white border border-[#39B5A8]/10 rounded-[2rem] p-8 mb-8 relative overflow-hidden shadow-sm" ref={activeDeliveryRef}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39B5A8]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-5 h-5 text-[#39B5A8]" />
                  <h3 className="text-xl font-black text-[#041614]">Active Delivery</h3>
                </div>
                <p className="text-gray-500 font-medium">Keep going! Your customer is waiting for their package.</p>
              </div>
              <button onClick={() => navigate(`/driver/job/${activeJob.id}`)}
                className="bg-[#041614] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#123E3A] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#041614]/20">
                <Navigation className="w-5 h-5" />Navigate to Destination
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-[#39B5A8]/10 rounded-[2.5rem] p-6 md:p-8 shadow-sm" ref={jobsSectionRef}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-black text-[#041614]">Delivery Jobs</h2>
            <div className="flex bg-[#F0F9F8] p-1.5 rounded-2xl border border-[#39B5A8]/10">
              {(["available", "in-progress", "completed"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs md:text-sm font-black rounded-xl transition-all ${
                    activeTab === tab ? "bg-white text-[#39B5A8] shadow-sm" : "text-gray-400 hover:text-[#39B5A8]"
                  }`}>
                  {tab === "in-progress" ? "In Progress" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-1.5 text-[10px] bg-[#39B5A8]/10 text-[#39B5A8] px-1.5 py-0.5 rounded-full font-black">
                    {jobs.filter(j => j.status === tab).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {jobs.filter(j => j.status === activeTab).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-bold text-sm">No {activeTab === "in-progress" ? "in-progress" : activeTab} jobs</p>
              </div>
            ) : (
              jobs.filter(j => j.status === activeTab).map(job => (
                <JobCard key={job.id} job={job} navigate={navigate} onCall={() => setCallJob(job)} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* --- LOGOUT MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-[#041614]/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="relative bg-white rounded-[2.5rem] max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300 overflow-visible pt-28 pb-8 px-8">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 pointer-events-none drop-shadow-2xl">
              <img src={sadMascotImg} alt="Sad Mascot" className="w-full h-full object-contain" />
            </div>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-[#041614] p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setShowLogoutModal(false)}>
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-black text-[#041614] mb-2">Are you sure?</h2>
              {activeJob ? (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col items-center gap-2">
                   <AlertTriangle className="w-6 h-6 text-red-500" />
                   <p className="text-red-600 text-xs font-black uppercase tracking-tight">Access Denied</p>
                   <p className="text-red-500 text-xs font-medium">You cannot logout while you have an active delivery ({activeJob.jobNumber}).</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm leading-relaxed font-medium">We're sad to see you go! Come back soon, the deliveries need you. 😢</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {!activeJob && (
                <button
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 shadow-lg active:scale-95 transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />Yes, Logout
                </button>
              )}
              <button className="w-full py-3.5 font-bold text-[#39B5A8] hover:bg-[#39B5A8]/5 rounded-2xl transition-all text-sm" onClick={() => setShowLogoutModal(false)}>
                {activeJob ? "Back to Dashboard" : "Stay & Keep Earning"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode; label: string; value: string; trend: string; color?: "primary" }) {
  return (
    <div className={`rounded-2xl p-6 transition-all border ${color === "primary" ? "bg-white border-[#39B5A8] shadow-md shadow-[#39B5A8]/10" : "bg-white border-[#39B5A8]/10 shadow-sm"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === "primary" ? "bg-[#39B5A8] text-white" : "bg-[#F0F9F8] text-[#39B5A8]"}`}>{icon}</div>
        <TrendingUp className={`w-4 h-4 ${color === "primary" ? "text-[#39B5A8]" : "text-gray-300"}`} />
      </div>
      <div className="text-3xl font-black mb-1 text-[#041614]">{value}</div>
      <div className="text-xs mb-1 font-bold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className={`text-[10px] font-bold ${color === "primary" ? "text-[#39B5A8]" : "text-gray-400"}`}>{trend}</div>
    </div>
  );
}

function NotificationItem({ title, message, time, type }: { title: string; message: string; time: string; type: "info" | "success" | "star" }) {
  const iconMap = {
    info: <Bell className="w-5 h-5 text-[#39B5A8]" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    star: <Star className="w-5 h-5 text-yellow-500" />,
  };
  return (
    <button className="w-full px-4 py-3 hover:bg-[#F0F9F8] transition-colors flex items-start gap-3 text-left">
      <div className="w-10 h-10 rounded-full bg-[#F0F9F8] flex items-center justify-center shrink-0">{iconMap[type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-[#041614] mb-1">{title}</h4>
        <p className="text-xs text-gray-500 mb-1">{message}</p>
        <span className="text-[10px] text-gray-400 font-bold">{time}</span>
      </div>
    </button>
  );
}

function JobCard({ job, navigate, onCall }: { job: Job; navigate: any; onCall: () => void }) {
  const getParcelStatusBadge = () => {
    if (job.status !== "in-progress" || !job.parcelStatus) return null;
    
    const statusConfig = {
      "picked-up": {
        label: "Picked Up",
        icon: <Package className="w-3 h-3" />,
        color: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      "out-for-delivery": {
        label: "Out for Delivery",
        icon: <Truck className="w-3 h-3" />,
        color: "text-[#39B5A8]",
        bg: "bg-[#F0F9F8]",
        border: "border-[#39B5A8]/30",
      },
    };

    const config = statusConfig[job.parcelStatus as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`text-[10px] font-bold ${config.bg} ${config.color} px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${config.border}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-6 hover:border-[#39B5A8]/40 transition-all shadow-sm">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-black text-[#39B5A8] bg-[#F0F9F8] px-2.5 py-1 rounded-lg border border-[#39B5A8]/10">{job.jobNumber}</span>
            <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-full uppercase">{job.packageSize}</span>
            {job.timeLimit && (
              <span className="text-[10px] text-white bg-[#39B5A8] px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                <Clock className="w-3 h-3" />{job.timeLimit}
              </span>
            )}
            {getParcelStatusBadge()}
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-[#39B5A8] mt-1 flex-shrink-0"></div>
              <div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">PICKUP</div>
                <div className="text-[#041614] font-bold">{job.pickup}</div>
              </div>
            </div>
            <div className="ml-2 border-l-2 border-dashed border-[#39B5A8]/20 h-6"></div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">DROP-OFF</div>
                <div className="text-[#041614] font-bold">{job.dropoff}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
            <span className="flex items-center gap-1.5"><Map className="w-3.5 h-3.5" />{job.distance}</span>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{job.customerName}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-[#39B5A8] leading-none mb-1">{job.earnings}</div>
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Earnings</div>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-50">
        {job.status === "available" && (
          <button onClick={() => navigate(`/driver/job/${job.id}`)} className="w-full bg-[#39B5A8] text-white font-black py-4 rounded-xl hover:bg-[#2D8F85] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#39B5A8]/20">
            <Info className="w-5 h-5" />View Full Information
          </button>
        )}
        {job.status === "in-progress" && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onCall} className="bg-white border-2 border-[#39B5A8] text-[#39B5A8] font-black py-3.5 rounded-xl hover:bg-[#F0F9F8] transition-all flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />Call
            </button>
            <button onClick={() => navigate(`/driver/job/${job.id}/update-status`)} className="bg-[#041614] text-white font-black py-3.5 rounded-xl hover:bg-[#123E3A] transition-all flex items-center justify-center gap-2 shadow-lg">
              <RefreshCw className="w-4 h-4" />Update Status
            </button>
          </div>
        )}
        {job.status === "completed" && (
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-black">Completed</span>
            </div>
            <button onClick={() => navigate(`/driver/job/${job.id}`)} className="text-sm font-black text-[#39B5A8] hover:underline transition-colors">View Receipt</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Tutorial({ step, onNext, onPrev, onClose, onlineToggleRef, statsCardsRef, activeDeliveryRef, jobsSectionRef, guideButtonRef }: any) {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const steps = [
    { title: "Welcome, Driver!", content: "Hey Pedro! I'm your PakiSHIP guide. Let me show you your driver dashboard. This is where you'll manage your deliveries. Tara!", image: mascotWavingImg, targetRef: null },
    { title: "Online/Offline", content: "Toggle this to go Online when you're ready to earn. Green means you're visible to customers!", image: mascotPhoneImg, targetRef: onlineToggleRef },
    { title: "Earnings & Performance", content: "Track your money and ratings here. We want to help you reach that 5-star rating!", image: mascotMoneyImg, targetRef: statsCardsRef },
    { title: "Active Job", content: "Your current delivery stays right here so you can access navigation and customer details quickly.", image: mascotBoxImg, targetRef: activeDeliveryRef },
    { title: "Available Jobs", content: "New job requests will appear here. Pick the ones that fit your route and start earning!", image: mascotChecklistImg, targetRef: jobsSectionRef },
    { title: "Need Help?", content: "Click 'Guide' anytime if you need a refresher. Safe driving!", image: mascotThinkingImg, targetRef: guideButtonRef },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  useEffect(() => {
    const targetRef = currentStep.targetRef;
    if (targetRef && targetRef.current) {
      const element = targetRef.current;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHighlightRect(element.getBoundingClientRect()), 350);
    } else {
      setHighlightRect(null);
    }
  }, [step, currentStep.targetRef]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[59]">
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask-driver">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && <rect x={highlightRect.left - 12} y={highlightRect.top - 12} width={highlightRect.width + 24} height={highlightRect.height + 24} rx="32" fill="black" />}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(4, 22, 20, 0.5)" mask="url(#spotlight-mask-driver)" />
        </svg>
        {highlightRect && (
          <div className="absolute border-4 border-[#39B5A8] rounded-[2rem] shadow-2xl shadow-[#39B5A8]/30 animate-pulse"
            style={{ left: highlightRect.left - 12, top: highlightRect.top - 12, width: highlightRect.width + 24, height: highlightRect.height + 24 }} />
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-[60] w-[380px] pointer-events-auto">
        <div className="flex justify-center mb-0">
          <div className="w-28 h-28 drop-shadow-2xl pointer-events-none">
            <img key={currentStep.image} src={currentStep.image} alt="Guide Mascot"
              className="w-full h-full object-contain animate-in zoom-in-75 duration-300"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
        </div>
        <div className="bg-white text-[#1A5D56] p-6 rounded-[2rem] shadow-2xl border border-[#39B5A8]/10 -mt-6 pt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="px-3 py-1 bg-[#39B5A8]/10 rounded-full text-[#39B5A8] text-xs font-black">Step {step + 1} of {steps.length}</div>
            <button className="text-gray-400 hover:text-[#041614] transition-colors p-2 hover:bg-gray-100 rounded-xl" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-black text-[#041614] mb-3">{currentStep.title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed font-medium mb-6">{currentStep.content}</p>
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-2 px-4 py-2 text-[#39B5A8] font-bold disabled:opacity-30 active:scale-95 text-sm" onClick={onPrev} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#39B5A8] text-white rounded-xl font-black shadow-lg hover:bg-[#2D8F85] active:scale-95 text-sm" onClick={isLastStep ? onClose : onNext}>
              {isLastStep ? "Let's Go!" : "Next"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
