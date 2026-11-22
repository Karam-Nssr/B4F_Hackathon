"use client";

import dynamic from "next/dynamic";
import type { VectorMapMarker, VectorMapProps } from "./vector-map-inner";

export const VectorMap = dynamic(() => import("./vector-map-inner"), {
  ssr: false,
});

export type { VectorMapProps, VectorMapMarker };

export default VectorMap;
