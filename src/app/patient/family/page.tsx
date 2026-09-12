"use client";
import { useState } from "react";
import { Card, CardContent, Button, Badge, Input, Label, Alert, AlertDescription } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  Heart, User, Plus, Trash2, Baby, CheckCircle2, AlertTriangle, Pill, ShieldCheck, Check,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  bloodGroup: string;
}

interface ANCCheckup {
  id: string;
  title: string;
  trimester: string;
  recommendedWeek: string;
  details: string;
  status: "completed" | "due" | "upcoming";
  completedDate?: string;
}

interface VaccineDose {
  id: string;
  vaccine: string;
  protectsAgainst: string;
  stage: string;
  status: "completed" | "due" | "upcoming";
  administeredDate?: string;
}

/** Local interpolation for strings like "administeredOf": "{done} of {total} administered". */
function tf(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in values ? String(values[key]) : `{${key}}`
  );
}

export default function FamilyPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"members" | "maternal" | "child">("members");

  // Family members state
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Ramesh Kumar", relation: "Self", age: 32, gender: "Male", bloodGroup: "B+" },
    { id: "2", name: "Sunita Devi", relation: "Spouse", age: 28, gender: "Female", bloodGroup: "O+" },
    { id: "3", name: "Aarav Kumar", relation: "Son", age: 2, gender: "Male", bloodGroup: "B+" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "", age: "", gender: "Male", bloodGroup: "O+" });

  // Maternal ANC state
  const [ancSchedule, setAncSchedule] = useState<ANCCheckup[]>([
    {
      id: "anc-1",
      title: "ANC Checkup 1 (Registration)",
      trimester: "1st Trimester",
      recommendedWeek: "Within 12 Weeks",
      details: "Blood group, Hemoglobin, Urine routine, USG dating scan, MCP Card issue",
      status: "completed",
      completedDate: "12 May 2026",
    },
    {
      id: "anc-2",
      title: "ANC Checkup 2",
      trimester: "2nd Trimester",
      recommendedWeek: "14 - 26 Weeks",
      details: "TT/Td-1 injection, IFA & Calcium tablets initiation, blood pressure, anomaly scan",
      status: "completed",
      completedDate: "28 July 2026",
    },
    {
      id: "anc-3",
      title: "ANC Checkup 3",
      trimester: "3rd Trimester",
      recommendedWeek: "28 - 34 Weeks",
      details: "TT/Td-2 booster, maternal anemia check, gestational diabetes test, fetal growth",
      status: "due",
    },
    {
      id: "anc-4",
      title: "ANC Checkup 4 (Pre-Delivery)",
      trimester: "3rd Trimester",
      recommendedWeek: "36 Weeks to Term",
      details: "Fetal presentation, Institutional birth center planning, 102/108 ambulance booking arrangement",
      status: "upcoming",
    },
  ]);

  const [ifaCount, setIfaCount] = useState(64); // out of 100 tablets

  // Child Immunization State
  const [vaccines, setVaccines] = useState<VaccineDose[]>([
    { id: "v1", vaccine: "BCG", protectsAgainst: "Tuberculosis", stage: "At Birth", status: "completed", administeredDate: "14 Dec 2023" },
    { id: "v2", vaccine: "OPV-0", protectsAgainst: "Poliomyelitis", stage: "At Birth", status: "completed", administeredDate: "14 Dec 2023" },
    { id: "v3", vaccine: "Hepatitis B (Birth Dose)", protectsAgainst: "Hepatitis B", stage: "Within 24 Hours", status: "completed", administeredDate: "14 Dec 2023" },
    { id: "v4", vaccine: "Pentavalent-1 (DPT+HepB+Hib)", protectsAgainst: "Diphtheria, Pertussis, Tetanus, Hep B, Hib", stage: "6 Weeks", status: "completed", administeredDate: "26 Jan 2024" },
    { id: "v5", vaccine: "Rotavirus-1 & OPV-1", protectsAgainst: "Rotavirus Diarrhea & Polio", stage: "6 Weeks", status: "completed", administeredDate: "26 Jan 2024" },
    { id: "v6", vaccine: "Pentavalent-2 & OPV-2", protectsAgainst: "5-in-1 Pediatric Diseases", stage: "10 Weeks", status: "completed", administeredDate: "24 Feb 2024" },
    { id: "v7", vaccine: "Pentavalent-3 & fIPV-2", protectsAgainst: "Polio & 5 Pediatric Conditions", stage: "14 Weeks", status: "completed", administeredDate: "28 Mar 2024" },
    { id: "v8", vaccine: "MR-1 (Measles-Rubella)", protectsAgainst: "Measles & Rubella", stage: "9 - 12 Months", status: "completed", administeredDate: "18 Sep 2024" },
    { id: "v9", vaccine: "DPT Booster-1 & MR-2", protectsAgainst: "Diphtheria-Pertussis-Tetanus Booster", stage: "16 - 24 Months", status: "due" },
    { id: "v10", vaccine: "DPT Booster-2", protectsAgainst: "School-age Diphtheria & Tetanus Booster", stage: "5 - 6 Years", status: "upcoming" },
  ]);

  const addMember = () => {
    if (!form.name || !form.relation || !form.age) return;
    setMembers([
      ...members,
      {
        id: Date.now().toString(),
        name: form.name,
        relation: form.relation,
        age: parseInt(form.age),
        gender: form.gender,
        bloodGroup: form.bloodGroup,
      },
    ]);
    setForm({ name: "", relation: "", age: "", gender: "Male", bloodGroup: "O+" });
    setShowForm(false);
  };

  const removeMember = (id: string) => setMembers(members.filter((m) => m.id !== id));

  const toggleAncStatus = (id: string) => {
    setAncSchedule(
      ancSchedule.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "completed" ? "due" : "completed",
              completedDate: a.status !== "completed" ? new Date().toLocaleDateString() : undefined,
            }
          : a
      )
    );
  };

  const toggleVaccine = (id: string) => {
    setVaccines(
      vaccines.map((v) =>
        v.id === id
          ? {
              ...v,
              status: v.status === "completed" ? "due" : "completed",
              administeredDate: v.status !== "completed" ? new Date().toLocaleDateString() : undefined,
            }
          : v
      )
    );
  };

  const instructions = `${t("patient.family.title")}. ${t("patient.family.intro")}`;

  const tabs: { key: "members" | "maternal" | "child"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "members", label: t("patient.family.tabMembers"), icon: User },
    { key: "maternal", label: t("patient.family.tabMaternal"), icon: Heart },
    { key: "child", label: t("patient.family.tabChild"), icon: Baby },
  ];

  return (
    <div className="container px-4 py-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("patient.family.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t("patient.family.pageIntro")}</p>
        </div>
        <SpeakButton text={instructions} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-muted p-1" role="tablist" aria-label={t("patient.family.title")}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold transition-all sm:text-sm ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${tab.key === "maternal" ? "text-rose-500" : tab.key === "child" ? "text-sky-500" : "text-primary"}`} aria-hidden />
            {tab.label}
            {tab.key === "members" && ` (${members.length})`}
          </button>
        ))}
      </div>

      {/* TAB 1: Family Members */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">{t("patient.family.household")}</p>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden />
              {t("patient.family.addMember")}
            </Button>
          </div>

          {showForm && (
            <Card className="border-primary/40">
              <CardContent className="space-y-3 p-5">
                <p className="font-semibold">{t("patient.family.addNewMember")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("patient.family.fullName")}</Label>
                    <Input
                      placeholder={t("patient.family.namePlaceholder")}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("patient.family.relationship")}</Label>
                    <Input
                      placeholder={t("patient.family.relationPlaceholder")}
                      value={form.relation}
                      onChange={(e) => setForm({ ...form, relation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("patient.family.ageYears")}</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={t("patient.family.agePlaceholder")}
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("patient.family.bloodGroup")}</Label>
                    <select
                      aria-label={t("patient.family.bloodGroup")}
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={addMember} className="flex-1">{t("patient.family.addNewMember")}</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">{t("patient.family.cancel")}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {members.map((m) => (
              <Card key={m.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <User className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.relation} · {m.age} {t("patient.family.years")} · {m.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-lg bg-danger-soft px-2 py-1 font-mono text-xs font-bold text-danger-soft-foreground">
                      {m.bloodGroup}
                    </span>
                    {m.relation !== "Self" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMember(m.id)}
                        aria-label={`${t("notifications.dismiss")}: ${m.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Maternal ANC Care */}
      {activeTab === "maternal" && (
        <div className="space-y-4">
          <Card className="border-rose-200/70 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
                  <Heart className="h-5 w-5 fill-current" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-bold">Sunita Devi ({t("patient.family.mother")})</p>
                  <p className="text-xs text-muted-foreground">
                    {t("patient.family.gestationalAge")}: <strong>26</strong> · {t("patient.family.edd")}: <strong>Nov 2026</strong>
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 border-rose-300 bg-card text-rose-700 dark:border-rose-800 dark:text-rose-300">
                {t("patient.family.pmmvy")}
              </Badge>
            </CardContent>
          </Card>

          {/* IFA daily course tracker */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Pill className="h-4 w-4 text-primary" aria-hidden />
                  {t("patient.family.ifaTitle")}
                </p>
                <span className="font-mono text-xs text-muted-foreground">{ifaCount} / 100</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-2.5 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(ifaCount / 100) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={ifaCount}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{t("patient.family.ifaNote")}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 gap-1 text-xs"
                  onClick={() => setIfaCount((p) => Math.min(100, p + 1))}
                  disabled={ifaCount >= 100}
                >
                  <Check className="h-3 w-3" aria-hidden /> {t("patient.family.logToday")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ANC visit schedule */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("patient.family.ancSchedule")}
            </p>
            {ancSchedule.map((anc) => (
              <Card key={anc.id} className={anc.status === "due" ? "border-warning-soft-foreground/30" : ""}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold">{anc.title}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                            anc.status === "completed"
                              ? "bg-success-soft text-success-soft-foreground"
                              : anc.status === "due"
                              ? "bg-warning-soft text-warning-soft-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {anc.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {anc.trimester} · {anc.recommendedWeek}
                        {anc.completedDate && ` · ${t("patient.family.doneOn")} ${anc.completedDate}`}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={anc.status === "completed" ? "outline" : "default"}
                      className="h-8 shrink-0 text-xs"
                      onClick={() => toggleAncStatus(anc.id)}
                    >
                      {anc.status === "completed" ? (
                        <>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-success-soft-foreground" aria-hidden /> {t("patient.family.done")}
                        </>
                      ) : (
                        t("patient.family.markVisited")
                      )}
                    </Button>
                  </div>
                  <p className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">{anc.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* High-risk warning signs */}
          <Alert className="border-danger-soft-foreground/25 bg-danger-soft text-danger-soft-foreground">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            <AlertDescription className="space-y-1 text-xs">
              <strong className="block font-semibold">{t("patient.family.dangerSignsTitle")}</strong>
              <p>{t("patient.family.dangerSignsBody")}</p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* TAB 3: Universal Child Immunization */}
      {activeTab === "child" && (
        <div className="space-y-4">
          <Card className="border-sky-200/70 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/20">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                  <Baby className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-bold">{t("patient.family.childName")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("patient.family.dob")}: <strong>14 Dec 2023</strong> · {t("patient.family.uip")}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 border-sky-300 bg-card text-sky-700 dark:border-sky-800 dark:text-sky-300">
                {t("patient.family.nationalSchedule")}
              </Badge>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">{t("patient.family.mandatory")}</span>
              <span>{tf(t("patient.family.administeredOf"), { done: vaccines.filter((v) => v.status === "completed").length, total: vaccines.length })}</span>
            </div>

            {vaccines.map((v) => (
              <Card key={v.id} className={v.status === "due" ? "border-primary/40" : ""}>
                <CardContent className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{v.vaccine}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                          v.status === "completed"
                            ? "bg-success-soft text-success-soft-foreground"
                            : v.status === "due"
                            ? "bg-warning-soft text-warning-soft-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("patient.family.targetAge")}: <strong>{v.stage}</strong> · {t("patient.family.protects")}: {v.protectsAgainst}
                    </p>
                    {v.administeredDate && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-success-soft-foreground">
                        <CheckCircle2 className="h-3 w-3" aria-hidden /> {t("patient.family.given")}: {v.administeredDate}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={v.status === "completed" ? "outline" : "default"}
                    className="h-8 shrink-0 text-xs"
                    onClick={() => toggleVaccine(v.id)}
                  >
                    {v.status === "completed" ? (
                      <>
                        <ShieldCheck className="mr-1 h-3.5 w-3.5 text-success-soft-foreground" aria-hidden /> {t("patient.family.done")}
                      </>
                    ) : (
                      t("patient.family.markGiven")
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
