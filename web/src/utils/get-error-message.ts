import {
  getUnexpectedErrorMessage,
  localizeErrorMessage,
} from "@/utils/localize-error-message";

const getErrorMessage = (
  error: unknown,
  locale = "ar",
  fallback?: string,
): string => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : undefined;
  const fallbackMessage = fallback
    ? localizeErrorMessage(fallback, locale, getUnexpectedErrorMessage(locale))
    : getUnexpectedErrorMessage(locale);

  return localizeErrorMessage(
    message,
    locale,
    fallbackMessage,
  );
};

export default getErrorMessage;
