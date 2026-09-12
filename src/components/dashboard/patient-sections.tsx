"use client";

/**
 * Patient dashboard — premium section components.
 * Each section owns its own loading / empty / error state and consumes the
 * SAME Phase 2 data layer as the rest of the app (Supabase in production,
 * Zustand fixtures in demo mode). No new data sources, no fake data.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2, Calendar, CalendarClock, Droplet, AlertTriangle, Stethoscope, Pill,
  FlaskConical, Shield, FileText, Video, Heart, Activity, MapPin,
  ArrowRight, Search, BedDouble, Users, Phone, RefreshCw,
  Siren,
} from "lucide-react";
import { Button, Badge, Skeleton, Input } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores";
import { useSupabaseData } from "@/lib/data/mode";
import { fetchHospitals, type DirectoryFilters } from "@/lib/data/hospitals";
import { fetchMyBookings, fetchActiveQueues, type PatientBooking } from "@/lib/data/opd";
import { fetchBloodBanks, type BloodBankView } from "@/lib/data/blood";
import { useHospitalStore } from "@/stores";
import { demoHospitals } from "@/data/hospitals";
import { cn } from "@/lib/utils";

/** Local interpolation for strings like "aheadOfYou": "{n} patients ahead of you". */
function tf(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in values ? String(values[key]) : `{${key}}`
  );
}

/* ------------------------------------------------------------------ */
/*  Small shared primitives                                            */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="shrink-0 flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function CardLink({
  href,
  className,
  children,
  ariaLabel,
  role,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  role?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      role={role}
      className={cn(
        "group block rounded-2xl border bg-card shadow-xs",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/25",
        "active:translate-y-0 active:scale-[0.99]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
    >
      {children}
    </Link>
  );
}

