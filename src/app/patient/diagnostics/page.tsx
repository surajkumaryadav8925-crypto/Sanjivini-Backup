"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { Microscope, Search, MapPin, Phone, Navigation, Clock, AlertCircle, FlaskConical, Building2, Filter } from "lucide-react";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { useTranslation } from "@/hooks/useTranslation";

// Demo diagnostic data
export interface DiagnosticTest { id: string; name: string; category: string; description: string; }
export interface DiagnosticFacility { id: string; name: string; type: string; address: string; phone: string; latitude: number; longitude: number; operatingHours: string; }
export interface DiagnosticAvailability { testId: string; facilityId: string; status: "available" | "limited" | "unavailable"; price?: string; }

const diagnosticTests: DiagnosticTest[] = [
  { id: "d1", name: "Complete Blood Count (CBC)", category: "Blood Tests", description: "Checks important components of your blood, such as red cells and white cells." },
  { id: "d2", name: "Blood Sugar (Fasting/PP)", category: "Blood Tests", description: "Measures your blood sugar level." },
  { id: "d3", name: "Thyroid Profile (T3, T4, TSH)", category: "Blood Tests", description: "Checks how well your thyroid gland is working." },
  { id: "d4", name: "Lipid Profile", category: "Blood Tests", description: "Measures cholesterol and other fats in your blood." },
  { id: "d5", name: "Liver Function Test (LFT)", category: "Blood Tests", description: "Checks how well your liver is functioning." },
  { id: "d6", name: "Kidney Function Test (KFT)", category: "Blood Tests", description: "Checks how well your kidneys are functioning." },
  { id: "d7", name: "X-Ray Chest PA", category: "Imaging", description: "Creates an image of your chest and lungs." },
  { id: "d8", name: "X-Ray - Other", category: "Imaging", description: "Used to examine bones and other parts of the body." },
  { id: "d9", name: "Ultrasound (USG)", category: "Imaging", description: "Uses sound waves to examine internal organs." },
  { id: "d10", name: "ECG", category: "Cardiology", description: "Checks the electrical activity and rhythm of your heart." },
  { id: "d11", name: "2D Echocardiography", category: "Cardiology", description: "Uses ultrasound to examine the structure and function of your heart." },
  { id: "d12", name: "MRI Scan", category: "Imaging", description: "Creates detailed images of organs and tissues inside the body." },
  { id: "d13", name: "CT Scan", category: "Imaging", description: "Creates detailed cross-sectional images of the inside of your body." },
  { id: "d14", name: "Urine Routine", category: "Urine Tests", description: "Checks your urine for signs of infection or other health conditions." },
  { id: "d15", name: "Stool Routine", category: "Urine Tests", description: "Examines a stool sample for signs of digestive or intestinal problems." },
];

const diagnosticFacilities: DiagnosticFacility[] = [
  { id: "f1", name: "District Hospital Diagnostic Center", type: "Government Hospital", address: "Main Road, Near Bus Stand", phone: "9876543210", latitude: 25.2457, longitude: 86.9918, operatingHours: "8:00 AM - 8:00 PM" },
  { id: "f2", name: "PHC Badh Bazar", type: "PHC", address: "Badh Bazar, NH-80", phone: "9876543211", latitude: 25.2550, longitude: 86.9850, operatingHours: "9:00 AM - 5:00 PM" },
  { id: "f3", name: "City Diagnostic Lab", type: "Private Lab", address: "Station Road", phone: "9876543212", latitude: 25.2400, longitude: 86.9900, operatingHours: "7:00 AM - 9:00 PM" },
  { id: "f4", name: "Medicare Pathology", type: "Private Lab", address: "Gandhi Chowk", phone: "9876543213", latitude: 25.2480, longitude: 86.9880, operatingHours: "8:00 AM - 6:00 PM" },
  { id: "f5", name: "Sub-District Hospital", type: "Government Hospital", address: "Railway Station Road", phone: "9876543214", latitude: 25.2520, longitude: 86.9940, operatingHours: "24x7" },
  { id: "f6", name: "Health Point Diagnostics", type: "Private Lab", address: "College Road", phone: "9876543215", latitude: 25.2380, longitude: 86.9870, operatingHours: "8:00 AM - 8:00 PM" },
];

