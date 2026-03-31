import { useState, useRef } from "react";
import { X, MapPin, Search, Navigation, ChevronRight, Map, LocateFixed, Loader2, AlertCircle } from "lucide-react";

interface Location {
  address: string;
  details?: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
  type: "pickup" | "delivery";
}

const popularLocations = [
  { address: "BGC, Taguig City", details: "Bonifacio Global City" },
  { address: "Makati Central Business District", details: "Ayala Avenue" },
  { address: "Ortigas Center, Pasig City", details: "Business District" },
  { address: "SM Mall of Asia, Pasay", details: "Entertainment Complex" },
  { address: "Quezon City Memorial Circle", details: "Quezon City" },
  { address: "Intramuros, Manila", details: "Historic District" },
  { address: "Alabang Town Center, Muntinlupa", details: "Shopping District" },
  { address: "UP Diliman, Quezon City", details: "University Area" },
];

export default function LocationPickerModal({ isOpen, onClose, onSelect, type }: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // New state & ref for the custom toast notification
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

  const filteredLocations = popularLocations.filter((loc) =>
    loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to show modern errors instead of browser alerts
  const showError = (msg: string) => {
    setErrorMsg(msg);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMsg(null);
    }, 4000); // Disappears after 4 seconds
  };

  const handleSelectLocation = (location: Location) => {
    onSelect(location);
    onClose();
    // Reset state for future openings
    setTimeout(() => {
      setSearchQuery("");
      setCustomAddress("");
      setShowCustomInput(false);
      setIsLocating(false);
      setErrorMsg(null);
    }, 300);
  };

  const handleCustomSubmit = () => {
    if (customAddress.trim()) {
      handleSelectLocation({ address: customAddress.trim() });
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.display_name) {
            handleSelectLocation({
              address: data.display_name,
              details: "Your Current Location"
            });
          } else {
            throw new Error("Could not fetch address details");
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          showError("Could not determine your exact street address. Please enter it manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to retrieve your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "Unable to retrieve your location. Please enter your address manually.";
        }
        
        showError(errorMessage);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-[#041614]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-[1.5rem] max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Custom Toast Notification */}
        {errorMsg && (
          <div className="absolute -top-14 left-0 right-0 flex justify-center z-[110] animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-red-50 border border-red-100 shadow-lg rounded-full px-5 py-3 flex items-center gap-3 max-w-[90%]">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-800 truncate">{errorMsg}</p>
              <button 
                onClick={() => setErrorMsg(null)}
                className="text-red-400 hover:text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === "pickup" ? "bg-[#39B5A8]/10 text-[#39B5A8]" : "bg-[#FDB833]/10 text-[#FDB833]"}`}>
              {type === "pickup" ? <MapPin className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#041614]">
                {type === "pickup" ? "Pickup Location" : "Delivery Location"}
              </h2>
              <p className="text-sm text-gray-500 font-medium">Where are we headed?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!showCustomInput ? (
            <>
              {/* Search Bar */}
              <div className="p-5 pb-2 shrink-0">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#39B5A8] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search popular locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#39B5A8]/30 focus:ring-4 focus:ring-[#39B5A8]/10 outline-none transition-all text-[#041614] font-medium placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Location List Area */}
              <div className="overflow-y-auto p-5 pt-2 flex-1 space-y-2 custom-scrollbar relative">
                
                {/* Use Current Location Button */}
                {!searchQuery && (
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="w-full p-3 mb-2 rounded-xl border border-[#39B5A8]/20 bg-[#39B5A8]/5 hover:bg-[#39B5A8]/10 focus:outline-none focus:ring-2 focus:ring-[#39B5A8]/30 transition-all text-left group flex items-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-[#39B5A8]/20 flex items-center justify-center shrink-0">
                      {isLocating ? (
                        <Loader2 className="w-5 h-5 text-[#39B5A8] animate-spin" />
                      ) : (
                        <LocateFixed className="w-5 h-5 text-[#39B5A8] group-hover:scale-110 transition-transform" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#39B5A8] truncate">
                        {isLocating ? "Locating you..." : "Use current location"}
                      </p>
                      <p className="text-sm text-[#39B5A8]/70 truncate">Using GPS</p>
                    </div>
                  </button>
                )}

                {/* Filtered Locations */}
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLocation(location)}
                      className="w-full p-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#39B5A8]/20 transition-all text-left group flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#39B5A8] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#041614] truncate">{location.address}</p>
                        {location.details && (
                          <p className="text-sm text-gray-500 truncate">{location.details}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#39B5A8] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10 px-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Map className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No locations found for "{searchQuery}"</p>
                  </div>
                )}
              </div>

              {/* Enter Custom Button */}
              <div className="p-5 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-[1.5rem]">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-3.5 rounded-xl border-2 border-dashed border-[#39B5A8]/50 text-[#39B5A8] hover:bg-[#39B5A8]/5 hover:border-[#39B5A8] font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-[#39B5A8]/10"
                >
                  Cannot find it? Enter custom address
                </button>
              </div>
            </>
          ) : (
            /* Custom Address Input View */
            <div className="p-6 flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Complete Address
                </label>
                <textarea
                  autoFocus
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="Enter building, street, barangay, city..."
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#39B5A8]/30 focus:ring-4 focus:ring-[#39B5A8]/10 outline-none transition-all text-[#041614] font-medium min-h-[140px] resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customAddress.trim()}
                  className="flex-1 py-3.5 rounded-xl bg-[#39B5A8] hover:bg-[#2D8F85] text-white font-semibold shadow-lg shadow-[#39B5A8]/20 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#39B5A8]/30"
                >
                  Confirm Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}