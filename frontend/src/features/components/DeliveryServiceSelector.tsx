import { Zap, Clock, Truck, Users, Package, AlertCircle, TrendingUp, MapPin, Car, Bike, ShieldCheck, ChevronRight, X, CheckCircle2, Navigation, Info, Search, HelpCircle, ReceiptText } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api-client";

import { 
  VehicleType, 
  DeliveryMode, 
  ServiceOption, 
} from "../config/businessRules";
import { 
  calculatePricing, 
  PricingBreakdown 
} from "../utils/pricingCalculations";

const FALLBACK_HUBS = [
  { id: "hub-1", name: "SM North EDSA PakiHub", address: "North Ave, Quezon City", distance: "1.2 km", status: "Open", capacity: "High" },
  { id: "hub-2", name: "Cubao Expo Terminal", address: "Socorro, Quezon City", distance: "4.5 km", status: "Busy", capacity: "Medium" },
  { id: "hub-3", name: "BGC High Street Hub", address: "Taguig, Metro Manila", distance: "12.0 km", status: "Open", capacity: "Full" },
  { id: "hub-4", name: "Makati Central Hub", address: "Ayala Ave, Makati", distance: "15.3 km", status: "Open", capacity: "High" },
];

type HubOption = {
  id: string;
  name: string;
  address: string;
  distance: string;
  status: string;
  capacity: string;
};

interface DeliveryServiceSelectorProps {
  distanceKm: number; 
  onSelect: (serviceId: string, price: number, options?: any) => void;
  onConfirm?: (serviceId: string, finalPrice: number, options?: any) => void;
  selectedService: string;
  packageSize?: "small" | "medium" | "large" | "xl";
  totalParcels: number;
  onSelectDropOffPoint: (hub: any) => void;
  selectedDropOffPoint: any | null;
  isSurgeActive?: boolean;
  selectedCategory?: string;
  cartItems?: Array<{ itemType: string; [key: string]: any }>; 
}

