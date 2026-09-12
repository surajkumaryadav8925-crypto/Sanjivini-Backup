"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { useAuthStore, useOfflineStore, useHospitalStore } from "@/stores";
import { useSupabaseData } from "@/lib/data/mode";
import { getMyStaffHospital } from "@/lib/data/staff";
import { fetchHospitalWards } from "@/lib/data/beds";
import { fetchBloodInventory } from "@/lib/data/blood";
import { fetchHospitalQueues } from "@/lib/data/opd";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Bed, Pill, Droplet, Calendar, AlertTriangle, WifiOff, CheckCircle, Loader2 } from "lucide-react";

interface LiveStats {
  totalBeds: number;
  availableBeds: number;
  icuAvailable: number;
  medicineCount: number;
  lowStockCount: number;
  bloodTotal: number;
  bloodA: number;
  bloodB: number;
  bloodCritical: string[];
  queueTotal: number;
  queueWaiting: number;
  topQueues: { id: string; department: string; waiting: number }[];
}

export default function HospitalDashboard() {
  const { profile } = useAuthStore();
  const { isOnline, pendingOperations } = useOfflineStore();
  const { wards, inventory, bloodGroups, departments } = useHospitalStore();
  const useDb = useSupabaseData();

  const [live, setLive] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(useDb);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useDb) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const staff = await getMyStaffHospital();
        if (!staff) throw new Error("No hospital is linked to your staff account.");

        const [wardsData, blood, queues, invRes] = await Promise.all([
          fetchHospitalWards(staff.hospitalId),
          fetchBloodInventory(staff.hospitalId),
          fetchHospitalQueues(staff.hospitalId),
          supabase
            .from("medicine_inventory")
            .select("quantity, min_quantity")
            .eq("hospital_id", staff.hospitalId),
        ]);

        if (cancelled) return;

        // Token counts for waiting calculation
        const { data: tokenCounts } = await supabase
          .from("opd_tokens")
          .select("queue_id, status")
          .in("queue_id", queues.length > 0 ? queues.map((q) => q.id) : ["00000000-0000-0000-0000-000000000000"]);

        const waitingByQueue = new Map<string, number>();
        for (const t of tokenCounts ?? []) {
          if (t.status === "waiting" || t.status === "called") {
            waitingByQueue.set(t.queue_id, (waitingByQueue.get(t.queue_id) ?? 0) + 1);
          }
        }

        const invRows = (invRes.data ?? []) as { quantity: number; min_quantity: number | null }[];
        const bloodCritical = blood.filter((b) => b.units_available < 5).map((b) => b.blood_group);

        setLive({
          totalBeds: wardsData.reduce((s, w) => s + w.totalBeds, 0),
          availableBeds: wardsData.reduce((s, w) => s + w.availableBeds, 0),
          icuAvailable: wardsData.find((w) => w.name.toLowerCase() === "icu")?.availableBeds ?? 0,
          medicineCount: invRows.length,
          lowStockCount: invRows.filter((i) => i.quantity <= (i.min_quantity ?? 10)).length,
          bloodTotal: blood.reduce((s, b) => s + b.units_available, 0),
          bloodA: blood.find((b) => b.blood_group === "A+")?.units_available ?? 0,
          bloodB: blood.find((b) => b.blood_group === "B+")?.units_available ?? 0,
          bloodCritical,
          queueTotal: queues.length,
          queueWaiting: Array.from(waitingByQueue.values()).reduce((s, n) => s + n, 0),
          topQueues: queues.slice(0, 2).map((q) => ({
            id: q.id,
            department: q.department,
            waiting: waitingByQueue.get(q.id) ?? 0,
          })),
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useDb]);

  const pc = pendingOperations.filter((o) => o.status === "pending").length;

  // Demo-mode figures (original behavior)
  const tb = wards.reduce((s, w) => s + w.totalBeds, 0);
  const ab = wards.reduce((s, w) => s + w.availableBeds, 0);
  const ib = wards.find((w) => w.id === "icu")?.availableBeds || 0;
  const ls = inventory.filter((i) => i.status === "low_stock").length;
  const ts = bloodGroups.reduce((s, bg) => s + bg.available, 0);
  const ap = bloodGroups.find((bg) => bg.group === "A+")?.available || 0;
  const bp = bloodGroups.find((bg) => bg.group === "B+")?.available || 0;
  const wc = departments.reduce((s, d) => s + d.patients.filter((p) => p.status === "waiting" || p.status === "called").length, 0);

  const stats = useDb && live
    ? {
        tb: live.totalBeds,
        ab: live.availableBeds,
        ib: live.icuAvailable,
        medicineCount: live.medicineCount,
        ls: live.lowStockCount,
        ts: live.bloodTotal,
        ap: live.bloodA,
        bp: live.bloodB,
        wc: live.queueWaiting,
        bloodCritical: live.bloodCritical,
        topQueues: live.topQueues,
      }
    : {
        tb,
        ab,
        ib,
        medicineCount: inventory.length,
        ls,
        ts,
        ap,
        bp,
        wc,
        bloodCritical: bloodGroups.filter((bg) => bg.available < 5).map((bg) => bg.group),
        topQueues: departments.slice(0, 2).map((d) => ({
          id: d.id,
          department: d.name,
          waiting: d.patients.filter((p) => p.status === "waiting" || p.status === "called").length,
        })),
      };

  const offlineText = pc > 0 ? `Offline (${pc})` : "Offline";

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
          <p className="text-muted-foreground">{profile?.full_name || "Admin"}</p>
        </div>
        {!isOnline ? (
          <Badge variant="warning"><WifiOff className="h-3 w-3 mr-1" />{offlineText}</Badge>
        ) : (
          <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Online</Badge>
        )}
      </div>

      {useDb && loading && (
        <Card className="border-dashed mb-6">
          <CardContent className="py-10 text-center">
            <Loader2 className="h-7 w-7 mx-auto mb-2 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading live hospital data...</p>
          </CardContent>
        </Card>
      )}

      {useDb && error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20 mb-6">
          <CardContent className="py-4 text-center">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Beds</p><p className="text-2xl font-bold text-blue-600">{stats.tb}</p><p className="text-xs text-muted-foreground">{stats.ab} available</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">ICU Beds</p><p className="text-2xl font-bold text-red-600">{stats.ib}</p><p className="text-xs text-muted-foreground">available</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Medicines</p><p className="text-2xl font-bold text-emerald-600">{stats.medicineCount}</p><p className="text-xs text-muted-foreground">{stats.ls} alerts</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Blood Units</p><p className="text-2xl font-bold text-rose-600">{stats.ts}</p><p className="text-xs text-muted-foreground">A+: {stats.ap}, B+: {stats.bp}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Link href="/hospital/beds"><Card className="hover:shadow-md cursor-pointer text-center"><CardContent className="p-4"><div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center mx-auto mb-2"><Bed className="h-6 w-6 text-white"/></div><p className="font-medium text-sm">Beds</p></CardContent></Card></Link>
        <Link href="/hospital/inventory"><Card className="hover:shadow-md cursor-pointer text-center"><CardContent className="p-4"><div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto mb-2"><Pill className="h-6 w-6 text-white"/></div><p className="font-medium text-sm">Inventory</p></CardContent></Card></Link>
        <Link href="/hospital/blood"><Card className="hover:shadow-md cursor-pointer text-center"><CardContent className="p-4"><div className="h-12 w-12 rounded-xl bg-rose-500 flex items-center justify-center mx-auto mb-2"><Droplet className="h-6 w-6 text-white"/></div><p className="font-medium text-sm">Blood</p></CardContent></Card></Link>
        <Link href="/hospital/opd"><Card className="hover:shadow-md cursor-pointer text-center"><CardContent className="p-4"><div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center mx-auto mb-2"><Calendar className="h-6 w-6 text-white"/></div><p className="font-medium text-sm">OPD</p></CardContent></Card></Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.bloodCritical.map((group) => (
              <div key={group} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <span className="text-sm">Blood {group} critically low</span>
                <Badge variant="destructive">Critical</Badge>
              </div>
            ))}
            {stats.ls > 0 ? (
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <span className="text-sm">{stats.ls} items low stock</span>
                <Badge variant="warning">Warning</Badge>
              </div>
            ) : null}
            {stats.bloodCritical.length === 0 && stats.ls === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No alerts</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>OPD Queue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Total Waiting</p>
                <p className="text-sm text-muted-foreground">{stats.wc} patients</p>
              </div>
              <Link href="/hospital/opd"><Button size="sm">Manage</Button></Link>
            </div>
            {stats.topQueues.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{d.department}</p>
                  <p className="text-sm text-muted-foreground">{d.waiting} waiting</p>
                </div>
                <Link href="/hospital/opd"><Button size="sm" variant="outline">Manage</Button></Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
