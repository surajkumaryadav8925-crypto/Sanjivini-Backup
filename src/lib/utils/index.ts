import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { enIN } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr = "PPP"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: enIN });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: enIN });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "p", { locale: enIN });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "PPp", { locale: enIN });
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = parseISO(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  return phone;
}

export function validatePhone(phone: string): boolean {
  const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getRiskColor(level: 'red' | 'yellow' | 'green'): string {
  switch (level) {
    case 'red':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'yellow':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'green':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
}

export function getRiskBgColor(level: 'red' | 'yellow' | 'green'): string {
  switch (level) {
    case 'red':
      return 'bg-red-500';
    case 'yellow':
      return 'bg-amber-500';
    case 'green':
      return 'bg-emerald-500';
    default:
      return 'bg-muted-foreground';
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_APP_MODE === 'demo';
}

export function getDemoLabel(): string {
  return isDemoMode() ? 'DEMO' : '';
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
] as const;

export const SPECIALIZATIONS = [
  'General Medicine', 'General Surgery', 'Pediatrics', 'Obstetrics & Gynecology',
  'Orthopedics', 'Cardiology', 'Neurology', 'Neurosurgery', 'Oncology',
  'Gastroenterology', 'Pulmonology', 'Dermatology', 'Psychiatry', 'ENT',
  'Ophthalmology', 'Urology', 'Nephrology', 'Endocrinology', 'Rheumatology',
  'Emergency Medicine', 'Anesthesiology', 'Radiology', 'Pathology',
  'Microbiology', 'Dentistry', 'Physiotherapy'
] as const;

export const SYMPTOMS_CATEGORIES = [
  'Fever', 'Respiratory', 'Digestive', 'Cardiovascular', 'Neurological',
  'Musculoskeletal', 'Skin', 'Eye', 'Ear Nose Throat', 'Mental Health',
  'Urinary', 'Women Health', 'Children', 'General', 'Pain', 'Other'
] as const;
