import { en } from "./en";
import { hi } from "./hi";

export { en, hi };

export const supportedLanguages = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
] as const;

export type LanguageCode = typeof supportedLanguages[number]["code"];

type TranslationType = typeof en;

const translations: Record<LanguageCode, TranslationType> = { en, hi };

const fallbackTranslation = en;

export function getTranslation(lang: LanguageCode) {
  return translations[lang] || fallbackTranslation;
}

export { fallbackTranslation };
export type { TranslationKeys } from "./en";