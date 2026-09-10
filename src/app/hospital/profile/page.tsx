"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Label } from "@/components/ui";
import {
  User,
  Building2,
  Calendar,
  Activity,
  Save,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/stores";

export default function HospitalProfilePage() {
  const profile = useAuthStore((s) => s.profile);

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [phone, setPhone] = useState("+91 98765 43210");
  const [email, setEmail] = useState("doctor.jnmch@biharhealth.gov.in");
  const [shift, setShift] = useState("Morning Shift (08:00 - 16:00)");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const staffName = profile?.full_name || "Dr. Priya Sharma";

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
            <User className="h-6 w-6 text-primary" />
            Hospital Staff Profile &amp; Duty Roster
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Clinical credentials, facility empanelment, and shift duty schedule
          </p>
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-xl border bg-card">
          <span className="text-xs font-semibold">Duty Status:</span>
          <Button
            size="sm"
            variant={isOnDuty ? "default" : "outline"}
            className={`text-xs h-8 ${isOnDuty ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold" : ""}`}
            onClick={() => setIsOnDuty(!isOnDuty)}
          >
            <Activity className="h-3.5 w-3.5 mr-1" />
            {isOnDuty ? "ON DUTY (ACTIVE)" : "OFF DUTY"}
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-2">
          <CardContent className="p-3.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
            <Check className="h-4 w-4 text-emerald-600" />
            Duty roster and contact credentials updated successfully.
          </CardContent>
        </Card>
      )}

      {/* Staff Overview Banner */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              <User className="h-8 w-8" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{staffName}</h2>
                <Badge className="bg-primary text-primary-foreground text-xs">Senior Medical Officer</Badge>
                <Badge variant="outline" className="font-mono text-xs">ID: MED-BR-84920</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Department of Emergency Medicine &amp; Critical Care
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <Building2 className="h-3.5 w-3.5" />
                Jawaharlal Nehru Medical College &amp; Hospital (JNMCH), Bhagalpur
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Facility Info & Roster */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Facility & Registration Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Attached Facility Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Institutional Name</p>
              <p className="font-semibold text-foreground">JNMCH Medical College &amp; Hospital</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <p className="text-xs text-muted-foreground">Facility Tier</p>
                <p className="font-semibold text-foreground">Tertiary Medical College</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <p className="text-xs text-muted-foreground">District</p>
                <p className="font-semibold text-foreground">Bhagalpur, Bihar</p>
              </div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">PM-JAY Empanelment Code</p>
              <p className="font-mono font-bold text-foreground">PMJAY-HOSP-BR-00492</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">State Health Society Reg. No.</p>
              <p className="font-mono font-bold text-foreground">SHS-BHR-TERTIARY-2024-09</p>
            </div>
          </CardContent>
        </Card>

        {/* Shift Duty & Schedule Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Duty Schedule &amp; Station Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Active Roster Shift</Label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-xs font-semibold"
                >
                  <option value="Morning Shift (08:00 - 16:00)">Morning Shift (08:00 - 16:00)</option>
                  <option value="Evening Shift (16:00 - 00:00)">Evening Shift (16:00 - 00:00)</option>
                  <option value="Night Emergency Shift (00:00 - 08:00)">Night Emergency Shift (00:00 - 08:00)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Direct Mobile / Intercom *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Official Health Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-lg space-y-1 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Supervised Units:</p>
                <p>&bull; General Ward A (Beds 1-25)</p>
                <p>&bull; Emergency Triage Resuscitation Bay 1</p>
                <p>&bull; OPD Consultation Counter 3</p>
              </div>

              <Button type="submit" className="w-full gap-2 bg-primary">
                <Save className="h-4 w-4" /> Save Profile Preferences
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
