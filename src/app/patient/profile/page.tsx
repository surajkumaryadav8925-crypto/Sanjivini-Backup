"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProfileStore, type PatientProfile } from "@/stores/profileStore";
import { useUIStore } from "@/stores";
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
  { value: "hi", label: "Hindi" },
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
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
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
    const t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) {
      a--;
    }
    return Math.max(0, a);
  };

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-";

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <Button onClick={handleStartEdit} variant="outline" size="sm" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          )}
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl border-4 border-background">
                <span className="text-3xl font-bold text-white">
                  {(isEditing ? editData.fullName : storeProfile.fullName)?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">
                  {isEditing ? editData.fullName : storeProfile.fullName}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {calcAge(storeProfile.dateOfBirth)} yrs • {storeProfile.gender ? storeProfile.gender.charAt(0).toUpperCase() + storeProfile.gender.slice(1) : "Patient"}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    <Droplet className="h-3 w-3 mr-1" />
                    {storeProfile.bloodGroup}
                  </Badge>
                  <Badge variant="outline">
                    <UserCircle className="h-3 w-3 mr-1" />
                    Patient
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
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="grid sm:grid-cols-2 gap-x-8">
                <ProfileRow
                  icon={User}
                  label="Full Name"
                  value={storeProfile.fullName}
                  editable
                  field="fullName"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={fmtDate(storeProfile.dateOfBirth)}
                  editable
                  field="dateOfBirth"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={User}
                  label="Gender"
                  value={storeProfile.gender ? storeProfile.gender.charAt(0).toUpperCase() + storeProfile.gender.slice(1) : "-"}
                  editable
                  field="gender"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={Droplet}
                  label="Blood Group"
                  value={storeProfile.bloodGroup}
                  editable
                  field="bloodGroup"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={Phone}
                  label="Phone"
                  value={storeProfile.phone}
                  editable
                  field="phone"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={Mail}
                  label="Email"
                  value={storeProfile.email}
                  editable
                  field="email"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <ProfileRow
                  icon={MapPin}
                  label="Address"
                  value={`${storeProfile.address || ""}, ${storeProfile.city || ""}, ${storeProfile.state || ""} - ${storeProfile.pincode || ""}`}
                  editable
                  field="address"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="grid sm:grid-cols-2 gap-x-8">
                <ProfileRow
                  icon={User}
                  label="Contact Name"
                  value={storeProfile.emergencyContactName}
                  editable
                  field="emergencyContactName"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={Heart}
                  label="Relationship"
                  value={storeProfile.emergencyContactRelation}
                  editable
                  field="emergencyContactRelation"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={Phone}
                  label="Phone"
                  value={storeProfile.emergencyContactPhone}
                  editable
                  field="emergencyContactPhone"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-emerald-500" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="grid sm:grid-cols-1 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-foreground">Blood Group</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{storeProfile.bloodGroup}</p>
                </div>
                <ProfileRow
                  icon={AlertCircle}
                  label="Allergies"
                  value={storeProfile.allergies}
                  editable
                  field="allergies"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={Shield}
                  label="Chronic Conditions"
                  value={storeProfile.chronicConditions}
                  editable
                  field="chronicConditions"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
                <ProfileRow
                  icon={Activity}
                  label="Medications"
                  value={storeProfile.currentMedications}
                  editable
                  field="currentMedications"
                  isEditing={isEditing}
                  editData={editData}
                  onChangeField={handleChangeField}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    {darkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Theme</p>
                    <p className="text-xs text-muted-foreground">{darkMode ? "Dark" : "Light"} mode</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={toggleDarkMode} className="gap-2">
                  {darkMode ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Language</p>
                    <p className="text-xs text-muted-foreground">{language === "hi" ? "Hindi (हिंदी)" : "English"}</p>
                  </div>
                </div>
                <Select
                  options={langOpts}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
                  className="w-36 h-9"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Notifications</p>
                    <p className="text-xs text-muted-foreground">Manage alerts</p>
                  </div>
                </div>
                <div className="space-y-3 pl-12">
                  {[
                    { k: "appointments", l: "Appointments" },
                    { k: "medicines", l: "Medicines" },
                    { k: "reminders", l: "Health Reminders" },
                    { k: "emergency", l: "Emergency Alerts" },
                  ].map((x) => (
                    <div key={x.k} className="flex items-center justify-between py-2">
                      <p className="text-sm text-foreground">{x.l}</p>
                      <button
                        type="button"
                        onClick={() => setNotifs({ ...notifs, [x.k]: !notifs[x.k as keyof typeof notifs] })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          notifs[x.k as keyof typeof notifs] ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            notifs[x.k as keyof typeof notifs] ? "translate-x-5" : "translate-x-0"
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
                <Shield className="h-5 w-5 text-blue-500" />
                Healthcare ID (ABHA)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">ABHA Address</p>
                    <p className="text-lg font-bold text-foreground">demo.abha@abdm</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                  Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Your ABHA address helps you access and share health records securely across all Ayushman Bharat digital healthcare facilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