const diagnosticAvailability: DiagnosticAvailability[] = [
  { testId: "d1", facilityId: "f1", status: "available", price: "" },
  { testId: "d1", facilityId: "f2", status: "available", price: "" },
  { testId: "d1", facilityId: "f3", status: "available", price: "\u20B9300" },
  { testId: "d1", facilityId: "f4", status: "available", price: "\u20B9250" },
  { testId: "d1", facilityId: "f5", status: "available", price: "" },
  { testId: "d1", facilityId: "f6", status: "available", price: "\u20B9280" },
  { testId: "d2", facilityId: "f1", status: "available", price: "" },
  { testId: "d2", facilityId: "f2", status: "limited", price: "" },
  { testId: "d2", facilityId: "f3", status: "available", price: "\u20B9120" },
  { testId: "d2", facilityId: "f4", status: "available", price: "\u20B9100" },
  { testId: "d2", facilityId: "f5", status: "available", price: "" },
  { testId: "d2", facilityId: "f6", status: "available", price: "\u20B9110" },
  { testId: "d3", facilityId: "f1", status: "limited", price: "" },
  { testId: "d3", facilityId: "f3", status: "available", price: "\u20B9550" },
  { testId: "d3", facilityId: "f4", status: "available", price: "\u20B9500" },
  { testId: "d3", facilityId: "f6", status: "available", price: "\u20B9480" },
  { testId: "d4", facilityId: "f1", status: "available", price: "" },
  { testId: "d4", facilityId: "f3", status: "available", price: "\u20B9400" },
  { testId: "d4", facilityId: "f4", status: "available", price: "\u20B9350" },
  { testId: "d4", facilityId: "f6", status: "available", price: "\u20B9380" },
  { testId: "d5", facilityId: "f1", status: "available", price: "" },
  { testId: "d5", facilityId: "f3", status: "available", price: "\u20B9500" },
  { testId: "d5", facilityId: "f4", status: "available", price: "\u20B9450" },
  { testId: "d5", facilityId: "f5", status: "limited", price: "" },
  { testId: "d5", facilityId: "f6", status: "available", price: "\u20B9480" },
  { testId: "d6", facilityId: "f1", status: "available", price: "" },
  { testId: "d6", facilityId: "f3", status: "available", price: "\u20B9350" },
  { testId: "d6", facilityId: "f4", status: "available", price: "\u20B9300" },
  { testId: "d6", facilityId: "f6", status: "available", price: "\u20B9320" },
  { testId: "d7", facilityId: "f1", status: "available", price: "" },
  { testId: "d7", facilityId: "f5", status: "available", price: "" },
  { testId: "d7", facilityId: "f6", status: "available", price: "\u20B9250" },
  { testId: "d8", facilityId: "f1", status: "available", price: "" },
  { testId: "d8", facilityId: "f5", status: "available", price: "" },
  { testId: "d8", facilityId: "f6", status: "available", price: "\u20B9200" },
  { testId: "d9", facilityId: "f1", status: "available", price: "" },
  { testId: "d9", facilityId: "f3", status: "available", price: "\u20B9400" },
  { testId: "d9", facilityId: "f5", status: "available", price: "" },
  { testId: "d9", facilityId: "f6", status: "available", price: "\u20B9350" },
  { testId: "d10", facilityId: "f1", status: "available", price: "" },
  { testId: "d10", facilityId: "f5", status: "available", price: "" },
  { testId: "d10", facilityId: "f6", status: "available", price: "\u20B9300" },
  { testId: "d11", facilityId: "f1", status: "limited", price: "" },
  { testId: "d11", facilityId: "f6", status: "available", price: "\u20B91800" },
  { testId: "d12", facilityId: "f1", status: "limited", price: "" },
  { testId: "d12", facilityId: "f6", status: "available", price: "\u20B95000" },
  { testId: "d13", facilityId: "f1", status: "available", price: "" },
  { testId: "d13", facilityId: "f6", status: "available", price: "\u20B93000" },
  { testId: "d14", facilityId: "f1", status: "available", price: "" },
  { testId: "d14", facilityId: "f2", status: "available", price: "" },
  { testId: "d14", facilityId: "f3", status: "available", price: "\u20B9150" },
  { testId: "d14", facilityId: "f4", status: "available", price: "\u20B9120" },
  { testId: "d14", facilityId: "f5", status: "available", price: "" },
  { testId: "d14", facilityId: "f6", status: "available", price: "\u20B9130" },
  { testId: "d15", facilityId: "f1", status: "available", price: "" },
  { testId: "d15", facilityId: "f3", status: "available", price: "\u20B9150" },
  { testId: "d15", facilityId: "f4", status: "available", price: "\u20B9120" },
  { testId: "d15", facilityId: "f6", status: "available", price: "\u20B9130" },
];

