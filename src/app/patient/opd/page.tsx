"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Alert, AlertDescription, Badge } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Calendar, Clock, User, Building2, CheckCircle, ArrowLeft, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { demoHospitals, DISTRICTS } from "@/data/hospitals";
import { useHospitalStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";

const DEPARTMENTS = [
  { id: "general-med", name: "General Medicine" },
  { id: "pediatrics", name: "Pediatrics" },
  { id: "orthopedics", name: "Orthopedics" },
  { id: "gynecology", name: "Gynecology" },
  { id: "cardiology", name: "Cardiology" },
  { id: "general-med", name: "General Surgery" },
  { id: "general-med", name: "Dermatology" },
  { id: "general-med", name: "Eye & ENT" },
];

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];

type Step = 1 | 2 | 3 | 4;

function OPDContent() {
  const searchParams = useSearchParams();
  const preselectedHospital = searchParams.get("hospital");

  const { t } = useTranslation();
  const { addPatientToQueue, departments: storeDepartments } = useHospitalStore();

  const matchedHosp = preselectedHospital
    ? demoHospitals.find(
        (h) =>
          h.name.toLowerCase().includes(preselectedHospital.toLowerCase()) ||
          h.id === preselectedHospital
      )
    : null;

  const [step, setStep] = useState<Step>(matchedHosp ? 2 : 1);
  const [selectedDistrict, setSelectedDistrict] = useState(matchedHosp ? matchedHosp.district : "Bhagalpur");
  const [hospital, setHospital] = useState(matchedHosp ? matchedHosp.id : "");
  const [department, setDepartment] = useState("");
  const [departmentId, setDepartmentId] = useState("general-med");
  const [slot, setSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<number | null>(null);

  const selectedHospital = demoHospitals.find((h) => h.id === hospital);
  const filteredHospitals = demoHospitals.filter(
    (h) => selectedDistrict === "all" || h.district === selectedDistrict
  );

  const instructions = `${t("patient.opd.title")}. ${t("patient.opd.selectHospital")}. ${t("patient.opd.selectDepartment")}. ${t("patient.opd.selectTimeSlot")}. ${t("patient.opd.patientDetails")}.`;

  const handleSelectDept = (dept: typeof DEPARTMENTS[0]) => {
    setDepartment(dept.name);
    setDepartmentId(dept.id);
  };

  const handleSubmit = async () => {
    if (!hospital || !department || !slot || !patientName || !phone) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    // Connect with hospital OPD queue store
    const targetDept = storeDepartments.find((d) => d.id === departmentId);
    const calculatedToken = targetDept
      ? (targetDept.patients.length > 0
          ? Math.max(...targetDept.patients.map((p) => p.token))
          : targetDept.currentToken) + 1
      : Math.floor(10 + Math.random() * 50);

    addPatientToQueue(departmentId, `${patientName} (${phone.slice(-4)})`);
    setToken(calculatedToken);
    setLoading(false);
  };

  const reset = () => {
    setStep(1);
    setHospital("");
    setDepartment("");
    setDepartmentId("general-med");
    setSlot("");
    setPatientName("");
    setPhone("");
    setToken(null);
  };

  if (token) {
    const liveDept = storeDepartments.find((d) => d.id === departmentId);
    return (
      <div className="container px-4 py-8 max-w-md mx-auto text-center space-y-4">
        <div className="bg-emerald-100 dark:bg-emerald-950/40 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("patient.opd.tokenBooked")}</h1>
        <p className="text-sm text-muted-foreground">
          Your OPD digital consultation token has been generated and synced with the hospital desk.
        </p>

        <Card className="border-primary/30 shadow-lg">
          <CardContent className="py-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("patient.opd.yourOdpToken")}
            </p>
            <p className="text-6xl font-black text-primary font-mono tracking-tight">#{token}</p>

            <div className="pt-3 border-t border-border space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {selectedHospital?.name} • {department}
              </p>
              <p className="text-xs text-muted-foreground">
                Scheduled Slot: <span className="font-medium text-foreground">{slot}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Patient: <span className="font-medium text-foreground">{patientName}</span>
              </p>
            </div>

            {liveDept && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium">
                  <Users className="h-3.5 w-3.5" />
                  Live Counter Status:
                </span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  Serving #{liveDept.currentToken}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-left">
          <AlertDescription className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
            {t("patient.opd.arriveNotice") ||
              "Please arrive at the OPD registration counter 15 minutes before your slot with your ABHA number or government ID."}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={reset} className="w-full">
            {t("patient.opd.bookAnother")}
          </Button>
          <Link href="/patient/dashboard" className="block">
            <Button variant="outline" className="w-full">
              {t("patient.opd.goToDashboard")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{t("patient.opd.title")}</h1>
        </div>
        <SpeakButton text={instructions} />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span>
          {t("patient.opd.step")} {step} {t("patient.opd.of")} 4
        </span>
        <div className="flex gap-1">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {t("patient.opd.selectHospital")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* District Quick Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <Button
                variant={selectedDistrict === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDistrict("all")}
                className="text-xs h-7 flex-shrink-0"
              >
                All Districts
              </Button>
              {DISTRICTS.map((d) => (
                <Button
                  key={d.name}
                  variant={selectedDistrict === d.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDistrict(d.name)}
                  className="text-xs h-7 flex-shrink-0"
                >
                  {d.name}
                </Button>
              ))}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredHospitals.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHospital(h.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    hospital === h.id
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{h.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.locality}, {h.district} • <span className="text-primary font-medium">{h.tier}</span>
                    </p>
                  </div>
                  <Badge variant={h.type === "Government" ? "info" : "secondary"} className="text-xs">
                    {h.type}
                  </Badge>
                </button>
              ))}
            </div>

            <Button
              className="w-full mt-3"
              onClick={() => setStep(2)}
              disabled={!hospital}
            >
              {t("common.next")} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t("patient.opd.selectDepartment")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              {DEPARTMENTS.map((d) => (
                <Button
                  key={d.name}
                  variant={department === d.name ? "default" : "outline"}
                  onClick={() => handleSelectDept(d)}
                  className="h-12 text-xs font-medium justify-start px-3"
                >
                  {d.name}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Button>
              <Button onClick={() => setStep(3)} disabled={!department} className="flex-1">
                {t("common.next")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              {t("patient.opd.selectTimeSlot")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((tm) => (
                <Button
                  key={tm}
                  variant={slot === tm ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSlot(tm)}
                  className="h-9 text-xs"
                >
                  {tm}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Button>
              <Button onClick={() => setStep(4)} disabled={!slot} className="flex-1">
                {t("common.next")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              {t("patient.opd.patientDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("patient.opd.patientName")}</Label>
              <Input
                placeholder={t("patient.opd.patientNamePlaceholder")}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("patient.opd.phoneNumber")}</Label>
              <Input
                type="tel"
                placeholder={t("patient.opd.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="p-3.5 bg-muted/60 rounded-xl text-xs space-y-1.5 border border-border">
              <p>
                <strong className="text-muted-foreground">{t("patient.opd.hospital")}:</strong>{" "}
                <span className="font-semibold text-foreground">{selectedHospital?.name}</span>
              </p>
              <p>
                <strong className="text-muted-foreground">{t("patient.opd.department")}:</strong>{" "}
                <span className="font-semibold text-foreground">{department}</span>
              </p>
              <p>
                <strong className="text-muted-foreground">{t("patient.opd.time")}:</strong>{" "}
                <span className="font-semibold text-foreground">{slot}</span>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!patientName || !phone || loading}
                className="flex-1"
              >
                {loading ? "Booking Token..." : t("patient.opd.bookToken")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function OPDPage() {
  return (
    <Suspense fallback={<div className="container px-4 py-12 text-center text-sm text-muted-foreground">Loading OPD Services...</div>}>
      <OPDContent />
    </Suspense>
  );
}

