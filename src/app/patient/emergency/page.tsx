"use client";
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Phone, MapPin, Heart, AlertTriangle, Navigation, Ambulance, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function EmergencyPage() {
  const { t } = useTranslation();
  const emergencyInstructions = `${t("patient.emergency.medicalEmergency")}. ${t("patient.emergency.stayCalm")}. ${t("patient.emergency.whileWaitingForHelp")}: ${t("patient.emergency.instruction1")}. ${t("patient.emergency.instruction2")}. ${t("patient.emergency.instruction3")}. ${t("patient.emergency.instruction4")}.`;
  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t("patient.emergency.title")}</h1>
          <p className="text-muted-foreground">{t("patient.emergency.stayCalm")}</p>
        </div>
        <SpeakButton text={emergencyInstructions} />
      </div>
      <Alert variant="destructive" className="mb-6 border-2 border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600">
        <AlertTriangle className="h-6 w-6" />
        <AlertDescription className="text-lg font-semibold">{t("patient.emergency.medicalEmergency")}</AlertDescription>
      </Alert>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="border-2 border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800"><CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><Phone className="h-5 w-5" />{t("patient.emergency.callEmergencyHelpline")}</CardTitle></CardHeader><CardContent className="space-y-3">
          <a href="tel:108" className="block"><Button size="lg" className="w-full bg-red-600 hover:bg-red-700 gap-2 active:scale-[0.98] transition-transform"><Ambulance className="h-5 w-5" />{t("patient.emergency.ambulance108")}</Button></a>
          <a href="tel:102" className="block"><Button size="lg" variant="outline" className="w-full gap-2 active:scale-[0.98] transition-transform"><Heart className="h-5 w-5" />{t("patient.emergency.medicalHelpline102")}</Button></a>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />{t("patient.emergency.nearbyEmergencyHospitals")}</CardTitle></CardHeader><CardContent className="space-y-2">
          <div className="p-3 bg-muted rounded-lg"><p className="font-medium">JNMCH Hospital</p><p className="text-sm text-muted-foreground">2.3 {t("patient.emergency.kmAway")}</p><a href="tel:+916412234567" className="text-sm text-blue-600">{t("patient.hospitals.call")}</a></div>
          <div className="p-3 bg-muted rounded-lg"><p className="font-medium">District Hospital</p><p className="text-sm text-muted-foreground">3.1 {t("patient.emergency.kmAway")}</p><a href="tel:+916412345678" className="text-sm text-blue-600">{t("patient.hospitals.call")}</a></div>
        </CardContent></Card>
      </div>
      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 mb-6"><CardContent className="py-4"><h3 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">{t("patient.emergency.whileWaitingForHelp")}</h3><ul className="text-sm space-y-1 text-amber-800 dark:text-amber-200"><li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />{t("patient.emergency.instruction1")}</li><li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />{t("patient.emergency.instruction2")}</li><li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />{t("patient.emergency.instruction3")}</li><li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />{t("patient.emergency.instruction4")}</li></ul></CardContent></Card>
      <div className="flex gap-3"><a href="https://www.google.com/maps/search/emergency+hospital+near+me" target="_blank" rel="noopener" className="flex-1"><Button variant="outline" className="w-full gap-2 active:scale-[0.98] transition-transform"><Navigation className="h-4 w-4" />{t("patient.emergency.findNearbyHospital")}</Button></a><Link href="/patient/hospitals" className="flex-1"><Button variant="outline" className="w-full">{t("patient.emergency.viewAllHospitals")}</Button></Link></div>
    </div>
  );
}


