"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Pill, Search, Phone, Navigation, AlertCircle, X, CheckCircle } from "lucide-react";
import { demoMedicines, searchMedicines, getMedicineAvailability } from "@/data/medicines";
import { BHAGALPUR_LOCATION } from "@/data/hospitals";
import { useTranslation } from "@/hooks/useTranslation";

export default function MedicinesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [facilityFilter, setFacilityFilter] = useState<string>("all");
  const [distanceFilter, setDistanceFilter] = useState<number>(50);

  const medicines = useMemo(() => searchMedicines(searchQuery), [searchQuery]);
  const selectedMedData = useMemo(() => demoMedicines.find(m => m.id === selectedMedicine), [selectedMedicine]);
  const availability = useMemo(() => {
    if (!selectedMedicine) return [];
    let results = getMedicineAvailability(selectedMedicine, BHAGALPUR_LOCATION.latitude, BHAGALPUR_LOCATION.longitude);
    if (availabilityFilter !== "all") results = results.filter(a => a.status === availabilityFilter);
    if (facilityFilter !== "all") results = results.filter(a => a.facility.type.includes(facilityFilter));
    results = results.filter(a => (a.distance || 0) <= distanceFilter);
    return results;
  }, [selectedMedicine, availabilityFilter, facilityFilter, distanceFilter]);

  const introText = t("medicines.title") + ". " + t("medicines.intro");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available": return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />{t("common.available")}</Badge>;
      case "low_stock": return <Badge variant="warning" className="gap-1"><AlertCircle className="h-3 w-3" />{t("medicines.lowStock")}</Badge>;
      case "out_of_stock": return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />{t("common.unavailable")}</Badge>;
      default: return null;
    }
  };

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pill className="h-5 w-5" aria-hidden />
            </span>
            {t("medicines.medicineDesk")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t("medicines.intro")} · {BHAGALPUR_LOCATION.name}, {BHAGALPUR_LOCATION.state}</p>
        </div>
        <SpeakButton text={introText} />
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder={t("medicines.searchPlaceholder")} 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="pl-10" 
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <select aria-label={t("medicines.allAvailability")} value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)} className="min-h-[38px] rounded-lg border bg-background px-3 text-sm">
          <option value="all">{t("medicines.allAvailability")}</option>
          <option value="available">{t("common.available")}</option>
          <option value="low_stock">{t("medicines.lowStock")}</option>
          <option value="out_of_stock">{t("common.unavailable")}</option>
        </select>
        <select aria-label={t("medicines.allFacilities")} value={facilityFilter} onChange={e => setFacilityFilter(e.target.value)} className="min-h-[38px] rounded-lg border bg-background px-3 text-sm">
          <option value="all">{t("medicines.allFacilities")}</option>
          <option value="government">{t("patient.hospitals.government")}</option>
          <option value="private">{t("patient.hospitals.private")}</option>
        </select>
        <select aria-label={t("medicines.within50km")} value={distanceFilter} onChange={e => setDistanceFilter(Number(e.target.value))} className="min-h-[38px] rounded-lg border bg-background px-3 text-sm">
          <option value="10">{t("medicines.within10km")}</option>
          <option value="25">{t("medicines.within25km")}</option>
          <option value="50">{t("medicines.within50km")}</option>
        </select>
      </div>

      {selectedMedicine && selectedMedData && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Pill className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{selectedMedData.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedMedData.genericName}</p>
                  <Badge variant="secondary" className="mt-1">{selectedMedData.category}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMedicine(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium mb-2">{t("medicines.commonUses")}</h3>
                <div className="flex flex-wrap gap-2">{selectedMedData.commonUses.map((use, i) => <Badge key={i} variant="outline">{use}</Badge>)}</div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">{t("medicines.availability")}</h3>
                {availability.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("common.noResults")}</p>
                ) : (
                  <div className="space-y-2">
                    {availability.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{item.facility.name}</p>
                          <p className="text-xs text-muted-foreground">{item.distance?.toFixed(1)} {t("patient.hospitals.kmAway")} - {item.quantity} {t("medicines.units")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          <a href={`tel:+${item.facility.phone}`}>
                            <Button variant="outline" size="sm"><Phone className="h-3 w-3" /></Button>
                          </a>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${item.facility.latitude},${item.facility.longitude}`} target="_blank" rel="noopener">
                            <Button variant="outline" size="sm"><Navigation className="h-3 w-3" /></Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {medicines.map(med => (
          <Card key={med.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMedicine(med.id)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Pill className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{med.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{med.genericName}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">{med.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {medicines.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Pill className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <p className="font-medium">{t("medicines.noResults")}</p>
          <p className="text-sm text-muted-foreground">{t("medicines.searchPlaceholder")}</p>
        </div>
      )}
    </div>
  );
}
