import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Package, Clock, Filter, Search, Loader2 } from "lucide-react";
import {
  fetchCustomerActiveDeliveries,
  type ActiveDelivery,
} from "@/lib/customer-dashboard";

const logoImg = "/assets/d0a94c34a139434e20f5cb9888d8909dd214b9e7.png";

export function AllDeliveriesPage() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
  const [summary, setSummary] = useState({
    totalActive: 0,
    inTransit: 0,
    outForDelivery: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const result = await fetchCustomerActiveDeliveries({
          search: searchQuery,
          status: filterStatus,
        });
        if (!isMounted) return;
        setDeliveries(result.deliveries);
        setSummary(result.summary);
        setErrorMsg(null);
      } catch (error) {
        if (!isMounted) return;
        setErrorMsg(error instanceof Error ? error.message : "Unable to load deliveries.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, filterStatus]);

  return (
    <div className="min-h-screen bg-[#F0F9F8] text-[#1A5D56] font-sans">
      <header className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-[#39B5A8]/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <img src={logoImg} alt="PakiSHIP" className="h-9" />
        <button
          onClick={() => navigate("/customer/home")}
          className="flex items-center gap-2 px-4 py-2 hover:bg-[#39B5A8]/5 rounded-xl transition-colors text-[#39B5A8] font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#041614] mb-2">All Active Deliveries</h1>
          <p className="text-[#39B5A8] text-lg font-semibold">Track and manage your ongoing shipments</p>
        </div>

        <div className="bg-white border border-[#39B5A8]/10 rounded-[2rem] p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[#39B5A8]/20 rounded-xl focus:outline-none focus:border-[#39B5A8] transition-colors"
                placeholder="Search by tracking number or location..."
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#39B5A8]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-[#39B5A8]/20 rounded-xl focus:outline-none focus:border-[#39B5A8] transition-colors font-bold text-sm"
              >
                <option value="all">All Status</option>
                <option value="intransit">In Transit</option>
                <option value="outfordelivery">Out for Delivery</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#39B5A8]/10 rounded-xl p-6">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Active</p>
            <p className="text-3xl font-black text-[#041614]">{summary.totalActive}</p>
          </div>
          <div className="bg-white border border-[#39B5A8]/10 rounded-xl p-6">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">In Transit</p>
            <p className="text-3xl font-black text-[#54A0CC]">{summary.inTransit}</p>
          </div>
          <div className="bg-white border border-[#39B5A8]/10 rounded-xl p-6">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Out for Delivery</p>
            <p className="text-3xl font-black text-[#FDB833]">{summary.outForDelivery}</p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-12 text-center">
              <Loader2 className="w-10 h-10 text-[#39B5A8] mx-auto mb-3 animate-spin" />
              <p className="text-[#39B5A8] font-bold">Loading active deliveries...</p>
            </div>
          ) : errorMsg ? (
            <div className="bg-white border border-red-200 rounded-[1.5rem] p-8 text-center">
              <p className="text-red-500 font-bold">{errorMsg}</p>
            </div>
          ) : deliveries.length > 0 ? (
            deliveries.map((item) => (
              <div key={item.id} className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-6 flex flex-wrap items-center justify-between gap-4 hover:border-[#39B5A8]/30 transition-all shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#F0F9F8] rounded-xl flex items-center justify-center border border-[#39B5A8]/5">
                    <Package className="w-6 h-6 text-[#39B5A8]" />
                  </div>
                  <div>
                    <h4 className="text-[#041614] font-black text-lg">{item.trackingNumber}</h4>
                    <p className="text-gray-500 text-sm font-medium">{item.to}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[#39B5A8] text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.timeLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Status</span>
                    <span className="text-sm font-black uppercase tracking-wider text-[#54A0CC]">
                      {item.status}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/customer/track-package", {
                        state: { trackingNumber: item.trackingNumber },
                      })
                    }
                    className="bg-[#041614] text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-[#123E3A] transition-all shadow-md active:scale-95"
                  >
                    Track Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-[#39B5A8]/10 rounded-[1.5rem] p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">No active deliveries found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
