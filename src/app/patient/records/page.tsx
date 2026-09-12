"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores";
import {
  FileText, Calendar, Stethoscope, Pill, TestTube, ChevronDown, ChevronUp,
  Search, ShieldCheck, Check, X, AlertCircle, User,
} from "lucide-react";
import { demoPatient, getPatientRecords, getPatientReports, getPatientAccess } from "@/data/medicalRecords";

/** Soft status pill — matches the dashboard/Blood page language. */
function StatusPill({ tone, children }: { tone: "success" | "warning" | "danger" | "neutral"; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    success: "bg-success-soft text-success-soft-foreground",
    warning: "bg-warning-soft text-warning-soft-foreground",
    danger: "bg-danger-soft text-danger-soft-foreground",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** Teal icon tile — the recurring visual motif across the app. */
function IconTile({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}

export default function PatientRecordsPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  // Authenticated users see their own records; unauthenticated demo viewers
  // fall back to the showcase patient so the page is never empty in demo mode.
  const recordsOwnerId = profile?.id || demoPatient.id;
  const [access, setAccess] = useState(getPatientAccess(recordsOwnerId));

  const records = getPatientRecords(recordsOwnerId);
  const reports = getPatientReports(recordsOwnerId);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (filter === "consultations") result = result.filter(r => r.visitType === "consultation");
    if (filter === "prescriptions") result = result.filter(r => r.prescription.length > 0);
    if (filter === "diagnostics") result = result.filter(r => r.tests.length > 0);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.diagnosis.toLowerCase().includes(q) ||
        r.facilityName.toLowerCase().includes(q) ||
        r.doctor.toLowerCase().includes(q) ||
        r.symptoms.toLowerCase().includes(q)
      );
    }
    return result;
  }, [records, filter, searchQuery]);

  const toggleAccess = (facilityId: string) => {
    setAccess(prev => prev.map(a =>
      a.facilityId === facilityId ? { ...a, accessGranted: !a.accessGranted } : a
    ));
  };

  const introText = t("records.title") + ". " + t("records.intro");

  const filters: { key: string; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { key: "all", label: t("records.all") },
    { key: "consultations", label: t("records.consultations"), icon: Stethoscope },
    { key: "prescriptions", label: t("records.prescriptions"), icon: Pill },
    { key: "diagnostics", label: t("records.diagnostics"), icon: TestTube },
  ];

  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("records.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t("records.intro")}</p>
        </div>
        <SpeakButton text={introText} />
      </div>

      {/* Patient summary — quiet, factual, scannable */}
      <Card className="border-primary/15 bg-primary/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <IconTile icon={User} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{demoPatient.name}</p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
                <div><span className="text-muted-foreground">{t("records.age")}:</span> <span className="font-medium">{demoPatient.age}</span></div>
                <div><span className="text-muted-foreground">{t("records.gender")}:</span> <span className="font-medium">{demoPatient.gender}</span></div>
                <div><span className="text-muted-foreground">{t("records.bloodGroup")}:</span> <span className="font-medium">{demoPatient.bloodGroup}</span></div>
                <div><span className="text-muted-foreground">{t("records.emergencyContact")}:</span> <span className="font-medium">{demoPatient.emergencyContact}</span></div>
              </div>
              {demoPatient.allergies.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{t("records.allergies")}:</span>
                  {demoPatient.allergies.map((a, i) => <StatusPill key={i} tone="danger">{a}</StatusPill>)}
                </div>
              )}
              {demoPatient.chronicConditions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{t("records.chronic")}:</span>
                  {demoPatient.chronicConditions.map((c, i) => <StatusPill key={i} tone="warning">{c}</StatusPill>)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("records.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label={t("records.search")}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("records.filter")}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {f.icon && <f.icon className="h-3.5 w-3.5" aria-hidden />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Health timeline */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Calendar className="h-5 w-5 text-primary" aria-hidden /> {t("records.timeline")}
          </h2>
          <SpeakButton text={filteredRecords.map(r => `${r.date}: ${r.diagnosis} at ${r.facilityName}`).join(". ")} />
        </div>
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" aria-hidden />
              </div>
              <p className="font-medium">{t("records.noRecords")}</p>
              <p className="text-sm text-muted-foreground">{t("records.intro")}</p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const expanded = expandedRecord === record.id;
              return (
                <Card key={record.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      type="button"
                      onClick={() => setExpandedRecord(expanded ? null : record.id)}
                      aria-expanded={expanded}
                      className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-muted/40"
                    >
                      <IconTile icon={Stethoscope} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{record.diagnosis}</h3>
                          <StatusPill tone="neutral">{record.visitType}</StatusPill>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {record.date} · {record.facilityName}
                        </p>
                        <p className="text-sm text-muted-foreground">{record.doctor} · {record.department}</p>
                      </div>
                      <span className="mt-1 text-muted-foreground">
                        {expanded ? <ChevronUp className="h-5 w-5" aria-hidden /> : <ChevronDown className="h-5 w-5" aria-hidden />}
                      </span>
                    </button>

                    {expanded && (
                      <div className="space-y-4 border-t px-5 py-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("records.symptoms")}</p>
                          <p className="mt-1 text-sm">{record.symptoms}</p>
                        </div>
                        {record.prescription.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("records.prescription")}</p>
                            <div className="mt-1.5 space-y-1.5">
                              {record.prescription.map((p, i) => (
                                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-muted/60 p-2.5 text-sm">
                                  <Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                  <div>
                                    <span className="font-medium">{p.medicine}</span>
                                    <span className="text-muted-foreground"> — {p.dosage}, {p.frequency}, {p.duration}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {record.tests.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("records.tests")}</p>
                            <div className="mt-1.5 space-y-1.5">
                              {record.tests.map((test, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                                  <TestTube className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                                  <span className="font-medium">{test.testName}</span>
                                  <StatusPill tone={test.status === "completed" ? "success" : "neutral"}>{test.status}</StatusPill>
                                  {test.result && <span className="text-muted-foreground">— {test.result}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {record.notes && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("records.notes")}</p>
                              <p className="mt-1 text-sm">{record.notes}</p>
                            </div>
                          )}
                          {record.followUpDate && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("records.followUp")}</p>
                              <p className="mt-1 text-sm font-medium">{record.followUpDate}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Diagnostic reports */}
      {reports.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
            <FileText className="h-5 w-5 text-primary" aria-hidden /> {t("records.reports")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <IconTile icon={TestTube} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold leading-snug">{report.testName}</p>
                        <StatusPill tone={report.status === "completed" || report.status === "available" ? "success" : "neutral"}>
                          {report.status}
                        </StatusPill>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{report.date} · {report.facilityName}</p>
                      {report.result && <p className="mt-2 rounded-lg bg-muted/60 p-2.5 text-sm">{report.result}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Record sharing & privacy */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden /> {t("records.privacy")}
            </h2>
            <SpeakButton text={t("records.privacyInfo")} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("records.privacyInfo")}</p>
          <div className="mt-4 space-y-2">
            {access.map((a) => (
              <div key={a.facilityId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{a.facilityName}</p>
                  <p className="text-xs text-muted-foreground">{a.facilityType}</p>
                </div>
                <Button
                  size="sm"
                  variant={a.accessGranted ? "default" : "outline"}
                  onClick={() => toggleAccess(a.facilityId)}
                  aria-pressed={a.accessGranted}
                  className="gap-1.5"
                >
                  {a.accessGranted ? <><Check className="h-3.5 w-3.5" aria-hidden />{t("records.allowed")}</> : <><X className="h-3.5 w-3.5" aria-hidden />{t("records.revoked")}</>}
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />{t("records.demoConsent")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
