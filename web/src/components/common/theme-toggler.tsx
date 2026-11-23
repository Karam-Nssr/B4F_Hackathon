"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import { MoonIcon, SunIcon } from "@/icons";
import { useLocale } from "next-intl";

const ThemeToggler = () => {
  const { toggleTheme, theme } = useTheme();
  const locale = useLocale();
  const label =
    locale === "en"
      ? theme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode"
      : theme === "dark"
        ? "التبديل إلى الوضع الفاتح"
        : "التبديل إلى الوضع الداكن";

  return (
    <Button
      onClick={toggleTheme}
      className="size-14 rounded-full"
      aria-label={label}
      aria-pressed={theme === "dark"}
      title={label}
    >
      <MoonIcon className="block dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </Button>
  );
};

export default ThemeToggler;
