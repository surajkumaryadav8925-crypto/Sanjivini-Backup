"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Alert, AlertDescription } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Calendar, Clock, User, Building2, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { demoHospitals } from "@/data/hospitals";
import { useTranslation } from "@/hooks/useTranslation";

const DEPARTMENTS = ["General Medicine", "Pediatrics", "Orthopedics", "Gynecology", "Surgery", "Dermatology", "ENT", "Ophthalmology"];
const TIME_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"];

type Step = 1 | 2 | 3 | 4;

export default function OPDPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(1);
  const [hospital, setHospital] = useState("");
  const [department, setDepartment] = useState("");
  const [slot, setSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<number | null>(null);

  const selectedHospital = demoHospitals.find(h => h.id === hospital);
  const instructions = `${t("patient.opd.title")}. ${t("patient.opd.selectHospital")}. ${t("patient.opd.selectDepartment")}. ${t("patient.opd.selectTimeSlot")}. ${t("patient.opd.patientDetails")}.`;

  const handleSubmit = async () => {
    if (!hospital || !department || !slot || !patientName || !phone) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setToken(Math.floor(1000 + Math.random() * 9000));
    setLoading(false);
  };

  const reset = () => { setStep(1); setHospital(""); setDepartment(""); setSlot(""); setPatientName(""); setPhone(""); setToken(null); };

  if (token) return (
    <div className="container px-4 py-6 max-w-md mx-auto text-center">
      <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-10 w-10 text-emerald-600" /></div>
      <h1 className="text-2xl font-bold mb-2">{t("patient.opd.tokenBooked")}</h1>
      <Card className="mb-6"><CardContent className="py-6"><p className="text-sm text-muted-foreground">{t("patient.opd.yourOdpToken")}</p><p className="text-5xl font-bold text-blue-600">{token}</p><p className="text-sm text-muted-foreground mt-2">{selectedHospital?.name} ? {department}</p><p className="text-sm text-muted-foreground">{slot}</p></CardContent></Card>
      <Alert className="mb-6 bg-amber-50"><AlertDescription className="text-sm">{t("patient.opd.arriveNotice")}</AlertDescription></Alert>
      <Button onClick={reset} className="w-full">{t("patient.opd.bookAnother")}</Button>
      <Link href="/patient/dashboard" className="block mt-4"><Button variant="outline" className="w-full">{t("patient.opd.goToDashboard")}</Button></Link>
    </div>
  );

  return (
    <div className="container px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2"><Calendar className="h-5 w-5" /><h1 className="text-2xl font-bold">{t("patient.opd.title")}</h1></div>
        <SpeakButton text={instructions} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6"><span>{t("patient.opd.step")} {step} {t("patient.opd.of")} 4</span><div className="flex gap-1">{([1,2,3,4] as Step[]).map(s => <div key={s} className={`h-2 w-6 rounded ${s <= step ? "bg-blue-500" : "bg-gray-200"}`} />)}</div></div>
      {step === 1 && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />{t("patient.opd.selectHospital")}</CardTitle></CardHeader><CardContent className="space-y-2">{demoHospitals.slice(0, 5).map(h => <Button key={h.id} variant={hospital === h.id ? "default" : "outline"} className="w-full justify-start" onClick={() => setHospital(h.id)}>{h.name}</Button>)}<Button variant="ghost" className="w-full mt-2" onClick={() => setStep(2)} disabled={!hospital}>{t("common.next")} <ArrowRight className="h-4 w-4 ml-2" /></Button></CardContent></Card>}
      {step === 2 && <Card><CardHeader><CardTitle>{t("patient.opd.selectDepartment")}</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">{DEPARTMENTS.map(d => <Button key={d} variant={department === d ? "default" : "outline"} onClick={() => setDepartment(d)}>{d}</Button>)}<div className="col-span-2 flex gap-2 mt-2"><Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-2" />{t("common.back")}</Button><Button onClick={() => setStep(3)} disabled={!department}>{t("common.next")} <ArrowRight className="h-4 w-4 ml-2" /></Button></div></CardContent></Card>}
      {step === 3 && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />{t("patient.opd.selectTimeSlot")}</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-2">{TIME_SLOTS.map(tm => <Button key={tm} variant={slot === tm ? "default" : "outline"} size="sm" onClick={() => setSlot(tm)}>{tm}</Button>)}<div className="col-span-3 flex gap-2 mt-2"><Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-2" />{t("common.back")}</Button><Button onClick={() => setStep(4)} disabled={!slot}>{t("common.next")} <ArrowRight className="h-4 w-4 ml-2" /></Button></div></CardContent></Card>}
      {step === 4 && <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />{t("patient.opd.patientDetails")}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>{t("patient.opd.patientName")}</Label><Input placeholder={t("patient.opd.patientNamePlaceholder")} value={patientName} onChange={e => setPatientName(e.target.value)} /></div><div className="space-y-2"><Label>{t("patient.opd.phoneNumber")}</Label><Input type="tel" placeholder={t("patient.opd.phonePlaceholder")} value={phone} onChange={e => setPhone(e.target.value)} /></div><div className="p-3 bg-muted rounded-lg text-sm"><p><strong>{t("patient.opd.hospital")}</strong> {selectedHospital?.name}</p><p><strong>{t("patient.opd.department")}</strong> {department}</p><p><strong>{t("patient.opd.time")}</strong> {slot}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-2" />{t("common.back")}</Button><Button onClick={handleSubmit} disabled={!patientName || !phone} isLoading={loading} className="flex-1">{t("patient.opd.bookToken")}</Button></div></CardContent></Card>}
    </div>
  );
}
