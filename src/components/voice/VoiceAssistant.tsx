"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Volume2, X, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/stores";
import { Button } from "@/components/ui";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface Command {
  patterns: string[];
  action: "greet" | "help" | "navigate";
  path?: string;
}

// Normalize transcript for matching
function normalizeTranscript(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesCommand(normalized: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    const normalizedPattern = normalizeTranscript(pattern);
    return normalized === normalizedPattern || 
           normalized.includes(normalizedPattern) ||
           normalizedPattern.includes(normalized);
  });
}

const EN_COMMANDS: Command[] = [
  { patterns: ["hello", "hi", "hey", "hi there"], action: "greet" },
  { patterns: ["help", "what can you do", "how can you help", "help me", "commands"], action: "help" },
  { patterns: ["open medicines", "go to medicines", "show medicines", "medicines", "open medicine", "go to medicine"], action: "navigate", path: "/patient/medicines" },
  { patterns: ["open hospitals", "go to hospitals", "show hospitals", "hospitals", "open hospital", "find hospitals"], action: "navigate", path: "/patient/hospitals" },
  { patterns: ["open diagnostics", "go to diagnostics", "show diagnostics", "diagnostics", "diagnostic tests"], action: "navigate", path: "/patient/diagnostics" },
  { patterns: ["open opd", "book opd", "go to opd", "opd", "appointment", "book appointment"], action: "navigate", path: "/patient/opd" },
  { patterns: ["open emergency", "emergency", "emergency services", "open emergencies"], action: "navigate", path: "/patient/emergency" },
  { patterns: ["open blood", "blood availability", "blood bank", "blood", "find blood"], action: "navigate", path: "/patient/blood" },
  { patterns: ["open insurance", "insurance", "insurance scheme", "insurance info"], action: "navigate", path: "/patient/insurance" },
  { patterns: ["open records", "health records", "my records", "medical records", "records"], action: "navigate", path: "/patient/records" },
  { patterns: ["open consultation", "video consultation", "consultation", "doctor consultation", "book doctor"], action: "navigate", path: "/patient/consultation" },
  { patterns: ["open family", "family health", "family", "my family"], action: "navigate", path: "/patient/family" },
  { patterns: ["go home", "open dashboard", "go to dashboard", "dashboard", "home", "main page"], action: "navigate", path: "/patient/dashboard" },
];

const HI_COMMANDS: Command[] = [
  { patterns: ["??????", "???????", "????", "????", "???"], action: "greet" },
  { patterns: ["???", "??? ???", "???? ??? ???", "??? ???? ?? ???? ??", "???? ???? ?? ???? ??", "???????", "?????"], action: "help" },
  { patterns: ["??????? ????", "??????? ????", "???? ????", "??????? ????", "???????", "???????", "????", "???????", "??????? ?? ???????"], action: "navigate", path: "/patient/medicines" },
  { patterns: ["??????? ????", "??????? ?????", "???????", "???????? ????", "?????? ???????", "?????? ???????"], action: "navigate", path: "/patient/hospitals" },
  { patterns: ["???? ????", "???? ?????", "?????????????? ????", "????? ????", "????", "???? ?????"], action: "navigate", path: "/patient/diagnostics" },
  { patterns: ["????? ????", "?????????? ??? ???", "?????", "OPD"], action: "navigate", path: "/patient/opd" },
  { patterns: ["????????? ????", "????????", "??????? ????", "?????????"], action: "navigate", path: "/patient/emergency" },
  { patterns: ["???? ????", "??? ?? ???????", "???? ?? ???????", "????", "????"], action: "navigate", path: "/patient/blood" },
  { patterns: ["???? ????", "?????????? ????", "???? ?? ???????", "???? ?????", "PM-JAY", "????????"], action: "navigate", path: "/patient/insurance" },
  { patterns: ["????????? ??????? ????", "???? ??????? ?????", "???????", "?????? ?????????"], action: "navigate", path: "/patient/records" },
  { patterns: ["????????? ????", "?????? ?????????", "?????? ?? ??? ???", "?????????"], action: "navigate", path: "/patient/consultation" },
  { patterns: ["?????? ????", "?????? ????", "????????? ?????????", "??????"], action: "navigate", path: "/patient/family" },
  { patterns: ["???", "????????", "?? ???", "??????", "????? ?????"], action: "navigate", path: "/patient/dashboard" },
];