export default function DeliveryServiceSelector({
  distanceKm = 0,
  onSelect,
  onConfirm,
  selectedService,
  packageSize = "small",
  totalParcels = 1,
  onSelectDropOffPoint,
  selectedDropOffPoint,
  isSurgeActive = false,
  selectedCategory = "general",
  cartItems = [],
}: DeliveryServiceSelectorProps) {
  const [showHubPicker, setShowHubPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableHubs, setAvailableHubs] = useState<HubOption[]>(FALLBACK_HUBS);
  const isXLPackage = packageSize === "xl";

  useEffect(() => {
    let isMounted = true;

    const loadHubs = async () => {
      try {
        const response = await apiFetch("/api/parcel-drafts/hubs");
        const result = await response.json();

        if (!response.ok) {
          return;
        }

        if (isMounted && Array.isArray(result.hubs) && result.hubs.length > 0) {
          setAvailableHubs(result.hubs);
        }
      } catch {
        if (isMounted) {
          setAvailableHubs(FALLBACK_HUBS);
        }
      }
    };

    void loadHubs();

    return () => {
      isMounted = false;
    };
  }, []);

  const isSensitiveItem = useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.some(item => {
        const typeString = item.type || item.itemType || ""; 
        return ["food", "fragile"].includes(typeString.toLowerCase());
      });
    }
    return ["food", "fragile"].includes((selectedCategory || "").toLowerCase());
  }, [cartItems, selectedCategory]);

  const [selectedVehicle] = useState<VehicleType>(
    isXLPackage ? VehicleType.SEDAN : VehicleType.MOTORCYCLE
  );

  const safeDistance = distanceKm || 0;
  const relayHops = Math.max(1, Math.min(2, Math.ceil(safeDistance / 10))); 

  const getPricingData = (id: string): PricingBreakdown => {
    const params = {
      isSurgeActive,
      packageSize,
      distanceKm: safeDistance,
    };

    if (id === "pakishare") {
      return calculatePricing({
        ...params,
        vehicleType: VehicleType.PUV_RELAY,
        deliveryMode: DeliveryMode.RELAY,
        serviceOption: ServiceOption.CHEAP,
        hops: relayHops,
        applyDiscount: true, 
      });
    } else {
      return calculatePricing({
        ...params,
        vehicleType: isXLPackage ? selectedVehicle : VehicleType.MOTORCYCLE,
        deliveryMode: DeliveryMode.DIRECT,
        serviceOption: ServiceOption.FAST,
        applyDiscount: false,
      });
    }
  };

  const currentPricing = useMemo(() => {
    if (!selectedService) return null;
    return getPricingData(selectedService);
  }, [selectedService, totalParcels, packageSize, isSurgeActive, safeDistance]);

  // Updated useEffect to include allowCash logic
  useEffect(() => {
    if (selectedService && currentPricing) {
      const finalPrice = (currentPricing.finalTotal || 0) * (totalParcels || 1);
      onSelect(selectedService, finalPrice, {
        hub: selectedDropOffPoint,
        vehicleType: selectedVehicle,
        // LOGIC SYNC: Only PakiExpress allows Cash
        allowCash: selectedService === "PakiExpress",
        isValid: selectedService === "pakishare" ? (!!selectedDropOffPoint && !isSensitiveItem) : true
      });
    }
  }, [selectedService, selectedDropOffPoint, currentPricing, totalParcels, isSensitiveItem]);

  useEffect(() => {
    if (isSensitiveItem && selectedService !== "PakiExpress") {
      const pricing = getPricingData("PakiExpress");
      const price = (pricing.finalTotal || 0) * (totalParcels || 1);
      onSelect("PakiExpress", price, {
        hub: selectedDropOffPoint,
        vehicleType: selectedVehicle,
        allowCash: true,
        isValid: true
      });
    }
  }, [isSensitiveItem, selectedService, totalParcels]);

  const filteredHubs = useMemo(() => {
    return availableHubs.filter(hub => 
      hub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      hub.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableHubs, searchQuery]);

  const services = [
    { 
      id: "pakishare", 
      name: "PakiShare", 
      icon: <Users className="w-5 h-5" />, 
      desc: "Relay Economy", 
      time: "2-4 hrs", 
      available: !isSensitiveItem && totalParcels === 1,
      note: isSensitiveItem 
        ? "Strictly no Food/Fragile items allowed" 
        : totalParcels > 1 ? "Max 1 parcel allowed" : null,
      rules: ["₱30 per hop", "Digital Payment Only", "72hr delivery window"]
    },
    { 
      id: "PakiExpress", 
      name: "PakiExpress", 
      icon: <Zap className="w-5 h-5" />, 
      desc: "Direct Delivery", 
      time: "30-60 mins", 
      available: isSensitiveItem ? true : totalParcels <= 3,
      note: totalParcels > 3 && !isSensitiveItem ? "Max 3 parcels" : null,
      rules: ["₱50 Base + ₱10/km", "Cash on Delivery OK", "Safe for Food & Fragile"]
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-2xl shadow-gray-200/50 space-y-6 relative overflow-visible font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#041614] tracking-tight">Select delivery service</h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-400 border border-gray-100">
              <Navigation className="w-3 h-3" /> {safeDistance.toFixed(1)} km
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-400 border border-gray-100">
              <Package className="w-3 h-3" /> {totalParcels} {totalParcels === 1 ? 'unit' : 'units'}
            </span>
            {isSensitiveItem && (
               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 rounded-lg text-[10px] font-bold text-orange-600 border border-orange-100">
                <AlertCircle className="w-3 h-3" /> PakiExpress Required
              </span>
            )}
          </div>
        </div>
        {isSurgeActive && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-100">
            <TrendingUp className="w-4 h-4 animate-bounce" />
            <span className="text-[10px] font-bold">Peak Surge (+₱20)</span>
          </div>
        )}
      </div>

      {/* SERVICE CARDS */}
      <div className="grid gap-3">
        {services.map((service) => {
          const pricing = getPricingData(service.id);
          const price = (pricing.finalTotal || 0) * (totalParcels || 1);
          const isSelected = selectedService === service.id;

          return (
            <div key={service.id} className="relative">
              <button
                type="button"
                disabled={!service.available}
                onClick={() => onSelect(service.id, price, { allowCash: service.id === "PakiExpress" })}
                className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  isSelected 
                  ? "border-[#39B5A8] bg-[#F0F9F8] shadow-md ring-4 ring-[#39B5A8]/5" 
                  : "border-gray-50 bg-gray-50/40 hover:border-gray-200 hover:bg-white"
                } ${!service.available ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isSelected ? "bg-[#39B5A8] text-white scale-105 shadow-lg shadow-[#39B5A8]/20" : "bg-white text-gray-400 border border-gray-100"
                  }`}>
                    {service.icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-base ${isSelected ? "text-[#041614]" : "text-gray-500"}`}>
                        {service.name}
                      </p>
                      {service.id === "pakibusiness" && totalParcels >= 10 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[9px] font-bold rounded-md uppercase">
                          35% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-gray-400">{service.desc}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full" />
                      <span className="text-[11px] font-bold text-[#39B5A8]">{service.time}</span>
                    </div>
                    {service.note && !service.available && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {service.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-xl font-bold text-[#041614]">₱{Math.round(price)}</p>
                  <span className="text-[9px] text-gray-400 font-bold tracking-tight">Per {totalParcels > 1 ? 'Batch' : 'Delivery'}</span>
                </div>
              </button>

              {isSelected && (
                <div className="mt-3 px-4 py-3 bg-white border border-gray-100 rounded-xl flex flex-wrap gap-x-4 gap-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {service.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#39B5A8]" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{rule}</span>
                    </div>
                  ))}
                </div>
              )}

              {service.id === "pakishare" && isSelected && (
                <div className="mt-3 px-2 animate-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={() => setShowHubPicker(true)}
                    className={`w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-between transition-all group/hub ${
                      selectedDropOffPoint 
                      ? "border-[#39B5A8] bg-white text-[#041614]" 
                      : "border-orange-200 bg-orange-50/30 hover:bg-orange-50 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${selectedDropOffPoint ? "bg-[#39B5A8] text-white" : "bg-orange-100 text-orange-600"}`}>
                        {selectedDropOffPoint ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <p className={`text-[9px] font-bold ${selectedDropOffPoint ? "text-[#39B5A8]" : "text-orange-600"}`}>
                          {selectedDropOffPoint ? "Drop-off hub selected" : "Action required"}
                        </p>
                        <p className="text-sm font-bold truncate max-w-[200px]">
                          {selectedDropOffPoint ? selectedDropOffPoint.name : "Choose where you'll drop off"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 group-hover/hub:text-[#39B5A8] transition-colors">
                        <span className="text-[10px] font-bold uppercase">Change</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PRICING BREAKDOWN SECTION */}
      {selectedService && currentPricing && (
        <div className="bg-[#F8FAFC] rounded-[1.5rem] p-5 border border-gray-100 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200/50">
             <ReceiptText className="w-4 h-4 text-gray-400" />
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bill Summary</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-medium">Subtotal (Net)</span>
              <span className="text-[#041614] font-bold">
                ₱{Math.round((currentPricing.subtotal || 0) * (totalParcels || 1))}
              </span>
            </div>

            {isSurgeActive && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-400 font-medium">Peak Surge Fee</span>
                <span className="text-red-500 font-bold">+₱{20 * (totalParcels || 1)}</span>
              </div>
            )}

            {(currentPricing.discount || 0) > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#39B5A8] font-medium">Discount applied</span>
                <span className="text-[#39B5A8] font-bold">
                  -₱{Math.round((currentPricing.discount || 0) * (totalParcels || 1))}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-medium">VAT (12%)</span>
              <span className="text-[#041614] font-bold">
                ₱{Math.round((currentPricing.vat || 0) * (totalParcels || 1))}
              </span>
            </div>

            <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="text-base font-bold text-[#041614]">Total Amount</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#39B5A8]">
                  ₱{Math.round((currentPricing.finalTotal || 0) * (totalParcels || 1))}
                </span>
                <p className="text-[10px] text-gray-400 font-bold -mt-1 uppercase tracking-tighter">Philippine Peso</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HUB PICKER MODAL (Unchanged) */}
      {showHubPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-[#041614]/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowHubPicker(false)} />
          
          <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              {/* SIDEBAR */}
              <div className="w-full md:w-80 bg-gray-50 p-8 border-r border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#39B5A8] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-[#39B5A8]/20">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#041614] leading-tight mb-2">Find a<br/>PakiHub</h3>
                  <p className="text-sm font-medium text-gray-400 leading-relaxed">
                    Select a drop-off point to activate PakiShare rates.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input 
                         className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#39B5A8]/20 focus:border-[#39B5A8] transition-all"
                         placeholder="Search nearby areas..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                       />
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                       <div className="flex items-center gap-2 mb-1">
                          <Info className="w-3 h-3 text-blue-500" />
                          <span className="text-[9px] font-bold text-blue-500 uppercase">Pro tip</span>
                       </div>
                       <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                         Dropping off at a hub with "Open" status ensures faster processing.
                       </p>
                    </div>
                </div>
              </div>

              {/* LIST AREA */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="p-4 md:p-8 flex items-center justify-between border-b border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Showing {filteredHubs.length} available hubs</span>
                    <button onClick={() => setShowHubPicker(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                       <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredHubs.map((hub) => (
                    <button
                      key={hub.id}
                      onClick={() => {
                        onSelectDropOffPoint(hub);
                        setShowHubPicker(false);
                      }}
                      className={`text-left p-6 rounded-3xl border-2 transition-all group relative ${
                        selectedDropOffPoint?.id === hub.id 
                        ? "border-[#39B5A8] bg-[#F0F9F8]" 
                        : "border-gray-50 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${selectedDropOffPoint?.id === hub.id ? "bg-[#39B5A8] text-white" : "bg-gray-100 text-[#39B5A8]"}`}>
                            <Navigation className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              hub.status === 'Busy' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                            }`}>{hub.status}</span>
                            <span className="text-xs font-bold text-[#041614] mt-2">{hub.distance}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-[#041614] mb-1 group-hover:text-[#39B5A8] transition-colors">
                          {hub.name}
                        </h4>
                        <p className="text-[11px] font-medium text-gray-400 line-clamp-1">{hub.address}</p>
                      </div>

                      {selectedDropOffPoint?.id === hub.id && (
                        <div className="absolute bottom-4 right-6 text-[#39B5A8] animate-in slide-in-from-right-2">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-4 border border-gray-100">
        <div className="p-2 bg-white rounded-lg shadow-sm">
           <ShieldCheck className="w-4 h-4 text-[#39B5A8]" />
        </div>
        <div>
           <p className="text-[11px] font-bold text-[#041614] mb-0.5">PakiShip Transparency</p>
           <p className="text-[11px] font-medium text-gray-400 leading-tight">
             Base rates adjusted for <b>{packageSize}</b> size. {isXLPackage ? "XL items restricted to Sedan/SUV only." : "Real-time tracking included."}
          </p>
        </div>
      </div>

    </div>
  );
}
