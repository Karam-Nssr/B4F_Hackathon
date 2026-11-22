"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import { MoonIcon, SunIcon } from "@/icons";

const ThemeToggleButton = () => {
  const { toggleTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon-lg"
      className="relative"
      aria-label="Toggle notifications"
      onClick={toggleTheme}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

export default ThemeToggleButton;
