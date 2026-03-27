import { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, User, Clock, Package } from "lucide-react";
import { Button } from "./ui/button";

interface MapPreviewProps {
  pickupAddress: string;
  deliveryAddress: string;
  driverName?: string;
  driverPhone?: string;
  estimatedTime?: string;
  trackingNumber?: string;
  showDriverInfo?: boolean;
  isDriverView?: boolean;
  onETAUpdate?: (eta: string, distance: string) => void;
}

export default function MapPreview({
  pickupAddress,
  deliveryAddress,
  driverName = "Juan Dela Cruz",
  driverPhone = "+63 912 345 6789",
  estimatedTime = "25 mins",
  trackingNumber,
  showDriverInfo = false,
  isDriverView = false,
  onETAUpdate,
}: MapPreviewProps) {
  const [driverProgress, setDriverProgress] = useState(isDriverView ? 15 : 30);
  const [liveETA, setLiveETA] = useState(estimatedTime);
  const [liveDistance, setLiveDistance] = useState("12.5 km");

  // Simulate real-time driver movement
  useEffect(() => {
    if (showDriverInfo || isDriverView) {
      const interval = setInterval(() => {
        setDriverProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + (isDriverView ? 1.5 : 3);
        });

        // Update Distance Simulation
        setLiveDistance((prev) => {
          const km = parseFloat(prev);
          const newKm = Math.max(0.1, km - 0.2);
          return `${newKm.toFixed(1)} km`;
        });

        // Update ETA Simulation
        setLiveETA((prev) => {
          const match = prev.match(/(\d+)/);
          if (!match) return prev;
          const mins = parseInt(match[1]);
          const newMins = Math.max(1, mins - 1);
          return `${newMins} mins`;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [showDriverInfo, isDriverView]);

  // Notify parent of updates
  useEffect(() => {
    if (onETAUpdate && isDriverView) {
      onETAUpdate(liveETA, liveDistance);
    }
  }, [liveETA, liveDistance, onETAUpdate, isDriverView]);

  /**
   * MAP PATH CALCULATION
   * Start: 15,20 | Control: 50,50 | End: 85,45
   */
  const t = driverProgress / 100;
  const driverPathX = (1 - t) * (1 - t) * 15 + 2 * (1 - t) * t * 50 + t * t * 85;
  const driverPathY = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 50 + t * t * 45;

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#F1F5F9] rounded-[2.5rem] overflow-hidden font-sans border border-slate-200">
      {/* Map Background - Simulated */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.15]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="mapGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1A5D56" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />
          </svg>
        </div>

        {/* Road overlay */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#1A5D56" />
            </linearGradient>
          </defs>
          
          <path
            d="M 15 20 Q 50 50 85 45"
            stroke="#CBD5E0"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {(showDriverInfo || isDriverView) && (
            <path
              d="M 15 20 Q 50 50 85 45"
              stroke="url(#routeGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="200"
              strokeDashoffset={200 - (driverProgress * 2)}
              className="transition-all duration-1000 ease-linear"
            />
          )}
          
          {(showDriverInfo || isDriverView) && (
            <g className="transition-all duration-1000 ease-linear">
              <circle cx={driverPathX} cy={driverPathY} r="3" fill="white" className="drop-shadow-md" />
              <circle cx={driverPathX} cy={driverPathY} r="2" fill="#38BDF8" />
            </g>
          )}
        </svg>

        {/* Pickup Marker */}
        <div className="absolute top-[20%] left-[15%] -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center">
             <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-100 mb-1 scale-75 origin-bottom">
                <span className="text-[8px] font-bold text-slate-500 uppercase px-1">Pickup</span>
             </div>
             <div className="w-8 h-8 bg-[#38BDF8] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4 text-white" />
             </div>
          </div>
        </div>

        {/* Delivery Marker */}
        <div className="absolute top-[45%] left-[85%] -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center">
             <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-100 mb-1 scale-75 origin-bottom">
                <span className="text-[8px] font-bold text-[#1A5D56] uppercase px-1">Delivery</span>
             </div>
             <div className="w-8 h-8 bg-[#1A5D56] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4 text-white" />
             </div>
          </div>
        </div>
      </div>

      {/* Top Floating UI */}
      <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-black/5 p-4 flex items-center gap-4 pointer-events-auto border border-white">
          <div className="w-12 h-12 rounded-xl bg-[#1A5D56] flex items-center justify-center shrink-0 shadow-lg shadow-[#1A5D56]/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {trackingNumber ? `Track #${trackingNumber}` : 'PakiShip Live'}
            </div>
            <div className="font-bold text-slate-800 text-lg leading-tight">
              {driverProgress === 100 ? "Parcel Arrived" : "On the way"}
            </div>
          </div>
        </div>

        <div className="bg-[#1A5D56] text-white rounded-2xl px-6 py-4 shadow-xl flex flex-col items-end pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-bold uppercase tracking-tighter opacity-80">Estimated Arrival</span>
          </div>
          <span className="text-2xl font-black font-bold">{liveETA}</span>
        </div>
      </div>

      {/* Driver Info & Progress Card */}
      {showDriverInfo && !isDriverView && (
        <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-7 border border-white animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#F0F9F8] flex items-center justify-center border border-[#38BDF8]/20">
                  <User className="w-8 h-8 text-[#1A5D56]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#38BDF8] rounded-full border-2 border-white flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                {/* Driver Name Bold */}
                <div className="font-black text-[#1A5D56] text-xl tracking-tight">{driverName}</div>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Courier Partner</span>
                   <div className="h-1 w-1 rounded-full bg-slate-300" />
                   <span className="text-xs font-black text-[#38BDF8]">4.9 ★</span>
                </div>
              </div>
            </div>
          </div>

          {/* MASCOT PROGRESS BAR (MASCOT "LAYING IN" THE BAR EFFECT) */}
          <div className="relative mb-4 mt-16 px-2"> {/* Added top margin and horizontal padding */}
            
            {/* Sliding Mascot Container - Positioning tweaked for overlap */}
            <div
              className="absolute transition-all duration-1000 ease-linear z-10"
              style={{
                left: `clamp(0px, calc(${driverProgress}% - 55px), calc(100% - 70px))`,
                bottom: "100%", // Anchors mascot base above the bar
                marginBottom: "-17px", // Negative margin pulls mascot partially "behind" the bar rim
              }}
            >
              <img
                src="https://i.imgur.com/JCkCd6c.png"
                alt="Mascot"
                className="w-16 h-16 object-contain drop-shadow-md"
                // Standard blend for transparent PNG on white background
              />
            </div>
            
            {/* The Bar - Now sits 'in front' of the mascot's base */}
            {/* Increased height to h-5 for a wider channel */}
            <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner p-0.5 relative z-20">
              <div
                className="h-full bg-gradient-to-r from-[#38BDF8] to-[#1A5D56] rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                style={{ width: `${driverProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3 px-1 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              <span>Picked Up</span>
              <span className="text-[#38BDF8]">{Math.round(driverProgress)}%</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <Navigation className="w-5 h-5 text-[#38BDF8] shrink-0" />
            {/* Status Text Bold */}
            <p className="text-sm font-bold">
              {driverProgress < 100 
                ? `Parcel is approximately ${liveDistance} from your location.`
                : "Rider has arrived at the destination!"}
            </p>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-30 text-[9px] font-black text-[#1A5D56] uppercase tracking-[0.4em]">
        PakiShip Secure Logistics
      </div>
    </div>
  );
}