function InlineError({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft">
        <AlertTriangle className="h-5 w-5 text-danger-soft-foreground" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground max-w-xs">
        {message ?? t("dash.loadError")}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> {t("dash.retry")}
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Greeting                                                           */
/* ------------------------------------------------------------------ */

function greetingKey(): "dash.greeting.morning" | "dash.greeting.afternoon" | "dash.greeting.evening" {
  const h = new Date().getHours();
  if (h < 12) return "dash.greeting.morning";
  if (h < 17) return "dash.greeting.afternoon";
  return "dash.greeting.evening";
}

export function Greeting() {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);
  const name = profile?.full_name?.trim() || t("login.patient");
  const speakText = `${t(greetingKey())}, ${name}. ${t("patient.dashboard.welcomeMessage")}`;

  return (
    <section className="animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{t(greetingKey())}</p>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {t("patient.dashboard.welcomeMessage")}
          </p>
        </div>
        <SpeakButton text={speakText} className="h-9 w-9" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick actions                                                      */
/* ------------------------------------------------------------------ */

export function QuickActions() {
  const { t } = useTranslation();
  const actions = [
    { href: "/patient/hospitals", icon: Building2, label: t("dash.actions.hospitals") },
    { href: "/patient/opd", icon: Calendar, label: t("common.opd") },
    { href: "/patient/blood", icon: Droplet, label: t("common.blood") },
    { href: "/patient/opd", icon: CalendarClock, label: t("dash.actions.appointments") },
    { href: "/patient/emergency", icon: Siren, label: t("common.emergency"), danger: true },
    { href: "/patient/medicines", icon: Pill, label: t("dash.actions.medicines") },
  ];

  return (
    <section aria-label={t("status.quickActions")}>
      <SectionHeading title={t("status.quickActions")} />
      <div
        className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3"
        role="list"
      >
        {actions.map((a) => (
          <CardLink
            key={a.label}
            href={a.href}
            role="listitem"
            className={cn(
              "flex flex-col items-center gap-2.5 p-3.5 text-center sm:gap-3 sm:p-4",
              a.danger &&
                "border-danger-soft bg-danger-soft/50 hover:border-destructive/40 hover:bg-danger-soft"
            )}
            ariaLabel={a.label}
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                a.danger
                  ? "bg-destructive/10 text-destructive"
                  : "bg-accent text-accent-foreground"
              )}
            >
              <a.icon className="h-5 w-5" aria-hidden />
            </span>
            <span
              className={cn(
                "text-xs font-medium leading-tight sm:text-[13px]",
                a.danger ? "text-destructive" : "text-foreground"
              )}
            >
              {a.label}
            </span>
          </CardLink>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Appointments (live queue status)                                   */
/* ------------------------------------------------------------------ */

export function AppointmentsSection() {
  const { t } = useTranslation();
  const useDb = useSupabaseData();

  const [bookings, setBookings] = useState<PatientBooking[] | null>(null);
  const [queues, setQueues] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!useDb) return; // demo mode: quiet empty state, data comes from the OPD page
    let cancelled = false;
    queueMicrotask(async () => {
      try {
        const [b, q] = await Promise.all([
          fetchMyBookings(),
          fetchActiveQueues(),
        ]);
        if (cancelled) return;
        const nowServing: Record<string, number> = {};
        for (const queue of q) nowServing[queue.id] = queue.current_token;
        setBookings(b);
        setQueues(nowServing);
      } catch {
        if (!cancelled) setError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [useDb, reload]);

  // Demo mode: derive "my appointments" from the persisted demo queue store.
  const demoBookings = useHospitalStore((s) => s.departments);
  const demoRows: PatientBooking[] = useMemo(() => {
    if (useDb) return [];
    return demoBookings.flatMap((d) =>
      d.patients
        .filter((p) => p.status === "waiting" || p.status === "called")
        .slice(0, 1)
        .map((p) => ({
          token_id: p.id,
          token_number: p.token,
          status: p.status,
          department: d.name,
          hospital_name: t("home.demoModeActive"),
          queue_id: d.id,
          current_token: d.currentToken,
          estimated_time: null,
          created_at: p.addedAt,
          notes: null,
        }))
    );
  }, [useDb, demoBookings, t]);

  const rows = useDb ? (bookings ?? []) : demoRows;
  const loading = useDb && bookings === null && !error;
  const nowServingMap = useDb ? (queues ?? {}) : Object.fromEntries(
    demoBookings.map((d) => [d.id, d.currentToken])
  );

  const active = rows.filter((b) => b.status === "waiting" || b.status === "called").slice(0, 2);
  const hasData = !loading && !error;

  return (
    <section>
      <SectionHeading
        title={t("dash.appointments.title")}
        subtitle={t("dash.appointments.subtitle")}
      >
        <Link
          href="/patient/opd"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t("dash.appointments.viewAll")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </SectionHeading>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2" aria-hidden>
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      )}

      {!loading && error && <InlineError onRetry={() => setReload((n) => n + 1)} />}

      {hasData && active.length === 0 && (
        <CardLink href="/patient/opd" className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold">{t("dash.appointments.emptyTitle")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("dash.appointments.emptyBody")}
            </p>
          </div>
          <Button className="shrink-0">{t("dash.appointments.bookCta")}</Button>
        </CardLink>
      )}

      {hasData && active.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 animate-stagger">
          {active.map((b) => {
            const now = nowServingMap[b.queue_id] ?? b.current_token;
            const ahead = Math.max(0, b.token_number - now);
            const aheadText = tf(t("dash.appointments.aheadOfYou"), { n: ahead });
            const done = b.status === "called";
            return (
              <CardLink
                key={b.token_id}
                href="/patient/opd"
                className={cn(
                  "p-5",
                  done ? "border-primary/30 bg-accent/60" : undefined
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{b.hospital_name}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {b.department}
                    </p>
                  </div>
                  <Badge
                    variant={done ? "success" : "info"}
                    className={cn(
                      "shrink-0",
                      done ? "bg-success-soft text-success-soft-foreground" : "bg-accent text-accent-foreground"
                    )}
                  >
                    {done ? t("dash.appointments.beingCalled") : t("dash.appointments.waiting")}
                  </Badge>
                </div>

                <div className="mt-5 flex items-end gap-6">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dash.appointments.yourToken")}
                    </p>
                    <p className="text-3xl font-bold tabular-nums tracking-tight">
                      #{b.token_number}
                    </p>
                  </div>
                  <div className="border-l pl-6">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dash.appointments.nowServing")}
                    </p>
                    <p className="text-3xl font-bold tabular-nums tracking-tight text-primary">
                      #{now || "–"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" aria-hidden />
                  {aheadText}
                </div>
              </CardLink>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Hospital discovery                                                 */
/* ------------------------------------------------------------------ */

export function HospitalDiscovery() {
  const { t } = useTranslation();
  const useDb = useSupabaseData();

  const [search, setSearch] = useState("");
  const [hospitals, setHospitals] = useState<UiHospitalLite[] | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!useDb) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      (async () => {
        try {
          const filters: DirectoryFilters = search.trim() ? { search: search.trim() } : {};
          const data = await fetchHospitals(filters);
          if (cancelled) return;
          setHospitals(data);
        } catch {
          if (!cancelled) setError(true);
        }
      })();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [useDb, search, reload]);

  const loading = useDb && hospitals === null && !error;
  const list: UiHospitalLite[] = useDb
    ? (hospitals ?? []).slice(0, 3)
    : demoHospitals.slice(0, 3).map((h) => ({
        id: h.id,
        name: h.name,
        district: h.district,
        availableBeds: h.availableBeds,
        emergencyAvailable: h.emergencyAvailable,
        bloodBankAvailable: h.bloodBankAvailable,
      }));
  const totalCount = useDb ? (hospitals?.length ?? 0) : demoHospitals.length;

  const totalBeds = list.reduce((sum, h) => sum + (h.availableBeds || 0), 0);
  const emergencyCount = list.filter((h) => h.emergencyAvailable).length;

  return (
    <section>
      <SectionHeading
        title={t("dash.discovery.title")}
        subtitle={t("dash.discovery.subtitle")}
      >
        <Link
          href="/patient/hospitals"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t("dash.discovery.cta")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </SectionHeading>

      {/* Search launcher — live-filters the preview list; full search on the hospitals page */}
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mb-4 flex items-center gap-2 rounded-2xl border bg-card px-4 py-2 shadow-xs transition-colors focus-within:border-primary/40"
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("dash.discovery.searchPlaceholder")}
          aria-label={t("dash.discovery.searchPlaceholder")}
          className="h-9 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 sm:text-sm dark:bg-transparent"
        />
        <Link href="/patient/hospitals" className="shrink-0">
          <Button size="sm">{t("dash.discovery.cta")}</Button>
        </Link>
      </form>

      {loading && (
        <div className="grid gap-4 md:grid-cols-3" aria-hidden>
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      )}

      {!loading && error && <InlineError onRetry={() => setReload((n) => n + 1)} />}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
            {list.map((h) => (
              <CardLink key={h.id} href={`/patient/hospitals/${h.id}`} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </div>
                  {h.emergencyAvailable && (
                    <Badge className="bg-danger-soft text-danger-soft-foreground border-0">
                      {t("dash.discovery.emergencyTag")}
                    </Badge>
                  )}
                </div>
                <p className="mt-3 font-semibold leading-snug">{h.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{h.district}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground border-t pt-3">
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" aria-hidden />
                    {h.availableBeds > 0
                      ? tf(t("dash.discovery.bedsAvailable"), { n: h.availableBeds })
                      : t("dash.discovery.bedsFull")}
                  </span>
                  {h.bloodBankAvailable && (
                    <span className="inline-flex items-center gap-1">
                      <Droplet className="h-3.5 w-3.5" aria-hidden />
                      {t("common.bloodBank")}
                    </span>
                  )}
                </div>
              </CardLink>
            ))}
          </div>

          {list.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-2xl border bg-card px-5 py-3.5 text-sm text-muted-foreground shadow-xs">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" aria-hidden />
                {tf(t("dash.discovery.statHospitals"), { n: totalCount })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-success" aria-hidden />
                {tf(t("dash.discovery.statBeds"), { n: totalBeds })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Siren className="h-4 w-4 text-destructive" aria-hidden />
                {tf(t("dash.discovery.statEmergency"), { n: emergencyCount })}
              </span>
            </div>
          )}

          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <p className="font-medium">{t("dash.discovery.noneTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("dash.discovery.noneBody")}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

interface UiHospitalLite {
  id: string;
  name: string;
  district: string;
  availableBeds: number;
  emergencyAvailable: boolean;
  bloodBankAvailable: boolean;
}

/* ------------------------------------------------------------------ */
/*  Blood availability                                                 */
/* ------------------------------------------------------------------ */

const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

type BloodLevel = "ok" | "low" | "out" | "unknown";

function bloodLevel(units: number | undefined, min: number): BloodLevel {
  if (units == null) return "unknown";
  if (units === 0) return "out";
  if (units <= min) return "low";
  return "ok";
}

const levelStyles: Record<BloodLevel, { chip: string; label: string; key: string }> = {
  ok: { chip: "bg-success-soft text-success-soft-foreground border-success/20", label: "Available", key: "common.available" },
  low: { chip: "bg-warning-soft text-warning-soft-foreground border-warning/25", label: "Low", key: "dash.blood.low" },
  out: { chip: "bg-danger-soft text-danger-soft-foreground border-destructive/20", label: "Out", key: "dash.blood.out" },
  unknown: { chip: "bg-muted text-muted-foreground border-border", label: "—", key: "dash.blood.unknown" },
};

export function BloodSection() {
  const { t } = useTranslation();
  const useDb = useSupabaseData();

  const [banks, setBanks] = useState<BloodBankView[] | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!useDb) return;
    let cancelled = false;
    queueMicrotask(async () => {
      try {
        const data = await fetchBloodBanks();
        if (!cancelled) setBanks(data);
      } catch {
        if (!cancelled) setError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [useDb, reload]);

  const demoBlood = useHospitalStore((s) => s.bloodGroups);
  const demoInventory = useMemo(() => {
    if (useDb) return {} as Record<string, number>;
    const inv: Record<string, number> = {};
    for (const bg of demoBlood) inv[bg.group] = bg.available;
    return inv;
  }, [useDb, demoBlood]);

  // Aggregate across banks (production) or use demo inventory.
  const unitsByGroup: Record<string, number> = useMemo(() => {
    if (!useDb) return demoInventory;
    const agg: Record<string, number> = {};
    for (const bank of banks ?? []) {
      for (const [group, units] of Object.entries(bank.inventory)) {
        agg[group] = (agg[group] ?? 0) + units;
      }
    }
    return agg;
  }, [useDb, banks, demoInventory]);

  const loading = useDb && banks === null && !error;
  const minThreshold = 5;
  const participating = BLOOD_GROUPS.filter((g) => unitsByGroup[g] != null);
  const groups = participating.length > 0 ? participating : BLOOD_GROUPS;

  return (
    <section>
      <SectionHeading
        title={t("dash.blood.title")}
        subtitle={t("dash.blood.subtitle")}
      >
        <Link
          href="/patient/blood"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t("dash.blood.viewAll")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </SectionHeading>

      {loading && <Skeleton className="h-44 rounded-2xl" aria-hidden />}
      {!loading && error && <InlineError onRetry={() => setReload((n) => n + 1)} />}

      {!loading && !error && (
        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
            {groups.map((group) => {
              const units = unitsByGroup[group];
              const level = bloodLevel(units, minThreshold);
              const style = levelStyles[level];
              return (
                <div
                  key={group}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-colors",
                    style.chip
                  )}
                >
                  <span className="text-base font-bold leading-none">{group}</span>
                  <span className="text-[11px] font-medium leading-none opacity-80">
                    {units == null ? "—" : `${units} u`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                {t("common.available")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
                {t("dash.blood.low")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden />
                {t("dash.blood.out")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/patient/blood">
                <Button variant="outline" size="sm">{t("dash.blood.viewAll")}</Button>
              </Link>
              <Link href="/patient/blood">
                <Button size="sm">{t("dash.blood.requestCta")}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Emergency — compact, unmistakable, calm                            */
/* ------------------------------------------------------------------ */

export function EmergencyCard() {
  const { t } = useTranslation();

  return (
    <section aria-label={t("common.emergency")}>
      <div className="flex flex-col gap-4 rounded-2xl border border-destructive/25 bg-danger-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Siren className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-danger-soft-foreground">
              {t("dash.emergency.title")}
            </p>
            <p className="mt-0.5 text-sm text-danger-soft-foreground/80">
              {t("dash.emergency.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-[3.75rem] sm:pl-0">
          <Link href="/patient/emergency">
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Phone className="h-3.5 w-3.5" aria-hidden /> SOS
            </Button>
          </Link>
          <Link href="/patient/emergency">
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 bg-card/70 text-danger-soft-foreground hover:bg-card"
            >
              {t("dash.emergency.hospitals")}
            </Button>
          </Link>
          <Link href="/patient/emergency">
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 bg-card/70 text-danger-soft-foreground hover:bg-card"
            >
              {t("dash.emergency.ambulance")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Health services grid                                               */
/* ------------------------------------------------------------------ */

export function HealthServices() {
  const { t } = useTranslation();
  const services = [
    { href: "/patient/hospitals", icon: Building2, name: t("common.hospitals"), desc: t("dash.services.hospitals") },
    { href: "/patient/opd", icon: Calendar, name: t("common.opd"), desc: t("dash.services.opd") },
    { href: "/patient/blood", icon: Droplet, name: t("common.blood"), desc: t("dash.services.blood") },
    { href: "/patient/emergency", icon: Siren, name: t("common.emergency"), desc: t("dash.services.emergency") },
    { href: "/patient/insurance", icon: Shield, name: t("common.insurance"), desc: t("dash.services.insurance") },
    { href: "/patient/family", icon: Users, name: t("common.family"), desc: t("dash.services.family") },
    { href: "/patient/diagnostics", icon: FlaskConical, name: t("dash.services.diagnosticsName"), desc: t("dash.services.diagnostics") },
    { href: "/patient/medicines", icon: Pill, name: t("dash.actions.medicines"), desc: t("dash.services.medicines") },
    { href: "/patient/consultation", icon: Video, name: t("dash.services.consultationName"), desc: t("dash.services.consultation") },
    { href: "/patient/records", icon: FileText, name: t("records.healthRecords"), desc: t("dash.services.records") },
    { href: "/patient/triage", icon: Stethoscope, name: t("common.triage"), desc: t("dash.services.triage") },
  ];

  return (
    <section>
      <SectionHeading title={t("dash.services.title")} subtitle={t("dash.services.subtitle")} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-stagger">
        {services.map((s) => (
          <CardLink key={s.href} href={s.href} className="flex items-start gap-3.5 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform duration-200 group-hover:scale-105">
              <s.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{s.name}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {s.desc}
              </span>
            </span>
          </CardLink>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Health information — honest empty state                            */
/* ------------------------------------------------------------------ */

export function HealthStatus() {
  const { t } = useTranslation();

  return (
    <section>
      <SectionHeading title={t("dash.health.title")} />
      <div className="rounded-2xl border border-dashed bg-card/50 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-medium">{t("dash.health.emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("dash.health.emptyBody")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/patient/records">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" aria-hidden /> {t("records.healthRecords")}
                </Button>
              </Link>
              <Link href="/patient/family">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Heart className="h-3.5 w-3.5" aria-hidden /> {t("common.family")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
