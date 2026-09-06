"use client";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { useAuthStore } from "@/stores";
import Link from "next/link";
import { Stethoscope, Calendar, Heart, Building2, AlertCircle, MapPin, Droplet, Shield, Pill, ArrowRight, FlaskConical, FileText, Video, User, Phone, Activity } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function PatientDashboard() {
  const { profile } = useAuthStore();
  const { t } = useTranslation();

  const quickActions = [
    { href: "/patient/triage", icon: Stethoscope, labelKey: "patient.triage.title", gradient: "from-blue-500 to-blue-600", bgLight: "bg-blue-50/70", borderLight: "border-blue-100", textColor: "text-blue-700", shadowColor: "hover:shadow-blue-200" },
    { href: "/patient/hospitals", icon: Building2, labelKey: "common.hospitals", gradient: "from-teal-500 to-emerald-600", bgLight: "bg-teal-50/70", borderLight: "border-teal-100", textColor: "text-teal-700", shadowColor: "hover:shadow-teal-200" },
    { href: "/patient/opd", icon: Calendar, labelKey: "common.opd", gradient: "from-purple-500 to-violet-600", bgLight: "bg-purple-50/70", borderLight: "border-purple-100", textColor: "text-purple-700", shadowColor: "hover:shadow-purple-200" },
    { href: "/patient/emergency", icon: AlertCircle, labelKey: "patient.emergency.title", gradient: "from-red-500 to-red-600", bgLight: "bg-red-50/70", borderLight: "border-red-100", textColor: "text-red-700", shadowColor: "hover:shadow-red-200" },
    { href: "/patient/blood", icon: Droplet, labelKey: "common.blood", gradient: "from-rose-500 to-pink-600", bgLight: "bg-rose-50/70", borderLight: "border-rose-100", textColor: "text-rose-700", shadowColor: "hover:shadow-rose-200" },
    { href: "/patient/medicines", icon: Pill, labelKey: "medicines.medicineDesk", gradient: "from-cyan-500 to-blue-600", bgLight: "bg-cyan-50/70", borderLight: "border-cyan-100", textColor: "text-cyan-700", shadowColor: "hover:shadow-cyan-200" },
    { href: "/patient/diagnostics", icon: FlaskConical, labelKey: "diagnostics.title", gradient: "from-teal-500 to-cyan-600", bgLight: "bg-teal-50/70", borderLight: "border-teal-100", textColor: "text-teal-700", shadowColor: "hover:shadow-teal-200" },
    { href: "/patient/insurance", icon: Shield, labelKey: "common.insurance", gradient: "from-amber-500 to-orange-600", bgLight: "bg-amber-50/70", borderLight: "border-amber-100", textColor: "text-amber-700", shadowColor: "hover:shadow-amber-200" },
    { href: "/patient/records", icon: FileText, labelKey: "records.healthRecords", gradient: "from-indigo-500 to-blue-600", bgLight: "bg-indigo-50/70", borderLight: "border-indigo-100", textColor: "text-indigo-700", shadowColor: "hover:shadow-indigo-200" },
    { href: "/patient/consultation", icon: Video, labelKey: "consultation.title", gradient: "from-purple-500 to-pink-600", bgLight: "bg-purple-50/70", borderLight: "border-purple-100", textColor: "text-purple-700", shadowColor: "hover:shadow-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Premium Header */}
      <div>
        {/* Background Pattern */}
        
        
        
        <div className="container relative px-4 py-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Welcome Section */}
            <div className="flex items-center gap-5 animate-in">
              <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {t("patient.dashboard.welcome")}, {profile?.full_name || t("login.patient")}
                </h1>
                <p className="text-muted-foreground mt-1 text-base">{t("patient.dashboard.welcomeMessage")}</p>
              </div>
            </div>
            
            {/* Speak Button */}
            <div className="flex items-center gap-3 animate-in" style={{animationDelay: '100ms'}}>
              <SpeakButton 
                text={`${t("patient.dashboard.welcome")}. ${t("patient.dashboard.welcomeMessage")}`}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 pb-12 max-w-6xl mx-auto">
        {/* Quick Actions - Premium Grid */}
        <div className="mb-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t("patient.dashboard.quickActions")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {quickActions.map((action, index) => (
              <Link key={action.href} href={action.href} className="block">
                <Card style={{ animationDelay: `${index * 100}ms` }} className={`h-full cursor-pointer border ${action.borderLight} dark:border-slate-600 bg-card dark:bg-card/95 backdrop-blur-sm shadow-sm hover:shadow-xl card-hover-lift card-active-press card-animate-in ${action.shadowColor}`}>
                  <CardContent className="p-5 flex flex-col items-center text-center gap-4">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg ring-2 ring-white/50 icon-hover-scale`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight ${action.textColor} dark:text-card-foreground">{t(action.labelKey)}</p>
                      
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Emergency Banner - Premium Alert */}
        <Card className="mb-8 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 dark:border-red-900/30 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t("patient.dashboard.emergencyServices")}</h3>
                  <p className="text-sm text-muted-foreground">{t("patient.dashboard.emergencyServicesDesc")}</p>
                </div>
              </div>
              <Link href="/patient/emergency">
                <Button variant="destructive" className="gap-2 shrink-0 emergency-attention">
                  {t("patient.dashboard.reportEmergency")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards Row - Premium Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                {t("patient.dashboard.nearbyHospitals")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("patient.dashboard.nearbyHospitalsDesc")}</p>
              <Link href="/patient/hospitals">
                <Button variant="outline" size="sm" className="gap-2 w-full justify-center">
                  {t("patient.dashboard.viewHospitals")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                {t("patient.dashboard.familyHealth")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("patient.dashboard.familyHealthDesc")}</p>
              <Link href="/patient/family">
                <Button variant="outline" size="sm" className="gap-2 w-full justify-center">
                  {t("patient.dashboard.manageFamily")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-3 text-base"><div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center"><Phone className="h-5 w-5 text-red-600" /></div>{t("common.emergencyContacts")}</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Emergency</span><Badge variant="destructive">108</Badge></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Ambulance</span><Badge variant="outline">102</Badge></div></CardContent></Card>
        </div>

        {/* DEMO Notice - Premium Badge */}
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200">
          <CardContent className="flex items-center gap-4 py-4">
            <Badge variant="secondary" className="shrink-0 font-medium text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              DEMO
            </Badge>
            <p className="text-sm text-amber-800 dark:text-amber-200">{t("patient.dashboard.DEMONotice")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}













