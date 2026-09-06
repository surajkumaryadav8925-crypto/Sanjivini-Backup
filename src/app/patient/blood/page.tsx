"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Droplet, Search, Phone, MapPin, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DEMO_BLOOD_DATA = [
  { hospital: "JNMCH Blood Bank", address: "Indira Nagar, Bhagalpur", aPos: 15, bPos: 20, oPos: 8, abPos: 5, aNeg: 3, bNeg: 4, oNeg: 2, abNeg: 1 },
  { hospital: "District Hospital Blood Bank", address: "Nathnagar, Bhagalpur", aPos: 12, bPos: 18, oPos: 10, abPos: 4, aNeg: 2, bNeg: 3, oNeg: 1, abNeg: 0 },
  { hospital: "Narayanpur PHC", address: "Narayanpur, Bhagalpur", aPos: 5, bPos: 8, oPos: 6, abPos: 2, aNeg: 1, bNeg: 2, oNeg: 3, abNeg: 0 },
];

export default function BloodPage() {
  const { t } = useTranslation();
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [search, setSearch] = useState("");
  const instructions = `${t("patient.blood.title")}. ${t("patient.blood.selectBloodGroup")} ${t("patient.blood.demoDataNotice")}`;
  const getUnits = (bank: typeof DEMO_BLOOD_DATA[0]) => { if (!selectedGroup) return bank.aPos + bank.bPos + bank.oPos + bank.abPos; const map: Record<string, number> = { "A+": bank.aPos, "A-": bank.aNeg, "B+": bank.bPos, "B-": bank.bNeg, "O+": bank.oPos, "O-": bank.oNeg, "AB+": bank.abPos, "AB-": bank.abNeg }; return map[selectedGroup] ?? 0; };
  const filteredBanks = DEMO_BLOOD_DATA.filter(b => b.hospital.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-bold">{t("patient.blood.title")}</h1>
        <SpeakButton text={instructions} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><AlertCircle className="h-4 w-4" /><span>{t("patient.blood.demoDataNotice")}</span></div>
      <div className="mb-4"><p className="text-sm font-medium mb-2">{t("patient.blood.selectBloodGroup")}</p><div className="flex flex-wrap gap-2">{BLOOD_GROUPS.map(g => <Button key={g} variant={selectedGroup === g ? "default" : "outline"} size="sm" onClick={() => setSelectedGroup(selectedGroup === g ? "" : g)} className={selectedGroup === g ? "bg-red-500" : ""}>{g}</Button>)}</div></div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t("patient.blood.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      {selectedGroup && <Badge variant="destructive" className="mb-4">{t("patient.blood.showingAvailability")} {selectedGroup}</Badge>}
      <div className="space-y-4">{filteredBanks.map((bank, i) => {
        const units = getUnits(bank);
        return <Card key={i} className={units > 0 ? "border-emerald-200" : "border-red-200"}><CardHeader><CardTitle className="flex justify-between items-center text-lg"><span className="flex items-center gap-2"><Droplet className="h-5 w-5 text-red-500" />{bank.hospital}</span><Badge variant={units > 0 ? "success" : "destructive"}>{units > 0 ? `${units} ${t("patient.blood.units")}` : t("patient.blood.notAvailable")}</Badge></CardTitle><p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{bank.address}</p></CardHeader><CardContent><div className="grid grid-cols-4 gap-2 mb-3">{BLOOD_GROUPS.slice(0, 4).map(g => { const m: Record<string, number> = { "A+": bank.aPos, "B+": bank.bPos, "O+": bank.oPos, "AB+": bank.abPos }; return <div key={g} className="text-center p-2 bg-muted rounded"><p className="text-xs text-muted-foreground">{g}</p><p className="font-bold">{m[g]}</p></div>; })}</div><a href="tel:+919876543210" className="block"><Button variant="outline" className="w-full gap-2"><Phone className="h-4 w-4" />{t("patient.blood.requestBlood")}</Button></a></CardContent></Card>;
      })}</div>
    </div>
  );
}
