"use client";
import{Card,CardContent,CardHeader,CardTitle,Button,Badge}from"@/components/ui";
import{useAuthStore,useOfflineStore,useHospitalStore}from"@/stores";
import Link from"next/link";
import{Bed,Pill,Droplet,Calendar,AlertTriangle,WifiOff,CheckCircle}from"lucide-react";
export default function HospitalDashboard(){
const{profile}=useAuthStore();const{isOnline,pendingOperations}=useOfflineStore();const{wards,inventory,bloodGroups,departments}=useHospitalStore();
const pc=pendingOperations.filter(o=>o.status==='pending').length;
const tb=wards.reduce((s,w)=>s+w.totalBeds,0);const ab=wards.reduce((s,w)=>s+w.availableBeds,0);
const ib=wards.find(w=>w.id==='icu')?.availableBeds||0;const ls=inventory.filter(i=>i.status==='low_stock').length;
const ts=bloodGroups.reduce((s,bg)=>s+bg.available,0);
const ap=bloodGroups.find(bg=>bg.group==='A+')?.available||0;const bp=bloodGroups.find(bg=>bg.group==='B+')?.available||0;
const wc=departments.reduce((s,d)=>s+d.patients.filter(p=>p.status==='waiting'||p.status==='called').length,0);
const offlineText=pc>0?'Offline ('+pc+')':'Offline';
return(<div className="container px-4 py-6 max-w-6xl mx-auto">
<div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">Hospital Dashboard</h1><p className="text-muted-foreground">{profile?.full_name||"Admin"}</p></div>
{!isOnline?<Badge variant="warning"><WifiOff className="h-3 w-3 mr-1"/>{offlineText}</Badge>:<Badge variant="success"><CheckCircle className="h-3 w-3 mr-1"/>Online</Badge>}</div>
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
<Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Beds</p><p className="text-2xl font-bold text-blue-600">{tb}</p><p className="text-xs text-muted-foreground">{ab} available</p></CardContent></Card>
<Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">ICU Beds</p><p className="text-2xl font-bold text-red-600">{ib}</p><p className="text-xs text-muted-foreground">available</p></CardContent></Card>
<Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Medicines</p><p className="text-2xl font-bold text-emerald-600">{inventory.length}</p><p className="text-xs text-muted-foreground">{ls} alerts</p></CardContent></Card>
<Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Blood Units</p><p className="text-2xl font-bold text-rose-600">{ts}</p><p className="text-xs text-muted-foreground">A+: {ap}, B+: {bp}</p></CardContent></Card>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
<Link href="/hospital/beds"><Card className="hover:shadow-md cursor-pointer text-center"><CardContent className="p-4"><div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center mx-auto mb-2"><Bed className="h-6 w-6 text-white"/></div><p className="font-medium text-sm">Beds</p></CardContent></Card></Link>
<Link href="/hospital/inventory"><Card className="hover:shadow-md cursor-pointer text-center"><CardContent className="p-4"><div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto mb-2"><Pill className="h-6 w-6 text-white"/></div><p className="font-medium text-sm">Inventory</p></CardContent></Card></Link>
<Link href="/hospital/blood"><Card className="hover:shadow-md cursor-pointer text-center"><CardContent className="p-4"><div className="h-12 w-12 rounded-xl bg-rose-500 flex items-center justify-center mx-auto mb-2"><Droplet className="h-6 w-6 text-white"/></div><p className="font-medium text-sm">Blood</p></CardContent></Card></Link>
<Link href="/hospital/opd"><Card className="hover:shadow-md cursor-pointer text-center"><CardContent className="p-4"><div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center mx-auto mb-2"><Calendar className="h-6 w-6 text-white"/></div><p className="font-medium text-sm">OPD</p></CardContent></Card></Link>
</div>
<div className="grid lg:grid-cols-2 gap-6">
<Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500"/>Alerts</CardTitle></CardHeader><CardContent className="space-y-2">
{bloodGroups.filter(bg=>bg.available<5).map(bg=><div key={bg.group} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"><span className="text-sm">Blood {bg.group} critically low</span><Badge variant="destructive">Critical</Badge></div>)}
{ls>0?<div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800"><span className="text-sm">{ls} items low stock</span><Badge variant="warning">Warning</Badge></div>:null}
{bloodGroups.filter(bg=>bg.available<5).length===0&&ls===0?<p className="text-sm text-muted-foreground text-center py-4">No alerts</p>:null}
</CardContent></Card>
<Card><CardHeader><CardTitle>OPD Queue</CardTitle></CardHeader><CardContent className="space-y-3">
<div className="flex items-center justify-between p-3 bg-muted rounded-lg"><div><p className="font-medium">Total Waiting</p><p className="text-sm text-muted-foreground">{wc} patients</p></div><Link href="/hospital/opd"><Button size="sm">Manage</Button></Link></div>
{departments.slice(0,2).map(d=>{const w=d.patients.filter(p=>p.status==='waiting'||p.status==='called').length;return <div key={d.id} className="flex items-center justify-between p-3 bg-muted rounded-lg"><div><p className="font-medium">{d.name}</p><p className="text-sm text-muted-foreground">{w} waiting</p></div><Link href="/hospital/opd"><Button size="sm" variant="outline">Manage</Button></Link></div>;})}
</CardContent></Card>
</div></div>);}
