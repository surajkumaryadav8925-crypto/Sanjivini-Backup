"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Label } from "@/components/ui";
import {
  FileText,
  User,
  Plus,
  Search,
  ArrowRight,
  Building2,
  Ambulance,
  CheckCircle2,
  Send,
} from "lucide-react";

interface InpatientRecord {
  id: string;
  uhid: string;
  patientName: string;
  age: number;
  gender: string;
  ward: string;
  bedNumber: string;
  admittedAt: string;
  diagnosis: string;
  attendingDoctor: string;
  status: "admitted" | "discharged" | "referred";
}

interface ReferralSlip {
  id: string;
  patientName: string;
  age: number;
  sourceFacility: string;
  targetFacility: string;
  provisionalDiagnosis: string;
  urgency: "critical" | "urgent" | "routine";
  ambulanceRequested: boolean;
  referredAt: string;
  status: "accepted" | "in-transit" | "completed";
}

const INITIAL_INPATIENTS: InpatientRecord[] = [
  {
    id: "IP-1092",
    uhid: "UHID-BR-84920",
    patientName: "Manoj Kumar",
    age: 45,
    gender: "Male",
    ward: "General Ward A",
    bedNumber: "GW-14",
    admittedAt: "2026-09-08 14:30",
    diagnosis: "Acute Bronchitis & Severe Dehydration",
    attendingDoctor: "Dr. Alok Verma",
    status: "admitted",
  },
  {
    id: "IP-1093",
    uhid: "UHID-BR-84921",
    patientName: "Radha Kumari",
    age: 26,
    gender: "Female",
    ward: "Maternity Ward",
    bedNumber: "MW-08",
    admittedAt: "2026-09-09 09:15",
    diagnosis: "Full Term Pregnancy, Active Labor",
    attendingDoctor: "Dr. Sunita Sen",
    status: "admitted",
  },
  {
    id: "IP-1094",
    uhid: "UHID-BR-84922",
    patientName: "Sanjay Jha",
    age: 58,
    gender: "Male",
    ward: "ICU",
    bedNumber: "ICU-03",
    admittedAt: "2026-09-07 23:40",
    diagnosis: "Post-Myocardial Infarction Stabilization",
    attendingDoctor: "Dr. K. N. Sinha",
    status: "admitted",
  },
  {
    id: "IP-1095",
    uhid: "UHID-BR-84918",
    patientName: "Amitabh Rai",
    age: 38,
    gender: "Male",
    ward: "Emergency Ward",
    bedNumber: "EMG-05",
    admittedAt: "2026-09-06 18:20",
    diagnosis: "Femur Fracture (Closed Reduction)",
    attendingDoctor: "Dr. S. K. Gupta",
    status: "discharged",
  },
];

const INITIAL_REFERRALS: ReferralSlip[] = [
  {
    id: "REF-2026-081",
    patientName: "Gopal Prasad",
    age: 52,
    sourceFacility: "Narayanpur PHC",
    targetFacility: "JNMCH Hospital Bhagalpur",
    provisionalDiagnosis: "Severe Acute Respiratory Distress (SARI) / Suspected Pneumonia",
    urgency: "critical",
    ambulanceRequested: true,
    referredAt: "2026-09-09 16:45",
    status: "in-transit",
  },
  {
    id: "REF-2026-082",
    patientName: "Kanti Devi",
    age: 34,
    sourceFacility: "Sabour CHC",
    targetFacility: "District Hospital Bhagalpur",
    provisionalDiagnosis: "Pre-Eclampsia with Elevated BP (170/110 mmHg)",
    urgency: "urgent",
    ambulanceRequested: true,
    referredAt: "2026-09-09 11:20",
    status: "accepted",
  },
];

