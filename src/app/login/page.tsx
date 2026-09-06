"use client";
import {useState}from"react";
import{Card,CardContent,Button,Input,Alert}from"@/components/ui";
import{Heart,Shield,User,Building2,Smartphone}from"lucide-react";
import{useRouter}from"next/navigation";
import{useAuthStore}from"@/stores";
import{useTranslation}from"@/hooks/useTranslation";
import type{UserRole}from"@/types";

export default function LoginPage(){
const{t}=useTranslation();
const router=useRouter();
const{setProfile}=useAuthStore();
const[step,setStep]=useState("select");
const[idNumber,setIdNumber]=useState("");
const[otp,setOtp]=useState("");
const[error,setError]=useState("");
const[loading,setLoading]=useState(false);

const handleDemoLogin=async(role:UserRole)=>{
setLoading(true);
await new Promise(r=>setTimeout(r,800));
setProfile({
id:role==="patient"?"demo-1":role==="hospital_staff"?"demo-2":"demo-3",
full_name:role==="patient"?"Demo Patient":role==="hospital_staff"?"Dr. Hospital":"Admin User",
email:role==="patient"?"patient@demo.com":"admin@demo.com",
role:role,
is_active:true,
created_at:new Date().toISOString(),
updated_at:new Date().toISOString()
});
router.push(role==="hospital_staff"?"/hospital/dashboard":role==="government_admin"?"/admin/dashboard":"/patient/dashboard");
setLoading(false);
};

const handleContinue=()=>{
if(idNumber.length<4){setError("Invalid ID");return;}
setStep("otp");
setError("");
};

const handleVerifyOtp=async()=>{
if(otp.length!==6){setError("Invalid OTP");return;}
setLoading(true);
await new Promise(r=>setTimeout(r,1000));
handleDemoLogin("patient");
setLoading(false);
};

return(<div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
<div className="w-full max-w-md">
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30 mb-4">
<Heart className="h-8 w-8 text-white"/>
</div>
<h1 className="text-2xl font-bold">{t("common.appName")}</h1>
<p className="text-muted-foreground mt-1">Healthcare Platform</p>
</div>

<Card className="shadow-xl border-0 bg-card/95 dark:bg-card/95 backdrop-blur">
<CardContent className="p-6">
{step==="select"?(
<>
<div className="flex rounded-lg bg-muted p-1 mb-6">
<button onClick={()=>setStep("otp")}className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all bg-primary text-white shadow-sm">
ABHA
</button>
<button onClick={()=>setStep("otp")}className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all text-muted-foreground">
Aadhaar
</button>
</div>

<h2 className="text-lg font-semibold mb-2">{t("login.title")}</h2>
<p className="text-sm text-muted-foreground mb-4">Enter your ABHA Number or Aadhaar Number</p>

{error&&<Alert variant="destructive"className="mb-4">{error}</Alert>}

<div className="space-y-4">
<Input placeholder="ABHA or Aadhaar Number" value={idNumber} onChange={(e)=>setIdNumber(e.target.value)} className="h-11"/>
<Button onClick={handleContinue} className="w-full h-11" disabled={loading}>{loading?t("common.loading"):t("common.next")}</Button>
</div>

<div className="relative my-6">
<div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"/></div>
<div className="relative flex justify-center text-xs uppercase">
<span className="bg-background px-2 text-muted-foreground">{t("login.demoLogin")}</span>
</div>
</div>

<div className="grid grid-cols-3 gap-2">
<Button variant="outline" onClick={()=>handleDemoLogin("patient")} className="h-20 flex flex-col gap-1">
<User className="h-5 w-5"/><span className="text-xs">{t("login.patient")}</span>
</Button>
<Button variant="outline" onClick={()=>handleDemoLogin("hospital_staff")} className="h-20 flex flex-col gap-1">
<Building2 className="h-5 w-5"/><span className="text-xs">{t("login.hospital")}</span>
</Button>
<Button variant="outline" onClick={()=>handleDemoLogin("government_admin")} className="h-20 flex flex-col gap-1">
<Shield className="h-5 w-5"/><span className="text-xs">{t("login.admin")}</span>
</Button>
</div>
</>
):(
<>
<div className="text-center mb-6">
<div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
<Smartphone className="h-6 w-6 text-primary"/>
</div>
<h2 className="text-lg font-semibold">Verify OTP</h2>
<p className="text-sm text-muted-foreground">Demo: Use any 6-digit code</p>
</div>

<Alert className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
<p className="text-sm text-amber-800 dark:text-amber-200">Demo Mode: Use 123456</p>
</Alert>

{error&&<Alert variant="destructive"className="mb-4">{error}</Alert>}

<div className="space-y-4">
<Input placeholder="Enter 6-digit OTP" value={otp} onChange={(e)=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} className="h-11 text-center text-lg tracking-widest" maxLength={6}/>
<Button onClick={handleVerifyOtp} className="w-full h-11" disabled={loading}>{loading?t("common.loading"):"Verify and Login"}</Button>
<Button variant="ghost" onClick={()=>{setStep("select");setOtp("");setError("");}} className="w-full">{t("common.back")}</Button>
</div>
</>
)}
</CardContent>
</Card>

<p className="text-center text-xs text-muted-foreground mt-4">{t("home.disclaimer")}</p>
</div>
</div>);
}