export default function DiagnosticsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);

  const filteredTests = useMemo(() => {
    return diagnosticTests.filter((test) => {
      const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) || test.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || test.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const categories = [...new Set(diagnosticTests.map((t) => t.category))];

  const getAvailability = (testId: string) => {
    return diagnosticAvailability
      .filter((a) => a.testId === testId)
      .map((a) => ({
        ...a,
        facility: diagnosticFacilities.find((f) => f.id === a.facilityId)!,
      }))
      .filter((item) => availabilityFilter === "all" || item.status === availabilityFilter);
  };

  const speakText = selectedTest ? `${selectedTest.name}. ${selectedTest.description}` : `${t("diagnostics.title")}. ${t("diagnostics.subtitle")}`;

  return (
    <div className="container px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><MapPin className="h-4 w-4" /><span>Bhagalpur, Bihar</span></div>
          <h1 className="text-2xl font-bold">{t("diagnostics.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("diagnostics.subtitle")}</p>
        </div>
        <SpeakButton text={speakText} />
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t("diagnostics.search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded-lg px-3 py-2 w-full md:w-44 bg-background"><option value="all">{t("diagnostics.allCategories")}</option>{categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</select>
        <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="border rounded-lg px-3 py-2 w-full md:w-44 bg-background"><option value="all">{t("diagnostics.allAvailability")}</option><option value="available">{t("diagnostics.available")}</option><option value="limited">{t("diagnostics.limited")}</option></select>
      </div>

      {selectedTest ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedTest(null)}>{t("diagnostics.back")}</Button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{selectedTest.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedTest.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">{t("diagnostics.filterBy")}:</span>
            <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm bg-background"><option value="all">{t("diagnostics.allAvailability")}</option><option value="available">{t("diagnostics.available")}</option><option value="limited">{t("diagnostics.limited")}</option></select>
          </div>
          {getAvailability(selectedTest.id).length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">{t("diagnostics.noAvailability")}</CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {getAvailability(selectedTest.id).map((item) => (
                <Card key={item.facilityId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{item.facility.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.facility.address}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.facility.operatingHours}</span>
                          {item.price && <span className="font-medium text-foreground">{item.price}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={item.status === "available" ? "default" : item.status === "limited" ? "secondary" : "destructive"}>
                          {item.status === "available" ? t("diagnostics.available") : item.status === "limited" ? t("diagnostics.limited") : t("diagnostics.unavailable")}
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={()=>window.open(`tel:${item.facility.phone}`)}><Phone className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline"><Navigation className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{t("diagnostics.categories")}</h2>
            <SpeakButton text={categories.join(". ")} />
          </div>
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{category}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTests.filter((t) => t.category === category).map((test) => (
                  <Card key={test.id} className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all" onClick={() => setSelectedTest(test)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                            <FlaskConical className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base leading-tight">{test.name}</p>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{test.description}</p>
                          <Badge variant="outline" className="mt-2 text-xs font-normal">{category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{t("diagnostics.disclaimer")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}