export default function HospitalRecordsPage() {
  const [activeTab, setActiveTab] = useState<"inpatients" | "referrals">("inpatients");
  const [search, setSearch] = useState("");
  const [inpatients, setInpatients] = useState<InpatientRecord[]>(INITIAL_INPATIENTS);
  const [referrals, setReferrals] = useState<ReferralSlip[]>(INITIAL_REFERRALS);

  // New Admission Dialog
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [admForm, setAdmForm] = useState({
    patientName: "",
    age: "",
    gender: "Male",
    ward: "General Ward A",
    bedNumber: "",
    diagnosis: "",
    attendingDoctor: "Dr. Priya Sharma",
  });

  // New Referral Dialog
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [refForm, setRefForm] = useState({
    patientName: "",
    age: "",
    sourceFacility: "JNMCH Hospital Bhagalpur",
    targetFacility: "AIIMS Patna",
    provisionalDiagnosis: "",
    urgency: "urgent" as ReferralSlip["urgency"],
    ambulanceRequested: true,
  });

  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admForm.patientName.trim()) return;

    const newRecord: InpatientRecord = {
      id: `IP-${Math.floor(1000 + Math.random() * 9000)}`,
      uhid: `UHID-BR-${Math.floor(10000 + Math.random() * 90000)}`,
      patientName: admForm.patientName,
      age: parseInt(admForm.age) || 35,
      gender: admForm.gender,
      ward: admForm.ward,
      bedNumber: admForm.bedNumber || "Bed-Auto",
      admittedAt: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
      diagnosis: admForm.diagnosis || "General Observation",
      attendingDoctor: admForm.attendingDoctor,
      status: "admitted",
    };

    setInpatients([newRecord, ...inpatients]);
    setAdmissionModalOpen(false);
    setAdmForm({
      patientName: "",
      age: "",
      gender: "Male",
      ward: "General Ward A",
      bedNumber: "",
      diagnosis: "",
      attendingDoctor: "Dr. Priya Sharma",
    });
  };

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refForm.patientName.trim()) return;

    const newRef: ReferralSlip = {
      id: `REF-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientName: refForm.patientName,
      age: parseInt(refForm.age) || 40,
      sourceFacility: refForm.sourceFacility,
      targetFacility: refForm.targetFacility,
      provisionalDiagnosis: refForm.provisionalDiagnosis,
      urgency: refForm.urgency,
      ambulanceRequested: refForm.ambulanceRequested,
      referredAt: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
      status: "in-transit",
    };

    setReferrals([newRef, ...referrals]);
    setReferralModalOpen(false);
    setRefForm({
      patientName: "",
      age: "",
      sourceFacility: "JNMCH Hospital Bhagalpur",
      targetFacility: "AIIMS Patna",
      provisionalDiagnosis: "",
      urgency: "urgent",
      ambulanceRequested: true,
    });
  };

  const handleDischarge = (id: string) => {
    setInpatients(inpatients.map((ip) => (ip.id === id ? { ...ip, status: "discharged" } : ip)));
  };

  const handleUpdateReferralStatus = (id: string, status: ReferralSlip["status"]) => {
    setReferrals(referrals.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const filteredInpatients = inpatients.filter(
    (ip) =>
      ip.patientName.toLowerCase().includes(search.toLowerCase()) ||
      ip.uhid.toLowerCase().includes(search.toLowerCase()) ||
      ip.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReferrals = referrals.filter(
    (r) =>
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.provisionalDiagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Inpatient Records &amp; Referral Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hospital admissions registry, bed occupancy census, and inter-facility transfer slips
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === "inpatients" ? (
            <Button className="gap-2 bg-primary" onClick={() => setAdmissionModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Admit New Patient
            </Button>
          ) : (
            <Button className="gap-2 bg-primary" onClick={() => setReferralModalOpen(true)}>
              <Send className="h-4 w-4" />
              Generate Referral Slip
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-xl max-w-md">
        <Button
          variant={activeTab === "inpatients" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("inpatients")}
          className="flex-1 text-xs"
        >
          <User className="h-3.5 w-3.5 mr-1.5" />
          Active Inpatients ({inpatients.filter((i) => i.status === "admitted").length})
        </Button>
        <Button
          variant={activeTab === "referrals" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("referrals")}
          className="flex-1 text-xs"
        >
          <Ambulance className="h-3.5 w-3.5 mr-1.5 text-red-500" />
          Inter-Hospital Referrals ({referrals.length})
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={
            activeTab === "inpatients"
              ? "Search admissions by patient name, UHID, or diagnosis..."
              : "Search referral slips by patient, slip ID, or condition..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* INPATIENTS TAB */}
      {activeTab === "inpatients" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Inpatient Ward Census</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInpatients.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">No matching admissions found.</p>
            ) : (
              <div className="divide-y">
                {filteredInpatients.map((ip) => (
                  <div key={ip.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{ip.patientName}</span>
                        <span className="text-xs text-muted-foreground font-mono">({ip.uhid})</span>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {ip.gender} &bull; {ip.age} yrs
                        </Badge>
                        <Badge
                          variant={
                            ip.status === "admitted"
                              ? "success"
                              : ip.status === "discharged"
                              ? "secondary"
                              : "warning"
                          }
                          className="capitalize text-[10px]"
                        >
                          {ip.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Location: <strong>{ip.ward}</strong> &bull; Bed: <strong>{ip.bedNumber}</strong> &bull; Doctor: <strong>{ip.attendingDoctor}</strong>
                      </p>
                      <p className="text-xs text-foreground font-medium pt-0.5">
                        Diagnosis: {ip.diagnosis}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Admitted: {ip.admittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ip.status === "admitted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleDischarge(ip.id)}
                        >
                          Discharge Summary
                        </Button>
                      )}
                      {ip.status === "discharged" && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Discharged
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* REFERRALS TAB */}
      {activeTab === "referrals" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Inter-Hospital Transfer &amp; Referral Desk</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReferrals.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">No referral slips found.</p>
            ) : (
              <div className="divide-y">
                {filteredReferrals.map((ref) => (
                  <div key={ref.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-primary">{ref.id}</span>
                        <span className="font-bold text-sm text-foreground">{ref.patientName}</span>
                        <Badge
                          variant={
                            ref.urgency === "critical"
                              ? "destructive"
                              : ref.urgency === "urgent"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {ref.urgency}
                        </Badge>
                        <Badge
                          variant={
                            ref.status === "completed"
                              ? "success"
                              : ref.status === "accepted"
                              ? "default"
                              : "warning"
                          }
                          className="capitalize text-[10px]"
                        >
                          {ref.status}
                        </Badge>
                      </div>

                      {/* Route flow */}
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{ref.sourceFacility}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-primary font-bold">{ref.targetFacility}</span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Provisional Diagnosis: <strong>{ref.provisionalDiagnosis}</strong>
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>Referred: {ref.referredAt}</span>
                        {ref.ambulanceRequested && (
                          <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                            <Ambulance className="h-3 w-3" /> 108 ALS Ambulance Assigned
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ref.status === "in-transit" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                          onClick={() => handleUpdateReferralStatus(ref.id, "accepted")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accept Admission
                        </Button>
                      )}
                      {ref.status === "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleUpdateReferralStatus(ref.id, "completed")}
                        >
                          Complete Transfer
                        </Button>
                      )}
                      {ref.status === "completed" && (
                        <span className="text-xs text-emerald-600 font-medium">Transfer Finalized</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Inpatient Modal */}
      {admissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-background border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg">Inpatient Admission Registration</h3>
              <button
                type="button"
                onClick={() => setAdmissionModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmission} className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Patient Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Shyam Bihari"
                  value={admForm.patientName}
                  onChange={(e) => setAdmForm({ ...admForm, patientName: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Age</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 42"
                    value={admForm.age}
                    onChange={(e) => setAdmForm({ ...admForm, age: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Gender</Label>
                  <select
                    value={admForm.gender}
                    onChange={(e) => setAdmForm({ ...admForm, gender: e.target.value })}
                    className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-xs font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Ward Assigned</Label>
                  <select
                    value={admForm.ward}
                    onChange={(e) => setAdmForm({ ...admForm, ward: e.target.value })}
                    className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-xs font-semibold"
                  >
                    <option value="General Ward A">General Ward A</option>
                    <option value="General Ward B">General Ward B</option>
                    <option value="Maternity Ward">Maternity Ward</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency Ward">Emergency Ward</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Bed Designation</Label>
                  <Input
                    placeholder="e.g. GW-19"
                    value={admForm.bedNumber}
                    onChange={(e) => setAdmForm({ ...admForm, bedNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Admission Diagnosis *</Label>
                <Input
                  required
                  placeholder="e.g. Acute Gastroenteritis with Hypovolemia"
                  value={admForm.diagnosis}
                  onChange={(e) => setAdmForm({ ...admForm, diagnosis: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setAdmissionModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary">
                  Confirm Admission
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Referral Modal */}
      {referralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-background border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Ambulance className="h-5 w-5 text-red-500" />
                Generate Referral Slip
              </h3>
              <button
                type="button"
                onClick={() => setReferralModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Patient Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Mohan Das"
                  value={refForm.patientName}
                  onChange={(e) => setRefForm({ ...refForm, patientName: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Urgency Level</Label>
                  <select
                    value={refForm.urgency}
                    onChange={(e) => setRefForm({ ...refForm, urgency: e.target.value as ReferralSlip["urgency"] })}
                    className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-xs font-semibold"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical / Emergency</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Destination Facility</Label>
                  <select
                    value={refForm.targetFacility}
                    onChange={(e) => setRefForm({ ...refForm, targetFacility: e.target.value })}
                    className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-xs font-semibold"
                  >
                    <option value="AIIMS Patna">AIIMS Patna</option>
                    <option value="PMCH Patna">PMCH Patna</option>
                    <option value="JNMCH Hospital Bhagalpur">JNMCH Hospital Bhagalpur</option>
                    <option value="District Hospital Bhagalpur">District Hospital Bhagalpur</option>
                    <option value="DMCH Darbhanga">DMCH Darbhanga</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Clinical Justification &amp; Findings *</Label>
                <Input
                  required
                  placeholder="e.g. Suspected intracranial hemorrhage requiring neurosurgical intervention"
                  value={refForm.provisionalDiagnosis}
                  onChange={(e) => setRefForm({ ...refForm, provisionalDiagnosis: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <Ambulance className="h-4 w-4 shrink-0 text-red-600" />
                <span>Automatically dispatches 108 ALS ambulance with onboard paramedic.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setReferralModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  Dispatch Referral
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
