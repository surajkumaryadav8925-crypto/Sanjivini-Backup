"use client";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Heart, Stethoscope, Building2, Shield, Mic, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
            {t("home.demoModeActive")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{t("common.appName")} Healthcare Platform</h1>
          <p className="text-lg text-muted-foreground mb-8">{t("home.tagline")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/patient/dashboard"><Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500">{t("home.patientPortal")} <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/hospital/dashboard"><Button size="lg" variant="outline" className="gap-2"><Building2 className="h-4 w-4" /> {t("home.hospital")}</Button></Link>
            <Link href="/admin/dashboard"><Button size="lg" variant="outline" className="gap-2"><Shield className="h-4 w-4" /> {t("home.government")}</Button></Link>
          </div>
        </div>
      </section>
      <section className="px-4 py-16 bg-card dark:bg-card/95">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">{t("home.platformFeatures")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Stethoscope className="h-6 w-6" />} title={t("home.aiTriage")} description={t("home.aiTriageDesc")} />
            <FeatureCard icon={<Mic className="h-6 w-6" />} title={t("home.voiceInput")} description={t("home.voiceInputDesc")} />
            <FeatureCard icon={<MapPin className="h-6 w-6" />} title={t("home.hospitalMatching")} description={t("home.hospitalMatchingDesc")} />
            <FeatureCard icon={<AlertCircle className="h-6 w-6" />} title={t("home.emergencyServices")} description={t("home.emergencyServicesDesc")} />
            <FeatureCard icon={<Heart className="h-6 w-6" />} title={t("home.familyHealth")} description={t("home.familyHealthDesc")} />
            <FeatureCard icon={<Shield className="h-6 w-6" />} title={t("home.abhaIntegration")} description={t("home.abhaIntegrationDesc")} />
          </div>
        </div>
      </section>
      <section className="px-4 py-12 bg-muted/50">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">{t("home.demoAccounts")}</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base">{t("login.patient")}</CardTitle></CardHeader><CardContent className="text-sm"><p>patient@demo.com / Demo1234</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-base">{t("login.hospital")}</CardTitle></CardHeader><CardContent className="text-sm"><p>hospital@demo.com / Demo1234</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-base">{t("login.admin")}</CardTitle></CardHeader><CardContent className="text-sm"><p>admin@demo.com / Demo1234</p></CardContent></Card>
          </div>
        </div>
      </section>
      <footer className="px-4 py-8 border-t text-center text-sm text-muted-foreground">
        <p>{t("home.footerText")}</p>
        <p className="mt-2">⚠️ {t("home.disclaimer")}</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <Card className="hover:shadow-lg transition-shadow"><CardHeader><div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">{icon}</div><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{description}</p></CardContent></Card>;
}
