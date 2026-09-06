"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { useHospitalStore } from "@/stores";
import { Calendar, Users, UserPlus, Phone, CheckCircle, XCircle, SkipForward, ChevronRight } from "lucide-react";
export default function OPDQueuePage() {
  const { departments, addPatientToQueue, callNextPatient, markPatientComplete, skipPatient, removePatient } = useHospitalStore();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [newPatientName, setNewPatientName] = useState("");
  const totalWaiting = departments.reduce((sum, d) => sum + d.patients.filter(p => p.status === "waiting" || p.status === "called").length, 0);
  const busyDepts = departments.filter(d => d.patients.some(p => p.status === "called")).length;
  const selected = departments.find(d => d.id === selectedDept);
  const waitingPatients = selected?.patients.filter(p => p.status === "waiting" || p.status === "called") || [];
  const completedPatients = selected?.patients.filter(p => p.status === "completed") || [];
  const handleAddPatient = () => { if (selectedDept && newPatientName.trim()) { addPatientToQueue(selectedDept, newPatientName.trim()); setNewPatientName(""); } };
  const getStatusColor = (status: string) => { if (status === "called") return "bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800"; if (status === "completed") return "bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800"; if (status === "skipped") return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"; return "bg-white dark:bg-gray-900 border-border"; };
  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">OPD Queue Management</h1><p className="text-sm text-muted-foreground mt-1">Manage outpatient department queues</p></div></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="p-4 text-center"><Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500"/><p className="text-2xl font-bold">{departments.length}</p><p className="text-xs text-muted-foreground">Departments</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-amber-500"/><p className="text-2xl font-bold text-amber-600">{totalWaiting}</p><p className="text-xs text-muted-foreground">Total Waiting</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Calendar className="h-8 w-8 mx-auto mb-2 text-emerald-500"/><p className="text-2xl font-bold text-emerald-600">{busyDepts}</p><p className="text-xs text-muted-foreground">Busy Now</p></CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Departments</h2>
          <div className="space-y-3">
            {departments.map((dept) => {
              const waiting = dept.patients.filter(p => p.status === "waiting" || p.status === "called").length;
              const called = dept.patients.some(p => p.status === "called");
              return (
                <Card key={dept.id} className={`cursor-pointer transition-colors ${selectedDept === dept.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedDept(dept.id)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div><p className="font-medium">{dept.name}</p><p className="text-sm text-muted-foreground">{waiting} waiting</p></div>
                    <div className="flex items-center gap-3">
                      {called && <Badge variant="default" className="bg-blue-500">Busy</Badge>}
                      <Badge variant="secondary">{dept.currentToken}</Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">{selected ? selected.name : "Select a Department"}</h2>
          {selected ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Patient name" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPatient()}/>
                <Button onClick={handleAddPatient} className="gap-2"><UserPlus className="h-4 w-4"/>Add</Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => callNextPatient(selected.id)} className="flex-1 gap-2"><Phone className="h-4 w-4"/>Call Next</Button>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Queue ({waitingPatients.length})</h3>
                {waitingPatients.map((p, idx) => (
                  <div key={p.id} className={`p-3 rounded-lg border flex items-center justify-between ${getStatusColor(p.status)}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${p.status === "called" ? "bg-blue-500 text-white" : "bg-muted"}`}>{p.token}</span>
                      <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">Token #{p.token}</p></div>
                    </div>
                    <div className="flex gap-1">
                      {p.status === "waiting" && <Button size="sm" variant="ghost" onClick={() => skipPatient(selected.id, p.id)}><SkipForward className="h-4 w-4"/></Button>}
                      {p.status === "called" && <Button size="sm" variant="ghost" className="text-green-600" onClick={() => markPatientComplete(selected.id, p.id)}><CheckCircle className="h-4 w-4"/></Button>}
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removePatient(selected.id, p.id)}><XCircle className="h-4 w-4"/></Button>
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
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Select a department to manage its queue</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
