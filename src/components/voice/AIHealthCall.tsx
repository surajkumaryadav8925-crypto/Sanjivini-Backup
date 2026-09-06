"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { PhoneOff, PhoneCall, Mic, MicOff, Loader2, Volume2, Bot } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUIStore } from "@/stores";
import { Button } from "@/components/ui";

type CallState = "idle" | "calling" | "connected" | "listening" | "processing" | "speaking" | "ended";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIHealthCall() {
  const { t } = useTranslation();
  const language = useUIStore((s) => s.language);
  const activeAssistant = useUIStore((s) => s.activeAssistant);
  const closeActiveAssistant = useUIStore((s) => s.closeActiveAssistant);
  const isOpen = activeAssistant === "call";

  const [callState, setCallState] = useState<CallState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const languageRef = useRef(language);
  const mountedRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  const speakFnRef = useRef<((text: string, lang: string) => void) | null>(null);

  // Keep refs updated
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Sync chatHistory with ref
  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speech synthesis function
  const speak = useCallback((text: string, lang: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    
    utterance.onstart = () => setCallState("speaking");
    utterance.onend = () => {
      if (mountedRef.current) setCallState("connected");
    };
    utterance.onerror = () => {
      if (mountedRef.current) setCallState("connected")
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // Keep speak function ref updated
  useEffect(() => {
    speakFnRef.current = speak;
  }, [speak]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === "undefined") {
      setTimeout(() => setIsSupported(false), 0);
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setTimeout(() => setIsSupported(false), 0);
      return;
    }

    setTimeout(() => setIsSupported(true), 0);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = "en-IN";

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
  }, []);

  // Start call
  const startCall = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const recognition = recognitionRef.current;
    if (recognition) {
      try { recognition.abort(); } catch { /* ignore */ }
    }
    setMessages([]);
    setChatHistory([]);
    setError("");
    setCallState("calling");
    
    // Simulate connection delay
    setTimeout(() => {
      setCallState("connected");
      const greeting = languageRef.current === "hi" 
        ? "??????! ??? ???? ?????? ??? ????? ???? ??? ???? ???? ??? ?? ???? ????"
        : "Hello! I am your Arogya AI health assistant. How can I help you today?";
      
      setMessages([{ role: "ai", text: greeting }]);
      speak(greeting, languageRef.current);
    }, 2000);
  }, [speak]);

  // Start listening
  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError(language === "hi" ? "???? ????????? ?????? ???? ???" : "Voice recognition is not available.");
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setError("");
    setCurrentTranscript("");
    setCallState("listening");
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

    try {
      recognition.start();
    } catch (err) {
      try {
        recognition.stop();
        setTimeout(() => {
          try { recognition.start(); }
          catch { 
            setError(language === "hi" ? "????? ?????????? ???? ???? ?? ????" : "Could not start recording.");
            setCallState("connected");
          }
        }, 100);
      } catch { 
        setError(language === "hi" ? "????? ?????????? ???? ???? ?? ????" : "Could not start recording.");
        setCallState("connected");
      }
    }
  }, [language]);

  // Stop listening
  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try { recognition.stop(); } catch {}
    }
    setCallState("connected");
  }, []);

  // Process input
  const processInput = useCallback((transcript: string) => {
    setCurrentTranscript(transcript);
    setMessages(prev => [...prev, { role: "user", text: transcript }]);
    setCallState("processing");

    const newHistory = [...chatHistoryRef.current, { role: "user", content: transcript }];
    
    fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newHistory, language: languageRef.current }),
    })
    .then(res => res.json())
    .then(data => {
      const response = data.response || data.error || (languageRef.current === "hi" ? "????? ????, ??? ???? ????" : "Sorry, something went wrong.");
      
      setMessages(prev => [...prev, { role: "ai", text: response }]);
      setChatHistory(prev => [...prev, { role: "user", content: transcript }, { role: "assistant", content: response }]);
      
      if (speakFnRef.current) {
        speakFnRef.current(response, languageRef.current);
      }
    })
    .catch(() => {
      const fallback = languageRef.current === "hi" 
        ? "??????? ?????? ??? ????? ???? ?????? ?????"
        : "Network error. Please try again.";
      setMessages(prev => [...prev, { role: "ai", text: fallback }]);
      setError(fallback);
      if (speakFnRef.current) {
        speakFnRef.current(fallback, languageRef.current);
      }
    });
  }, []);

  // Set up recognition event handlers
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    const handleStart = () => setCallState("listening");
    
    const handleResult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        processInput(transcript);
      } else {
        setCallState("connected");
      }
    };
    
    const handleError = (event: SpeechRecognitionErrorEvent) => {
      let errorMsg = language === "hi" ? "?? ?????? ????" : "An error occurred.";
      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          errorMsg = language === "hi" ? "?????????? ?? ?????? ???? ?????" : "Microphone permission denied.";
          break;
        case "no-speech":
          errorMsg = language === "hi" ? "??? ????? ???? ????? ???" : "No speech detected.";
          break;
        case "audio-capture":
          errorMsg = language === "hi" ? "?????????? ???? ?????" : "No microphone found.";
          break;
        case "network":
          errorMsg = language === "hi" ? "??????? ???????" : "Network error.";
          break;
        case "aborted":
          return;
        default:
          errorMsg = `${language === "hi" ? "??????:" : "Error:"} ${event.error}`;
      }
      setError(errorMsg);
      setCallState("connected");
    };
    
    const handleEnd = () => {
      if (callState === "listening") {
        setCallState("connected");
      }
    };

    recognition.onstart = handleStart;
    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [processInput, language, callState]);

  // Open/close panel
  useEffect(() => {
    if (isOpen && callState === "idle") {
      setTimeout(() => startCall(), 0);
    }
    if (!isOpen) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      const recognition = recognitionRef.current;
      if (recognition) {
        try { recognition.abort(); } catch {}
      }
      setTimeout(() => {
        setCallState("idle");
        setMessages([]);
        setChatHistory([]);
        setError("");
        setCurrentTranscript("");
      }, 0);
    }
  }, [isOpen, callState, startCall]);

  // Close panel
  const closePanel = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const recognition = recognitionRef.current;
    if (recognition) {
      try { recognition.abort(); } catch {}
    }
    closeActiveAssistant();
  }, [closeActiveAssistant]);

  // Get status text
  const getStatusText = () => {
    switch (callState) {
      case "calling": return t("aiCall.connecting") || "Connecting...";
      case "connected": return t("aiCall.connected") || "Connected";
      case "listening": return t("aiCall.listening") || "Listening...";
      case "processing": return t("aiCall.processing") || "Processing...";
      case "speaking": return t("aiCall.speaking") || "Speaking...";
      case "ended": return t("aiCall.ended") || "Call Ended";
      default: return "";
    }
  };

  // Render floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          const recognition = recognitionRef.current;
          if (recognition) {
            try { recognition.abort(); } catch { /* ignore */ }
          }
          closeActiveAssistant(); // Reset state first
          // Small delay to ensure state is reset before opening
          setTimeout(() => {
            useUIStore.getState().setActiveAssistant("call");
          }, 50);
        }}
        className="fixed bottom-20 left-4 z-50 h-14 w-14 rounded-2xl shadow-lg flex items-center justify-center transition-all bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:scale-105 active:scale-95"
        title={t("aiCall.title") || "Call AI Assistant"}
      >
        <PhoneCall className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={closePanel}
      />
      
      {/* Call Panel */}
      <div className="fixed bottom-36 left-4 z-50 w-[380px] max-w-[calc(100vw-32px)] max-h-[70vh] rounded-2xl bg-background border shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{t("aiCall.title") || "Arogya AI Assistant"}</h3>
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${
                  callState === "connected" ? "bg-emerald-500" :
                  callState === "calling" ? "bg-amber-500 animate-pulse" :
                  "bg-muted-foreground"
                }`} />
                <span className="text-xs text-muted-foreground">{getStatusText()}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={closePanel} className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600">
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 && callState === "connected" && (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Bot className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-muted-foreground">{t("aiCall.tapToSpeak")}</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md" 
                  : "bg-muted rounded-bl-md"
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {currentTranscript && (
            <div className="flex justify-end animate-in">
              <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30">
                <p className="text-xs text-muted-foreground mb-1">{t("aiCall.youSaid")}</p>
                <p className="text-sm italic opacity-80">{currentTranscript}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center animate-in">
              <div className="max-w-[90%] rounded-2xl px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex flex-col items-center gap-3">
            <div className={`flex items-center gap-2 text-sm font-medium ${
              callState === "listening" ? "text-blue-500" :
              callState === "speaking" ? "text-emerald-500" :
              callState === "processing" ? "text-amber-500" :
              "text-muted-foreground"
            }`}>
              {callState === "listening" && <Mic className="h-4 w-4 animate-pulse" />}
              {callState === "speaking" && <Volume2 className="h-4 w-4 animate-pulse" />}
              {callState === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{getStatusText()}</span>
            </div>

            <button
              onClick={callState === "listening" ? stopListening : startListening}
              disabled={
                isSupported === false ||
                callState === "calling" ||
                callState === "ended" ||
                callState === "speaking" ||
                callState === "processing"
              }
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                callState === "listening"
                  ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse voice-listening ai-call-active"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:scale-105 active:scale-95"
              } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {callState === "listening" ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : callState === "speaking" || callState === "processing" ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={closePanel} 
              className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
            >
              {t("aiCall.endCall")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

