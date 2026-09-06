"use client";

import { useCallback, useMemo } from "react";
import { useUIStore } from "@/stores";
import { en, supportedLanguages, type LanguageCode } from "@/i18n";
import { getTranslation } from "@/i18n/index";

// Type for nested object access
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
        : `${K}`
      : never
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

export function useTranslation() {
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  const translations = useMemo(() => {
    return getTranslation(language as LanguageCode);
  }, [language]);

  // Get translation by key path (e.g., "patient.dashboard.welcome")
  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let value: unknown = translations;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Fallback to English if key not found
          let fallback: unknown = en;
          for (const fk of keys) {
            if (fallback && typeof fallback === "object" && fk in fallback) {
              fallback = (fallback as Record<string, unknown>)[fk];
            } else {
              return key; // Return key if not found in fallback either
            }
          }
          return typeof fallback === "string" ? fallback : key;
        }
      }

      return typeof value === "string" ? value : key;
    },
    [translations]
  );

  // Get all supported languages
  const languages = supportedLanguages;

  // Get current language info
  const currentLanguage = useMemo(() => {
    return languages.find((l) => l.code === language) || languages[0];
  }, [language, languages]);

  return {
    t,
    language: language as LanguageCode,
    setLanguage,
    languages,
    currentLanguage,
  };
}

// Helper function to interpolate variables in translations
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return key in values ? String(values[key]) : `{${key}}`;
  });
}
