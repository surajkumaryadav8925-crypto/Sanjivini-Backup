"use client";

/**
 * Patient dashboard — premium section components (design system 2.0).
 * Each section owns its own loading / empty / error state and consumes the
 * SAME Phase 2 data layer as the rest of the app (Supabase in production,
 * Zustand fixtures in demo mode). No new data sources, no fake data.
 *
 * Visual layer: layered depth, per-card accent identities, pointer 3D tilt
 * (TiltCard), staggered entrances, premium skeletons — all pure CSS/transform
 * (no animation library), so it stays fast and reduced-motion safe.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2, CalendarClock, Droplet, AlertTriangle, FileText, Heart, Activity,
  MapPin, ArrowRight, Search, BedDouble, Users, Phone, RefreshCw, Siren, Sparkles,
} from "lucide-react";
import { Button, Badge, Skeleton, Input, TiltCard } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores";
import { useSupabaseData } from "@/lib/data/mode";
import { fetchHospitals, type DirectoryFilters } from "@/lib/data/hospitals";
import { fetchMyBookings, fetchActiveQueues, type PatientBooking } from "@/lib/data/opd";
import { fetchBloodBanks, type BloodBankView } from "@/lib/data/blood";
import { useHospitalStore } from "@/stores";
import { demoHospitals } from "@/data/hospitals";
import { SCENES, VisualScene, type SceneKey } from "./quick-action-visuals";
import { cn } from "@/lib/utils";

/** Local interpolation for strings like "aheadOfYou": "{n} patients ahead of you". */
function tf(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in values ? String(values[key]) : `{${key}}`
  );
}

/* ------------------------------------------------------------------ */
/*  Scene accents — per-card hover border tint, matched to its world   */
/* ------------------------------------------------------------------ */

