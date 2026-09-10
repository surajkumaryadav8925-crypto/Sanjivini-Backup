"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Label, Alert, AlertDescription } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  Heart,
  User,
  Plus,
  Trash2,
  Baby,
  CheckCircle2,
  AlertTriangle,
  Pill,
  ShieldCheck,
  Check,
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

  return (
    <div className="container px-4 py-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            {t("patient.family.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Family health records, maternal care (ANC), and universal immunization
          </p>
        </div>
        <SpeakButton text={instructions} />
      </div>

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-xl">
        <Button
          variant={activeTab === "members" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("members")}
          className="flex-1 text-xs"
        >
          <User className="h-3.5 w-3.5 mr-1.5" />
          Members ({members.length})
        </Button>
        <Button
          variant={activeTab === "maternal" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("maternal")}
          className="flex-1 text-xs"
        >
          <Heart className="h-3.5 w-3.5 mr-1.5 text-rose-500" />
          Maternal ANC
        </Button>
        <Button
          variant={activeTab === "child" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("child")}
          className="flex-1 text-xs"
        >
          <Baby className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
          Child Vaccines
        </Button>
      </div>

      {/* TAB 1: Family Members */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Registered Household Dependents</p>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              {t("patient.family.addMember")}
            </Button>
          </div>

          {showForm && (
            <Card className="border-primary/50 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{t("patient.family.addNewMember")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      placeholder={t("patient.family.namePlaceholder")}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Relationship</Label>
                    <Input
                      placeholder={t("patient.family.relationPlaceholder")}
                      value={form.relation}
                      onChange={(e) => setForm({ ...form, relation: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Age (Years)</Label>
                    <Input
                      type="number"
                      placeholder={t("patient.family.agePlaceholder")}
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Blood Group</Label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-xs font-semibold"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={addMember} className="flex-1 bg-primary">
                    {t("patient.family.addNewMember")}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    {t("patient.family.cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {members.map((m) => (
              <Card key={m.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.relation} &bull; {m.age} {t("patient.family.years")} &bull; {m.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-red-600 font-bold text-xs">
                      {m.bloodGroup}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {t("common.active")}
                    </Badge>
                    {m.relation !== "Self" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMember(m.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
          <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Sunita Devi (Mother)</p>
                  <p className="text-xs text-muted-foreground">
                    Gestational Age: <strong>26 Weeks</strong> &bull; Expected Delivery: <strong>Nov 2026</strong>
                  </p>
                </div>
              </div>
              <Badge className="bg-rose-600 text-white text-xs px-2.5 py-0.5">
                PMMVY Registered
              </Badge>
            </CardContent>
          </Card>

          {/* Micronutrient Daily Course Tracker */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  Iron &amp; Folic Acid (IFA) 100-Day Course
                </span>
                <span className="font-mono text-xs text-muted-foreground">{ifaCount} / 100 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(ifaCount / 100) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                <span>Daily 1 red IFA tablet prevents pregnancy anemia</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setIfaCount((p) => Math.min(100, p + 1))}
                  disabled={ifaCount >= 100}
                >
                  <Check className="h-3 w-3 mr-1" /> Log Today&apos;s Tablet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ANC Checkup Visits */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Antenatal Care (ANC) Visits Schedule
            </p>
            {ancSchedule.map((anc) => (
              <Card key={anc.id} className={anc.status === "due" ? "border-amber-400 dark:border-amber-700 shadow-sm" : ""}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground">{anc.title}</p>
                        <Badge
                          variant={
                            anc.status === "completed"
                              ? "success"
                              : anc.status === "due"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px] capitalize"
                        >
                          {anc.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {anc.trimester} &bull; {anc.recommendedWeek}
                        {anc.completedDate && ` &bull; Done on ${anc.completedDate}`}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={anc.status === "completed" ? "outline" : "default"}
                      className={`text-xs h-8 ${anc.status === "due" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
                      onClick={() => toggleAncStatus(anc.id)}
                    >
                      {anc.status === "completed" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Done
                        </>
                      ) : (
                        "Mark Visited"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded">
                    {anc.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* High Risk Warning Signs Alert */}
          <Alert className="bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-900 dark:text-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <AlertDescription className="text-xs space-y-1">
              <strong className="block font-semibold">Maternal Danger Signs (Seek Immediate Hospital Care):</strong>
              <p>Severe headache with blurred vision, sudden swelling of face/hands, vaginal bleeding, high fever, or reduced baby movement.</p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* TAB 3: Universal Child Immunization */}
      {activeTab === "child" && (
        <div className="space-y-4">
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
                  <Baby className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Baby Aarav Kumar</p>
                  <p className="text-xs text-muted-foreground">
                    DOB: <strong>14 Dec 2023</strong> &bull; Universal Immunization Record (UIP)
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white text-xs px-2.5 py-0.5">
                National Schedule
              </Badge>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Mandatory Vaccines</span>
              <span>
                {vaccines.filter((v) => v.status === "completed").length} of {vaccines.length} Administered
              </span>
            </div>

            {vaccines.map((v) => (
              <Card key={v.id} className={v.status === "due" ? "border-primary shadow-sm" : ""}>
                <CardContent className="p-3.5 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-foreground">{v.vaccine}</p>
                      <Badge
                        variant={
                          v.status === "completed"
                            ? "success"
                            : v.status === "due"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px] capitalize"
                      >
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target Age: <strong>{v.stage}</strong> &bull; Protects: {v.protectsAgainst}
                    </p>
                    {v.administeredDate && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Given: {v.administeredDate}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={v.status === "completed" ? "outline" : "default"}
                    className="text-xs h-8 shrink-0"
                    onClick={() => toggleVaccine(v.id)}
                  >
                    {v.status === "completed" ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Done
                      </>
                    ) : (
                      "Mark Given"
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

