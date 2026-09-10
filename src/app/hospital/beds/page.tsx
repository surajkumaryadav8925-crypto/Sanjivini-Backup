"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalStore } from "@/stores";
import { Bed, Users, AlertTriangle, Wrench, Plus, Minus, Edit2 } from "lucide-react";

type WardBedField = 'totalBeds' | 'availableBeds' | 'occupiedBeds' | 'reservedBeds' | 'outOfService';

export default function BedsPage() {
  const { wards, updateWardBed } = useHospitalStore();
  const [editWard, setEditWard] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Record<WardBedField, number>>>({});
  const totalBeds = wards.reduce((sum, w) => sum + w.totalBeds, 0);
  const totalAvailable = wards.reduce((sum, w) => sum + w.availableBeds, 0);
  const totalOccupied = wards.reduce((sum, w) => sum + w.occupiedBeds, 0);
  const totalReserved = wards.reduce((sum, w) => sum + w.reservedBeds, 0);
  const totalOutOfService = wards.reduce((sum, w) => sum + w.outOfService, 0);
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
  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">Bed Management</h1><p className="text-sm text-muted-foreground mt-1">Manage hospital bed availability and status</p></div></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card><CardContent className="p-4 text-center"><Bed className="h-8 w-8 mx-auto mb-2 text-blue-500"/><p className="text-2xl font-bold">{totalBeds}</p><p className="text-xs text-muted-foreground">Total Beds</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-emerald-500"/><p className="text-2xl font-bold text-emerald-600">{totalAvailable}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500"/><p className="text-2xl font-bold text-orange-600">{totalOccupied}</p><p className="text-xs text-muted-foreground">Occupied</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-purple-500"/><p className="text-2xl font-bold text-purple-600">{totalReserved}</p><p className="text-xs text-muted-foreground">Reserved</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Wrench className="h-8 w-8 mx-auto mb-2 text-red-500"/><p className="text-2xl font-bold text-red-600">{totalOutOfService}</p><p className="text-xs text-muted-foreground">Out of Service</p></CardContent></Card>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wards.map((ward) => (
          <Card key={ward.id}>
            <CardHeader className="pb-3"><CardTitle className="flex items-center justify-between text-lg"><span>{ward.name}</span><Button variant="ghost" size="icon" onClick={() => openEdit(ward)}><Edit2 className="h-4 w-4"/></Button></CardTitle></CardHeader>
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
      {editWard && (
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
                    <Input className="w-16 text-center h-8" type="number" value={editData[field.key] || 0} onChange={(e) => setEditData(prev => ({ ...prev, [field.key]: parseInt(e.target.value) || 0 }))}/>
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
