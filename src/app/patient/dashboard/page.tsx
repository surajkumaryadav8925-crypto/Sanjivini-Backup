"use client";
/**
 * Patient dashboard — premium healthcare IA:
 * Greeting → Quick actions → Appointments (live queue) → Hospital discovery
 * → Emergency → Blood availability → Health services → Health info.
 * All data comes from the existing Phase 2 data layer (Supabase in
 * production, Zustand fixtures in demo mode). No new data sources.
 */
import { Greeting, QuickActions, AppointmentsSection, HospitalDiscovery, EmergencyCard, BloodSection, HealthServices, HealthStatus } from "@/components/dashboard/patient-sections";
import { useSupabaseData } from "@/lib/data/mode";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores";

export default function PatientDashboard() {
  const useDb = useSupabaseData();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-16">
        <Greeting />

        {!useDb && isAuthenticated && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-warning/25 bg-warning-soft px-4 py-3 animate-fade-up">
            <span className="rounded-md bg-warning/15 px-2 py-0.5 text-xs font-bold tracking-wide text-warning-soft-foreground">
              DEMO
            </span>
            <p className="text-sm text-warning-soft-foreground">
              {t("patient.dashboard.DEMONotice")}
            </p>
          </div>
        )}

        <div className="mt-7 space-y-10 sm:space-y-12">
          <QuickActions />
          <AppointmentsSection />
          <HospitalDiscovery />
          <EmergencyCard />
          <BloodSection />
          <HealthServices />
          <HealthStatus />
        </div>
      </div>
      <div className="h-4" aria-hidden />
    </div>
  );
}
