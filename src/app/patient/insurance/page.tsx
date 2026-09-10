"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Alert, AlertDescription, Badge, Input, Label } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  FileText,
  Building2,
  CreditCard,
  Download,
  Users,
  Search,
  Sparkles,
  ExternalLink,
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
      <Link href="/patient/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-amber-500 fill-amber-500/20" />
            {t("patient.insurance.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)
          </p>
        </div>
        <SpeakButton text={instructions} />
      </div>

      {/* Scheme Banner */}
      <Alert className="bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200">
        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertDescription>
          <strong>Ayushman Bharat PM-JAY &bull; ₹5,00,000 Free Annual Health Cover</strong>
          <p className="text-xs mt-1 text-muted-foreground dark:text-blue-300">
            {t("patient.insurance.schemeDescription")}
          </p>
        </AlertDescription>
      </Alert>

      {/* Active Golden Card Preview if Verified */}
      {isVerified && (
        <Card className="border-2 border-amber-500 shadow-xl overflow-hidden bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5">
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-bold text-sm sm:text-base tracking-wide uppercase">
                  Ayushman Golden Card &bull; PM-JAY
                </h3>
                <p className="text-[11px] text-amber-100">National Health Authority &bull; Govt of India</p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white border-0 text-xs px-2.5 py-0.5 font-bold">
              VERIFIED &bull; ACTIVE
            </Badge>
          </div>

          <CardContent className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Primary Beneficiary Name</p>
                <p className="text-base font-bold text-foreground">{patientDisplayName}</p>
                <p className="text-xs text-muted-foreground mt-1">PM-JAY ID: <span className="font-mono font-bold text-foreground">PMJAY-BR-849201948</span></p>
                <p className="text-xs text-muted-foreground">ABHA Address: <span className="font-mono text-foreground">ramesh.kumar@abdm</span></p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Available Annual Coverage
                </p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹5,00,000</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  100% Cashless secondary &amp; tertiary hospitalization across all empanelled hospitals
                </p>
              </div>
            </div>

            <div className="pt-2 border-t text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Users className="h-4 w-4 text-primary" />
                Covered Family Members (4 Total):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                <div className="p-2 bg-muted/50 rounded text-center">
                  <p className="font-semibold text-foreground">{patientDisplayName}</p>
                  <p className="text-[10px]">Head of Household</p>
                </div>
                <div className="p-2 bg-muted/50 rounded text-center">
                  <p className="font-semibold text-foreground">Sunita Devi</p>
                  <p className="text-[10px]">Spouse</p>
                </div>
                <div className="p-2 bg-muted/50 rounded text-center">
                  <p className="font-semibold text-foreground">Aarav Kumar</p>
                  <p className="text-[10px]">Son (Age 8)</p>
                </div>
                <div className="p-2 bg-muted/50 rounded text-center">
                  <p className="font-semibold text-foreground">Priya Kumari</p>
                  <p className="text-[10px]">Daughter (Age 5)</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-amber-500 text-amber-700 dark:text-amber-400"
                onClick={() => alert("Ayushman Golden Card digital slip ready for hospital kiosk admission.")}
              >
                <Download className="h-4 w-4" /> Download Ayushman e-Card
              </Button>
              <Link href="/patient/hospitals" className="flex-1">
                <Button size="sm" className="w-full bg-primary gap-2">
                  <Building2 className="h-4 w-4" /> View Empanelled Hospitals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligibility Checker Trigger Card */}
      <Card className={isVerified ? "border-muted" : "border-2 border-primary/50 shadow-md"}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                {t("patient.insurance.eligibilityCheck")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("patient.insurance.eligibilityCheckDesc")}
              </p>
            </div>
            {isVerified && (
              <Badge variant="success" className="text-xs">
                Eligibility Confirmed
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm mb-4">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              {t("patient.insurance.secC2011Criteria")}:
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                {t("patient.insurance.families1")}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                {t("patient.insurance.families2")}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                {t("patient.insurance.families3")}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                {t("patient.insurance.families4")}
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11"
            onClick={() => setModalOpen(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            {isVerified ? "Re-Check / Verify Another ID" : t("patient.insurance.checkEligibility")}
          </Button>
        </CardContent>
      </Card>

      {/* Required Documents Guide */}
      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t("patient.insurance.documentsRequired")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              {t("patient.insurance.documents1")}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              {t("patient.insurance.documents2")}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              {t("patient.insurance.documents3")}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              {t("patient.insurance.documents4")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empanelled Hospitals Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-semibold text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                {t("patient.insurance.pmjayHospitals")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("patient.insurance.pmjayHospitalsDesc")}
              </p>
            </div>
            <Link href="/patient/hospitals">
              <Button variant="outline" className="gap-2 shrink-0">
                <ExternalLink className="h-4 w-4" />
                {t("patient.insurance.findHospitals")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Verification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-background border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  PM-JAY Eligibility Portal
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verify SECC 2011 &amp; NFSA database eligibility
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold">Verification Method</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button
                    type="button"
                    variant={authDocType === "aadhaar" ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleFillDemo("aadhaar")}
                  >
                    <CreditCard className="h-3.5 w-3.5 mr-1" />
                    Aadhaar Card
                  </Button>
                  <Button
                    type="button"
                    variant={authDocType === "ration" ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleFillDemo("ration")}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Ration Card (NFSA)
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">
                  {authDocType === "aadhaar" ? "12-Digit Aadhaar Number" : "Ration Card Number (NFSA)"} *
                </Label>
                <Input
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder={authDocType === "aadhaar" ? "XXXX-XXXX-XXXX" : "BR-NFSA-XXXXXX"}
                  className="mt-1 font-mono"
                />
              </div>

              <div className="p-3 bg-muted/60 rounded-lg text-xs space-y-1">
                <p className="font-semibold">Demo Test Identifiers:</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-1.5 text-primary underline"
                    onClick={() => handleFillDemo("aadhaar")}
                  >
                    Use Sample Aadhaar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-1.5 text-primary underline"
                    onClick={() => handleFillDemo("ration")}
                  >
                    Use Sample Ration Card
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={verifying || !docNumber}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {verifying ? "Querying NHA..." : "Verify Status"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

