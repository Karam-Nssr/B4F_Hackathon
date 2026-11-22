/*
Pseudocode:
Objective: define this segment's runtime error boundary.
Input: an unknown error and Next.js retry callback.
Process: delegate error presentation, logging, and recovery to shared UI.
Output: a consistent client-side recovery screen.
*/
"use client";

import ErrorBoundary from "@/components/common/error-boundary";

interface SegmentErrorProps {
  error: unknown;
  retry: () => void;
}

const SegmentError = ({ error, retry }: SegmentErrorProps) => (
  <ErrorBoundary error={error} retry={retry} />
);

export default SegmentError;
