"use client";

import { useState } from "react";
import { Card, CardContent, Button, Input, Label, Alert, Select } from "@/components/ui";
import { Heart, User, Mail, Lock, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/stores";

type Step = "account" | "onboarding";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [step, setStep] = useState<Step>("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Account step
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Onboarding step (patients table). The profiles row itself is created
  // automatically by the DB trigger (migration 014).
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("male");
  const [bloodGroup, setBloodGroup] = useState("");
  const [district, setDistrict] = useState("");

  const configured = isSupabaseConfigured();

  const validateAccount = (): string | null => {
    if (fullName.trim().length < 2) return "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const validationError = validateAccount();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!configured) {
      setError(
        "Registration is unavailable in demo mode. Configure Supabase credentials to enable sign-up."
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || undefined,
          },
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.session) {
        // Email confirmation is enabled on this Supabase project.
        setInfo("Account created. Please check your email to confirm your address, then sign in.");
        return;
      }

      // Auto-signin (confirmation disabled): continue to onboarding.
      if (!data.user) {
        setError("Account created but no session returned. Please sign in.");
        return;
      }
      setUser(data.user);
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile((profileRow as typeof profileRow) ?? null);
      setStep("onboarding");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Your session has expired. Please sign in again.");
        router.push("/login");
        return;
      }

      // patients row: RLS permits inserting only your own (user_id = auth.uid()).
      const { error: patientError } = await supabase.from("patients").insert({
        user_id: user.id,
        date_of_birth: dateOfBirth,
        gender,
        blood_group: bloodGroup || null,
        district: district.trim() || null,
        state: "Bihar",
      });

      if (patientError) {
        setError(patientError.message);
        return;
      }

      router.push("/patient/dashboard");
    } catch {
      setError("Could not save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30 mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{t("common.appName")}</h1>
          <p className="text-muted-foreground mt-1">
            {step === "account" ? "Create your account" : "Complete your health profile"}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/95 dark:bg-card/95 backdrop-blur">
          <CardContent className="p-6">
            {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
            {info && <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800">{info}</Alert>}

            {step === "account" ? (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Full name
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {t("login.email")}
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("login.emailPlaceholder")}
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone (optional)
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> {t("login.password")}
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? t("common.loading") : "Create account"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOnboarding} className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    One last step: this creates your patient health record so
                    you can book OPD tokens, request blood, and track family
                    health.
                  </p>
                </Alert>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Date of birth</Label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Blood group (optional)</Label>
                    <Select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      options={[
                        { value: "", label: "Select" },
                        ...["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => ({
                          value: g,
                          label: g,
                        })),
                      ]}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>District</Label>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Bhagalpur"
                      className="h-11"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? t("common.loading") : "Finish setup"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/patient/dashboard")}
                >
                  Skip for now
                </Button>
              </form>
            )}

            {step === "account" && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-primary font-medium hover:underline">
                  {t("login.signIn")}
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">{t("home.disclaimer")}</p>
      </div>
    </div>
  );
}
