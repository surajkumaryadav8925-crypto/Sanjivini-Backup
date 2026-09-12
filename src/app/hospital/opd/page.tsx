"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { useHospitalStore } from "@/stores";
import { useSupabaseData } from "@/lib/data/mode";
import { getMyStaffHospital } from "@/lib/data/staff";
import {
  fetchHospitalQueues,
  fetchQueueTokens,
  bookOpdToken,
  type OpdQueueInfo,
} from "@/lib/data/opd";
import { supabase } from "@/lib/supabase";
import { Calendar, Users, UserPlus, Phone, CheckCircle, XCircle, SkipForward, ChevronRight, Loader2, RefreshCw, AlertTriangle } from "lucide-react";

interface LiveToken {
  id: string;
  token_number: number;
  status: string;
  notes: string | null;
  patient_id: string | null;
}

export default function OPDQueuePage() {
  const useDb = useSupabaseData();
  const { departments, addPatientToQueue, callNextPatient: demoCallNext, markPatientComplete: demoComplete, skipPatient: demoSkip, removePatient: demoRemove } = useHospitalStore();

  const [queues, setQueues] = useState<OpdQueueInfo[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [tokens, setTokens] = useState<LiveToken[]>([]);
  const [loading, setLoading] = useState(useDb);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");

  const load = useCallback(async () => {
    try {
      const staff = await getMyStaffHospital();
      if (!staff) {
        setError("No hospital is linked to your staff account. Contact your administrator.");
        setQueues([]);
        setLoading(false);
        return;
      }
      const q = await fetchHospitalQueues(staff.hospitalId);
      setQueues(q);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load OPD queues");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTokens = useCallback(async (queueId: string) => {
    try {
      const rows = await fetchQueueTokens(queueId);
      setTokens(rows as LiveToken[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queue tokens");
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

  useEffect(() => {
    if (!useDb || !selectedQueue) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadTokens(selectedQueue);
    });
    return () => {
      cancelled = true;
    };
  }, [useDb, selectedQueue, loadTokens]);

  const selected = queues.find((q) => q.id === selectedQueue);
  const waiting = tokens.filter((t) => t.status === "waiting" || t.status === "called");
  const completed = tokens.filter((t) => t.status === "completed");

  const displayName = (t: LiveToken) => {
    if (t.patient_id) return "Registered Patient";
    return t.notes?.split("|")[0]?.trim() || `Walk-in`;
  };

  // --- Staff actions via secure DB paths ---
  const callNext = async () => {
    if (!selectedQueue) return;
    setActionBusy(true);
    setError(null);
    try {
      const { error } = await supabase.rpc("call_next_patient", { p_queue_id: selectedQueue });
      if (error) throw new Error(error.message);
      await loadTokens(selectedQueue);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not call next patient");
    } finally {
      setActionBusy(false);
    }
  };

  const completeToken = async (tokenId: string) => {
    setActionBusy(true);
    try {
      const { error } = await supabase.from("opd_tokens").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", tokenId).eq("status", "called");
      if (error) throw new Error(error.message);
      if (selectedQueue) await loadTokens(selectedQueue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete token");
    } finally {
      setActionBusy(false);
    }
  };

  const skipToken = async (tokenId: string) => {
    setActionBusy(true);
    try {
      const { error } = await supabase.from("opd_tokens").update({ status: "skipped" }).eq("id", tokenId);
      if (error) throw new Error(error.message);
      if (selectedQueue) await loadTokens(selectedQueue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not skip token");
    } finally {
      setActionBusy(false);
    }
  };

  const addWalkIn = async () => {
    if (!selectedQueue || !newPatientName.trim()) return;
    setActionBusy(true);
    setError(null);
    try {
      // staff walk-in: reuse the patient booking RPC; patient_id is resolved from auth inside.
      // For walk-ins we need a patient record — insert a token row directly instead (RLS: staff of this hospital).
      const { data: queueRow } = await supabase
        .from("opd_queues")
        .select("id, hospital_id, total_tokens")
        .eq("id", selectedQueue)
        .single();
      if (!queueRow) throw new Error("Queue not found");

      const nextNumber = (await supabase
        .from("opd_tokens")
        .select("token_number")
        .eq("queue_id", selectedQueue)
        .order("token_number", { ascending: false })
        .limit(1)).data?.[0]?.token_number ?? 0;

      const newTokenNumber = Number(nextNumber) + 1;
      const { error } = await supabase.from("opd_tokens").insert({
        queue_id: selectedQueue,
        patient_id: null,
        token_number: newTokenNumber,
        status: "waiting",
        notes: `${newPatientName.trim()} | ${newPatientPhone.trim()}`,
      });
      if (error) throw new Error(error.message);

      // Keep the queue counter in step with the new token (RLS: staff of this hospital).
      await supabase
        .from("opd_queues")
        .update({ total_tokens: newTokenNumber })
        .eq("id", selectedQueue)
        .gte("total_tokens", newTokenNumber - 1);

      setNewPatientName("");
      setNewPatientPhone("");
      await loadTokens(selectedQueue);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add walk-in patient");
    } finally {
      setActionBusy(false);
    }
  };

  const totalWaiting = useDb
    ? queues.reduce((sum, q) => sum + Math.max(0, q.total_tokens - Math.max(q.current_token, 0)), 0)
    : departments.reduce((sum, d) => sum + d.patients.filter((p) => p.status === "waiting" || p.status === "called").length, 0);
  const busyDepts = useDb
    ? queues.filter((q) => q.current_token > 0).length
    : departments.filter((d) => d.patients.some((p) => p.status === "called")).length;

  const getStatusColor = (status: string) => { if (status === "called") return "bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800"; if (status === "completed") return "bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800"; if (status === "skipped") return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"; return "bg-white dark:bg-gray-900 border-border"; };

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">OPD Queue Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage outpatient department queues</p>
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
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="p-4 text-center"><Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500"/><p className="text-2xl font-bold">{useDb ? queues.length : departments.length}</p><p className="text-xs text-muted-foreground">Departments</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-amber-500"/><p className="text-2xl font-bold text-amber-600">{totalWaiting}</p><p className="text-xs text-muted-foreground">Total Waiting</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Calendar className="h-8 w-8 mx-auto mb-2 text-emerald-500"/><p className="text-2xl font-bold text-emerald-600">{busyDepts}</p><p className="text-xs text-muted-foreground">Busy Now</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Departments</h2>
          {useDb && loading && (
            <Card className="border-dashed"><CardContent className="py-10 text-center"><Loader2 className="h-7 w-7 mx-auto mb-2 text-primary animate-spin" /><p className="text-sm text-muted-foreground">Loading queues...</p></CardContent></Card>
          )}
          {useDb && !loading && queues.length === 0 && !error && (
            <Card className="border-dashed"><CardContent className="py-10 text-center"><p className="text-sm text-muted-foreground">No active queues today. Queues appear here once patients book tokens or staff open a department.</p></CardContent></Card>
          )}
          <div className="space-y-3">
            {(useDb ? queues.map((q) => ({ id: q.id, name: q.department, current: q.current_token, total: q.total_tokens })) : departments.map((d) => ({ id: d.id, name: d.name, current: d.currentToken, total: d.patients.length }))).map((dept) => (
              <Card key={dept.id} className={`cursor-pointer transition-colors ${selectedQueue === dept.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedQueue(dept.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="font-medium">{dept.name}</p><p className="text-sm text-muted-foreground">{dept.total - dept.current} waiting</p></div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{dept.current}</Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {useDb ? (selected ? selected.department : "Select a Department") : (departments.find((d) => d.id === selectedQueue)?.name ?? "Select a Department")}
          </h2>
          {useDb && selected ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Walk-in patient name" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} />
                <Input placeholder="Phone (optional)" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} className="w-40" />
                <Button onClick={addWalkIn} disabled={actionBusy || !newPatientName.trim()} className="gap-2"><UserPlus className="h-4 w-4"/>Add</Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={callNext} disabled={actionBusy} className="flex-1 gap-2">
                  {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}Call Next
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Queue ({waiting.length})</h3>
                {waiting.map((t) => (
                  <div key={t.id} className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(t.status)}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${t.status === "called" ? "bg-blue-500 text-white" : "bg-muted"}`}>{t.token_number}</span>
                      <div><p className="font-medium">{displayName(t)}</p><p className="text-xs text-muted-foreground">Token #{t.token_number}</p></div>
                    </div>
                    <div className="flex gap-1">
                      {t.status === "waiting" && <Button size="sm" variant="ghost" disabled={actionBusy} onClick={() => void skipToken(t.id)}><SkipForward className="h-4 w-4"/></Button>}
                      {t.status === "called" && <Button size="sm" variant="ghost" className="text-green-600" disabled={actionBusy} onClick={() => void completeToken(t.id)}><CheckCircle className="h-4 w-4"/></Button>}
                    </div>
                  </div>
                ))}
                {waiting.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No patients in queue</p>}
              </div>
              {completed.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Completed Today ({completed.length})</h3>
                  {completed.slice(-3).map((t) => (
                    <div key={t.id} className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 flex items-center justify-between">
                      <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">{t.token_number}</span><p className="font-medium line-through text-muted-foreground">{displayName(t)}</p></div>
                      <CheckCircle className="h-5 w-5 text-green-500"/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !useDb && selectedQueue ? (
            <DemoQueuePanel
              departments={departments}
              selectedDept={selectedQueue}
              addPatientToQueue={addPatientToQueue}
              callNextPatient={demoCallNext}
              markPatientComplete={demoComplete}
              skipPatient={demoSkip}
              removePatient={demoRemove}
            />
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Select a department to manage its queue</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* Demo-mode panel: original behavior preserved verbatim. */
function DemoQueuePanel({ departments, selectedDept, addPatientToQueue, callNextPatient, markPatientComplete, skipPatient, removePatient }: {
  departments: ReturnType<typeof useHospitalStore.getState>["departments"];
  selectedDept: string;
  addPatientToQueue: (deptId: string, name: string) => void;
  callNextPatient: (deptId: string) => void;
  markPatientComplete: (deptId: string, patientId: string) => void;
  skipPatient: (deptId: string, patientId: string) => void;
  removePatient: (deptId: string, patientId: string) => void;
}) {
  const [newPatientName, setNewPatientName] = useState("");
  const selected = departments.find((d) => d.id === selectedDept);
  const waitingPatients = selected?.patients.filter((p) => p.status === "waiting" || p.status === "called") || [];
  const completedPatients = selected?.patients.filter((p) => p.status === "completed") || [];
  const handleAddPatient = () => { if (selectedDept && newPatientName.trim()) { addPatientToQueue(selectedDept, newPatientName.trim()); setNewPatientName(""); } };
  const getStatusColor = (status: string) => { if (status === "called") return "bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800"; if (status === "completed") return "bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800"; if (status === "skipped") return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"; return "bg-white dark:bg-gray-900 border-border"; };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Patient name" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPatient()}/>
        <Button onClick={handleAddPatient} className="gap-2"><UserPlus className="h-4 w-4"/>Add</Button>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => callNextPatient(selectedDept)} className="flex-1 gap-2"><Phone className="h-4 w-4"/>Call Next</Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Queue ({waitingPatients.length})</h3>
        {waitingPatients.map((p) => (
          <div key={p.id} className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(p.status)}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${p.status === "called" ? "bg-blue-500 text-white" : "bg-muted"}`}>{p.token}</span>
              <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">Token #{p.token}</p></div>
            </div>
            <div className="flex gap-1">
              {p.status === "waiting" && <Button size="sm" variant="ghost" onClick={() => skipPatient(selectedDept, p.id)}><SkipForward className="h-4 w-4"/></Button>}
              {p.status === "called" && <Button size="sm" variant="ghost" className="text-green-600" onClick={() => markPatientComplete(selectedDept, p.id)}><CheckCircle className="h-4 w-4"/></Button>}
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removePatient(selectedDept, p.id)}><XCircle className="h-4 w-4"/></Button>
            </div>
          </div>
        ))}
        {waitingPatients.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No patients in queue</p>}
      </div>
      {completedPatients.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium text-muted-foreground">Completed Today ({completedPatients.length})</h3>
          {completedPatients.slice(-3).map((p) => (
            <div key={p.id} className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">{p.token}</span><p className="font-medium line-through text-muted-foreground">{p.name}</p></div>
              <CheckCircle className="h-5 w-5 text-green-500"/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