const QA_BORDER: Record<SceneKey, string> = {
  hospitals: "hover:border-primary/30",
  opd: "hover:border-info/30",
  blood: "hover:border-destructive/30",
  appointments: "hover:border-violet/30",
  medicines: "hover:border-success/30",
  records: "hover:border-primary/30",
  diagnostics: "hover:border-info/30",
  emergency: "hover:border-destructive/35",
  insurance: "hover:border-warning/30",
  family: "hover:border-violet/30",
  consultation: "hover:border-violet/30",
  triage: "hover:border-primary/30",
};

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
/*  Hero                                                               */
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
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const speakText = `${t(greetingKey())}, ${name}. ${t("patient.dashboard.welcomeMessage")}`;

  return (
    <section className="animate-fade-up" aria-labelledby="dash-hero-title">
      <div className="relative overflow-hidden rounded-3xl border bg-card shadow-md">
        {/* Ambient depth — gradient blobs + dot grid */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="hero-blob absolute -top-24 -right-16 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
          <div className="hero-blob-alt absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-info/10 blur-3xl" />
          <div className="absolute top-6 right-[30%] h-24 w-24 rounded-full bg-violet/10 blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: "radial-gradient(hsl(174 30% 30% / 0.10) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          {/* Floating decorative icon — subtle, paused for reduced motion via globals */}
          <Sparkles className="hero-float absolute right-8 bottom-6 hidden h-16 w-16 text-primary/15 sm:block" aria-hidden />
        </div>

        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 ring-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              {t(greetingKey())}
            </p>
            <h1
              id="dash-hero-title"
              className="mt-1.5 truncate text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {t("dash.hero.tagline")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link href="/patient/hospitals">
                <Button className="gap-2 shadow-md shadow-primary/25">
                  <Building2 className="h-4 w-4" aria-hidden />
                  {t("dash.hero.ctaPrimary")}
                </Button>
              </Link>
              <Link href="/patient/opd">
                <Button variant="outline" className="gap-2">
                  <CalendarClock className="h-4 w-4" aria-hidden />
                  {t("dash.hero.ctaSecondary")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <SpeakButton text={speakText} className="h-9 w-9" />
            <span
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-info text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-background"
            >
              {initials || "S"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick actions                                                      */
/* ------------------------------------------------------------------ */

interface QuickAction {
  href: string;
  scene: SceneKey;
  label: string;
  sub: string;
  danger?: boolean;
}

export function QuickActions() {
  const { t } = useTranslation();
  const actions: QuickAction[] = [
    { href: "/patient/hospitals", scene: "hospitals", label: t("dash.actions.hospitals"), sub: t("dash.qa.hospitalsSub") },
    { href: "/patient/opd", scene: "opd", label: t("common.opd"), sub: t("dash.qa.opdSub") },
    { href: "/patient/blood", scene: "blood", label: t("common.blood"), sub: t("dash.qa.bloodSub") },
    { href: "/patient/opd", scene: "appointments", label: t("dash.actions.appointments"), sub: t("dash.qa.apptSub") },
    { href: "/patient/medicines", scene: "medicines", label: t("dash.actions.medicines"), sub: t("dash.qa.medsSub") },
    { href: "/patient/records", scene: "records", label: t("records.healthRecords"), sub: t("dash.qa.recordsSub") },
    { href: "/patient/diagnostics", scene: "diagnostics", label: t("dash.services.diagnosticsName"), sub: t("dash.qa.diagnosticsSub") },
    { href: "/patient/emergency", scene: "emergency", label: t("common.emergency"), sub: t("dash.qa.emergencySub"), danger: true },
  ];

  return (
    <section aria-label={t("status.quickActions")}>
      <SectionHeading title={t("status.quickActions")} />
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        role="list"
      >
        {actions.map((a) => {
          const Scene = SCENES[a.scene];
          return (
            <TiltCard key={a.label} role="listitem" className="h-full">
              <CardLink
                href={a.href}
                ariaLabel={`${a.label} — ${a.sub}`}
                className={cn(
                  "group/qa relative flex h-full items-center gap-1 overflow-hidden p-3 sm:gap-2 sm:p-4",
                  QA_BORDER[a.scene],
                  a.danger && "border-destructive/20 bg-danger-soft/60 hover:border-destructive/40"
                )}
              >
                {/* Text block — left, 55-65% of the card */}
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[13px] font-semibold leading-tight sm:text-sm", a.danger && "text-destructive")}>
                    {a.label}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-muted-foreground sm:text-[11px]">
                    {a.sub}
                  </span>
                </span>
                {/* 3D object — right, ~40% of the card, above the surface */}
                <VisualScene
                  label={`${a.label} ${a.sub}`}
                  className="qa-visual -mr-1 h-[72px] w-[72px] shrink-0 sm:h-24 sm:w-24"
                >
                  <Scene />
                </VisualScene>
              </CardLink>
            </TiltCard>
          );
        })}
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
          <Skeleton shimmer className="h-44 rounded-2xl" />
          <Skeleton shimmer className="h-44 rounded-2xl" />
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
          <Button className="shrink-0 shadow-md shadow-primary/20">{t("dash.appointments.bookCta")}</Button>
        </CardLink>
      )}

      {hasData && active.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {active.map((b) => {
            const now = nowServingMap[b.queue_id] ?? b.current_token;
            const ahead = Math.max(0, b.token_number - now);
            const aheadText = tf(t("dash.appointments.aheadOfYou"), { n: ahead });
            const done = b.status === "called";
            // Progress visualization — real numbers only (token vs now-serving).
            const total = Math.max(b.token_number, 1);
            const servedPct = Math.min(100, Math.max(0, ((now || 0) / total) * 100));
            return (
              <TiltCard key={b.token_id} className="h-full">
                <CardLink
                  href="/patient/opd"
                  className={cn(
                    "flex h-full flex-col p-5",
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
                        done ? "bg-success-soft text-success-soft-foreground" : "bg-info-soft text-info-soft-foreground"
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

                  {/* Queue progress — only from real token numbers */}
                  <div
                    className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={now || 0}
                    aria-valuemin={0}
                    aria-valuemax={b.token_number}
                    aria-label={t("dash.appointments.nowServing")}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-info to-primary transition-[width] duration-500"
                      style={{ width: `${servedPct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" aria-hidden />
                    {aheadText}
                  </div>
                </CardLink>
              </TiltCard>
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
          <Skeleton shimmer className="h-44 rounded-2xl" />
          <Skeleton shimmer className="h-44 rounded-2xl" />
          <Skeleton shimmer className="h-44 rounded-2xl" />
        </div>
      )}

      {!loading && error && <InlineError onRetry={() => setReload((n) => n + 1)} />}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((h) => (
              <TiltCard key={h.id} className="h-full" maxTilt={3.5}>
                <CardLink href={`/patient/hospitals/${h.id}`} className="flex h-full flex-col p-5">
                  {/* Visual header — gradient banner per hospital */}
                  <div
                    aria-hidden
                    className="relative -mx-5 -mt-5 mb-4 h-16 overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/15 via-info/10 to-violet/10"
                  >
                    <div className="absolute -right-3 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-xl" />
                    <span className="absolute bottom-3 left-5 flex h-11 w-11 items-center justify-center rounded-xl border bg-card text-primary shadow-sm tilt-pop">
                      <Building2 className="h-5 w-5" aria-hidden />
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold leading-snug">{h.name}</p>
                    {h.emergencyAvailable && (
                      <Badge className="shrink-0 gap-1 border-0 bg-danger-soft text-danger-soft-foreground">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 ring-ping" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
                        </span>
                        {t("dash.discovery.emergencyTag")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{h.district}</span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground border-t pt-3">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className={cn("h-3.5 w-3.5", h.availableBeds > 0 ? "text-success" : "text-destructive")} aria-hidden />
                      {h.availableBeds > 0
                        ? tf(t("dash.discovery.bedsAvailable"), { n: h.availableBeds })
                        : t("dash.discovery.bedsFull")}
                    </span>
                    {h.bloodBankAvailable && (
                      <span className="inline-flex items-center gap-1">
                        <Droplet className="h-3.5 w-3.5 text-destructive/80" aria-hidden />
                        {t("common.bloodBank")}
                      </span>
                    )}
                  </div>
                </CardLink>
              </TiltCard>
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

const levelStyles: Record<BloodLevel, { chip: string; key: string }> = {
  ok: { chip: "bg-success-soft text-success-soft-foreground border-success/20", key: "common.available" },
  low: { chip: "bg-warning-soft text-warning-soft-foreground border-warning/25", key: "dash.blood.low" },
  out: { chip: "bg-danger-soft text-danger-soft-foreground border-destructive/20", key: "dash.blood.out" },
  unknown: { chip: "bg-muted text-muted-foreground border-border", key: "dash.blood.unknown" },
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

      {loading && <Skeleton shimmer className="h-44 rounded-2xl" aria-hidden />}
      {!loading && error && <InlineError onRetry={() => setReload((n) => n + 1)} />}

      {!loading && !error && (
        <TiltCard maxTilt={2.5}>
          <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-xs">
            {/* Rosy ambient corner for the blood identity */}
            <div aria-hidden className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-destructive/8 blur-2xl" />

            <div className="relative grid grid-cols-4 gap-2.5 sm:grid-cols-8">
              {groups.map((group) => {
                const units = unitsByGroup[group];
                const level = bloodLevel(units, minThreshold);
                const style = levelStyles[level];
                return (
                  <div
                    key={group}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm",
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

            <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
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
        </TiltCard>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Emergency — unmistakable, calm                                     */
/* ------------------------------------------------------------------ */

export function EmergencyCard() {
  const { t } = useTranslation();

  return (
    <section aria-label={t("common.emergency")}>
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-destructive/25 bg-danger-soft p-5 shadow-md shadow-destructive/10 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        {/* Controlled ambient glow — calm, not flashing */}
        <div aria-hidden className="absolute -left-12 -top-16 h-48 w-48 rounded-full bg-destructive/10 blur-3xl" />

        <div className="relative flex items-start gap-3.5">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <span aria-hidden className="absolute inset-0 rounded-xl ring-ping ring-1 ring-destructive/40" />
            <Siren className="animate-heartbeat h-5 w-5" aria-hidden />
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

        <div className="relative flex flex-wrap items-center gap-2 pl-[3.75rem] sm:pl-0">
          <Link href="/patient/emergency">
            <Button variant="destructive" size="sm" className="gap-1.5 shadow-md shadow-destructive/25">
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

interface Service {
  href: string;
  scene: SceneKey;
  name: string;
  desc: string;
}

export function HealthServices() {
  const { t } = useTranslation();
  const services: Service[] = [
    { href: "/patient/hospitals", scene: "hospitals", name: t("common.hospitals"), desc: t("dash.services.hospitals") },
    { href: "/patient/opd", scene: "opd", name: t("common.opd"), desc: t("dash.services.opd") },
    { href: "/patient/blood", scene: "blood", name: t("common.blood"), desc: t("dash.services.blood") },
    { href: "/patient/emergency", scene: "emergency", name: t("common.emergency"), desc: t("dash.services.emergency") },
    { href: "/patient/insurance", scene: "insurance", name: t("common.insurance"), desc: t("dash.services.insurance") },
    { href: "/patient/family", scene: "family", name: t("common.family"), desc: t("dash.services.family") },
    { href: "/patient/diagnostics", scene: "diagnostics", name: t("dash.services.diagnosticsName"), desc: t("dash.services.diagnostics") },
    { href: "/patient/medicines", scene: "medicines", name: t("dash.actions.medicines"), desc: t("dash.services.medicines") },
    { href: "/patient/consultation", scene: "consultation", name: t("dash.services.consultationName"), desc: t("dash.services.consultation") },
    { href: "/patient/records", scene: "records", name: t("records.healthRecords"), desc: t("dash.services.records") },
    { href: "/patient/triage", scene: "triage", name: t("common.triage"), desc: t("dash.services.triage") },
  ];

  return (
    <section>
      <SectionHeading title={t("dash.services.title")} subtitle={t("dash.services.subtitle")} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-stagger">
        {services.map((s) => {
          const Scene = SCENES[s.scene];
          return (
            <TiltCard key={s.href + s.name} className="h-full" maxTilt={4}>
              <CardLink
                href={s.href}
                className={cn(
                  "group/qa relative flex h-full items-center gap-2.5 p-4",
                  QA_BORDER[s.scene]
                )}
              >
                <VisualScene label={`${s.name}: ${s.desc}`} className="qa-visual h-[72px] w-[72px] shrink-0">
                  <Scene />
                </VisualScene>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{s.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {s.desc}
                  </span>
                </span>
              </CardLink>
            </TiltCard>
          );
        })}
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
      <div className="relative overflow-hidden rounded-2xl border border-dashed bg-card/60 p-6">
        <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex items-start gap-4">
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
