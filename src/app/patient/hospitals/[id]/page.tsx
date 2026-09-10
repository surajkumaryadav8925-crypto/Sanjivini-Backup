"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Alert, AlertDescription } from "@/components/ui";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Clock,
  Heart,
  CheckCircle,
  Navigation,
  Calendar,
  Bed,
  Droplet,
  Shield,
} from "lucide-react";
import { demoHospitals, DISTRICTS, calculateDistance } from "@/data/hospitals";

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const hospital = demoHospitals.find((h) => h.id === id);

  if (!hospital) {
    return (
      <div className="container px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Hospital Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">The requested healthcare facility does not exist in our directory.</p>
        <Link href="/patient/hospitals">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const districtObj = DISTRICTS.find((d) => d.name === hospital.district) || DISTRICTS[0];
  const distance = calculateDistance(districtObj.latitude, districtObj.longitude, hospital.latitude, hospital.longitude);

  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Main Header Card */}
      <Card className="overflow-hidden">
        <div className="h-4 bg-gradient-to-r from-primary via-primary/80 to-teal-500" />
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {hospital.tier}
                </span>
                <Badge variant={hospital.type === "Government" ? "info" : "success"}>
                  {hospital.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {hospital.district} District
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span>{hospital.name}</span>
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{hospital.locality}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{hospital.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-teal-600" />
              <span>~{distance.toFixed(1)} km from {hospital.district} center</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>{hospital.openingHours}</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 mb-1">
                <Bed className="h-4 w-4" />
                <span className="text-xs font-medium">Bed Capacity</span>
              </div>
              <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                {hospital.availableBeds} / {hospital.totalBeds}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Available now</p>
            </div>

            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-1.5 text-red-700 dark:text-red-300 mb-1">
                <Droplet className="h-4 w-4" />
                <span className="text-xs font-medium">Blood Center</span>
              </div>
              <p className="text-base font-bold text-red-800 dark:text-red-200">
                {hospital.bloodBankAvailable ? "Operational" : "Not Available"}
              </p>
              <p className="text-[11px] text-red-600 dark:text-red-400">Verified inventory</p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 mb-1">
                <Heart className="h-4 w-4" />
                <span className="text-xs font-medium">Emergency Care</span>
              </div>
              <p className="text-base font-bold text-purple-800 dark:text-purple-200">
                {hospital.emergencyAvailable ? "24x7 Active" : "Daytime OPD"}
              </p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400">Trauma & Casualty</p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">Ayushman PM-JAY</span>
              </div>
              <p className="text-base font-bold text-blue-800 dark:text-blue-200">Empaneled</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400">Cashless coverage</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <a href={`tel:${hospital.phone}`} className="flex-1 min-w-[140px]">
              <Button variant="outline" className="w-full gap-2">
                <Phone className="h-4 w-4" />
                Call ({hospital.phone})
              </Button>
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px]"
            >
              <Button variant="outline" className="w-full gap-2">
                <Navigation className="h-4 w-4" />
                GPS Navigation
              </Button>
            </a>
            <Link href={`/patient/opd?hospital=${encodeURIComponent(hospital.name)}`} className="flex-1 min-w-[140px]">
              <Button className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                Book OPD Token
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {hospital.emergencyAvailable && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
          <Heart className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm">
            <strong>Emergency Services Available 24x7:</strong> This facility operates round-the-clock emergency, trauma response, and ambulance intake. Call 108 for urgent transit support.
          </AlertDescription>
        </Alert>
      )}

      {/* Departments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Specialties & Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {hospital.departments.map((d) => (
              <div
                key={d.id}
                className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                  d.available
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-foreground"
                    : "bg-muted/40 border-border text-muted-foreground opacity-60"
                }`}
              >
                {d.available ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <span className="text-muted-foreground text-xs">✕</span>
                )}
                <span className="text-sm font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Doctors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Duty Doctors & Consultants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hospital.doctors.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-muted/50 rounded-xl border border-border gap-2"
            >
              <div>
                <p className="font-semibold text-foreground text-base">{doc.name}</p>
                <p className="text-sm text-muted-foreground">
                  {doc.specialty} • <span className="font-mono text-xs">{doc.qualification}</span>
                </p>
                <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  OPD Hours: {doc.schedule}
                </p>
              </div>
              <Badge variant={doc.available ? "success" : "secondary"} className="self-start sm:self-center">
                {doc.available ? "On Duty Today" : "Off Duty"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}