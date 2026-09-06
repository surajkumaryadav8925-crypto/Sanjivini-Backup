"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { useHospitalStore } from "@/stores";
import { Droplet, Plus, Minus, Edit2, AlertTriangle } from "lucide-react";
export default function BloodBankPage() {
  const { bloodGroups, updateBloodGroup } = useHospitalStore();
  const [editGroup, setEditGroup] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ available: number; reserved: number }>({ available: 0, reserved: 0 });
  const totalUnits = bloodGroups.reduce((sum, bg) => sum + bg.available + bg.reserved, 0);
  const totalAvailable = bloodGroups.reduce((sum, bg) => sum + bg.available, 0);
  const totalReserved = bloodGroups.reduce((sum, bg) => sum + bg.reserved, 0);
  const criticalGroups = bloodGroups.filter(bg => bg.available < 5);
  const openEdit = (bg: typeof bloodGroups[0]) => { setEditGroup(bg.group); setEditData({ available: bg.available, reserved: bg.reserved }); };
  const saveEdit = () => { if (editGroup) { updateBloodGroup(editGroup, "available", editData.available); updateBloodGroup(editGroup, "reserved", editData.reserved); setEditGroup(null); } };
  const adjust = (field: "available" | "reserved", delta: number) => { setEditData(prev => ({ ...prev, [field]: Math.max(0, prev[field] + delta) })); };
  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">Blood Bank Management</h1><p className="text-sm text-muted-foreground mt-1">Manage blood inventory and reservations</p></div></div>
      {criticalGroups.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20"><CardContent className="flex items-center gap-3 py-3"><AlertTriangle className="h-5 w-5 text-red-500"/><span className="text-sm font-medium text-red-700 dark:text-red-300">Critical: {criticalGroups.map(bg => bg.group).join(", ")} blood groups are below safe levels</span></CardContent></Card>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="p-4 text-center"><Droplet className="h-8 w-8 mx-auto mb-2 text-red-500"/><p className="text-2xl font-bold">{totalUnits}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Droplet className="h-8 w-8 mx-auto mb-2 text-emerald-500"/><p className="text-2xl font-bold text-emerald-600">{totalAvailable}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Droplet className="h-8 w-8 mx-auto mb-2 text-purple-500"/><p className="text-2xl font-bold text-purple-600">{totalReserved}</p><p className="text-xs text-muted-foreground">Reserved</p></CardContent></Card>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bloodGroups.map((bg) => (
          <Card key={bg.group} className={bg.available < 5 ? "border-red-300 dark:border-red-800" : ""}>
            <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between"><span className="text-2xl font-bold">{bg.group}</span><Button variant="ghost" size="icon" onClick={() => openEdit(bg)}><Edit2 className="h-4 w-4"/></Button></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <p className="text-4xl font-bold text-red-600">{bg.available}</p><p className="text-sm text-muted-foreground">Available</p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{bg.reserved}</p><p className="text-xs text-muted-foreground">Reserved</p>
              </div>
              {bg.available < 5 && <Badge variant="destructive" className="w-full justify-center">Low Stock Warning</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
      {editGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative z-50 w-full max-w-md rounded-xl bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit {editGroup} Blood Group</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Available Units</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjust("available", -1)}><Minus className="h-4 w-4"/></Button>
                  <Input className="w-20 text-center" type="number" value={editData.available} onChange={(e) => setEditData(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}/>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjust("available", 1)}><Plus className="h-4 w-4"/></Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Reserved Units</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjust("reserved", -1)}><Minus className="h-4 w-4"/></Button>
                  <Input className="w-20 text-center" type="number" value={editData.reserved} onChange={(e) => setEditData(prev => ({ ...prev, reserved: parseInt(e.target.value) || 0 }))}/>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => adjust("reserved", 1)}><Plus className="h-4 w-4"/></Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditGroup(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
