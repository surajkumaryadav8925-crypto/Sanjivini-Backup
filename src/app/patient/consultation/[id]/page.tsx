"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Clock, Calendar, User, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useConsultationStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { demoDoctors, specializationLabels } from "@/data/doctors";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConsultationRoomPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  const { getConsultationById, updateConsultationStatus, cancelConsultation } = useConsultationStore();

  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  const consultation = getConsultationById(id);
  const doctor = consultation ? demoDoctors.find((d) => d.id === consultation.doctorId) : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isJoined) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isJoined]);

  useEffect(() => {
    if (consultation && consultation.status === "upcoming") {
      updateConsultationStatus(id, "in_progress");
    }
  }, [isJoined, consultation, id, updateConsultationStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleJoin = () => {
    setIsJoined(true);
    setShowDemoVideo(true);
  };

  const handleEndCall = () => {
    setIsJoined(false);
    setShowDemoVideo(false);
    updateConsultationStatus(id, "completed");
    router.push("/patient/consultation");
  };

  const handleCancel = () => {
    cancelConsultation(id);
    router.push("/patient/consultation");
  };

  if (!consultation) {
    return (
      <div className="container px-4 py-6 max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">{t("consultation.consultationNotFound")}</p>
            <Link href="/patient/consultation">
              <Button className="mt-4">{t("consultation.backToConsultations")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (consultation.status === "cancelled") {
    return (
      <div className="container px-4 py-6 max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium">{t("consultation.consultationCancelled")}</p>
            <Link href="/patient/consultation">
              <Button className="mt-4">{t("consultation.backToConsultations")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isJoined && showDemoVideo) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="bg-amber-600 text-white text-center py-2 text-sm font-medium">
          {t("consultation.demoMode")} - {t("consultation.demoNoticeVideo")}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          <div className="w-full max-w-4xl aspect-video bg-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{doctor?.imageInitials || "DR"}</span>
              </div>
              <p className="text-white text-xl font-semibold">{consultation.doctorName}</p>
              <p className="text-gray-400">{doctor ? specializationLabels[doctor.specialization] : ""}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-4 py-2 text-white font-mono">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{formatTime(elapsedTime)}</span>
            </div>
            <div className="absolute top-4 right-4 bg-red-600 rounded-lg px-3 py-1 text-white text-sm font-medium">LIVE</div>
          </div>
          <div className="absolute bottom-24 right-4 w-48 aspect-video bg-gray-700 rounded-xl flex items-center justify-center border-2 border-gray-600">
            {isVideoOff ? (
              <div className="text-center">
                <VideoOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">{t("consultation.cameraOff")}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-gray-600 mx-auto mb-2 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm">{t("consultation.you")}</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setIsMuted(!isMuted)} className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}>
              {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
            </button>
            <button onClick={() => setIsVideoOff(!isVideoOff)} className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}>
              {isVideoOff ? <VideoOff className="h-6 w-6 text-white" /> : <Video className="h-6 w-6 text-white" />}
            </button>
            <button onClick={handleEndCall} className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors">
              <PhoneOff className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-3xl mx-auto">
      <Link href="/patient/consultation" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />{t("common.back")}
      </Link>
      <div className="mb-6 flex items-center gap-2">
        <h1 className="text-2xl font-bold">{t("consultation.waitingRoom")}</h1>
        <SpeakButton text={t("consultation.waitingRoomDesc")} />
      </div>
      <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardContent className="flex items-center gap-3 py-3">
          <Badge variant="default" className="bg-blue-500">DEMO</Badge>
          <p className="text-sm text-blue-800 dark:text-blue-200">{t("consultation.waitingRoomDemo")}</p>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{doctor?.imageInitials || "DR"}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{consultation.doctorName}</h2>
              <p className="text-muted-foreground">{doctor ? specializationLabels[doctor.specialization] : ""}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success">{t("consultation.ready")}</Badge>
                {doctor && <span className="text-sm text-muted-foreground">{doctor.experience} {t("consultation.yearsExp")}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(consultation.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{consultation.time}</span>
            </div>
          </div>
          {consultation.concern && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-1">{t("consultation.yourConcern")}:</p>
              <p className="text-sm text-muted-foreground">{consultation.concern}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t("consultation.preCallCheck")}</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                {isVideoOff ? (
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t("consultation.cameraOff")}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-2 flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t("consultation.cameraPreview")}</p>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setIsVideoOff(!isVideoOff)}>
                {isVideoOff ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
                {isVideoOff ? t("consultation.turnCameraOn") : t("consultation.turnCameraOff")}
              </Button>
            </div>
            <div className="flex-1">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                <div className="text-center">
                  <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t("consultation.micWorking")}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                {isMuted ? t("consultation.unmuteMic") : t("consultation.muteMic")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">{t("consultation.instructions")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />{t("consultation.instruction1")}</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />{t("consultation.instruction2")}</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />{t("consultation.instruction3")}</li>
          </ul>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1" size="lg" onClick={handleJoin}><Video className="h-5 w-5 mr-2" />{t("consultation.joinConsultation")}</Button>
        <Button variant="outline" onClick={handleCancel}>{t("consultation.cancelConsultation")}</Button>
      </div>
    </div>
  );
}