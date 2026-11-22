"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 1280; // xl breakpoint — matches TailAdmin sidebar's xl:translate-x-0

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      if (active) setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    queueMicrotask(onChange);
    return () => {
      active = false;
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
};

export default useIsMobile;
