import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Clock, MapPin, Navigation, Package, User, Phone } from "lucide-react";
import { loadGoogleMapsApi, hasGoogleMapsApiKey } from "@/lib/google-maps";
import type { DeliveryLocation } from "@/lib/location-types";

interface MapPreviewProps {
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation?: DeliveryLocation | null;
  deliveryLocation?: DeliveryLocation | null;
  driverName?: string;
  driverPhone?: string;
  estimatedTime?: string;
  trackingNumber?: string;
  showDriverInfo?: boolean;
  isDriverView?: boolean;
  onETAUpdate?: (eta: string, distance: string) => void;
}

function buildRoutePoint(location?: DeliveryLocation | null) {
  if (
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number"
  ) {
    return { lat: location.lat, lng: location.lng };
  }

  return location?.address;
}

export default function MapPreview({
  pickupAddress,
  deliveryAddress,
  pickupLocation,
  deliveryLocation,
  driverName = "Juan Dela Cruz",
  driverPhone = "+63 912 345 6789",
  estimatedTime = "Route pending",
  trackingNumber,
  showDriverInfo = false,
  isDriverView = false,
  onETAUpdate,
}: MapPreviewProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const deliveryMarkerRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState({
    duration: estimatedTime,
    distance: "Route pending",
  });

  const mapsEnabled = hasGoogleMapsApiKey();

  const routeOrigin = useMemo(
    () => buildRoutePoint(pickupLocation ?? { address: pickupAddress }),
    [pickupAddress, pickupLocation],
  );
  const routeDestination = useMemo(
    () => buildRoutePoint(deliveryLocation ?? { address: deliveryAddress }),
    [deliveryAddress, deliveryLocation],
  );

  useEffect(() => {
    setRouteSummary((prev) => ({
      duration: prev.duration === "Route pending" ? estimatedTime : prev.duration,
      distance: prev.distance,
    }));
  }, [estimatedTime]);

  useEffect(() => {
    if (!mapsEnabled || !mapElementRef.current) {
      return;
    }

    let cancelled = false;

    const initializeMap = async () => {
      setIsLoading(true);

      try {
        const google = await loadGoogleMapsApi();
        if (cancelled || !mapElementRef.current) {
          return;
        }

        mapRef.current = new google.maps.Map(mapElementRef.current, {
          center: { lat: 14.5995, lng: 120.9842 },
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: mapRef.current,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#1A5D56",
            strokeOpacity: 0.92,
            strokeWeight: 6,
          },
        });

        pickupMarkerRef.current = new google.maps.Marker({
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#38BDF8",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
        });

        deliveryMarkerRef.current = new google.maps.Marker({
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#1A5D56",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
        });
      } catch (error) {
        console.error("Unable to initialize route map", error);
        setErrorMsg("Google Maps could not load for this route preview.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void initializeMap();

    return () => {
      cancelled = true;
    };
  }, [mapsEnabled]);

  useEffect(() => {
    if (
      !mapsEnabled ||
      !mapRef.current ||
      !directionsRendererRef.current ||
      !routeOrigin ||
      !routeDestination
    ) {
      return;
    }

    let cancelled = false;

    const renderRoute = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const google = await loadGoogleMapsApi();
        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
          {
            origin: routeOrigin,
            destination: routeDestination,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result: any, status: string) => {
            if (cancelled) {
              return;
            }

            if (status !== google.maps.DirectionsStatus.OK || !result) {
              setErrorMsg("We couldn't draw the route yet. Check the selected addresses.");
              setIsLoading(false);
              return;
            }

            directionsRendererRef.current.setDirections(result);

            const leg = result.routes?.[0]?.legs?.[0];
            const durationText = leg?.duration?.text || estimatedTime;
            const distanceText = leg?.distance?.text || "Route pending";

            setRouteSummary({
              duration: durationText,
              distance: distanceText,
            });
            onETAUpdate?.(durationText, distanceText);

            const startLocation = leg?.start_location;
            const endLocation = leg?.end_location;

            if (startLocation && pickupMarkerRef.current) {
              pickupMarkerRef.current.setPosition(startLocation);
            }

            if (endLocation && deliveryMarkerRef.current) {
              deliveryMarkerRef.current.setPosition(endLocation);
            }

            setIsLoading(false);
          },
        );
      } catch (error) {
        console.error("Unable to render Google Maps directions", error);
        setErrorMsg("We couldn't load route directions right now.");
        setIsLoading(false);
      }
    };

    void renderRoute();

    return () => {
      cancelled = true;
    };
  }, [
    deliveryAddress,
    estimatedTime,
    mapsEnabled,
    onETAUpdate,
    pickupAddress,
    routeDestination,
    routeOrigin,
  ]);

  if (!mapsEnabled) {
    return (
      <div className="relative min-h-[420px] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#F8FBFB] p-8">
        <div className="flex h-full min-h-[340px] flex-col items-center justify-center text-center">
          <MapPin className="h-10 w-10 text-[#39B5A8]" />
          <h3 className="mt-4 text-2xl font-bold text-[#041614]">
            Google Maps key required
          </h3>
          <p className="mt-2 max-w-md text-sm font-medium text-gray-500">
            Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `frontend/.env.local` to
            enable location mapping and live route visualization.
          </p>
          <div className="mt-8 grid w-full max-w-xl gap-4 rounded-[1.75rem] bg-white p-5 text-left shadow-sm md:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Pickup
              </p>
              <p className="mt-1 font-semibold text-[#041614]">{pickupAddress}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Delivery
              </p>
              <p className="mt-1 font-semibold text-[#041614]">{deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#F1F5F9]">
      <div ref={mapElementRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
        <div className="pointer-events-auto rounded-[1.5rem] border border-white/70 bg-white/92 p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A5D56] text-white">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {trackingNumber ? `Track #${trackingNumber}` : "Customer route"}
              </p>
              <p className="text-lg font-bold text-slate-900">
                {showDriverInfo || isDriverView ? "Live route map" : "Delivery route"}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto rounded-[1.5rem] bg-[#1A5D56] px-5 py-4 text-white shadow-xl">
          <div className="mb-1 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#38BDF8]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
              Estimated travel time
            </span>
          </div>
          <p className="text-2xl font-black">{routeSummary.duration}</p>
          <p className="text-xs font-semibold text-white/75">{routeSummary.distance}</p>
        </div>
      </div>

      {showDriverInfo && (
        <div className="pointer-events-none absolute bottom-28 left-5 rounded-[1.5rem] border border-white/70 bg-white/94 p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F9F8] text-[#1A5D56]">
              <User className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Assigned rider
              </p>
              <p className="text-lg font-bold text-[#041614]">{driverName}</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Phone className="h-4 w-4 text-[#39B5A8]" />
                <span>{driverPhone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
        <div className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/94 p-4 shadow-xl md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#38BDF8]/10 text-[#38BDF8]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Pickup
              </p>
              <p className="font-semibold text-[#041614]">{pickupAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#1A5D56]/10 text-[#1A5D56]">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Delivery
              </p>
              <p className="font-semibold text-[#041614]">{deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {(isLoading || errorMsg) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-lg">
            {isLoading ? (
              <>
                <Clock className="h-5 w-5 animate-pulse text-[#39B5A8]" />
                <span className="font-semibold text-[#041614]">
                  Drawing route on Google Maps...
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-[#041614]">{errorMsg}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
