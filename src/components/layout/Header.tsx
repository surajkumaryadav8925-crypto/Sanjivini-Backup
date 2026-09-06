"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useAuthStore,useOfflineStore,useUIStore} from "@/stores";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui";
import {Menu,X,User,LogOut,Wifi,WifiOff,RefreshCw,Home,Stethoscope,Building2,Shield,Heart,ChevronDown,Sun,Moon} from "lucide-react";
import {useState,useSyncExternalStore}from"react";
import {LanguageSelector}from"./LanguageSelector";
import {NotificationBell}from"./NotificationBell";
import {useTranslation}from"@/hooks/useTranslation";
import type {UserRole}from"@/types";
function useIsHydrated(){return useSyncExternalStore(()=>()=>{},()=>true,()=>false);}
type NavItem={href:string;labelKey:string;icon:React.ComponentType<{className?:string}>};
const navConfig:Record<UserRole,NavItem[]>={
  patient:[
    {href:"/patient/dashboard",labelKey:"common.dashboard",icon:Home},
    {href:"/patient/triage",labelKey:"common.triage",icon:Stethoscope},
    {href:"/patient/hospitals",labelKey:"common.hospitals",icon:Building2},
    {href:"/patient/family",labelKey:"common.family",icon:Heart}
  ],
  hospital_staff:[
    {href:"/hospital/dashboard",labelKey:"common.dashboard",icon:Home},
    {href:"/hospital/beds",labelKey:"common.beds",icon:Building2},
    {href:"/hospital/inventory",labelKey:"common.inventory",icon:Stethoscope}
  ],
  government_admin:[
    {href:"/admin/dashboard",labelKey:"common.dashboard",icon:Home},
    {href:"/admin/hospitals",labelKey:"common.hospitals",icon:Building2},
    {href:"/admin/analytics",labelKey:"common.settings",icon:Shield}
  ],
  super_admin:[
    {href:"/admin/dashboard",labelKey:"common.dashboard",icon:Home},
    {href:"/admin/hospitals",labelKey:"common.hospitals",icon:Building2},
    {href:"/admin/analytics",labelKey:"common.settings",icon:Shield}
  ]
};
export function Header(){
  const pathname=usePathname();
  const profile=useAuthStore(s=>s.profile);
  const isAuthenticated=useAuthStore(s=>s.isAuthenticated);
  const logout=useAuthStore(s=>s.logout);
  const isOnline=useOfflineStore(s=>s.isOnline);
  const isSyncing=useOfflineStore(s=>s.isSyncing);
  const pendingOperations=useOfflineStore(s=>s.pendingOperations);
  const darkMode=useUIStore(s=>s.darkMode);
  const toggleDarkMode=useUIStore(s=>s.toggleDarkMode);
  const[mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const[profileOpen,setProfileOpen]=useState(false);
  const mounted=useIsHydrated();
  const{t}=useTranslation();
  const pendingCount=mounted?pendingOperations.filter(op=>op.status==="pending").length:0;
  const navItems=isAuthenticated&&profile?navConfig[profile.role]||[]:[];
  const profileLink=profile?.role==="patient"?"/patient/profile":profile?.role==="hospital_staff"?"/hospital/profile":"/admin/profile";
  return(
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">{t("common.appName")}</span>
          </Link>
          
          {isAuthenticated&&(
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item:NavItem)=>(
                <Link key={item.href} href={item.href} className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname===item.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                  <item.icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mounted&&!isOnline&&(
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
              <WifiOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("status.offline")}{pendingCount>0?` (${pendingCount})`:""}</span>
            </div>
          )}

          {mounted&&isSyncing&&(
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span className="hidden sm:inline">Syncing...</span>
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9 rounded-lg">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Language Selector - Always visible outside auth check */}
          <LanguageSelector />

          {!isAuthenticated ? (<Link href="/login"><Button variant="default" size="sm" className="gap-2 h-9 rounded-lg"><User className="h-4 w-4" /><span className="hidden sm:inline">{t("login.signIn")}</span></Button></Link>) : (
            <>
              <NotificationBell />
              
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={()=>setProfileOpen(!profileOpen)} className="gap-2 h-9 rounded-lg">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{profile?.full_name?.charAt(0) || "U"}</span>
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{profile?.full_name?.split(" ")[0] || "User"}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-background shadow-xl shadow-black/10 py-2 dropdown-panel">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </div>
                    <Link href={profileLink} onClick={()=>setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                      <User className="h-4 w-4" />
                      {t("common.profile")}
                    </Link>
                    <button onClick={()=>{setProfileOpen(false);logout();}} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors w-full text-left text-destructive">
                      <LogOut className="h-4 w-4" />
                      {t("common.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-lg" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background animate-in slide-in-from-top-2">
          <nav className="container px-4 py-4 space-y-1">
            {navItems.map((item:NavItem)=>(
              <Link key={item.href} href={item.href} onClick={()=>setMobileMenuOpen(false)} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname===item.href ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}>
                <item.icon className="h-5 w-5" />
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

