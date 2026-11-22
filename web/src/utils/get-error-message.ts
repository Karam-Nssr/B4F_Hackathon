/*
Pseudocode:
Objective: turn unknown request/runtime failures into a displayable message.
Input: any caught value.
Process: preserve non-empty Error messages and strings; otherwise use a safe
generic fallback rather than pretending the operation succeeded.
Output: a non-empty user-facing string.
*/
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "An unexpected error occurred.";
};

export default getErrorMessage;
