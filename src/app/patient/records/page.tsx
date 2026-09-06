"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores";
import { FileText, Calendar, Stethoscope, Pill, TestTube, Building2, ChevronDown, ChevronUp, Search, Shield, Check, X, AlertCircle, Clock, User } from "lucide-react";
import { demoPatient, getPatientRecords, getPatientReports, getPatientAccess, MedicalRecord, DiagnosticReport } from "@/data/medicalRecords";

export default function PatientRecordsPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [access, setAccess] = useState(getPatientAccess(profile?.id || "demo-user"));

  const records = getPatientRecords(profile?.id || "demo-user");
  const reports = getPatientReports(profile?.id || "demo-user");

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

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{t("records.title")}</h1>
          <SpeakButton text={introText} />
        </div>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> {demoPatient.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">{t("records.age")}:</span> {demoPatient.age}</div>
            <div><span className="text-muted-foreground">{t("records.gender")}:</span> {demoPatient.gender}</div>
            <div><span className="text-muted-foreground">{t("records.bloodGroup")}:</span> {demoPatient.bloodGroup}</div>
            <div><span className="text-muted-foreground">{t("records.emergencyContact")}:</span> {demoPatient.emergencyContact}</div>
          </div>
          {demoPatient.allergies.length > 0 && (
            <div className="mt-3">
              <span className="text-sm text-muted-foreground">{t("records.allergies")}: </span>
              {demoPatient.allergies.map((a, i) => <Badge key={i} variant="destructive" className="mr-1">{a}</Badge>)}
            </div>
          )}
          {demoPatient.chronicConditions.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">{t("records.chronic")}: </span>
              {demoPatient.chronicConditions.map((c, i) => <Badge key={i} variant="secondary" className="mr-1">{c}</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("records.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>{t("records.all")}</Button>
              <Button size="sm" variant={filter === "consultations" ? "default" : "outline"} onClick={() => setFilter("consultations")}><Stethoscope className="h-4 w-4 mr-1" />{t("records.consultations")}</Button>
              <Button size="sm" variant={filter === "prescriptions" ? "default" : "outline"} onClick={() => setFilter("prescriptions")}><Pill className="h-4 w-4 mr-1" />{t("records.prescriptions")}</Button>
              <Button size="sm" variant={filter === "diagnostics" ? "default" : "outline"} onClick={() => setFilter("diagnostics")}><TestTube className="h-4 w-4 mr-1" />{t("records.diagnostics")}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Timeline */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" /> {t("records.timeline")}
          <SpeakButton text={filteredRecords.map(r => `${r.date}: ${r.diagnosis} at ${r.facilityName}`).join(". ")} />
        </h2>
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">{t("records.noRecords")}</CardContent></Card>
          ) : (
            filteredRecords.map((record, index) => (
              <Card key={record.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{record.diagnosis}</h3>
                          <Badge variant="outline">{record.visitType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.date} | {record.facilityName}</p>
                        <p className="text-sm text-muted-foreground">{record.doctor} | {record.department}</p>
                      </div>
                    </div>
                    {expandedRecord === record.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                  {expandedRecord === record.id && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <div><span className="font-medium">{t("records.symptoms")}:</span> <span className="text-sm">{record.symptoms}</span></div>
                      {record.prescription.length > 0 && (
                        <div>
                          <span className="font-medium">{t("records.prescription")}:</span>
                          <div className="mt-1 space-y-1">
                            {record.prescription.map((p, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                                <Pill className="h-4 w-4" />
                                <span>{p.medicine}</span>
                                <span className="text-muted-foreground">- {p.dosage}, {p.frequency}, {p.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {record.tests.length > 0 && (
                        <div>
                          <span className="font-medium">{t("records.tests")}:</span>
                          <div className="mt-1 space-y-1">
                            {record.tests.map((test, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <TestTube className="h-4 w-4" />
                                <span>{test.testName}</span>
                                <Badge variant={test.status === "completed" ? "default" : "secondary"}>{test.status}</Badge>
                                {test.result && <span className="text-muted-foreground">- {test.result}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {record.notes && <div><span className="font-medium">{t("records.notes")}:</span> <span className="text-sm">{record.notes}</span></div>}
                      {record.followUpDate && <div><span className="font-medium">{t("records.followUp")}:</span> <span className="text-sm">{record.followUpDate}</span></div>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Diagnostic Reports */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" /> {t("records.reports")}
        </h2>
        <div className="grid gap-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TestTube className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{report.testName}</p>
                      <p className="text-sm text-muted-foreground">{report.date} | {report.facilityName}</p>
                    </div>
                  </div>
                  <Badge variant={report.status === "completed" || report.status === "available" ? "default" : "secondary"}>
                    {report.status}
                  </Badge>
                </div>
                {report.result && <p className="mt-2 text-sm bg-muted p-2 rounded">{report.result}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Record Sharing & Privacy */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" /> {t("records.privacy")}
            <SpeakButton text={t("records.privacyInfo")} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("records.privacyInfo")}</p>
          <div className="space-y-2">
            {access.map((a) => (
              <div key={a.facilityId} className="flex items-center justify-between p-2 bg-background dark:bg-black/40 rounded">
                <div>
                  <p className="font-medium text-sm">{a.facilityName}</p>
                  <p className="text-xs text-muted-foreground">{a.facilityType}</p>
                </div>
                <Button size="sm" variant={a.accessGranted ? "default" : "outline"} onClick={() => toggleAccess(a.facilityId)}>
                  {a.accessGranted ? <><Check className="h-4 w-4 mr-1" />{t("records.allowed")}</> : <><X className="h-4 w-4 mr-1" />{t("records.revoked")}</>}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" />{t("records.demoConsent")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
