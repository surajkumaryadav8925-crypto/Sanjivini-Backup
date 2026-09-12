"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalStore, type Ward } from "@/stores";
import { useSupabaseData } from "@/lib/data/mode";
import { getMyStaffHospital } from "@/lib/data/staff";
import { fetchHospitalWards, updateBedStatus, type BedRow } from "@/lib/data/beds";
import { Bed, Users, AlertTriangle, Wrench, Plus, Minus, Edit2, Loader2, RefreshCw } from "lucide-react";

type WardBedField = 'totalBeds' | 'availableBeds' | 'occupiedBeds' | 'reservedBeds' | 'outOfService';

export default function BedsPage() {
  const useDb = useSupabaseData();
  const { wards, updateWardBed } = useHospitalStore();

  // --- Live beds (production mode) ---
  const [liveWards, setLiveWards] = useState<Ward[]>([]);
  const [liveBeds, setLiveBeds] = useState<BedRow[]>([]);
  const [loading, setLoading] = useState(useDb);
  const [error, setError] = useState<string | null>(null);
  const [savingBed, setSavingBed] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [staffHospital, setStaffHospital] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const staff = await getMyStaffHospital();
      if (!staff) {
        setError("No hospital is linked to your staff account. Contact your administrator.");
        setLiveWards([]);
        setLiveBeds([]);
        return;
      }
      setStaffHospital(staff.hospitalId);
      const [w, beds] = await Promise.all([
        fetchHospitalWards(staff.hospitalId),
        (await import("@/lib/supabase")).supabase
          .from("beds")
          .select("id, bed_type, bed_number, ward, status, is_icu, has_oxygen, has_ventilator")
          .eq("hospital_id", staff.hospitalId)
          .order("bed_number"),
      ]);
      setLiveWards(w);
      setLiveBeds((beds.data ?? []) as BedRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load beds");
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

  const [editWard, setEditWard] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Record<WardBedField, number>>>({});

  // Demo-mode handlers (unchanged from original)
  const demoTotals = {
    totalBeds: wards.reduce((sum, w) => sum + w.totalBeds, 0),
    availableBeds: wards.reduce((sum, w) => sum + w.availableBeds, 0),
    occupiedBeds: wards.reduce((sum, w) => sum + w.occupiedBeds, 0),
    reservedBeds: wards.reduce((sum, w) => sum + w.reservedBeds, 0),
    outOfService: wards.reduce((sum, w) => sum + w.outOfService, 0),
  };
  const openEdit = (ward: typeof wards[0]) => {
    setEditWard(ward.id);
    setEditData({ totalBeds: ward.totalBeds, availableBeds: ward.availableBeds, occupiedBeds: ward.occupiedBeds, reservedBeds: ward.reservedBeds, outOfService: ward.outOfService });
  };
  const saveEdit = () => {
    if (!editWard) return;
    (Object.entries(editData) as [WardBedField, number][]).forEach(([field, value]) => { updateWardBed(editWard, field, value); });
    setEditWard(null);
  };
  const adjustValue = (field: WardBedField, delta: number) => { setEditData(prev => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) + delta) })); };

  // Live-mode derived totals
  const liveTotals = {
    totalBeds: liveWards.reduce((sum, w) => sum + w.totalBeds, 0),
    availableBeds: liveWards.reduce((sum, w) => sum + w.availableBeds, 0),
    occupiedBeds: liveWards.reduce((sum, w) => sum + w.occupiedBeds, 0),
    reservedBeds: liveWards.reduce((sum, w) => sum + w.reservedBeds, 0),
    outOfService: liveWards.reduce((sum, w) => sum + w.outOfService, 0),
  };
  const totals = useDb ? liveTotals : demoTotals;
  const displayedWards = useDb ? liveWards : wards;

  const setBedStatus = async (bed: BedRow, status: "available" | "occupied" | "maintenance" | "reserved") => {
    setSavingBed(bed.id);
    try {
      await updateBedStatus(bed.id, status);
      setLiveBeds((prev) => prev.map((b) => (b.id === bed.id ? { ...b, status } : b)));
      // Recompute ward summaries
      setLiveWards(
        (() => {
          const updated = liveBeds.map((b) => (b.id === bed.id ? { ...b, status } : b));
          return summarize(updated);
        })()
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update bed");
    } finally {
      setSavingBed(null);
    }
  };

  function summarize(rows: BedRow[]) {
    const map = new Map<string, Ward>();
    for (const row of rows) {
      const wardName = row.ward?.trim() || row.bed_type;
      const label = wardName.charAt(0).toUpperCase() + wardName.slice(1);
      let ward = map.get(label);
      if (!ward) {
        ward = { id: label, name: label, totalBeds: 0, availableBeds: 0, occupiedBeds: 0, reservedBeds: 0, outOfService: 0 };
        map.set(label, ward);
      }
      ward.totalBeds += 1;
      if (row.status === "available") ward.availableBeds += 1;
      else if (row.status === "occupied") ward.occupiedBeds += 1;
      else if (row.status === "reserved") ward.reservedBeds += 1;
      else ward.outOfService += 1;
    }
    return Array.from(map.values());
  }

  const selectedBeds = selectedWard
    ? liveBeds.filter((b) => (b.ward?.trim() || b.bed_type).replace(/^\w/, (c) => c.toUpperCase()) === selectedWard)
    : [];

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bed Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage hospital bed availability and status</p>
        </div>
        {useDb && (
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        )}
      </div>

      {useDb && error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20 mb-6">
          <CardContent className="py-4 text-center space-y-2">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {useDb && loading && !error && (
        <Card className="border-dashed mb-6">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-3 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading live bed data...</p>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card><CardContent className="p-4 text-center"><Bed className="h-8 w-8 mx-auto mb-2 text-blue-500"/><p className="text-2xl font-bold">{totals.totalBeds}</p><p className="text-xs text-muted-foreground">Total Beds</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-emerald-500"/><p className="text-2xl font-bold text-emerald-600">{totals.availableBeds}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500"/><p className="text-2xl font-bold text-orange-600">{totals.occupiedBeds}</p><p className="text-xs text-muted-foreground">Occupied</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-purple-500"/><p className="text-2xl font-bold text-purple-600">{totals.reservedBeds}</p><p className="text-xs text-muted-foreground">Reserved</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Wrench className="h-8 w-8 mx-auto mb-2 text-red-500"/><p className="text-2xl font-bold text-red-600">{totals.outOfService}</p><p className="text-xs text-muted-foreground">Out of Service</p></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedWards.map((ward) => (
          <Card key={ward.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{ward.name}</span>
                {useDb ? (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedWard(ward.name)} className="text-xs gap-1">
                    <Edit2 className="h-3.5 w-3.5" /> Manage
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => openEdit(ward)}><Edit2 className="h-4 w-4"/></Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg"><span className="text-sm">Total Beds</span><Badge variant="secondary" className="text-base">{ward.totalBeds}</Badge></div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg"><span className="text-sm">Available</span><Badge variant="secondary" className="text-emerald-600 text-base">{ward.availableBeds}</Badge></div>
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg"><span className="text-sm">Occupied</span><Badge variant="secondary" className="text-orange-600 text-base">{ward.occupiedBeds}</Badge></div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg"><span className="text-sm">Reserved</span><Badge variant="secondary" className="text-purple-600 text-base">{ward.reservedBeds}</Badge></div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg"><span className="text-sm">Out of Service</span><Badge variant="secondary" className="text-red-600 text-base">{ward.outOfService}</Badge></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live per-bed management dialog (production mode) */}
      {useDb && selectedWard && (
        <Dialog open onOpenChange={() => setSelectedWard(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Beds — {selectedWard}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto py-2">
              {selectedBeds.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No beds registered in this ward.</p>
              )}
              {selectedBeds.map((bed) => (
                <div key={bed.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{bed.bed_number}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {bed.bed_type}
                      {bed.is_icu ? " • ICU" : ""}
                      {bed.has_oxygen ? " • O2" : ""}
                      {bed.has_ventilator ? " • Ventilator" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {savingBed === bed.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      (["available", "occupied", "maintenance"] as const).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={bed.status === s ? "default" : "outline"}
                          className="text-[10px] h-7 px-2 capitalize"
                          disabled={savingBed === bed.id}
                          onClick={() => void setBedStatus(bed, s)}
                        >
                          {s}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedWard(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Demo-mode ward count editor (unchanged) */}
      {!useDb && editWard && (
        <Dialog open onOpenChange={() => setEditWard(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit {wards.find(w => w.id === editWard)?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              {([
                { key: 'totalBeds', label: 'Total Beds' },
                { key: 'availableBeds', label: 'Available' },
                { key: 'occupiedBeds', label: 'Occupied' },
                { key: 'reservedBeds', label: 'Reserved' },
                { key: 'outOfService', label: 'Out of Service' },
              ] as const).map((field) => (
                <div key={field.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{field.label}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjustValue(field.key, -1)}><Minus className="h-4 w-4"/></Button>
                    <Input className="w-16 text-center h-8" type="number" value={editData[field.key] || 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData(prev => ({ ...prev, [field.key]: parseInt(e.target.value) || 0 }))}/>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjustValue(field.key, 1)}><Plus className="h-4 w-4"/></Button>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditWard(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
