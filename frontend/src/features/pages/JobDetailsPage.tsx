import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, MapPin, Package, User, Phone, MessageSquare,
  Clock, Navigation, CheckCircle2, AlertCircle, Map, RefreshCw, ExternalLink, X,
} from "lucide-react";
import { useJobs, Job } from "./JobsContext";
const logoImg = "/assets/d0a94c34a139434e20f5cb9888d8909dd214b9e7.png";
const mascotBoxImg = "https://i.imgur.com/7ywKdmd.png";

// ─── Custom Call Modal ───────────────────────────────────────────────────────
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
        <a
          href={`tel:${job.customerPhone}`}
          className="w-full bg-[#39B5A8] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#39B5A8]/20 hover:bg-[#2D8F85] transition-all active:scale-95 mb-3"
        >
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

function getStepFromStatus(status: Job["status"]): number {
  if (status === "available") return 0;
  if (status === "in-progress") return 1;
  return 2;
}

function ProgressTracker({ currentStep }: { currentStep: number }) {
  const steps = ["Pickup", "In Transit", "Delivery"];
  return (
    <div className="flex items-center justify-between w-full px-2">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            {i < steps.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full h-1 z-0">
                <div className={`h-full ${done ? "bg-[#39B5A8]" : "bg-gray-200"} transition-all duration-500`} />
              </div>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 font-black text-sm border-2 transition-all duration-300 ${
              done ? "bg-[#39B5A8] border-[#39B5A8] text-white"
              : active ? "bg-[#041614] border-[#041614] text-white shadow-lg shadow-[#041614]/30"
              : "bg-white border-gray-200 text-gray-400"
            }`}>
              {done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`text-[11px] font-black mt-1.5 uppercase tracking-wider ${
              active ? "text-[#041614]" : done ? "text-[#39B5A8]" : "text-gray-400"
            }`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MapPlaceholder({ destination }: { destination: string }) {
  return (
    <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-[#c8ede9] via-[#a8ddd7] to-[#7ecdc5]">
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A5D56" strokeWidth="1"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <line x1="0" y1="80" x2="100%" y2="80" stroke="white" strokeWidth="6"/>
        <line x1="0" y1="160" x2="100%" y2="160" stroke="white" strokeWidth="4"/>
        <line x1="120" y1="0" x2="120" y2="100%" stroke="white" strokeWidth="6"/>
        <line x1="280" y1="0" x2="280" y2="100%" stroke="white" strokeWidth="4"/>
      </svg>
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-md">
        <Navigation className="w-4 h-4 text-[#39B5A8]" />
        <div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ETA to Pickup</div>
          <div className="text-sm font-black text-[#041614]">~8 mins</div>
        </div>
      </div>
      <div className="absolute bottom-10 right-16 flex flex-col items-center">
        <div className="bg-[#041614] text-white text-[10px] font-black px-2 py-1 rounded-lg mb-1 whitespace-nowrap shadow-lg max-w-[120px] truncate">{destination}</div>
        <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" />
      </div>
      <div className="absolute top-16 left-24">
        <div className="w-4 h-4 bg-[#39B5A8] rounded-full border-2 border-white shadow-md animate-pulse" />
      </div>
      <div className="absolute bottom-2 right-2 bg-white/80 text-[9px] text-gray-500 font-bold px-2 py-0.5 rounded-full">Map preview</div>
    </div>
  );
}

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, updateJobStatus } = useJobs();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const job = jobs.find(j => j.id === jobId) ?? null;

  useEffect(() => {
    if (!job) navigate('/driver');
  }, [job, navigate]);

  const handleAcceptJob = () => {
    if (job) updateJobStatus(job.id, "in-progress");
    setShowAcceptModal(false);
    navigate('/driver');
  };

  const handleOpenMaps = () => {
    if (job) {
      const dest = job.status === 'available' ? job.pickup : job.dropoff;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`, '_blank');
    }
  };

  if (!job) return <div className="min-h-screen bg-[#F0F9F8] flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#39B5A8] border-t-transparent rounded-full animate-spin" /></div>;

  const currentStep = getStepFromStatus(job.status);

  return (
    <div className="min-h-screen bg-[#F0F9F8] text-[#1A5D56]">

      {/* Custom Call Modal */}
      {showCallModal && <CallModal job={job} onClose={() => setShowCallModal(false)} />}

      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#39B5A8]/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/driver')} className="p-2 hover:bg-[#F0F9F8] rounded-xl transition-colors text-[#39B5A8]"><ArrowLeft className="w-5 h-5" /></button>
            <img src={logoImg} alt="PakiSHIP Logo" className="h-8" />
          </div>
          <h1 className="text-base font-black text-[#041614]">Job Details</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        {/* Progress */}
        <div className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#39B5A8] bg-[#F0F9F8] px-2.5 py-1 rounded-lg border border-[#39B5A8]/10">{job.jobNumber}</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${job.status === 'available' ? 'bg-green-100 text-green-700' : job.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                {job.status === 'in-progress' ? 'In Progress' : job.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#39B5A8] leading-none">{job.earnings}</div>
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Earnings</div>
            </div>
          </div>
          <ProgressTracker currentStep={currentStep} />
          {job.timeLimit && (
            <div className="mt-4 flex items-center gap-2 bg-[#F0F9F8] border border-[#39B5A8]/20 rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-[#39B5A8]" />
              <span className="text-xs font-bold text-[#041614]">Est. completion: <span className="text-[#39B5A8]">{job.timeLimit}</span></span>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3"><Map className="w-4 h-4 text-[#39B5A8]" /><h3 className="text-sm font-black text-[#041614]">Live Map</h3></div>
          <MapPlaceholder destination={job.status === 'available' ? job.pickup : job.dropoff} />
          <button onClick={handleOpenMaps} className="mt-3 w-full bg-[#39B5A8] text-white font-black py-3.5 rounded-xl hover:bg-[#2D8F85] transition-all flex items-center justify-center gap-2 shadow-md text-sm">
            <ExternalLink className="w-4 h-4" />Open Google Maps Navigation
          </button>
        </div>

        {/* Route */}
        <div className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-5 shadow-sm">
          <h3 className="text-sm font-black text-[#041614] mb-3 flex items-center gap-2"><Navigation className="w-4 h-4 text-[#39B5A8]" />Route</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#39B5A8] flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-white" /></div>
            <div><div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Pickup</div><div className="text-[#041614] font-bold text-sm">{job.pickup}</div></div>
          </div>
          <div className="flex items-center gap-3 pl-4 my-1">
            <div className="w-0.5 h-8 bg-gradient-to-b from-[#39B5A8] to-red-400 ml-0.5"></div>
            <span className="text-xs text-gray-400 font-bold">{job.distance}</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-white" /></div>
            <div><div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Drop-off</div><div className="text-[#041614] font-bold text-sm">{job.dropoff}</div></div>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-5 shadow-sm">
          <h3 className="text-sm font-black text-[#041614] mb-3 flex items-center gap-2"><User className="w-4 h-4 text-[#39B5A8]" />Customer</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#39B5A8] flex items-center justify-center text-white font-black text-base">{job.customerName.charAt(0)}</div>
              <div>
                <div className="text-[#041614] font-black text-sm">{job.customerName}</div>
                {job.customerPhone && <div className="text-xs text-gray-400 font-bold">{job.customerPhone}</div>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCallModal(true)} className="p-2.5 bg-[#39B5A8] text-white rounded-xl hover:bg-[#2D8F85] transition-all">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"><MessageSquare className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Package */}
        <div className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-5 shadow-sm">
          <h3 className="text-sm font-black text-[#041614] mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-[#39B5A8]" />Package Details</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 bg-[#F0F9F8] rounded-xl"><div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Size</div><div className="text-[#041614] font-black text-lg">{job.packageSize}</div></div>
            <div className="p-3 bg-[#F0F9F8] rounded-xl"><div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Distance</div><div className="text-[#041614] font-black text-lg">{job.distance}</div></div>
          </div>
          {job.packageDescription && <div className="p-3 border border-gray-100 rounded-xl mb-3"><div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Description</div><div className="text-[#041614] font-bold text-sm">{job.packageDescription}</div></div>}
          {job.specialInstructions && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <div><div className="text-[9px] text-yellow-700 font-bold uppercase tracking-wider mb-0.5">Special Instructions</div><div className="text-yellow-900 font-bold text-sm">{job.specialInstructions}</div></div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
          {job.status === 'available' && (<>
            <button onClick={() => navigate('/driver')} className="py-3.5 px-6 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-all text-sm">Go Back</button>
            <button onClick={() => setShowAcceptModal(true)} className="py-3.5 px-6 bg-[#39B5A8] text-white rounded-xl font-black hover:bg-[#2D8F85] transition-all shadow-lg flex items-center justify-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4" />Accept Job</button>
          </>)}
          {job.status === 'in-progress' && (<>
            <button onClick={() => setShowCallModal(true)} className="py-3.5 px-6 bg-white border-2 border-[#39B5A8] text-[#39B5A8] rounded-xl font-black hover:bg-[#F0F9F8] transition-all flex items-center justify-center gap-2 text-sm"><Phone className="w-4 h-4" />Call Customer</button>
            <button onClick={() => navigate(`/driver/job/${job.id}/update-status`)} className="py-3.5 px-6 bg-[#041614] text-white rounded-xl font-black hover:bg-[#123E3A] transition-all shadow-lg flex items-center justify-center gap-2 text-sm"><RefreshCw className="w-4 h-4" />Update Parcel Status</button>
          </>)}
          {job.status === 'completed' && (
            <button onClick={() => navigate('/driver')} className="md:col-span-2 py-3.5 px-6 bg-[#39B5A8] text-white rounded-xl font-black hover:bg-[#2D8F85] transition-all shadow-lg text-sm">Back to Dashboard</button>
          )}
        </div>
      </main>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-[#041614]/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#F0F9F8] rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                <img src={mascotBoxImg} alt="Mascot" className="w-full h-full object-cover scale-110 rounded-full" />
              </div>
              <h2 className="text-xl font-black text-[#041614] mb-2">Accept this job?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">You're about to accept <span className="font-bold text-[#39B5A8]">{job.jobNumber}</span>. Pick up from <span className="font-bold">{job.pickup}</span>.</p>
            </div>
            <div className="bg-[#F0F9F8] rounded-xl p-4 mb-5 grid grid-cols-2 gap-3 text-center">
              <div><div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Earnings</div><div className="text-xl font-black text-[#39B5A8]">{job.earnings}</div></div>
              <div><div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Distance</div><div className="text-xl font-black text-[#041614]">{job.distance}</div></div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setShowAcceptModal(false)} className="px-5 py-2.5 font-bold text-gray-400 hover:text-[#39B5A8] rounded-xl transition-all text-sm">Cancel</button>
              <button onClick={handleAcceptJob} className="flex items-center gap-2 px-6 py-2.5 bg-[#39B5A8] text-white rounded-xl font-black text-sm hover:bg-[#2D8F85] shadow-lg active:scale-95"><CheckCircle2 className="w-4 h-4" />Confirm & Accept</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
