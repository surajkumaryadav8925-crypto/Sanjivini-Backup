"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Label } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Droplet, Search, Phone, MapPin, CheckCircle2, Clock, ShieldAlert, HeartHandshake, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useHospitalStore } from "@/stores";
import { useSupabaseData } from "@/lib/data/mode";
import {
  fetchBloodBanks,
  fetchBloodRequests,
  createBloodRequest,
  type BloodBankView,
} from "@/lib/data/blood";
import { getMyPatientId as resolvePatientId } from "@/lib/data/emergency";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/** i18n keys for hardcoded English UI copy in the request form. */
const STATUS_KEYS: Record<string, string> = {
  "Patient Full Name *": "patient.blood.form.patientName",
  "Blood Group *": "patient.blood.form.bloodGroup",
  "Units Required *": "patient.blood.form.unitsRequired",
  "Urgency Level": "patient.blood.form.urgencyLevel",
  "Attendant Contact Number *": "patient.blood.form.contactNumber",
  "Cancel": "common.cancel",
  "Send Request": "patient.blood.form.send",
};
const statusText = (key: string, t: (k: string) => string) => t(STATUS_KEYS[key] ?? "") || key;

interface UiRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospitalName: string;
  urgency: "routine" | "urgent" | "emergency";
  contactPhone: string;
  status: "pending" | "approved" | "fulfilled" | "rejected";
  requestedAt: string;
}

