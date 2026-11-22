import { SaFlagIcon } from "@/icons";
import { UsFlagIcon } from "@/icons";
import type { Locale } from "./routing";

export interface Language {
  id: Locale;
  name: string;
  shortName: string;
  dir: "ltr" | "rtl";
  FlagIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
}

export const languages: Language[] = [
  {
    id: "ar",
    name: "العربية (سوريا)",
    shortName: "العربية",
    dir: "rtl",
    FlagIcon: SaFlagIcon,
    badge: "RTL",
  },
  {
    id: "en",
    name: "English",
    shortName: "English",
    dir: "ltr",
    FlagIcon: UsFlagIcon,
  },
];

export const getLanguage = (locale: Locale): Language => {
  return (
    languages.find((l) => l.id === locale) ||
    languages.find((l) => l.id === "en") ||
    languages[0]
  );
};

export const isRtl = (locale: Locale): boolean => {
  return getLanguage(locale).dir === "rtl";
};

export default getLanguage;
