"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { useHospitalStore } from "@/stores";
import { useSupabaseData } from "@/lib/data/mode";
import { getMyStaffHospital } from "@/lib/data/staff";
import {
  fetchBloodInventory,
  updateBloodInventory,
  fetchBloodRequests,
  setBloodRequestStatus,
  type BloodInventoryRow,
  type BloodRequestRow,
} from "@/lib/data/blood";
import { Droplet, Plus, Minus, Edit2, AlertTriangle, CheckCircle, Clock, Check, X, Loader2, RefreshCw } from "lucide-react";

interface UiBloodGroup { group: string; available: number; reserved: number; }
const ALL_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodBankPage() {
  const useDb = useSupabaseData();
  const { bloodGroups: demoGroups, updateBloodGroup, bloodRequests: demoRequests, updateBloodRequestStatus } = useHospitalStore();

  const [activeTab, setActiveTab] = useState<"inventory" | "requests">("inventory");
  const [editGroup, setEditGroup] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ available: number; reserved: number }>({ available: 0, reserved: 0 });
  const [requestFilter, setRequestFilter] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // --- Live data (production mode) ---
  const [liveGroups, setLiveGroups] = useState<UiBloodGroup[]>([]);
  const [liveRequests, setLiveRequests] = useState<BloodRequestRow[]>([]);
  const [loading, setLoading] = useState(useDb);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const staff = await getMyStaffHospital();
      if (!staff) {
        setError("No hospital is linked to your staff account. Contact your administrator.");
        setLiveGroups([]);
        setLiveRequests([]);
        return;
      }
      const [inv, reqs] = await Promise.all([
        fetchBloodInventory(staff.hospitalId),
        fetchBloodRequests(staff.hospitalId),
      ]);
      const byGroup = new Map(inv.map((row) => [row.blood_group, row]));
      setLiveGroups(
        ALL_GROUPS.map((g) => {
          const row = byGroup.get(g);
          return { group: g, available: row?.units_available ?? 0, reserved: row?.units_reserved ?? 0 };
        })
      );
      setLiveRequests(reqs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blood bank data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!useDb) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [useDb, load]);

  const bloodGroups: UiBloodGroup[] = useDb ? liveGroups : demoGroups;

  const openEdit = (bg: UiBloodGroup) => {
    setEditGroup(bg.group);
    setEditData({ available: bg.available, reserved: bg.reserved });
  };

  const saveEdit = async () => {
    if (!editGroup) return;
    setSaving(true);
    setActionError(null);
    try {
      if (useDb) {
        const staff = await getMyStaffHospital();
        if (!staff) throw new Error("Not authorized");
        await updateBloodInventory(staff.hospitalId, editGroup, editData.available, editData.reserved);
        setLiveGroups((prev) => prev.map((g) => (g.group === editGroup ? { ...g, available: editData.available, reserved: editData.reserved } : g)));
      } else {
        updateBloodGroup(editGroup, "available", editData.available);
        updateBloodGroup(editGroup, "reserved", editData.reserved);
      }
      setEditGroup(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not save inventory");
    } finally {
      setSaving(false);
    }
  };

  const adjust = (field: "available" | "reserved", delta: number) => {
    setEditData(prev => ({ ...prev, [field]: Math.max(0, prev[field] + delta) }));
  };

  const handleRequestAction = async (reqId: string, action: "approve" | "reject" | "fulfill") => {
    setSaving(true);
    setActionError(null);
    try {
      await setBloodRequestStatus(reqId, action);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSaving(false);
    }
  };

  const requests = useDb
    ? liveRequests.map((r) => ({ ...r, hospitalName: r.hospital_name ?? "" }))
    : demoRequests.map((r) => ({ ...r, hospital_name: r.hospitalName, contact_phone: r.contactPhone, patient_name: r.patientName, created_at: r.requestedAt, blood_group: r.bloodGroup, hospitalName: r.hospitalName }));

  const totalUnits = bloodGroups.reduce((sum, bg) => sum + bg.available + bg.reserved, 0);
  const totalAvailable = bloodGroups.reduce((sum, bg) => sum + bg.available, 0);
  const totalReserved = bloodGroups.reduce((sum, bg) => sum + bg.reserved, 0);
  const criticalGroups = bloodGroups.filter(bg => bg.available < 5);
  const pendingRequestsCount = requests.filter(r => r.status === "pending").length;

  const filteredRequests = requests.filter(r => {
    if (requestFilter === "all") return true;
    return r.status === requestFilter;
  });

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Droplet className="h-6 w-6 text-red-500 fill-red-500" />
            Blood Bank Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time blood stock control, hospital reservations, and patient requisitions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {useDb && (
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          )}
          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === "inventory" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("inventory")}
              className="text-xs"
            >
              Inventory Units
            </Button>
            <Button
              variant={activeTab === "requests" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("requests")}
              className="text-xs relative"
            >
              Requisitions
              {pendingRequestsCount > 0 && (
                <Badge className="ml-1.5 h-5 px-1.5 bg-red-500 text-white text-[10px]">
                  {pendingRequestsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {useDb && error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-4 text-center space-y-2">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {actionError && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{actionError}</p>
          </CardContent>
        </Card>
      )}

      {criticalGroups.length > 0 && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">
              Critical Shortage: {criticalGroups.map(bg => bg.group).join(", ")} blood groups are below safe inventory threshold (&lt;5 units).
            </span>
          </CardContent>
        </Card>
      )}

      {/* Overview Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Droplet className="h-7 w-7 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold">{totalUnits}</p>
            <p className="text-xs text-muted-foreground">Total Units In Bank</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Droplet className="h-7 w-7 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalAvailable}</p>
            <p className="text-xs text-muted-foreground">Available For Dispatch</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Droplet className="h-7 w-7 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalReserved}</p>
            <p className="text-xs text-muted-foreground">Reserved For Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-7 w-7 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingRequestsCount}</p>
            <p className="text-xs text-muted-foreground">Pending Requisitions</p>
          </CardContent>
        </Card>
      </div>

      {activeTab === "inventory" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bloodGroups.map((bg) => (
            <Card key={bg.group} className={bg.available < 5 ? "border-red-300 dark:border-red-800" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{bg.group}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(bg)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{bg.available}</p>
                  <p className="text-xs text-muted-foreground">Available Units</p>
                </div>
                <div className="text-center p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{bg.reserved}</p>
                  <p className="text-xs text-muted-foreground">Reserved Units</p>
                </div>
                {bg.available < 5 ? (
                  <Badge variant="destructive" className="w-full justify-center">Low Stock Warning</Badge>
                ) : (
                  <Badge variant="outline" className="w-full justify-center text-emerald-600 border-emerald-500/50">Adequate Stock</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Requisitions Management */
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg">Incoming Patient Blood Requisitions</CardTitle>
              <div className="flex gap-1.5">
                {(["all", "pending", "approved", "fulfilled", "rejected"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={requestFilter === status ? "default" : "outline"}
                    size="sm"
                    className="text-xs capitalize h-8"
                    onClick={() => setRequestFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No blood requisitions found in this category.
              </div>
            ) : (
              <div className="divide-y">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-muted-foreground">{req.id.slice(0, 8)}</span>
                        <Badge variant="outline" className="font-bold text-red-600">
                          {req.blood_group} • {req.units} {req.units > 1 ? "units" : "unit"}
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
                          className="capitalize text-[10px]"
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        Patient: {req.patient_name} &bull; Attendant Phone: {req.contact_phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(req.created_at).toLocaleString()} &bull; Target: {req.hospitalName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                            disabled={saving}
                            onClick={() => void handleRequestAction(req.id, "approve")}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve & Reserve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1 text-xs"
                            disabled={saving}
                            onClick={() => void handleRequestAction(req.id, "reject")}
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs"
                          disabled={saving}
                          onClick={() => void handleRequestAction(req.id, "fulfill")}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Mark Dispensed
                        </Button>
                      )}
                      {req.status === "fulfilled" && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Units Dispensed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {editGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative z-50 w-full max-w-md rounded-xl bg-background p-6 shadow-xl border">
            <h2 className="text-lg font-semibold mb-4">Adjust {editGroup} Inventory Stock</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Available Units</p>
                  <p className="text-xs text-muted-foreground">Ready for emergency dispatch</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjust("available", -1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    className="w-20 text-center font-bold"
                    type="number"
                    value={editData.available}
                    onChange={(e) => setEditData(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}
                  />
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjust("available", 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Reserved Units</p>
                  <p className="text-xs text-muted-foreground">Earmarked for surgery / requisitions</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjust("reserved", -1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    className="w-20 text-center font-bold"
                    type="number"
                    value={editData.reserved}
                    onChange={(e) => setEditData(prev => ({ ...prev, reserved: parseInt(e.target.value) || 0 }))}
                  />
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjust("reserved", 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditGroup(null)}>Cancel</Button>
              <Button onClick={() => void saveEdit()} disabled={saving} className="bg-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
