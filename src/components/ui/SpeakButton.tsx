"use client";

import {useState,useEffect,useRef,useCallback}from"react";
import {Volume2,Square}from"lucide-react";
import {useTranslation}from"@/hooks/useTranslation";
import {useUIStore}from"@/stores";
import {Button}from"./button";

interface SpeakButtonProps{
  text:string;
  className?:string;
}

export function SpeakButton({text,className}:SpeakButtonProps){
  const[isSpeaking,setIsSpeaking]=useState(false);
  const[isSupported,setIsSupported]=useState(false);
  const isSpeakingRef=useRef(false);
  const{t}=useTranslation();
  const language=useUIStore(s=>s.language);

  // Initialize supported check in a separate effect
  useEffect(()=>{
    // Simple check without setState in same tick
    const checkSupport=()=>{
      const supported=typeof window!=="undefined"&&"speechSynthesis"in window;
      if(supported!==isSupported){
        setIsSupported(supported);
      }
    };
    checkSupport();
  },[isSupported]);

  useEffect(()=>{
    if(isSpeakingRef.current){
      if(typeof window!=="undefined"){
        window.speechSynthesis.cancel();
      }
      isSpeakingRef.current=false;
      setIsSpeaking(false);
    }
  },[language]);

  useEffect(()=>{
    return()=>{
      if(typeof window!=="undefined"){
        window.speechSynthesis.cancel();
      }
    };
  },[]);

  const handleSpeak=useCallback(()=>{
    if(!isSupported||!text)return;
    if(typeof window!=="undefined"){
      window.speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.lang=language==="hi"?"hi-IN":"en-IN";
      utterance.rate=0.9;
      utterance.onstart=()=>{
        isSpeakingRef.current=true;
        setIsSpeaking(true);
      };
      utterance.onend=()=>{
        isSpeakingRef.current=false;
        setIsSpeaking(false);
      };
      utterance.onerror=()=>{
        isSpeakingRef.current=false;
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    }
  },[isSupported,text,language]);

  const handleStop=useCallback(()=>{
    if(typeof window!=="undefined"){
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current=false;
    setIsSpeaking(false);
  },[]);

  const handleClick=useCallback(()=>{
    if(isSpeaking||isSpeakingRef.current){
      handleStop();
    }else{
      handleSpeak();
    }
  },[isSpeaking,handleStop,handleSpeak]);

  if(!isSupported)return null;

  return(
    <Button
      variant="ghost"
      size="sm"
      className={"h-8 w-8 p-0 "+(className||"")}
      onClick={handleClick}
      title={isSpeaking?t("common.stopReading"):t("common.readAloud")}
      aria-label={isSpeaking?t("common.stopReading"):t("common.readAloud")}
    >
      {isSpeaking?<Square className="h-4 w-4"/>:<Volume2 className="h-4 w-4"/>}
    </Button>
  );
}
