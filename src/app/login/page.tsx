"use client";

import { useState } from "react";
import { Card, CardContent, Button, Input, Alert } from "@/components/ui";
import { Heart, Shield, User, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { IS_DEMO_MODE } from "@/lib/auth/mode";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const setProfile = useAuthStore((s) => s.setProfile);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Demo mode is a separate, explicitly non-secure showcase flow.
  const demoAvailable = IS_DEMO_MODE && !isSupabaseConfigured();

  const redirectAfterLogin = (role: UserRole) => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("redirect");
    // Only allow same-app relative redirects (open-redirect guard).
    const safeRedirect =
      requested && requested.startsWith("/") && !requested.startsWith("//")
        ? requested
        : null;

    if (safeRedirect) {
      router.push(safeRedirect);
      return;
    }
    router.push(
      role === "hospital_staff"
        ? "/hospital/dashboard"
        : role === "government_admin" || role === "super_admin"
        ? "/admin/dashboard"
        : "/patient/dashboard"
    );
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !data.user) {
        setError(
          authError?.message === "Invalid login credentials"
            ? "Invalid email or password."
            : authError?.message || "Login failed."
        );
        setLoading(false);
        return;
      }

      // Role always comes from the profiles table via the session, never
      // from client state.
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setUser(data.user);
      setProfile(profileRow ?? null);
      redirectAfterLogin((profileRow?.role as UserRole | undefined) ?? "patient");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Showcase-only demo login (demo mode without Supabase).
  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setProfile({
      id: role === "patient" ? "demo-1" : role === "hospital_staff" ? "demo-2" : "demo-3",
      full_name:
        role === "patient"
          ? "Demo Patient"
          : role === "hospital_staff"
          ? "Dr. Hospital"
          : "Admin User",
      email:
        role === "patient"
          ? "patient@demo.com"
          : role === "hospital_staff"
          ? "hospital@demo.com"
          : "admin@demo.com",
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    redirectAfterLogin(role);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30 mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{t("common.appName")}</h1>
          <p className="text-muted-foreground mt-1">Healthcare Platform</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/95 dark:bg-card/95 backdrop-blur">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2">{t("login.title")}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in with your email and password.
            </p>

            {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  {t("login.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  {t("login.password")}
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? t("common.loading") : t("login.signIn")}
              </Button>
            </form>

            {demoAvailable && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t("login.demoLogin")}
                    </span>
                  </div>
                </div>

                <Alert className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Demo mode: demo accounts are for the showcase only and are
                    not secured. No real patient data is accessible.
                  </p>
                </Alert>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => handleDemoLogin("patient")} className="h-16 flex flex-col gap-1">
                    <User className="h-5 w-5" />
                    <span className="text-xs">{t("login.patient")}</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleDemoLogin("hospital_staff")} className="h-16 flex flex-col gap-1">
                    <Building2 className="h-5 w-5" />
                    <span className="text-xs">{t("login.hospital")}</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleDemoLogin("government_admin")} className="h-16 flex flex-col gap-1">
                    <Shield className="h-5 w-5" />
                    <span className="text-xs">{t("login.admin")}</span>
                  </Button>
                </div>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("login.dontHaveAccount")}{" "}
              <a href="/register" className="text-primary font-medium hover:underline">
                {t("login.signUp")}
              </a>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">{t("home.disclaimer")}</p>
      </div>
    </div>
  );
}
