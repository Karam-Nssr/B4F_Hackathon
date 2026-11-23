"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import { MoonIcon, SunIcon } from "@/icons";
import { cn } from "@/utils";
import { useLocale } from "next-intl";

const ThemeToggleButton = ({ className }: { className?: string }) => {
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
      variant="outline"
      size="icon-lg"
      className={cn("relative", className)}
      aria-label={label}
      aria-pressed={theme === "dark"}
      title={label}
      onClick={toggleTheme}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

export default ThemeToggleButton;
