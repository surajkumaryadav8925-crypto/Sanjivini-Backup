"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription, Badge } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  Phone,
  MapPin,
  Heart,
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  Share2,
  Navigation,
  Activity,
  Radio,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { demoHospitals, DISTRICTS } from "@/data/hospitals";

export default function EmergencyPage() {
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Bhagalpur");
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Attempt to acquire coordinates for emergency dispatch
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          // Default to Bhagalpur center if permission denied
          setGeoCoords({ lat: 25.2425, lng: 86.9842 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const handleRefreshLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        () => setLocating(false),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocating(false);
    }
  };

  const emergencyHospitals = demoHospitals.filter(
    (h) => h.district === selectedDistrict && (h.emergencyAvailable || h.icuAvailable)
  );

  const sosMessage = `EMERGENCY MEDICAL ALERT! I need immediate medical assistance. My coordinates: ${
    geoCoords ? `https://maps.google.com/?q=${geoCoords.lat.toFixed(5)},${geoCoords.lng.toFixed(5)}` : "Location pending"
  }. Please send ambulance/help immediately.`;

  const emergencyInstructions = `${t("patient.emergency.medicalEmergency")}. ${t("patient.emergency.stayCalm")}. ${t("patient.emergency.whileWaitingForHelp")}: ${t("patient.emergency.instruction1")}. ${t("patient.emergency.instruction2")}. ${t("patient.emergency.instruction3")}. ${t("patient.emergency.instruction4")}.`;

  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-red-600 dark:text-red-500">
            <Radio className="h-6 w-6 animate-pulse text-red-600" />
            {t("patient.emergency.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("patient.emergency.stayCalm")}</p>
        </div>
        <SpeakButton text={emergencyInstructions} />
      </div>

      {/* Critical Banner */}
      <Alert className="border-2 border-red-600 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200">
        <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
        <AlertDescription className="text-base font-semibold">
          {t("patient.emergency.medicalEmergency")} &bull; Call 108 for Immediate State Ambulance Dispatch
        </AlertDescription>
      </Alert>

      {/* 1-Tap SOS GPS Dispatch Hub */}
      <Card className="border-2 border-red-500/60 shadow-lg bg-gradient-to-br from-red-500/10 via-background to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-red-600" />
              1-Tap SOS Emergency Broadcast
            </span>
            <Badge variant="outline" className="font-mono text-xs">
              {geoCoords ? `${geoCoords.lat.toFixed(4)}, ${geoCoords.lng.toFixed(4)}` : "Acquiring GPS..."}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Instantly transmit your live GPS position and emergency dispatch message to family or emergency contacts via SMS or WhatsApp:
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={`sms:?body=${encodeURIComponent(sosMessage)}`}
              onClick={() => setSosSent(true)}
              className="flex-1"
            >
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 font-bold h-11">
                <Radio className="h-4 w-4" />
                Send SOS via SMS
              </Button>
            </a>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(sosMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSosSent(true)}
              className="flex-1"
            >
              <Button variant="outline" className="w-full border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-2 font-bold h-11">
                <Share2 className="h-4 w-4" />
                Broadcast on WhatsApp
              </Button>
            </a>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshLocation}
              disabled={locating}
              className="text-xs sm:w-auto"
            >
              {locating ? "Updating GPS..." : "Refresh GPS"}
            </Button>
          </div>

          {sosSent && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Emergency dispatch message generated with live coordinates!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Emergency Helplines (108, 102, 112) */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="border-2 border-red-300 dark:border-red-900 bg-red-50/70 dark:bg-red-950/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">
                Primary Ambulance
              </span>
              <Ambulance className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">108</p>
            <p className="text-xs text-muted-foreground">{t("patient.emergency.ambulance108")}</p>
            <a href="tel:108" className="block pt-1">
              <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 font-bold">
                <Phone className="h-4 w-4" /> Call 108
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-2 border-pink-300 dark:border-pink-900 bg-pink-50/70 dark:bg-pink-950/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-300">
                Maternal & Child
              </span>
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <p className="text-2xl font-black text-pink-600 dark:text-pink-400">102</p>
            <p className="text-xs text-muted-foreground">{t("patient.emergency.medicalHelpline102")}</p>
            <a href="tel:102" className="block pt-1">
              <Button size="sm" variant="outline" className="w-full border-pink-500 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-950/50 gap-2 font-bold">
                <Phone className="h-4 w-4" /> Call 102
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                National Emergency
              </span>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">112</p>
            <p className="text-xs text-muted-foreground">Police & Emergency Response</p>
            <a href="tel:112" className="block pt-1">
              <Button size="sm" variant="outline" className="w-full border-blue-500 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/50 gap-2 font-bold">
                <Phone className="h-4 w-4" /> Call 112
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* District Emergency Hospital Locator */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                {t("patient.emergency.nearbyEmergencyHospitals")}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hospitals with active Emergency wards &amp; ICU capabilities
              </p>
            </div>
            {/* District selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-9 px-3 rounded-md border bg-background text-xs font-semibold"
              >
                {DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {emergencyHospitals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No emergency facilities listed for this district.
            </p>
          ) : (
            emergencyHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="p-3.5 rounded-lg border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{hosp.name}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {hosp.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {hosp.address}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Beds Available: {hosp.availableBeds} / {hosp.totalBeds}
                    </span>
                    {hosp.icuAvailable && (
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        ICU Ready
                      </span>
                    )}
                    {hosp.bloodBankAvailable && (
                      <span className="text-red-600 dark:text-red-400 font-medium">Blood Bank On-Site</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a href={`tel:${hosp.phone}`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                      <Phone className="h-3.5 w-3.5 text-blue-600" />
                      {hosp.phone}
                    </Button>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.name + " " + hosp.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="text-xs gap-1.5 h-8 bg-primary">
                      <Navigation className="h-3.5 w-3.5" />
                      Directions
                    </Button>
                  </a>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Critical First-Aid Protocols */}
      <Card className="bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            {t("patient.emergency.whileWaitingForHelp")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-900 dark:text-amber-200">
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded bg-background/80 border border-amber-200 dark:border-amber-900/50">
              <p className="font-bold text-xs uppercase text-amber-700 dark:text-amber-400 mb-1">
                Unresponsive / Fainting
              </p>
              <p className="text-xs">
                {t("patient.emergency.instruction1")}. Keep airways clear and turn onto side in recovery position.
              </p>
            </div>
            <div className="p-2.5 rounded bg-background/80 border border-amber-200 dark:border-amber-900/50">
              <p className="font-bold text-xs uppercase text-amber-700 dark:text-amber-400 mb-1">
                Severe Bleeding
              </p>
              <p className="text-xs">
                {t("patient.emergency.instruction2")}. Apply firm, continuous direct pressure with a clean cloth.
              </p>
            </div>
            <div className="p-2.5 rounded bg-background/80 border border-amber-200 dark:border-amber-900/50">
              <p className="font-bold text-xs uppercase text-amber-700 dark:text-amber-400 mb-1">
                Chest Pain &amp; Breathlessness
              </p>
              <p className="text-xs">
                {t("patient.emergency.instruction3")}. Sit upright, loosen tight collar or waistbands, do not walk.
              </p>
            </div>
            <div className="p-2.5 rounded bg-background/80 border border-amber-200 dark:border-amber-900/50">
              <p className="font-bold text-xs uppercase text-amber-700 dark:text-amber-400 mb-1">
                Rural Protocol: Snakebite
              </p>
              <p className="text-xs">
                Immobilize the limb immediately with a splint. Do NOT cut, burn, or tourniquet. Rush to district hospital.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Navigation Links */}
      <div className="flex gap-3">
        <a
          href="https://www.google.com/maps/search/emergency+hospital+near+me"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="outline" className="w-full gap-2 h-11">
            <ExternalLink className="h-4 w-4" />
            {t("patient.emergency.findNearbyHospital")}
          </Button>
        </a>
        <Link href="/patient/hospitals" className="flex-1">
          <Button variant="outline" className="w-full h-11">
            {t("patient.emergency.viewAllHospitals")}
          </Button>
        </Link>
      </div>
    </div>
  );
}



