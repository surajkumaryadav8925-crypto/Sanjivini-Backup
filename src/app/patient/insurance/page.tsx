"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Badge, Input, Label } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  ArrowLeft, Shield, CheckCircle, FileText, Building2, CreditCard, Download,
  Users, Search, Sparkles, ExternalLink, X,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores";

export default function InsurancePage() {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);

  const [modalOpen, setModalOpen] = useState(false);
  const [authDocType, setAuthDocType] = useState<"aadhaar" | "ration">("aadhaar");
  const [docNumber, setDocNumber] = useState("9876-5432-1098");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const patientDisplayName = profile?.full_name || "Ramesh Kumar";

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
      setModalOpen(false);
    }, 700);
  };

  const handleFillDemo = (type: "aadhaar" | "ration") => {
    setAuthDocType(type);
    setDocNumber(type === "aadhaar" ? "9876-5432-1098" : "BR-NFSA-0492817");
  };

  const instructions = `${t("patient.insurance.title")}. ${t("patient.insurance.schemeDescription")}. ${t("patient.insurance.eligibilityCheck")}. ${t("patient.insurance.documentsRequired")}.`;

  return (
    <div className="container px-4 py-6 max-w-3xl mx-auto space-y-6">
      <Link href="/patient/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("common.back")}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-soft text-warning-soft-foreground">
              <Shield className="h-5 w-5" aria-hidden />
            </span>
            {t("patient.insurance.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t("patient.insurance.schemeName")}</p>
        </div>
        <SpeakButton text={instructions} />
      </div>

      {/* Scheme banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-semibold">{t("patient.insurance.coverLine")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("patient.insurance.schemeDescription")}</p>
        </div>
      </div>

      {/* Active Golden Card once verified — amber retained deliberately (scheme identity) */}
      {isVerified && (
        <Card className="overflow-hidden border-amber-500/50 shadow-md">
          <div className="flex items-center justify-between bg-gradient-to-r from-amber-600 to-amber-500 p-4 text-white">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" aria-hidden />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide sm:text-base">{t("patient.insurance.goldenCard")}</h2>
                <p className="text-[11px] text-amber-100">{t("patient.insurance.nha")}</p>
              </div>
            </div>
            <Badge className="border-0 bg-emerald-600 text-xs font-bold text-white">{t("patient.insurance.verifiedActive")}</Badge>
          </div>

          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">{t("patient.insurance.beneficiary")}</p>
                <p className="text-base font-bold">{patientDisplayName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("patient.insurance.pmjayId")}: <span className="font-mono font-bold text-foreground">PMJAY-BR-849201948</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("patient.insurance.abhaAddress")}: <span className="font-mono text-foreground">ramesh.kumar@abdm</span>
                </p>
              </div>
              <div className="rounded-xl border border-success-soft-foreground/20 bg-success-soft p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-success-soft-foreground">
                  {t("patient.insurance.availableCoverage")}
                </p>
                <p className="text-2xl font-black text-success-soft-foreground">₹5,00,000</p>
                <p className="text-[11px] text-success-soft-foreground/90">{t("patient.insurance.coverageNote")}</p>
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-primary" aria-hidden />
                {t("patient.insurance.coveredMembers")} (4):
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { name: patientDisplayName, rel: "Head of Household" },
                  { name: "Sunita Devi", rel: "Spouse" },
                  { name: "Aarav Kumar", rel: "Son (Age 8)" },
                  { name: "Priya Kumari", rel: "Daughter (Age 5)" },
                ].map((m) => (
                  <div key={m.name} className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.rel}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-amber-500 text-amber-700 dark:text-amber-400"
                onClick={() => alert("Ayushman Golden Card digital slip ready for hospital kiosk admission.")}
              >
                <Download className="h-4 w-4" aria-hidden /> {t("patient.insurance.downloadCard")}
              </Button>
              <Link href="/patient/hospitals" className="flex-1">
                <Button size="sm" className="w-full gap-2">
                  <Building2 className="h-4 w-4" aria-hidden /> {t("patient.insurance.viewHospitals")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligibility checker */}
      <Card className={isVerified ? "" : "border-primary/40"}>
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
                {t("patient.insurance.eligibilityCheck")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("patient.insurance.eligibilityCheckDesc")}</p>
            </div>
            {isVerified && (
              <Badge variant="success" className="shrink-0 text-xs">{t("patient.insurance.eligibilityConfirmed")}</Badge>
            )}
          </div>

          <div className="mb-4 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("patient.insurance.secC2011Criteria")}:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {["families1", "families2", "families3", "families4"].map((k) => (
                <div key={k} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-4 w-4 shrink-0 text-success-soft-foreground" aria-hidden />
                  {t(`patient.insurance.${k}`)}
                </div>
              ))}
            </div>
          </div>

          <Button
            className="h-11 w-full font-bold"
            onClick={() => setModalOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" aria-hidden />
            {isVerified ? t("patient.insurance.recheck") : t("patient.insurance.checkEligibility")}
          </Button>
        </CardContent>
      </Card>

      {/* Required documents */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5 text-primary" aria-hidden />
            {t("patient.insurance.documentsRequired")}
          </h2>
          <div className="grid gap-2.5 text-xs sm:grid-cols-2">
            {["documents1", "documents2", "documents3", "documents4"].map((k) => (
              <div key={k} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 text-muted-foreground">
                <CheckCircle className="h-4 w-4 shrink-0 text-success-soft-foreground" aria-hidden />
                {t(`patient.insurance.${k}`)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empanelled hospitals */}
      <Card>
        <CardContent className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 font-semibold">
              <Building2 className="h-5 w-5 text-success-soft-foreground" aria-hidden />
              {t("patient.insurance.pmjayHospitals")}
            </h2>
            <p className="text-xs text-muted-foreground">{t("patient.insurance.pmjayHospitalsDesc")}</p>
          </div>
          <Link href="/patient/hospitals" className="shrink-0">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" aria-hidden />
              {t("patient.insurance.findHospitals")}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Eligibility verification modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label={t("patient.insurance.portal")}>
          <div className="relative w-full max-w-md space-y-4 rounded-2xl border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Shield className="h-5 w-5 text-amber-500" aria-hidden />
                  {t("patient.insurance.portal")}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("patient.insurance.portalDesc")}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="p-1 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold">{t("patient.insurance.verificationMethod")}</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={authDocType === "aadhaar" ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleFillDemo("aadhaar")}
                  >
                    <CreditCard className="mr-1 h-3.5 w-3.5" aria-hidden />
                    {t("patient.insurance.aadhaar")}
                  </Button>
                  <Button
                    type="button"
                    variant={authDocType === "ration" ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleFillDemo("ration")}
                  >
                    <FileText className="mr-1 h-3.5 w-3.5" aria-hidden />
                    {t("patient.insurance.ration")}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">
                  {authDocType === "aadhaar" ? t("patient.insurance.aadhaarNumber") : t("patient.insurance.rationNumber")} *
                </Label>
                <Input
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder={authDocType === "aadhaar" ? "XXXX-XXXX-XXXX" : "BR-NFSA-XXXXXX"}
                  className="mt-1.5 font-mono"
                />
              </div>

              <div className="space-y-1 rounded-xl bg-muted/60 p-3 text-xs">
                <p className="font-semibold">{t("patient.insurance.demoIdentifiers")}:</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5 text-[11px] text-primary underline"
                    onClick={() => handleFillDemo("aadhaar")}
                  >
                    {t("patient.insurance.useSampleAadhaar")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5 text-[11px] text-primary underline"
                    onClick={() => handleFillDemo("ration")}
                  >
                    {t("patient.insurance.useSampleRation")}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
                  {t("patient.family.cancel")}
                </Button>
                <Button type="submit" disabled={verifying || !docNumber} className="flex-1 bg-amber-600 font-bold text-white hover:bg-amber-700">
                  {verifying ? t("patient.insurance.querying") : t("patient.insurance.verifyStatus")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