export default function BloodPage() {
  const { t } = useTranslation();
  const { bloodGroups, requestBlood } = useHospitalStore();
  const demoStoreRequests = useHospitalStore((s) => s.bloodRequests);
  const useDb = useSupabaseData();

  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [search, setSearch] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [targetHospital, setTargetHospital] = useState("");
  const [targetHospitalId, setTargetHospitalId] = useState<string | null>(null);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  // --- Live data (production mode) ---
  const [banks, setBanks] = useState<BloodBankView[]>([]);
  const [loading, setLoading] = useState(useDb);
  const [error, setError] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<UiRequest[]>([]);

  const loadRequests = () => {
    if (!useDb) return;
    fetchBloodRequests()
      .then((rows) =>
        setMyRequests(
          rows.map((r) => ({
            id: r.id,
            patientName: r.patient_name,
            bloodGroup: r.blood_group,
            units: r.units,
            hospitalName: r.hospital_name ?? "",
            urgency: r.urgency,
            contactPhone: r.contact_phone,
            status: r.status,
            requestedAt: r.created_at,
          }))
        )
      )
      .catch(() => setMyRequests([]));
  };

  useEffect(() => {
    if (!useDb) return;
    let cancelled = false;
    Promise.all([fetchBloodBanks(), resolvePatientId()])
      .then(([bankRows]) => {
        if (!cancelled) {
          setBanks(bankRows);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load blood banks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    loadRequests();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDb]);

  // Request form state
  const [patientName, setPatientName] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [urgency, setUrgency] = useState<"routine" | "urgent" | "emergency">("urgent");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Demo fixtures (demo mode only) — identical to the original showcase data.
  const demoBanks: BloodBankView[] = [
    {
      id: "bb-1",
      hospital: "JNMCH Blood Bank",
      address: "Mayaganj, Bhagalpur",
      phone: "+91 641 240 1078",
      inventory: Object.fromEntries(bloodGroups.map((bg) => [bg.group, bg.available])),
      totalUnits: bloodGroups.reduce((s, bg) => s + bg.available, 0),
    },
    {
      id: "bb-2",
      hospital: "District Hospital Blood Bank",
      address: "Barari Road, Bhagalpur",
      phone: "+91 641 242 0012",
      inventory: { "A+": 12, "B+": 18, "O+": 10, "AB+": 4, "A-": 2, "B-": 3, "O-": 1, "AB-": 0 },
      totalUnits: 50,
    },
    {
      id: "bb-3",
      hospital: "Sultanganj Referral Hospital Blood Storage",
      address: "Sultanganj, Bhagalpur",
      phone: "+91 641 254 3210",
      inventory: { "A+": 4, "B+": 6, "O+": 5, "AB+": 1, "A-": 1, "B-": 1, "O-": 2, "AB-": 0 },
      totalUnits: 20,
    },
  ];

  const bloodBanks: BloodBankView[] = useDb ? banks : demoBanks;

  const getAvailableUnits = (bankId: string, group: string) => {
    const bank = bloodBanks.find((b) => b.id === bankId);
    return bank?.inventory[group] ?? 0;
  };

  const openRequestDialog = (bank: BloodBankView, defaultGroup?: string) => {
    setTargetHospital(bank.hospital);
    setTargetHospitalId(bank.id);
    setSubmitError(null);
    if (defaultGroup) setSelectedGroup(defaultGroup);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);
    try {
      if (useDb) {
        if (!targetHospitalId) throw new Error("Please choose a blood bank.");
        const patientId = await resolvePatientId();
        if (!patientId) throw new Error("No patient profile found for this account.");
        const id = await createBloodRequest({
          patientId,
          hospitalId: targetHospitalId,
          patientName: patientName.trim(),
          bloodGroup: selectedGroup || "O+",
          units: Math.max(1, parseInt(unitsNeeded) || 1),
          urgency,
          contactPhone,
        });
        setLastSubmittedId(id);
        loadRequests();
      } else {
        const reqId = requestBlood({
          patientName: patientName.trim(),
          bloodGroup: selectedGroup || "O+",
          units: Math.max(1, parseInt(unitsNeeded) || 1),
          hospitalName: targetHospital,
          urgency,
          contactPhone,
        });
        setLastSubmittedId(reqId);
      }
      setRequestModalOpen(false);
      setPatientName("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBanks: BloodBankView[] = bloodBanks.filter(
    (b) =>
      b.hospital.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase())
  );

  const instructions = `${t("patient.blood.title")}. ${t("patient.blood.selectBloodGroup")} ${t("patient.blood.demoDataNotice")}`;

  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Droplet className="h-6 w-6 text-red-500 fill-red-500" />
            {t("patient.blood.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("patient.blood.realtimeNote")}
          </p>
        </div>
        <SpeakButton text={instructions} />
      </div>

      {lastSubmittedId && (
        <Card className="border-success/40 bg-success-soft">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
              <div>
                <p className="font-semibold text-success-soft-foreground">
                  {t("patient.blood.refConfirmed")}
                </p>
                <p className="text-xs text-success-soft-foreground/80">
                  {t("patient.blood.refId")}: <span className="font-mono font-bold">{lastSubmittedId}</span>. {t("patient.blood.refBody")}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setLastSubmittedId(null)}>
              {t("patient.blood.dismiss")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Blood Group Quick Filter Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{t("patient.blood.selectBloodGroup")}</Label>
            {selectedGroup && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => setSelectedGroup("")}
              >
                {t("patient.blood.clearFilter")}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BLOOD_GROUPS.map((g) => {
              const isSelected = selectedGroup === g;
              return (
                <Button
                  key={g}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGroup(isSelected ? "" : g)}
                  className={`font-bold transition-all ${
                    isSelected
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-sm scale-105"
                      : "hover:border-red-400 hover:text-red-600"
                  }`}
                >
                  <Droplet className="h-3.5 w-3.5 mr-1 fill-current" />
                  {g}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {useDb && loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-3 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">{t("patient.blood.loadingInventory")}</p>
          </CardContent>
        </Card>
      )}
      {useDb && error && (
        <Card className="border-destructive/30 bg-danger-soft">
          <CardContent className="py-6 text-center space-y-3">
            <p className="text-sm font-medium text-danger-soft-foreground">
              {t("patient.blood.loadError")}: {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchBloodBanks()
                  .then(setBanks)
                  .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load blood banks"))
                  .finally(() => setLoading(false));
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      {useDb && !loading && !error && bloodBanks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Droplet className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              {t("patient.blood.emptyBanks")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      {!loading && !error && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("patient.blood.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      )}

      {/* Blood Bank Cards */}
      <div className="space-y-4">
        {filteredBanks.map((bank) => {
          const availableUnitsForGroup = selectedGroup
            ? getAvailableUnits(bank.id, selectedGroup)
            : bank.totalUnits;

          return (
            <Card
              key={bank.id}
              className={`transition-all hover:shadow-md ${
                selectedGroup && availableUnitsForGroup > 0
                  ? "border-emerald-500/50 bg-card"
                  : selectedGroup && availableUnitsForGroup === 0
                  ? "border-red-300 dark:border-red-900 bg-card"
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-red-500 fill-red-500" />
                      {bank.hospital}
                      {useDb && (
                        <Badge variant="outline" className="text-[10px] text-success border-success/40 bg-success-soft">
                          {t("patient.blood.liveStore")}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {bank.address}
                    </p>
                  </div>

                  {selectedGroup ? (
                    <Badge
                      variant={availableUnitsForGroup > 0 ? "success" : "destructive"}
                      className="px-3 py-1 text-sm font-semibold"
                    >
                      {availableUnitsForGroup > 0
                        ? `${availableUnitsForGroup} Units Available`
                        : "Out of Stock"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Select a group for units</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 8-Group Matrix Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-2.5 bg-muted/50 rounded-lg">
                  {BLOOD_GROUPS.map((g) => {
                    const u = getAvailableUnits(bank.id, g);
                    const isFocus = selectedGroup === g;
                    return (
                      <div
                        key={g}
                        onClick={() => setSelectedGroup(g)}
                        className={`text-center p-1.5 rounded cursor-pointer transition-colors ${
                          isFocus
                            ? "bg-red-500 text-white font-bold shadow-sm"
                            : u > 0
                            ? "bg-background hover:bg-red-50 dark:hover:bg-red-950/40"
                            : "bg-muted text-muted-foreground opacity-60"
                        }`}
                      >
                        <p className="text-[11px] font-semibold">{g}</p>
                        <p className={`text-sm ${isFocus ? "text-white" : u > 0 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                          {u}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2 font-medium"
                    onClick={() => openRequestDialog(bank, selectedGroup)}
                  >
                    <HeartHandshake className="h-4 w-4" />
                    Request Blood Units
                  </Button>
                  <a href={`tel:${bank.phone}`} className="sm:w-auto">
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      {bank.phone}
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Blood Requests List */}
      {(useDb ? myRequests : demoStoreRequests).length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Active Blood Requisition History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(useDb ? myRequests : demoStoreRequests).slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold font-mono text-xs text-muted-foreground">{req.id}</span>
                    <Badge variant="outline" className="font-bold text-red-600">
                      {req.bloodGroup} • {req.units} {req.units > 1 ? "units" : "unit"}
                    </Badge>
                    <Badge
                      variant={
                        req.urgency === "emergency"
                          ? "destructive"
                          : req.urgency === "urgent"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px] uppercase"
                    >
                      {req.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {req.patientName} • {req.hospitalName}
                  </p>
                </div>
                <div>
                  <Badge
                    variant={
                      req.status === "approved"
                        ? "success"
                        : req.status === "fulfilled"
                        ? "default"
                        : req.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                    className="capitalize text-xs"
                  >
                    {req.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-background border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-red-600 fill-red-600" />
                  Request Blood Units
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{targetHospital}</p>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold">{statusText("Patient Full Name *", t)}</Label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">{statusText("Blood Group *", t)}</Label>
                  <select
                    className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-sm font-semibold"
                    value={selectedGroup || "O+"}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">{statusText("Units Required *", t)}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="4"
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">{statusText("Urgency Level", t)}</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(["routine", "urgent", "emergency"] as const).map((lvl) => (
                    <Button
                      key={lvl}
                      type="button"
                      variant={urgency === lvl ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUrgency(lvl)}
                      className={`text-xs capitalize ${
                        urgency === lvl && lvl === "emergency"
                          ? "bg-red-600 hover:bg-red-700"
                          : urgency === lvl && lvl === "urgent"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : ""
                      }`}
                    >
                      {lvl}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">{statusText("Attendant Contact Number *", t)}</Label>
                <Input
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              {submitError && (
                <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {submitError}
                </p>
              )}

              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Please ensure donor replacement or doctor prescription is available at the blood bank collection counter.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRequestModalOpen(false)}
                >
                  {statusText("Cancel", t)}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? statusText("Send Request", t) + "…" : statusText("Send Request", t)}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
