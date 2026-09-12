"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Video, Search, Star, Clock, Award, Globe, Calendar, CheckCircle, Filter } from "lucide-react";
import { useConsultationStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { demoDoctors, availableTimeSlots, specializationLabels } from "@/data/doctors";
import type { Doctor, Specialization, TimeSlot } from "@/data/doctors";

const availabilityColors = {
  available: "bg-green-500",
  busy: "bg-amber-500",
  offline: "bg-gray-400",
};

const availabilityLabels = {
  available: "Available",
  busy: "Busy",
  offline: "Offline",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export default function ConsultationPage() {
  const { t } = useTranslation();
  const { bookConsultation, getUpcomingConsultations, getCompletedConsultations } = useConsultationStore();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<Specialization | "all">("all");
  const [availabilityFilter] = useState<"all" | "available">("all");

  // Booking flow states
  const [bookingStep, setBookingStep] = useState<"select" | "schedule" | "confirm" | "success">("select");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [concern, setConcern] = useState("");
  const [bookedConsultationId, setBookedConsultationId] = useState<string | null>(null);

  // Generate next 7 days for date selection
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return demoDoctors.filter((doctor) => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpec = specializationFilter === "all" || doctor.specialization === specializationFilter;
      const matchesAvailability = availabilityFilter === "all" || doctor.availability === "available";
      return matchesSearch && matchesSpec && matchesAvailability;
    });
  }, [searchQuery, specializationFilter, availabilityFilter]);

  const upcomingConsultations = getUpcomingConsultations();
  const completedConsultations = getCompletedConsultations();

  const specializations: (Specialization | "all")[] = ["all", "general", "cardiology", "pediatrics", "gynecology", "dermatology", "orthopedics", "neurology", "ophthalmology"];

  const handleBookDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep("schedule");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;

    const consultation = bookConsultation({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      date: selectedDate.toISOString(),
      time: selectedSlot.time,
      concern: concern,
      fee: selectedDoctor.consultationFee,
    });

    setBookedConsultationId(consultation.id);
    setBookingStep("success");
  };

  const handleReset = () => {
    setBookingStep("select");
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setConcern("");
    setBookedConsultationId(null);
  };

  const introText = `${t("consultation.title")}. ${t("consultation.intro")}`;

  // Render booking schedule step
  if (bookingStep === "schedule" && selectedDoctor) {
    return (
      <div className="container px-4 py-6 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => setBookingStep("select")} className="mb-4">
          {t("common.back")}
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("consultation.bookConsultation")}</h1>
          <p className="text-muted-foreground">{selectedDoctor.name}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-lg font-bold text-primary">{selectedDoctor.imageInitials}</span>
              </div>
              <div>
                <h3 className="font-semibold">{selectedDoctor.name}</h3>
                <p className="text-sm text-muted-foreground">{specializationLabels[selectedDoctor.specialization]}</p>
                <p className="text-sm text-muted-foreground">{selectedDoctor.qualification}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" /> {t("consultation.selectDate")}
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {availableDates.map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-xs text-muted-foreground">{formatDate(date)}</div>
                <div className="text-sm font-medium">{date.getDate()}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" /> {t("consultation.selectTime")}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {availableTimeSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    !slot.available
                      ? "border-border bg-muted dark:bg-muted text-muted-foreground cursor-not-allowed"
                      : selectedSlot?.time === slot.time
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSlot && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">{t("consultation.healthConcern")}</h2>
            <textarea
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              placeholder={t("consultation.concernPlaceholder")}
              className="w-full p-3 rounded-lg border border-border bg-background min-h-[100px] resize-none"
            />
          </div>
        )}

        {selectedSlot && (
          <div className="mb-6">
            <Card className="border-primary/15 bg-primary/[0.04]">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("consultation.consultationFee")}</span>
                  <span className="text-xl font-bold">Rs. {selectedDoctor.consultationFee}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full mt-4"
              onClick={handleConfirmBooking}
            >
              {t("consultation.confirmBooking")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Render success step
  if (bookingStep === "success") {
    return (
      <div className="container px-4 py-6 max-w-3xl mx-auto">
        <Card className="text-center py-8">
          <CardContent>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
              <CheckCircle className="h-8 w-8 text-success-soft-foreground" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("consultation.bookingSuccess")}</h1>
            <p className="text-muted-foreground mb-6">{t("consultation.bookingSuccessDesc")}</p>

            {selectedDoctor && selectedDate && selectedSlot && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">{selectedDoctor.imageInitials}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedDoctor.name}</p>
                    <p className="text-sm text-muted-foreground">{specializationLabels[selectedDoctor.specialization]}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">{t("consultation.date")}:</span> {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
                  <p><span className="text-muted-foreground">{t("consultation.time")}:</span> {selectedSlot.time}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={handleReset}>
                {t("consultation.bookAnother")}
              </Button>
              {bookedConsultationId && (
                <Link href={`/patient/consultation/${bookedConsultationId}`}>
                  <Button>{t("consultation.viewDetails")}</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render doctor selection (default)
  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6" />
            {t("consultation.title")}
          </h1>
          <SpeakButton text={introText} />
        </div>
      </div>

      <Card className="mb-6 border-primary/15 bg-primary/[0.04]">
        <CardContent className="flex items-center gap-3 py-3">
          <Badge variant="default">DEMO</Badge>
          <p className="text-sm text-muted-foreground">
            {t("consultation.demoNotice")}
          </p>
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("consultation.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{t("consultation.filterBy")}:</span>
          </div>
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecializationFilter(spec)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                specializationFilter === spec
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {spec === "all" ? t("common.all") : specializationLabels[spec]}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Consultations */}
      {upcomingConsultations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" /> {t("consultation.upcomingConsultations")}
          </h2>
          <div className="grid gap-3">
            {upcomingConsultations.slice(0, 3).map((consultation) => {
              const doctor = demoDoctors.find((d) => d.id === consultation.doctorId);
              return (
                <Card key={consultation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-bold text-primary">{doctor?.imageInitials || "DR"}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{consultation.doctorName}</p>
                          <p className="text-sm text-muted-foreground">{specializationLabels[consultation.specialization]}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(consultation.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {consultation.time}
                          </p>
                        </div>
                      </div>
                      <Link href={`/patient/consultation/${consultation.id}`}>
                        <Button size="sm">{t("consultation.join")}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Doctor List */}
      <h2 className="text-lg font-semibold mb-4">{t("consultation.availableDoctors")}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70">
                  <span className="text-lg font-bold text-primary-foreground">{doctor.imageInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{doctor.name}</h3>
                    <span className={`h-2 w-2 rounded-full ${availabilityColors[doctor.availability]}`} title={availabilityLabels[doctor.availability]} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{specializationLabels[doctor.specialization]}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" /> {doctor.experience} {t("consultation.yearsExp")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" /> {doctor.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {doctor.languages.join(", ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{doctor.bio}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">Rs. {doctor.consultationFee}</span>
                      <span className="text-xs text-muted-foreground"> / {t("consultation.session")}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBookDoctor(doctor)}
                      disabled={doctor.availability === "offline"}
                    >
                      {doctor.availability === "offline" ? t("consultation.unavailable") : t("consultation.book")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">{t("consultation.noDoctorsFound")}</p>
          </CardContent>
        </Card>
      )}

      {/* Completed Consultations */}
      {completedConsultations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success-soft-foreground" aria-hidden /> {t("consultation.pastConsultations")}
          </h2>
          <div className="grid gap-3">
            {completedConsultations.slice(0, 5).map((consultation) => (
              <Card key={consultation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-medium text-muted-foreground">{consultation.doctorName.split(" ").map(n => n[0]).join("")}</span>
                      </div>
                      <div>
                        <p className="font-medium">{consultation.doctorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(consultation.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {consultation.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">{t("consultation.completed")}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}