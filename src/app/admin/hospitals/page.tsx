"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Activity,
  Bed,
  Droplet,
} from "lucide-react";
import { demoHospitals, DISTRICTS, HospitalTier } from "@/data/hospitals";

export default function AdminHospitalsPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [escalatedHospitals, setEscalatedHospitals] = useState<string[]>([]);

  const filteredHospitals = demoHospitals.filter((h) => {
    if (selectedDistrict !== "All" && h.district !== selectedDistrict) return false;
    if (selectedTier !== "All" && h.tier !== selectedTier) return false;
    if (
      search &&
      !h.name.toLowerCase().includes(search.toLowerCase()) &&
      !h.address.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalBeds = filteredHospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const totalAvailableBeds = filteredHospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const icuFacilitiesCount = filteredHospitals.filter((h) => h.icuAvailable).length;
  const bloodBanksCount = filteredHospitals.filter((h) => h.bloodBankAvailable).length;

  const handleEscalate = (id: string) => {
    if (escalatedHospitals.includes(id)) {
      setEscalatedHospitals(escalatedHospitals.filter((item) => item !== id));
    } else {
      setEscalatedHospitals([...escalatedHospitals, id]);
    }
  };

  const tiers: HospitalTier[] = ["Medical College", "District Hospital", "SDH", "CHC", "PHC"];

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            District Hospital Network &amp; Facility Oversight
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time public health facility monitoring across Bihar health divisions
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{filteredHospitals.length}</p>
            <p className="text-xs text-muted-foreground">Monitored Facilities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bed className="h-6 w-6 mx-auto mb-1 text-emerald-600" />
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalAvailableBeds} / {totalBeds}
            </p>
            <p className="text-xs text-muted-foreground">Available / Total Beds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 mx-auto mb-1 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{icuFacilitiesCount}</p>
            <p className="text-xs text-muted-foreground">Active ICU Centers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Droplet className="h-6 w-6 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-500">{bloodBanksCount}</p>
            <p className="text-xs text-muted-foreground">Blood Storage Centers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Jurisdiction District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-xs font-semibold"
              >
                <option value="All">All Districts (State Overview)</option>
                {DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} District
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Facility Classification</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-md border bg-background text-xs font-semibold"
              >
                <option value="All">All Facility Tiers</option>
                {tiers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Facility Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search hospital or block..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hospitals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHospitals.map((hosp) => {
          const occupancyRate = Math.round(
            ((hosp.totalBeds - hosp.availableBeds) / Math.max(1, hosp.totalBeds)) * 100
          );
          const isCritical = occupancyRate > 85 || hosp.availableBeds < 5;
          const isEscalated = escalatedHospitals.includes(hosp.id);

          return (
            <Card
              key={hosp.id}
              className={`hover:shadow-md transition-all ${
                isEscalated
                  ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/20"
                  : isCritical
                  ? "border-red-300 dark:border-red-900"
                  : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base leading-snug">{hosp.name}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {hosp.locality}, {hosp.district}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {hosp.tier}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                {/* Bed Utilization Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Bed Occupancy:</span>
                    <span className={`font-bold ${isCritical ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                      {occupancyRate}% ({hosp.availableBeds} free of {hosp.totalBeds})
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        isCritical ? "bg-red-500" : occupancyRate > 60 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Capability Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hosp.emergencyAvailable && (
                    <Badge variant="outline" className="text-[10px] text-red-600 border-red-300 dark:border-red-800">
                      Emergency 24x7
                    </Badge>
                  )}
                  {hosp.icuAvailable && (
                    <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-300 dark:border-purple-800">
                      ICU Facility
                    </Badge>
                  )}
                  {hosp.bloodBankAvailable && (
                    <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300 dark:border-rose-800">
                      Blood Bank
                    </Badge>
                  )}
                </div>

                <div className="pt-2 border-t flex items-center justify-between gap-2">
                  <a href={`tel:${hosp.phone}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {hosp.phone}
                  </a>

                  <Button
                    size="sm"
                    variant={isEscalated ? "destructive" : "outline"}
                    className="text-[11px] h-7 px-2.5"
                    onClick={() => handleEscalate(hosp.id)}
                  >
                    {isEscalated ? "Escalation Active" : "Escalate Resources"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
