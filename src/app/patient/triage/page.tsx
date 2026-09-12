"use client";
import { useState } from "react";
import { Card, CardContent, Button, Input, Label, Alert, AlertDescription } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { performTriage, getRiskColorClass, getRiskLabel } from "@/lib/ai/triage";
import { Stethoscope, Shield, AlertTriangle, Building2, Siren, RotateCcw } from "lucide-react";
import type { TriageResult } from "@/types";
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
    <div className="container px-4 py-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </span>
            {t("patient.triage.title")}
          </h1>
        </div>
        <SpeakButton text={!result ? triageIntro : resultText} />
      </div>

      <Alert variant="warning" className="border-warning-soft-foreground/25 bg-warning-soft text-warning-soft-foreground">
        <AlertDescription className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          {t("patient.triage.assistiveOnly")}
        </AlertDescription>
      </Alert>

      {!result ? (
        <Card>
          <CardContent className="space-y-5 p-5">
            <div>
              <p className="mb-3 text-sm font-semibold">{t("patient.triage.yourSymptoms")}</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    aria-pressed={symptoms.includes(s)}
                    className={`inline-flex min-h-[38px] items-center rounded-full px-3.5 text-sm font-medium transition-colors ${
                      symptoms.includes(s)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {symptoms.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-muted/60 p-3">
                  {symptoms.map(s => (
                    <button
                      key={s}
                      onClick={() => toggle(s)}
                      className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium shadow-xs transition-colors hover:text-destructive"
                      aria-label={`${s} — remove`}
                    >
                      {s} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("patient.triage.age")}</Label>
                <Input type="number" inputMode="numeric" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("patient.triage.gender")}</Label>
                <div className="flex gap-1.5">
                  {(["male", "female", "other"] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      aria-pressed={gender === g}
                      className={`min-h-[38px] flex-1 rounded-lg text-xs font-medium transition-colors ${
                        gender === g
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      {t(`patient.triage.${g}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={analyze} disabled={!symptoms.length || !age} isLoading={loading}>
              {t("patient.triage.analyze")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className={`border-2 ${
            result.risk_level === "red"
              ? "border-danger-soft-foreground/40 bg-danger-soft text-danger-soft-foreground"
              : result.risk_level === "yellow"
              ? "border-warning-soft-foreground/40 bg-warning-soft text-warning-soft-foreground"
              : "border-success-soft-foreground/40 bg-success-soft text-success-soft-foreground"
          }`}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${getRiskColorClass(result.risk_level)}`}>
                  {getRiskLabel(result.risk_level)}
                </span>
                <span className="text-sm font-semibold">{result.confidence}% {t("patient.triage.confidence")}</span>
              </div>
              <p className="text-base font-semibold leading-snug">{result.recommended_action}</p>
              {result.red_flags.length > 0 && (
                <div className="rounded-xl bg-card/80 p-3 dark:bg-card/60">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4" aria-hidden />
                    {t("patient.triage.redFlags")}
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs opacity-90">
                    {result.red_flags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-xl border bg-card p-3 text-foreground dark:bg-card/80">
                <p className="text-sm font-medium">{t("patient.triage.possible")} {result.possible_conditions.join(", ")}</p>
              </div>
              <div className="rounded-xl border bg-card p-3 text-foreground dark:bg-card/80">
                <p className="text-sm font-medium">{t("patient.triage.specialist")} {result.recommended_specialization}</p>
              </div>
              <p className="rounded-xl bg-background/70 p-3 text-xs text-muted-foreground dark:bg-background/50">{t("patient.triage.disclaimer")}</p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2 sm:flex-row">
            {result.risk_level !== "green" && (
              <Link href="/patient/hospitals" className="flex-1">
                <Button className="w-full gap-2"><Building2 className="h-4 w-4" aria-hidden />{t("patient.triage.findHospital")}</Button>
              </Link>
            )}
            {result.risk_level === "red" && (
              <Link href="/patient/emergency" className="flex-1">
                <Button className="w-full gap-2" variant="destructive"><Siren className="h-4 w-4" aria-hidden />{t("patient.dashboard.emergencyServices")}</Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => setResult(null)} className="gap-2 sm:flex-1">
              <RotateCcw className="h-4 w-4" aria-hidden />{t("patient.triage.new")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
