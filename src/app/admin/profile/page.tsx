"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Label } from "@/components/ui";
import {
  Shield,
  Building2,
  MapPin,
  AlertOctagon,
  Radio,
  FileCheck,
  Save,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/stores";

export default function AdminProfilePage() {
  const profile = useAuthStore((s) => s.profile);

  const [disasterMode, setDisasterMode] = useState(false);
  const [cmoPhone, setCmoPhone] = useState("+91 641 240 0110");
  const [cmoEmail, setCmoEmail] = useState("cmo.bhagalpur@bihar.gov.in");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const adminName = profile?.full_name || "Dr. Arvind Verma";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Civil Surgeon &amp; Administrative Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            District Health Officer jurisdiction, emergency broadcast control, and executive directory
          </p>
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-xl border bg-card">
          <span className="text-xs font-semibold">Disaster Mode:</span>
          <Button
            size="sm"
            variant={disasterMode ? "destructive" : "outline"}
            className="text-xs h-8"
            onClick={() => setDisasterMode(!disasterMode)}
          >
            <Radio className="h-3.5 w-3.5 mr-1" />
            {disasterMode ? "DISASTER RESPONSE ACTIVE" : "NORMAL MONITORING"}
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-2">
          <CardContent className="p-3.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
            <Check className="h-4 w-4 text-emerald-600" />
            Administrative jurisdiction parameters saved successfully.
          </CardContent>
        </Card>
      )}

      {disasterMode && (
        <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/40">
          <CardContent className="p-4 flex items-center gap-3 text-red-900 dark:text-red-200 text-sm font-semibold">
            <AlertOctagon className="h-6 w-6 text-red-600 shrink-0" />
            <div>
              <p className="font-bold">Disaster Health Protocol Triggered Across Division</p>
              <p className="text-xs text-red-700 dark:text-red-300 font-normal mt-0.5">
                All leave for medical officers cancelled. 20% surge bed reservation enforced across all district and sub-divisional hospitals.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Overview */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              <Shield className="h-8 w-8" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{adminName}</h2>
                <Badge className="bg-primary text-primary-foreground text-xs">Civil Surgeon &amp; CMO</Badge>
                <Badge variant="outline" className="font-mono text-xs">GOVT-ID: CS-BHR-0491</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                State Health Society &bull; Department of Health &amp; Family Welfare, Govt. of Bihar
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Administrative Headquarters: Civil Surgeon Office, Barari, Bhagalpur
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Jurisdiction & Settings */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Jurisdiction Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Administrative Jurisdiction Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Supervised Territory</p>
              <p className="font-semibold text-foreground">Bhagalpur Health Division (16 Blocks)</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <p className="text-xs text-muted-foreground">Public Hospitals</p>
                <p className="font-bold text-lg text-primary">24 Facilities</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <p className="text-xs text-muted-foreground">Health &amp; Wellness Centres</p>
                <p className="font-bold text-lg text-foreground">114 Centres</p>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Field Cadre Supervised</p>
              <p className="font-semibold text-foreground">420 Community Health Officers &bull; 1,850 ASHA Workers</p>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Empanelled PM-JAY Tertiary Hospitals</p>
              <p className="font-semibold text-foreground">JNMCH Medical College, Sadar Hospital Bhagalpur</p>
            </div>
          </CardContent>
        </Card>

        {/* Official Settings & Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              Official Executive Directives &amp; Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Civil Surgeon Office Direct Line *</Label>
                <Input
                  value={cmoPhone}
                  onChange={(e) => setCmoPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Official Nic.in Health Email *</Label>
                <Input
                  type="email"
                  value={cmoEmail}
                  onChange={(e) => setCmoEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1.5 text-muted-foreground">
                <p className="font-semibold text-foreground">Executive Powers:</p>
                <p>&bull; Immediate requisition of 108 Emergency Ambulances</p>
                <p>&bull; Redirection of district blood bank inventory quotas</p>
                <p>&bull; Issuance of epidemic containment circulars via Sanjivini</p>
              </div>

              <Button type="submit" className="w-full gap-2 bg-primary">
                <Save className="h-4 w-4" /> Save Jurisdictional Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
