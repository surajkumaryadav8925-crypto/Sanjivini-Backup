"use client";
import {useState,useRef,useEffect}from"react";
import {ChevronDown,Globe}from"lucide-react";
import {useTranslation}from"@/hooks/useTranslation";
import {cn}from"@/lib/utils";
import {Button}from"@/components/ui";
export function LanguageSelector(){const[isOpen,setIsOpen]=useState(false);const dropdownRef=useRef<HTMLDivElement>(null);const{language,setLanguage,languages}=useTranslation();useEffect(()=>{function handleClickOutside(event:MouseEvent){if(dropdownRef.current&&!dropdownRef.current.contains(event.target as Node)){setIsOpen(false);}};document.addEventListener("mousedown",handleClickOutside);return()=>document.removeEventListener("mousedown",handleClickOutside);},[]);const currentLang=languages.find(l=>l.code===language)||languages[0];return(<div className="relative"ref={dropdownRef}><Button variant="ghost"size="sm"className="flex items-center gap-1 text-xs"onClick={()=>setIsOpen(!isOpen)}aria-expanded={isOpen}aria-haspopup="listbox"><Globe className="h-4 w-4"/><span className="hidden sm:inline">{currentLang.nativeName}</span><ChevronDown className={cn("h-3 w-3 transition-transform",isOpen&&"rotate-180")}/></Button>{isOpen&&(<div className="absolute right-0 mt-1 w-40 rounded-md border bg-background shadow-lg z-50 overflow-hidden dropdown-panel">
{languages.map((lang)=>(<button key={lang.code}onClick={()=>{setLanguage(lang.code);setIsOpen(false);}}className={cn("w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between",lang.code===language&&"bg-muted font-medium")}>
<span>{lang.nativeName}</span>{lang.code===language&&<span>?</span>}</button>))}</div>)}</div>);}

