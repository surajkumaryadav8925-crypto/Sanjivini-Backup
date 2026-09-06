"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalStore } from "@/stores";
import { Pill, Search, Plus, Edit2, Trash2, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
export default function InventoryPage() {
  const { inventory, addInventoryItem, updateInventoryItem, removeInventoryItem } = useHospitalStore();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: "", category: "Medicines", currentStock: 0, minRequired: 10, status: "available" as const });
  const categories = ["all", ...new Set(inventory.map(i => i.category))];
  const filtered = useMemo(() => inventory.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || i.category === filterCategory;
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  }), [inventory, search, filterCategory, filterStatus]);
  const stats = { total: inventory.length, available: inventory.filter(i => i.status === "available").length, low: inventory.filter(i => i.status === "low_stock").length, out: inventory.filter(i => i.status === "out_of_stock").length };
  const handleAdd = () => { addInventoryItem({...newItem, lastUpdated: new Date().toISOString()}); setNewItem({ name: "", category: "Medicines", currentStock: 0, minRequired: 10, status: "available" }); setShowAdd(false); };
  const handleSave = () => { if (editItem) { const item = inventory.find(i => i.id === editItem); if (item) updateInventoryItem(editItem, item); setEditItem(null); } };
  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">Inventory Management</h1><p className="text-sm text-muted-foreground mt-1">Manage hospital inventory and supplies</p></div><Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4"/>Add Item</Button></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><Pill className="h-8 w-8 mx-auto mb-2 text-blue-500"/><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500"/><p className="text-2xl font-bold text-emerald-600">{stats.available}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500"/><p className="text-2xl font-bold text-amber-600">{stats.low}</p><p className="text-xs text-muted-foreground">Low Stock</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><XCircle className="h-8 w-8 mx-auto mb-2 text-red-500"/><p className="text-2xl font-bold text-red-600">{stats.out}</p><p className="text-xs text-muted-foreground">Out of Stock</p></CardContent></Card>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9"/></div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="all">All Categories</option>{categories.filter(c => c !== "all").map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="all">All Status</option><option value="available">Available</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option></select>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-medium">Item</th><th className="text-left p-3 font-medium">Category</th><th className="text-center p-3 font-medium">Stock</th><th className="text-center p-3 font-medium">Min Required</th><th className="text-center p-3 font-medium">Status</th><th className="text-right p-3 font-medium">Actions</th></tr></thead>
              <tbody>{filtered.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-muted-foreground">{item.category}</td>
                  <td className="p-3 text-center"><span className={item.status === "out_of_stock" ? "text-red-600 font-bold" : item.status === "low_stock" ? "text-amber-600 font-bold" : ""}>{item.currentStock}</span></td>
                  <td className="p-3 text-center text-muted-foreground">{item.minRequired}</td>
                  <td className="p-3 text-center"><Badge variant={item.status === "available" ? "secondary" : item.status === "low_stock" ? "warning" : "destructive"}>{item.status === "available" ? "Available" : item.status === "low_stock" ? "Low Stock" : "Out of Stock"}</Badge></td>
                  <td className="p-3 text-right"><div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditItem(item.id); }}>
                      <Edit2 className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeInventoryItem(item.id)}>
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No items found</div>}
          </div>
        </CardContent>
      </Card>
      {showAdd && (
        <Dialog open onOpenChange={() => setShowAdd(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><label className="text-sm font-medium">Name</label><Input value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))} placeholder="Item name"/></div>
              <div><label className="text-sm font-medium">Category</label>
                <select value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option>Medicines</option><option>Emergency Medicines</option><option>Medical Supplies</option><option>PPE</option><option>Equipment</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Current Stock</label><Input type="number" value={newItem.currentStock} onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}/></div>
                <div><label className="text-sm font-medium">Min Required</label><Input type="number" value={newItem.minRequired} onChange={(e) => setNewItem(prev => ({ ...prev, minRequired: parseInt(e.target.value) || 0 }))}/></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {editItem && (
        <Dialog open onOpenChange={() => setEditItem(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Inventory Item</DialogTitle></DialogHeader>
            {(() => { const item = inventory.find(i => i.id === editItem); if (!item) return null; return (
              <div className="space-y-4 py-4">
                <div><label className="text-sm font-medium">Name</label><Input value={item.name} onChange={(e) => updateInventoryItem(editItem, { name: e.target.value })}/></div>
                <div><label className="text-sm font-medium">Current Stock</label><Input type="number" value={item.currentStock} onChange={(e) => updateInventoryItem(editItem, { currentStock: parseInt(e.target.value) || 0 })}/></div>
                <div><label className="text-sm font-medium">Min Required</label><Input type="number" value={item.minRequired} onChange={(e) => updateInventoryItem(editItem, { minRequired: parseInt(e.target.value) || 0 })}/></div>
              </div>
            ); })()}
            <DialogFooter><Button variant="outline" onClick={() => setEditItem(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
