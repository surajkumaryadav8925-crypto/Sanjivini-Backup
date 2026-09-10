"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  ShieldCheck,
  Radio,
  MapPin,
  CheckCircle2,
  BellRing,
} from "lucide-react";
import { DISTRICTS } from "@/data/hospitals";

interface DiseaseAlert {
  id: string;
  disease: string;
  district: string;
  blocksAffected: string[];
  casesReported: number;
  riskLevel: "high" | "moderate" | "low";
  trend: "rising" | "stable" | "declining";
  actionStatus: string;
}

const INITIAL_ALERTS: DiseaseAlert[] = [
  {
    id: "DA-1",
    disease: "Dengue Fever / Vector-Borne",
    district: "Bhagalpur",
    blocksAffected: ["Nathnagar", "Sabour", "Urban Wards 12-16"],
    casesReported: 142,
    riskLevel: "high",
    trend: "rising",
    actionStatus: "Anti-larval fogging and fever clinics deployed",
  },
  {
    id: "DA-2",
    disease: "Acute Encephalitis Syndrome (AES)",
    district: "Muzaffarpur",
    blocksAffected: ["Kanti", "Minapur"],
    casesReported: 28,
    riskLevel: "high",
    trend: "stable",
    actionStatus: "Pediatric PICU beds reserved at SKMCH",
  },
  {
    id: "DA-3",
    disease: "Typhoid & Water-Borne Enteric Fever",
    district: "Patna",
    blocksAffected: ["Danapur", "Phulwari Sharif"],
    casesReported: 89,
    riskLevel: "moderate",
    trend: "declining",
    actionStatus: "Chlorination of drinking water tubewells ongoing",
  },
  {
    id: "DA-4",
    disease: "Viral Hepatitis (Hepatitis E)",
    district: "Gaya",
    blocksAffected: ["Bodh Gaya", "Manpur"],
    casesReported: 34,
    riskLevel: "moderate",
    trend: "stable",
    actionStatus: "Water quality samples dispatched for PCR test",
  },
];

export default function AdminAnalyticsPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [alerts] = useState<DiseaseAlert[]>(INITIAL_ALERTS);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const filteredAlerts = alerts.filter(
    (a) => selectedDistrict === "All" || a.district === selectedDistrict
  );

  const handleBroadcastAlert = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Epidemiological Surveillance &amp; Health Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Integrated Disease Surveillance Programme (IDSP) &bull; Bihar Public Health Division
          </p>
        </div>

        <Button
          className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold"
          onClick={handleBroadcastAlert}
        >
          <BellRing className="h-4 w-4" />
          Broadcast Rapid Advisory to CHOs
        </Button>
      </div>

      {broadcastSent && (
        <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-2">
          <CardContent className="p-3.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Epidemic Control Advisory dispatched to all 420 Community Health Officers (CHOs) and Medical Officers in-Charge.
          </CardContent>
        </Card>
      )}

      {/* Key Population Health Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">142,580</p>
            <p className="text-xs text-muted-foreground">Monthly Public OPD Consultations</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">+8.4% MoM</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <ShieldCheck className="h-6 w-6 mx-auto mb-1 text-emerald-600" />
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">89.4%</p>
            <p className="text-xs text-muted-foreground">Institutional Delivery Rate</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Above State Target (85%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">92.1%</p>
            <p className="text-xs text-muted-foreground">Full Child Immunization (UIP)</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Universal Coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">68.5%</p>
            <p className="text-xs text-muted-foreground">Regional Bed Occupancy Ratio</p>
            <p className="text-[11px] text-muted-foreground mt-1">Optimal Capacity Buffer</p>
          </CardContent>
        </Card>
      </div>

      {/* Disease Surveillance Watchlist */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Active Outbreak Surveillance &amp; Hotspot Tracker
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Weekly epidemiological cluster reporting from District Surveillance Units (DSU)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Filter District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-9 px-3 rounded-md border bg-background text-xs font-semibold"
              >
                <option value="All">All Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{alert.disease}</span>
                    <Badge
                      variant={alert.riskLevel === "high" ? "destructive" : "warning"}
                      className="text-[10px] uppercase font-bold"
                    >
                      {alert.riskLevel} Risk
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Trend: {alert.trend}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <strong>{alert.district} District</strong> &bull; Blocks: {alert.blocksAffected.join(", ")}
                  </p>

                  <p className="text-xs text-foreground font-medium">
                    Response: {alert.actionStatus}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">{alert.casesReported}</p>
                  <p className="text-[11px] text-muted-foreground">Cases Reported (Last 7 Days)</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tier-to-Tier Referral Flow Analytics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Inter-Tier Referral Traffic &amp; Patient Routing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <p className="text-muted-foreground">
            Systematic escalation flow ensuring primary health care stabilizes routine cases and only critical conditions reach apex tertiary medical colleges:
          </p>

          <div className="grid md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-1">
              <Badge variant="outline" className="text-[10px]">Tier 1: PHC / HWC</Badge>
              <p className="font-bold text-sm">Primary Health Centres</p>
              <p className="text-muted-foreground">62% Resolved Locally</p>
              <p className="text-primary font-semibold pt-1">38% Escalated to CHC</p>
            </div>

            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-1">
              <Badge variant="outline" className="text-[10px]">Tier 2: CHC / Block</Badge>
              <p className="font-bold text-sm">Community Health Centres</p>
              <p className="text-muted-foreground">54% Inpatient Stabilized</p>
              <p className="text-primary font-semibold pt-1">46% Escalated to SDH/DH</p>
            </div>

            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-1">
              <Badge variant="outline" className="text-[10px]">Tier 3: District Hospital</Badge>
              <p className="font-bold text-sm">Sadar District Hospitals</p>
              <p className="text-muted-foreground">78% Surgical &amp; Specialized Care</p>
              <p className="text-amber-600 font-semibold pt-1">22% Escalated to Tertiary</p>
            </div>

            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-1 border-primary/40 bg-primary/5">
              <Badge className="bg-primary text-primary-foreground text-[10px]">Tier 4: Apex Tertiary</Badge>
              <p className="font-bold text-sm">Medical Colleges (AIIMS/JNMCH)</p>
              <p className="text-muted-foreground">94% Retention &amp; Super-Specialty</p>
              <p className="text-emerald-600 font-semibold pt-1">Direct State ICU Pipeline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
