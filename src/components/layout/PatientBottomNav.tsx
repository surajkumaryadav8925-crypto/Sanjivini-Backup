"use client";

/**
 * Mobile bottom navigation for the patient portal.
 * Fixed to the bottom on small screens (hidden on lg+), with a clear active
 * state. Renders only for authenticated patients so other roles keep the
 * existing header navigation untouched.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Calendar, Droplet, Siren } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/patient/dashboard", labelKey: "common.dashboard", icon: Home },
  { href: "/patient/hospitals", labelKey: "common.hospitals", icon: Building2 },
  { href: "/patient/opd", labelKey: "common.opd", icon: Calendar },
  { href: "/patient/blood", labelKey: "common.blood", icon: Droplet },
  { href: "/patient/emergency", labelKey: "common.emergency", icon: Siren },
] as const;

export function PatientBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.profile?.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const isPatientArea = pathname?.startsWith("/patient") ?? false;
  if (!isAuthenticated || role !== "patient" || !isPatientArea) return null;

  return (
    <nav
      aria-label={t("common.navigation")}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-1 py-1.5",
                "text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                  active && "bg-accent"
                )}
              >
                <item.icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