export function VoiceAssistant() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useUIStore((s) => s.language);
  const activeAssistant = useUIStore((s) => s.activeAssistant);
  const setActiveAssistant = useUIStore((s) => s.setActiveAssistant);
  const closeActiveAssistant = useUIStore((s) => s.closeActiveAssistant);

  // Use shared state - derive isOpen from activeAssistant
  const isOpen = activeAssistant === "voice";
  const [state, setState] = useState<VoiceState>("idle");
  const [userSpeech, setUserSpeech] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [detectedCommand, setDetectedCommand] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const routerRef = useRef(router);
  const tRef = useRef(t);
  const languageRef = useRef(language);
  const mountedRef = useRef(true);

  useEffect(() => { tRef.current = t; languageRef.current = language; routerRef.current = router; }, [t, language, router]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setState("idle");
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    mountedRef.current = true;
    if (typeof window === "undefined") { if (mountedRef.current) setIsSupported(false); return; }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) { if (mountedRef.current) setIsSupported(false); return; }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = languageRef.current === "hi" ? "hi-IN" : "en-IN";
    recognitionRef.current = recognition;
    if (mountedRef.current) setIsSupported(true);

    return () => { mountedRef.current = false; try { recognition.abort(); } catch {} };
  }, []);

  // Speech synthesis
  const speak = useCallback((text: string, lang: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setState("idle"); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.9;
    utterance.onstart = () => setState("speaking");
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");
    window.speechSynthesis.speak(utterance);
  }, []);

  // Process command
  const processCommand = useCallback((transcript: string) => {
    const commands = languageRef.current === "hi" ? HI_COMMANDS : EN_COMMANDS;
    const normalized = normalizeTranscript(transcript);
    setDetectedCommand(normalized);

    for (const command of commands) {
      if (matchesCommand(normalized, command.patterns)) {
        let response = "";
        switch (command.action) {
          case "greet": response = tRef.current("voice.greeting"); break;
          case "help": response = tRef.current("voice.help"); break;
          case "navigate":
            if (command.path) {
              response = tRef.current("voice.navigating").replace("{path}", command.path);
              setTimeout(() => routerRef.current.push(command.path!), 500);
            }
            break;
        }
        if (response) { setAssistantResponse(response); speak(response, languageRef.current); }
        return;
      }
    }
    setAssistantResponse(tRef.current("voice.notUnderstood"));
    speak(tRef.current("voice.notUnderstood"), languageRef.current);
  }, [speak]);

  // Setup recognition handlers
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onstart = () => { setState("listening"); setError(""); };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      setUserSpeech(transcript);
      setState("processing");
      processCommand(transcript);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMsg = tRef.current("voice.error");
      switch (event.error) {
        case "not-allowed": case "service-not-allowed": errorMsg = tRef.current("voice.microphoneDenied"); break;
        case "no-speech": errorMsg = tRef.current("voice.noSpeech"); break;
        case "audio-capture": errorMsg = tRef.current("voice.noMicrophone"); break;
        case "network": errorMsg = tRef.current("voice.networkError"); break;
        case "aborted": setState("idle"); return;
        default: errorMsg = tRef.current("voice.error");
      }
      setError(errorMsg); setState("idle");
    };
    recognition.onend = () => { setState((prev) => (prev === "listening" ? "idle" : prev)); };

    return () => { recognition.onstart = null; recognition.onresult = null; recognition.onerror = null; recognition.onend = null; };
  }, [processCommand]);

  // Start listening
  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) { setError("Voice recognition not ready."); return; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setUserSpeech(""); setAssistantResponse(""); setError(""); setDetectedCommand(""); setState("idle");
    recognition.lang = languageRef.current === "hi" ? "hi-IN" : "en-IN";
    try { recognition.start(); }
    catch (err) {
      try { recognition.stop(); setTimeout(() => { try { recognition.start(); } catch { setError("Failed to start."); } }, 100); }
      catch { setError("Failed to start."); }
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) { try { recognition.stop(); } catch {} }
    setState("idle");
  }, []);

  // Toggle - sets this assistant as active
  const handleToggle = useCallback(() => {
    if (state === "listening") { stopListening(); }
    else {
      // Set this as the active assistant (will close AI Call if open)
      setActiveAssistant("voice"); startListening();
    }
  }, [state, startListening, stopListening, setActiveAssistant]);

  // Close - clears active assistant
  const handleClose = useCallback(() => {
    cleanup(); setUserSpeech(""); setAssistantResponse(""); setError(""); setDetectedCommand("");
    closeActiveAssistant();
  }, [cleanup, closeActiveAssistant]);

  const getStatusText = () => {
    switch (state) {
      case "listening": return t("voice.listening");
      case "processing": return t("voice.processing");
      case "speaking": return t("voice.speaking");
      default: return isSupported === false ? t("voice.notSupported") : t("voice.hint");
    }
  };

  if (isSupported === null) return null;

  // Only render panel when this assistant is active
  const isPanelOpen = isOpen;

  return (
    <>
      {/* Floating microphone button - BOTTOM RIGHT */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          state === "listening" ? "bg-red-500 hover:bg-red-600 animate-pulse voice-listening" : "bg-blue-600 hover:bg-blue-700"
        } ${isSupported === false ? "opacity-50 cursor-not-allowed" : ""}`}
        title={t("voice.assistantTitle")}
        aria-label={t("voice.assistantTitle")}
      >
        {state === "speaking" ? (<Volume2 className="h-6 w-6 text-white" />) :
         state === "listening" ? (<MicOff className="h-6 w-6 text-white" />) :
         (<Mic className="h-6 w-6 text-white" />)}
      </button>

      {/* Voice Assistant Panel - BOTTOM RIGHT */}
      {isPanelOpen && (
        <div className="fixed bottom-36 right-4 z-[60] w-80 sm:w-96 bg-background border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                state === "listening" ? "bg-blue-500 animate-pulse" :
                state === "speaking" ? "bg-green-500 animate-pulse" :
                state === "processing" ? "bg-amber-500" : "bg-gray-400"
              }`} />
              <span className="font-medium text-sm">{t("voice.assistantTitle")}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="text-center">
              <span className="text-sm text-muted-foreground">{getStatusText()}</span>
            </div>

            <div className="flex justify-center">
              <button
                onClick={state === "listening" ? stopListening : startListening}
                disabled={isSupported === false || state === "processing" || state === "speaking"}
                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                  state === "listening" ? "bg-red-500 hover:bg-red-600 animate-pulse voice-listening" : "bg-blue-600 hover:bg-blue-700"
                } ${isSupported === false || state === "processing" || state === "speaking" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {state === "processing" ? (<Loader2 className="h-6 w-6 text-white animate-spin" />) :
                 state === "listening" ? (<MicOff className="h-6 w-6 text-white" />) :
                 (<Mic className="h-6 w-6 text-white" />)}
              </button>
            </div>

            {userSpeech && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">{t("voice.youSaid")}:</p>
                <p className="text-sm font-medium break-words">{userSpeech}</p>
              </div>
            )}

            {detectedCommand && (
              <div className="bg-muted dark:bg-muted rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Detected: {detectedCommand}</p>
              </div>
            )}

            {assistantResponse && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  {t("voice.assistant")}:
                </p>
                <p className="text-sm break-words">{assistantResponse}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {state === "idle" && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t("voice.hintListening")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

