"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Badge, Alert, AlertDescription } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { performTriage, getRiskColorClass, getRiskLabel } from "@/lib/ai/triage";
import { Stethoscope, Shield, AlertTriangle } from "lucide-react";
import type { TriageSymptom, TriageResult } from "@/types";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

const SYMPTOMS = ["Fever", "Cough", "Headache", "Body aches", "Fatigue", "Sore throat", "Nausea", "Dizziness", "Chest pain", "Shortness of breath", "Abdominal pain"];

export default function TriagePage() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const toggle = (s: string) => setSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const analyze = async () => {
    if (!symptoms.length || !age) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const r = performTriage({ symptoms: symptoms.map(name => ({ id: crypto.randomUUID(), name })), age: parseInt(age), gender });
    r.session_id = crypto.randomUUID();
    setResult(r);
    setLoading(false);
  };

  const triageIntro = `${t("patient.triage.title")}. ${t("patient.triage.yourSymptoms")}. ${t("patient.triage.assistiveOnly")}`;
  const resultText = result ? `${result.recommended_action}. ${t("patient.triage.disclaimer")}` : "";

  return (
    <div className="container px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-bold"><Stethoscope className="inline h-6 w-6 mr-2" />{t("patient.triage.title")}</h1>
        <SpeakButton text={!result ? triageIntro : resultText} />
      </div>
      <Alert variant="warning" className="mb-4 bg-amber-50"><AlertDescription><Shield className="inline h-4 w-4 mr-1" />{t("patient.triage.assistiveOnly")}</AlertDescription></Alert>

      {!result ? (
        <Card>
          <CardHeader><CardTitle>{t("patient.triage.yourSymptoms")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">{SYMPTOMS.map(s => (
              <Button key={s} variant={symptoms.includes(s) ? "default" : "outline"} size="sm" onClick={() => toggle(s)}>{s}</Button>
            ))}</div>
            {symptoms.length > 0 && <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">{symptoms.map(s => <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => toggle(s)}>{s} ✕</Badge>)}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("patient.triage.age")}</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t("patient.triage.gender")}</Label><div className="flex gap-1">{(["male", "female", "other"] as const).map(g => (
                <Button key={g} variant={gender === g ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setGender(g)}>{t(`patient.triage.${g}`)}</Button>
              ))}</div></div>
            </div>
            <Button className="w-full bg-blue-500" onClick={analyze} disabled={!symptoms.length || !age} isLoading={loading}>{t("patient.triage.analyze")}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className={`border-2 ${result.risk_level === "red" ? "border-red-500 bg-red-50" : result.risk_level === "yellow" ? "border-amber-500 bg-amber-50" : "border-emerald-500 bg-emerald-50"}`}>
            <CardHeader><CardTitle><Badge className={`${getRiskColorClass(result.risk_level)}`}>{getRiskLabel(result.risk_level)}</Badge> {result.confidence}% {t("patient.triage.confidence")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{result.recommended_action}</p>
              {result.red_flags.length > 0 && <div className="p-2 bg-red-100 rounded"><p className="font-medium text-red-700 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{t("patient.triage.redFlags")}</p><ul className="list-disc list-inside text-red-600 text-sm">{result.red_flags.map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
              <div className="p-2 bg-background rounded border"><p className="font-medium text-sm">{t("patient.triage.possible")} {result.possible_conditions.join(", ")}</p></div>
              <div className="p-2 bg-background rounded border"><p className="font-medium text-sm">{t("patient.triage.specialist")} {result.recommended_specialization}</p></div>
              <p className="text-xs text-muted-foreground p-2 bg-muted rounded">{t("patient.triage.disclaimer")}</p>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            {result.risk_level !== "green" && <Link href="/patient/hospitals" className="flex-1"><Button className="w-full bg-emerald-500">{t("patient.triage.findHospital")}</Button></Link>}
            {result.risk_level === "red" && <Link href="/patient/emergency" className="flex-1"><Button className="w-full bg-red-500">{t("patient.dashboard.emergencyServices")}</Button></Link>}
            <Button variant="outline" onClick={() => setResult(null)} className="flex-1">{t("patient.triage.new")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
