"use client";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Input, Badge } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { MapPin, Phone, Clock, Search, Heart, Stethoscope, Navigation, Loader2 } from "lucide-react";
import { demoHospitals, BHAGALPUR_LOCATION, calculateDistance } from "@/data/hospitals";
import { useTranslation } from "@/hooks/useTranslation";

type LocationStatus = "default" | "loading" | "granted" | "denied" | "error";

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function HospitalsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("default");

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
        });
        setLocationStatus("granted");
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

  const referenceLatitude = userLocation?.latitude ?? BHAGALPUR_LOCATION.latitude;
  const referenceLongitude = userLocation?.longitude ?? BHAGALPUR_LOCATION.longitude;

  const hospitals = useMemo(() => {
    return demoHospitals.map(h => ({
      ...h,
      distance: calculateDistance(referenceLatitude, referenceLongitude, h.latitude, h.longitude)
    })).filter(h => {
      if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && h.type !== typeFilter) return false;
      if (emergencyOnly && !h.emergencyAvailable) return false;
      return true;
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [search, typeFilter, emergencyOnly, referenceLatitude, referenceLongitude]);

  const isLocationLoading = locationStatus === "loading";
  const showLocationMessage = locationStatus === "denied" || locationStatus === "error";

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {locationStatus === "granted" ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <MapPin className="h-4 w-4" />
                <span>Showing hospitals near your current location</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{BHAGALPUR_LOCATION.name}, {BHAGALPUR_LOCATION.state}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                disabled={isLocationLoading}
                className="gap-1.5 w-full sm:w-auto text-xs h-7"
              >
                {isLocationLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3" />
                    Use My Current Location
                  </>
                )}
              </Button>
            </div>
          )}
          {showLocationMessage && (
            <div className="text-xs text-amber-600 mt-1 mb-2">
              {locationStatus === "denied"
                ? "Location permission was denied. Showing hospitals from the default area."
                : "Unable to get your current location. Showing hospitals from the default area."}
            </div>
          )}
          <h1 className="text-2xl font-bold">{t("patient.hospitals.title")}</h1>
        </div>
        <SpeakButton text={`${t("patient.hospitals.title")}. ${t("patient.hospitals.searchPlaceholder")}`} />
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t("patient.hospitals.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-lg px-3 py-2 w-full md:w-40">
          <option value="all">{t("patient.hospitals.allTypes")}</option>
          <option value="Government">{t("patient.hospitals.government")}</option>
          <option value="Private">{t("patient.hospitals.private")}</option>
          <option value="Trust">{t("patient.hospitals.trust")}</option>
        </select>
        <Button variant={emergencyOnly ? "default" : "outline"} onClick={() => setEmergencyOnly(!emergencyOnly)} className="gap-2"><Heart className="h-4 w-4" />{t("patient.hospitals.emergency")}</Button>
      </div>
      {hospitals.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">{t("patient.hospitals.noHospitalsFound")}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map(h => (
            <Card key={h.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start"><div className="flex-1"><h3 className="font-semibold">{h.name}</h3><p className="text-sm text-muted-foreground">{h.locality}</p></div><Badge variant={h.type === "Government" ? "info" : "success"}>{h.type}</Badge></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-3 w-3" /> {h.distance?.toFixed(1)} {t("patient.hospitals.kmAway")}<span className="mx-1">?</span><Clock className="h-3 w-3" /> {h.openingHours}</div>
                <div className="flex flex-wrap gap-1">{h.emergencyAvailable && <Badge variant="destructive" className="text-xs">24x7 Emergency</Badge>}{h.departments.filter(d => d.available).slice(0, 2).map(d => <Badge key={d.id} variant="secondary" className="text-xs">{d.name}</Badge>)}</div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/patient/hospitals/${h.id}`} className="flex-1"><Button variant="outline" size="sm" className="w-full gap-1"><Stethoscope className="h-3 w-3" />{t("common.details")}</Button></Link>
                  <a href={`tel:${h.phone}`} className="flex-1"><Button variant="outline" size="sm" className="w-full gap-1"><Phone className="h-4 w-4" />{t("patient.hospitals.call")}</Button></a>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`} target="_blank" rel="noopener" className="flex-1"><Button variant="outline" size="sm" className="w-full gap-1"><Navigation className="h-4 w-4" />{t("patient.hospitals.nav")}</Button></a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}