"use client";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Alert, AlertDescription } from "@/components/ui";
import { ArrowLeft, Building2, MapPin, Phone, Clock, Heart, CheckCircle, Navigation, Calendar } from "lucide-react";
import { demoHospitals, BHAGALPUR_LOCATION, calculateDistance } from "@/data/hospitals";

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const hospital = demoHospitals.find(h => h.id === id);
  if (!hospital) return (<div className="container px-4 py-12 text-center"><h1 className="text-2xl font-bold mb-4">Hospital Not Found</h1><Link href="/patient/hospitals"><Button><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link></div>);
  const distance = calculateDistance(BHAGALPUR_LOCATION.latitude, BHAGALPUR_LOCATION.longitude, hospital.latitude, hospital.longitude);
  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
      <div className="space-y-6">
        <Card><CardHeader><div className="flex justify-between items-start"><div><CardTitle className="text-xl flex items-center gap-2"><Building2 className="h-5 w-5" />{hospital.name}</CardTitle><p className="text-muted-foreground mt-1">{hospital.locality}</p></div><Badge variant={hospital.type === "Government" ? "info" : "success"}>{hospital.type}</Badge></div></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-4 text-sm text-muted-foreground"><div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{hospital.address}</div><div className="flex items-center gap-1"><Navigation className="h-4 w-4" />{distance.toFixed(1)} km</div><div className="flex items-center gap-1"><Clock className="h-4 w-4" />{hospital.openingHours}</div></div><div className="flex gap-2"><a href={`tel:${hospital.phone}`} className="flex-1"><Button variant="outline" className="w-full gap-2"><Phone className="h-4 w-4" />Call</Button></a><a href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`} target="_blank" rel="noopener" className="flex-1"><Button variant="outline" className="w-full gap-2"><Navigation className="h-4 w-4" />Directions</Button></a><Link href="/patient/opd" className="flex-1"><Button className="w-full gap-2"><Calendar className="h-4 w-4" />Book OPD</Button></Link></div></CardContent></Card>
        {hospital.emergencyAvailable && <Alert variant="destructive" className="bg-red-50 border-red-200"><Heart className="h-4 w-4" /><AlertDescription><strong>Emergency Services Available 24x7</strong></AlertDescription></Alert>}
        <Card><CardHeader><CardTitle>Departments</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{hospital.departments.map(d => <div key={d.id} className={`flex items-center gap-2 p-2 rounded-lg ${d.available ? "bg-emerald-50" : "bg-gray-50 opacity-50"}`}>{d.available ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <span>✗</span>}<span className="text-sm">{d.name}</span></div>)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Available Doctors</CardTitle></CardHeader><CardContent className="space-y-3">{hospital.doctors.map(doc => <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg"><div><p className="font-medium">{doc.name}</p><p className="text-sm text-muted-foreground">{doc.specialty} • {doc.qualification}</p><p className="text-xs text-muted-foreground">{doc.schedule}</p></div><Badge variant={doc.available ? "success" : "secondary"}>{doc.available ? "Available" : "Unavailable"}</Badge></div>)}</CardContent></Card>
      </div>
    </div>
  );
}