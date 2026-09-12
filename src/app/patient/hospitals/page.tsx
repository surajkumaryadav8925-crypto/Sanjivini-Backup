"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Input, Badge } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  MapPin,
  Phone,
  Clock,
  Search,
  Heart,
  Stethoscope,
  Navigation,
  Loader2,
  Bed,
  Droplet,
  Globe2,
  SlidersHorizontal,
} from "lucide-react";
import {
  demoHospitals,
  DISTRICTS,
  BHAGALPUR_LOCATION,
  calculateDistance,
  type DistrictLocation,
  type HospitalTier,
  type Hospital,
} from "@/data/hospitals";
import { useSupabaseData } from "@/lib/data/mode";
import { fetchHospitals } from "@/lib/data/hospitals";
import { useTranslation } from "@/hooks/useTranslation";

type LocationStatus = "default" | "loading" | "granted" | "denied" | "error";

interface UserLocation {
  latitude: number;
  longitude: number;
  name?: string;
}

export default function HospitalsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("Bhagalpur");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [selectedDistrict, setSelectedDistrict] = useState<DistrictLocation>(BHAGALPUR_LOCATION);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("default");

  // --- Supabase-backed directory (production mode) ---
  const useDb = useSupabaseData();
  const [dbHospitals, setDbHospitals] = useState<Hospital[]>([]);
  const [dbLoading, setDbLoading] = useState(useDb);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    if (!useDb) return;
    let cancelled = false;
    fetchHospitals({ district: districtFilter })
      .then((rows) => {
        if (!cancelled) {
          setDbHospitals(rows);
          setDbError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setDbError(err instanceof Error ? err.message : "Failed to load hospitals");
      })
      .finally(() => {
        if (!cancelled) setDbLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [useDb, districtFilter]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: "My GPS Location",
        });
        setLocationStatus("granted");
        setIsLocationModalOpen(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const handleSelectDistrict = (district: DistrictLocation) => {
    setSelectedDistrict(district);
    setDistrictFilter(district.name);
    setUserLocation(null);
    setLocationStatus("default");
    setIsLocationModalOpen(false);
  };

  const referenceLatitude = userLocation?.latitude ?? selectedDistrict.latitude;
  const referenceLongitude = userLocation?.longitude ?? selectedDistrict.longitude;

  const source = useDb ? dbHospitals : demoHospitals;

  const hospitals = useMemo(() => {
    return source
      .map((h) => ({
        ...h,
        distance: calculateDistance(referenceLatitude, referenceLongitude, h.latitude, h.longitude),
      }))
      .filter((h) => {
        if (districtFilter !== "all" && h.district !== districtFilter) return false;
        if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.locality.toLowerCase().includes(search.toLowerCase())) return false;
        if (typeFilter !== "all" && h.type !== typeFilter) return false;
        if (tierFilter !== "all" && h.tier !== tierFilter) return false;
        if (emergencyOnly && !h.emergencyAvailable) return false;
        return true;
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [source, search, typeFilter, tierFilter, emergencyOnly, referenceLatitude, referenceLongitude]);

  const isLocationLoading = locationStatus === "loading";
  const showLocationMessage = locationStatus === "denied" || locationStatus === "error";

  const getTierBadgeVariant = (tier: HospitalTier) => {
    switch (tier) {
      case "Medical College":
        return "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "District Hospital":
        return "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "SDH":
        return "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "CHC":
        return "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "PHC":
        return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200";
    }
  };

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      {/* Top Banner & Location Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Regional Healthcare Network
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {userLocation ? "My GPS Location" : `${selectedDistrict.name}, ${selectedDistrict.state}`}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLocationModalOpen(true)}
              className="h-7 text-xs gap-1"
            >
              <Globe2 className="h-3 w-3" />
              Change District
            </Button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("patient.hospitals.title") || "Hospital & Facility Directory"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Discover Medical Colleges, District Hospitals, SDHs, and Primary Health Centers with real-time bed and blood availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SpeakButton
            text={`${t("patient.hospitals.title")}. Showing hospitals in ${selectedDistrict.name}. Use filters to find emergency services, free beds, and blood banks.`}
          />
        </div>
      </div>

      {showLocationMessage && (
        <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 mb-4">
          {locationStatus === "denied"
            ? "Location permission was denied. Defaulting to selected district center coordinates."
            : "Unable to retrieve device GPS. Defaulting to selected district center coordinates."}
        </div>
      )}

      {/* District Quick Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <Button
          variant={districtFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setDistrictFilter("all")}
          className="text-xs h-7 flex-shrink-0"
        >
          All 7 Districts
        </Button>
        {DISTRICTS.map((d) => (
          <Button
            key={d.name}
            variant={districtFilter === d.name ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelectDistrict(d)}
            className="text-xs h-7 flex-shrink-0"
          >
            {d.name}
          </Button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mb-6">
        <div className="lg:col-span-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hospitals by name or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full h-10 border rounded-lg px-3 text-sm bg-background text-foreground"
          >
            <option value="all">All Facility Tiers</option>
            <option value="Medical College">Medical College (Tertiary)</option>
            <option value="District Hospital">District Hospital (Secondary)</option>
            <option value="SDH">Sub-Divisional Hospital (SDH)</option>
            <option value="CHC">Community Health Center (CHC)</option>
            <option value="PHC">Primary Health Center (PHC)</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-10 border rounded-lg px-3 text-sm bg-background text-foreground"
          >
            <option value="all">{t("patient.hospitals.allTypes") || "All Ownership"}</option>
            <option value="Government">{t("patient.hospitals.government") || "Government"}</option>
            <option value="Private">{t("patient.hospitals.private") || "Private"}</option>
            <option value="Trust">{t("patient.hospitals.trust") || "Trust"}</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <Button
            variant={emergencyOnly ? "default" : "outline"}
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`w-full h-10 gap-2 ${emergencyOnly ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
          >
            <Heart className="h-4 w-4" />
            24x7 Emergency
          </Button>
        </div>
      </div>

      {/* Database status states (production mode) */}
      {useDb && dbLoading && (
        <Card className="border-dashed mb-4">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-3 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading hospitals from the health network...</p>
          </CardContent>
        </Card>
      )}
      {useDb && dbError && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20 mb-4">
          <CardContent className="py-6 text-center space-y-3">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Could not load the hospital directory: {dbError}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDbLoading(true);
                setDbError(null);
                fetchHospitals({ district: districtFilter })
                  .then((rows) => setDbHospitals(rows))
                  .catch((err: unknown) => setDbError(err instanceof Error ? err.message : "Failed to load hospitals"))
                  .finally(() => setDbLoading(false));
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hospital Cards Grid */}
      {useDb && dbError ? null : hospitals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <SlidersHorizontal className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="text-base font-semibold text-foreground">
              {useDb && dbLoading ? "Loading hospitals..." : "No matching facilities found"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {useDb && dbLoading
                ? "Fetching the latest hospital directory from the health network."
                : useDb && dbError
                ? "Hospital data is unavailable right now. Please try again."
                : useDb && !dbError
                ? "No verified healthcare facilities match your current filters in this district."
                : "No healthcare centers match your current combination of filters in this district. Try selecting \"All 7 Districts\" or clearing your tier filters."}
            </p>
            {!dbLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setTierFilter("all");
                  setDistrictFilter("all");
                  setEmergencyOnly(false);
                }}
                className="mt-4"
              >
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((h) => (
            <Card key={h.id} className="hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
              <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getTierBadgeVariant(h.tier)}`}>
                          {h.tier}
                        </span>
                        <Badge variant={h.type === "Government" ? "info" : "success"} className="text-[11px]">
                          {h.type}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-foreground text-base leading-snug line-clamp-2">
                        {h.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {h.locality}, {h.district}
                      </p>
                    </div>
                  </div>

                  {/* Proximity & Hours */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <MapPin className="h-3 w-3 text-primary" />
                      {h.distance !== undefined ? `${h.distance.toFixed(1)} km away` : "Distance N/A"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {h.openingHours}
                    </span>
                  </div>

                  {/* Live Capacity Indicators */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                      <Bed className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-emerald-700 dark:text-emerald-300">
                          {h.availableBeds} / {h.totalBeds}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Free Beds</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-muted/60 border border-border flex items-center gap-2">
                      <Droplet className={`h-4 w-4 flex-shrink-0 ${h.bloodBankAvailable ? "text-red-500" : "text-muted-foreground"}`} />
                      <div>
                        <p className={`font-semibold ${h.bloodBankAvailable ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                          {h.bloodBankAvailable ? "Available" : "No Bank"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Blood Center</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges / Departments */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {h.emergencyAvailable && (
                      <Badge variant="destructive" className="text-[11px] py-0">
                        24x7 Emergency
                      </Badge>
                    )}
                    {h.icuAvailable && (
                      <Badge variant="secondary" className="text-[11px] py-0">
                        ICU Facility
                      </Badge>
                    )}
                    {h.departments
                      .filter((d) => d.available)
                      .slice(0, 2)
                      .map((d) => (
                        <Badge key={d.id} variant="outline" className="text-[11px] py-0">
                          {d.name}
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-border mt-3">
                  <Link href={`/patient/hospitals/${h.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {t("common.details") || "Details"}
                    </Button>
                  </Link>
                  <a href={`tel:${h.phone}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {t("patient.hospitals.call") || "Call"}
                    </Button>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <Navigation className="h-3.5 w-3.5" />
                      {t("patient.hospitals.nav") || "Maps"}
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Location Switcher Dialog */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary" />
              Select Healthcare District in Bihar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Select your administrative district to view nearby primary health centers, sub-divisional hospitals, and medical colleges with calculated road distance.
            </p>

            <Button
              onClick={handleUseCurrentLocation}
              disabled={isLocationLoading}
              variant="outline"
              className="w-full justify-center gap-2 h-10 border-primary/40 text-primary hover:bg-primary/5"
            >
              {isLocationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Detecting GPS coordinates...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Use My Current GPS Location
                </>
              )}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or choose by district</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {DISTRICTS.map((dist) => {
                const isSelected = selectedDistrict.name === dist.name && !userLocation;
                return (
                  <button
                    key={dist.name}
                    type="button"
                    onClick={() => handleSelectDistrict(dist)}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20"
                        : "border-border hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <span className="font-semibold text-sm flex items-center justify-between w-full">
                      {dist.name}
                      {isSelected && <Badge variant="default" className="text-[10px] h-4">Selected</Badge>}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {dist.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsLocationModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}