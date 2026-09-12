"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProfileStore, type PatientProfile } from "@/stores/profileStore";
import { useUIStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import type { Gender, BloodGroup } from "@/types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplet,
  Heart,
  Shield,
  AlertCircle,
  Edit2,
  Save,
  X,
  Bell,
  Globe,
  Moon,
  Sun,
  UserCircle,
  Activity,
} from "lucide-react";

const genderOpts = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const bgOpts = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const langOpts = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
];

interface IRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  editable?: boolean;
  field?: keyof PatientProfile;
  isEditing: boolean;
  editData: PatientProfile;
  onChangeField: (field: keyof PatientProfile, value: string) => void;
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  editable,
  field,
  isEditing,
  editData,
  onChangeField,
}: IRowProps) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
        {editable && field ? (
          isEditing ? (
            field === "gender" ? (
              <Select
                options={genderOpts}
                value={editData.gender}
                onChange={(e) => onChangeField("gender", e.target.value)}
                className="h-9"
              />
            ) : field === "bloodGroup" ? (
              <Select
                options={bgOpts}
                value={editData.bloodGroup}
                onChange={(e) => onChangeField("bloodGroup", e.target.value)}
                className="h-9"
              />
            ) : (
              <Input
                value={editData[field]}
                onChange={(e) => onChangeField(field, e.target.value)}
                className="h-9"
              />
            )
          ) : (
            <p className="text-sm font-medium text-foreground">{value}</p>
          )
        ) : (
          <p className="text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { darkMode, toggleDarkMode, language, setLanguage } = useUIStore();
  const { profile: storeProfile, updateProfile } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<PatientProfile>(storeProfile);
  const [notifs, setNotifs] = useState({
    appointments: true,
    medicines: true,
    reminders: false,
    emergency: true,
  });

  const handleStartEdit = () => {
    setEditData(storeProfile);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(storeProfile);
    setIsEditing(false);
  };

  const handleChangeField = (field: keyof PatientProfile, val: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: field === "gender" ? (val as Gender) : field === "bloodGroup" ? (val as BloodGroup) : val,
    }));
  };

  const calcAge = (dob: string) => {
    if (!dob) return 0;
    const b = new Date(dob);
    const now = new Date();
    let a = now.getFullYear() - b.getFullYear();
    if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) {
      a--;
    }
    return Math.max(0, a);
  };

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-";

  const notifRows = [
    { k: "appointments", l: t("profile.notifAppointments") },
    { k: "medicines", l: t("profile.notifMedicines") },
    { k: "reminders", l: t("profile.notifReminders") },
    { k: "emergency", l: t("profile.notifEmergency") },
  ] as const;

  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("profile.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleStartEdit} variant="outline" size="sm" className="gap-2">
            <Edit2 className="h-4 w-4" aria-hidden />
            {t("profile.editProfile")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
              <X className="h-4 w-4" aria-hidden />
              {t("profile.cancel")}
            </Button>
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save className="h-4 w-4" aria-hidden />
              {t("profile.save")}
            </Button>
          </div>
        )}
      </div>

      {/* Hero card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
        <CardContent className="px-6 pb-6">
          <div className="-mt-12 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg ring-4 ring-card">
              <span className="text-3xl font-bold text-primary-foreground">
                {(isEditing ? editData.fullName : storeProfile.fullName)?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                {isEditing ? editData.fullName : storeProfile.fullName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {calcAge(storeProfile.dateOfBirth)} yrs · {storeProfile.gender ? storeProfile.gender.charAt(0).toUpperCase() + storeProfile.gender.slice(1) : t("profile.patient")}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Droplet className="mr-1 h-3 w-3" aria-hidden />
                  {storeProfile.bloodGroup}
                </Badge>
                <Badge variant="outline">
                  <UserCircle className="mr-1 h-3 w-3" aria-hidden />
                  {t("profile.patient")}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" aria-hidden />
              {t("profile.personalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid gap-x-8 sm:grid-cols-2">
              <ProfileRow icon={User} label={t("profile.fullName")} value={storeProfile.fullName} editable field="fullName" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
              <ProfileRow icon={Calendar} label={t("profile.dateOfBirth")} value={fmtDate(storeProfile.dateOfBirth)} editable field="dateOfBirth" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
              <ProfileRow icon={User} label={t("profile.gender")} value={storeProfile.gender ? storeProfile.gender.charAt(0).toUpperCase() + storeProfile.gender.slice(1) : "-"} editable field="gender" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
              <ProfileRow icon={Droplet} label={t("profile.bloodGroup")} value={storeProfile.bloodGroup} editable field="bloodGroup" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
              <ProfileRow icon={Phone} label={t("profile.phone")} value={storeProfile.phone} editable field="phone" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
              <ProfileRow icon={Mail} label={t("profile.email")} value={storeProfile.email} editable field="email" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <ProfileRow icon={MapPin} label={t("profile.address")} value={`${storeProfile.address || ""}, ${storeProfile.city || ""}, ${storeProfile.state || ""} - ${storeProfile.pincode || ""}`} editable field="address" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-danger-soft-foreground" aria-hidden />
              {t("profile.emergencyContact")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid gap-x-8 sm:grid-cols-2">
              <ProfileRow icon={User} label={t("profile.contactName")} value={storeProfile.emergencyContactName} editable field="emergencyContactName" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
              <ProfileRow icon={Heart} label={t("profile.relationship")} value={storeProfile.emergencyContactRelation} editable field="emergencyContactRelation" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
              <ProfileRow icon={Phone} label={t("profile.phone")} value={storeProfile.emergencyContactPhone} editable field="emergencyContactPhone" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-success-soft-foreground" aria-hidden />
              {t("profile.medicalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 px-6">
            <div className="rounded-xl bg-primary/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Droplet className="h-4 w-4 text-danger-soft-foreground" aria-hidden />
                <span className="text-sm font-medium text-foreground">{t("profile.bloodGroup")}</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{storeProfile.bloodGroup}</p>
            </div>
            <ProfileRow icon={AlertCircle} label={t("profile.allergies")} value={storeProfile.allergies} editable field="allergies" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
            <ProfileRow icon={Shield} label={t("profile.chronicConditions")} value={storeProfile.chronicConditions} editable field="chronicConditions" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
            <ProfileRow icon={Activity} label={t("profile.medications")} value={storeProfile.currentMedications} editable field="currentMedications" isEditing={isEditing} editData={editData} onChangeField={handleChangeField} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" aria-hidden />
              {t("profile.accountSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            <div className="flex items-center justify-between border-b border-border py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  {darkMode ? <Moon className="h-4 w-4 text-muted-foreground" aria-hidden /> : <Sun className="h-4 w-4 text-muted-foreground" aria-hidden />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("profile.theme")}</p>
                  <p className="text-xs text-muted-foreground">{darkMode ? t("profile.darkMode") : t("profile.lightMode")}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={toggleDarkMode} className="gap-2">
                {darkMode ? (
                  <>
                    <Sun className="h-4 w-4" aria-hidden />
                    {t("profile.lightMode")}
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" aria-hidden />
                    {t("profile.darkMode")}
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("profile.language")}</p>
                  <p className="text-xs text-muted-foreground">{language === "hi" ? "हिंदी" : "English"}</p>
                </div>
              </div>
              <Select
                options={langOpts}
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
                className="h-9 w-36"
              />
            </div>

            <div className="pt-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Bell className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("profile.notifications")}</p>
                  <p className="text-xs text-muted-foreground">{t("profile.manageAlerts")}</p>
                </div>
              </div>
              <div className="space-y-3 pl-12">
                {notifRows.map((x) => (
                  <div key={x.k} className="flex items-center justify-between py-2">
                    <p className="text-sm text-foreground">{x.l}</p>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifs[x.k]}
                      aria-label={x.l}
                      onClick={() => setNotifs({ ...notifs, [x.k]: !notifs[x.k] })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        notifs[x.k] ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          notifs[x.k] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" aria-hidden />
              {t("profile.abhaTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{t("profile.abhaAddress")}</p>
                  <p className="text-lg font-bold text-foreground">demo.abha@abdm</p>
                </div>
              </div>
              <Badge variant="success" className="text-xs">
                {t("profile.verified")}
              </Badge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("profile.abhaNote")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
