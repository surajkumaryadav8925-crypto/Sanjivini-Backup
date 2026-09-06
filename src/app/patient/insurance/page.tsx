"use client";
import Link from "next/link";
import { Card, CardContent, Button, Alert, AlertDescription } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { ArrowLeft, Shield, CheckCircle, FileText, Building2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function InsurancePage() {
  const { t } = useTranslation();
  const instructions = `${t("patient.insurance.title")}. ${t("patient.insurance.schemeDescription")}. ${t("patient.insurance.eligibilityCheck")}. ${t("patient.insurance.documentsRequired")}.`;
  return (
    <div className="container px-4 py-6 max-w-2xl mx-auto">
      <Link href="/patient/dashboard" className="inline-flex items-center gap-2 text-muted-foreground mb-4"><ArrowLeft className="h-4 w-4" />{t("common.back")}</Link>
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-amber-500" />{t("patient.insurance.title")}</h1>
        <SpeakButton text={instructions} />
      </div>
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription><strong>Ayushman Bharat PM-JAY</strong><p className="text-sm mt-1">{t("patient.insurance.schemeDescription")}</p></AlertDescription>
      </Alert>
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="font-semibold mb-4">{t("patient.insurance.eligibilityCheck")}</h2>
          <p className="text-muted-foreground mb-4">{t("patient.insurance.eligibilityCheckDesc")}</p>
          <div className="space-y-2 text-sm">
            <p><strong>{t("patient.insurance.secC2011Criteria")}</strong></p>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />{t("patient.insurance.families1")}</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />{t("patient.insurance.families2")}</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />{t("patient.insurance.families3")}</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />{t("patient.insurance.families4")}</div>
          </div>
          <Button className="w-full mt-4" disabled>{t("patient.insurance.checkEligibility")}</Button>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FileText className="h-5 w-5" />{t("patient.insurance.documentsRequired")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />{t("patient.insurance.documents1")}</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />{t("patient.insurance.documents2")}</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />{t("patient.insurance.documents3")}</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />{t("patient.insurance.documents4")}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="h-5 w-5" />{t("patient.insurance.pmjayHospitals")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("patient.insurance.pmjayHospitalsDesc")}</p>
          <Link href="/patient/hospitals"><Button variant="outline" className="w-full">{t("patient.insurance.findHospitals")}</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
