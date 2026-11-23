const FALLBACK_MESSAGES = {
  ar: {
    unexpected: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    network: "تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.",
    validation: "تحقق من البيانات المدخلة وحاول مرة أخرى.",
    request: "تعذر إكمال الطلب. يرجى المحاولة مرة أخرى.",
    unauthorized:
      "انتهت صلاحية الجلسة أو بيانات الدخول غير صحيحة. يرجى تسجيل الدخول مجدداً.",
    forbidden: "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
    notFound: "لم يتم العثور على البيانات المطلوبة.",
    tooMany: "محاولات كثيرة. يرجى الانتظار قليلاً ثم المحاولة.",
    server: "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.",
    timeout: "استغرق الطلب وقتاً طويلاً. يرجى المحاولة مرة أخرى.",
  },
  en: {
    unexpected: "Something went wrong. Please try again.",
    network: "Could not connect to the server. Check your connection and try again.",
    validation: "Check the entered information and try again.",
    request: "Could not complete the request. Please try again.",
    unauthorized:
      "Your session expired or your credentials are incorrect. Please sign in again.",
    forbidden: "You do not have permission to perform this action.",
    notFound: "The requested information could not be found.",
    tooMany: "Too many attempts. Please wait a moment and try again.",
    server: "A server error occurred. Please try again later.",
    timeout: "The request timed out. Please try again.",
  },
} as const;

const ARABIC_TRANSLATIONS: Record<string, string> = {
  "Invalid email or password":
    "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "A bearer token is required":
    FALLBACK_MESSAGES.ar.unauthorized,
  "Invalid access token": FALLBACK_MESSAGES.ar.unauthorized,
  "Invalid or expired access token": FALLBACK_MESSAGES.ar.unauthorized,
  "Admin accounts cannot be registered publicly":
    "لا يمكن إنشاء حساب مشرف من خلال التسجيل العام.",
  "Password exceeds bcrypt's 72-byte limit":
    "كلمة المرور أطول من الحد المسموح. اختر كلمة أقصر.",
  "Email is already registered": "البريد الإلكتروني مسجل مسبقاً.",
  "minPriceSyp cannot exceed maxPriceSyp":
    "الحد الأدنى للسعر لا يمكن أن يتجاوز الحد الأعلى.",
  "Product not found": "المنتج غير موجود.",
  "Shop not found": "المتجر غير موجود.",
  "User not found": "المستخدم غير موجود.",
  "Order not found": "الطلب غير موجود.",
  "Save a phone number and national ID in your profile before ordering":
    "احفظ رقم هاتفك ورقمك الوطني في ملفك الشخصي قبل إتمام الطلب.",
  "A product quantity cannot exceed 10000":
    "لا يمكن أن تتجاوز كمية المنتج 10000.",
  "One or more products are unavailable":
    "منتج واحد أو أكثر غير متاح حالياً.",
  "Order total must be a positive SYP amount":
    "إجمالي الطلب يجب أن يكون مبلغاً موجباً بالليرة السورية.",
  "Order creation failed and requires database cleanup":
    "تعذر إنشاء الطلب. يرجى المحاولة لاحقاً.",
  "At least one profile field is required":
    "عدّل حقلاً واحداً على الأقل قبل الحفظ.",
  "Invalid identifier": "المعرّف غير صالح.",
  "The order confirmation window has expired":
    "انتهت مهلة تأكيد هذا الطلب.",
  "No active shop is associated with this account":
    "لا يوجد متجر نشط مرتبط بهذا الحساب.",
  "First name is required": "الاسم الأول مطلوب.",
  "Last name is required": "اسم العائلة مطلوب.",
  "Email is required": "البريد الإلكتروني مطلوب.",
  "Email address is required": "البريد الإلكتروني مطلوب.",
  "Please enter a valid email address":
    "يرجى إدخال بريد إلكتروني صحيح.",
  "Please confirm your password": "يرجى تأكيد كلمة المرور.",
  "Please confirm your new password": "يرجى تأكيد كلمة المرور الجديدة.",
  "Please select category": "يرجى اختيار التصنيف.",
  "Please select country": "يرجى اختيار الدولة.",
  "Please select subject": "يرجى اختيار الموضوع.",
  "Date of birth is required": "تاريخ الميلاد مطلوب.",
  "Street address is required": "عنوان الشارع مطلوب.",
  "City/State is required": "المدينة والمحافظة مطلوبتان.",
  "Post code is required": "الرمز البريدي مطلوب.",
  "Postal Code is required": "الرمز البريدي مطلوب.",
  "TAX ID is required": "الرقم الضريبي مطلوب.",
  "Phone number is required": "رقم الهاتف مطلوب.",
  "Current password is required": "كلمة المرور الحالية مطلوبة.",
  "Membership is required": "نوع العضوية مطلوب.",
  "Name is required": "الاسم مطلوب.",
  "Subject is required": "الموضوع مطلوب.",
  "Message is required": "الرسالة مطلوبة.",
};

const ENGLISH_BY_ARABIC = new Map(
  Object.entries(ARABIC_TRANSLATIONS).map(([english, arabic]) => [
    arabic,
    english,
  ]),
);
const ENGLISH_FALLBACK_TRANSLATIONS: Record<string, string> = {
  "تعذر حفظ المنتج": "Could not save the product.",
  "تعذر حذف المنتج": "Could not delete the product.",
  "تعذر تحديث حالة الطلب": "Could not update the order status.",
  "تعذر إرسال الطلب": "Could not submit the order.",
  "تعذر تسجيل الدخول": "Could not sign in.",
  "تعذر تسجيل الدخول التجريبي": "Could not sign in with the demo account.",
  "تعذر حفظ البيانات": "Could not save the identity information.",
  "لم يتم تحديد متجر لهذا الحساب بعد": "No shop is assigned to this account yet.",
};
for (const [arabic, english] of Object.entries(ENGLISH_FALLBACK_TRANSLATIONS)) {
  ENGLISH_BY_ARABIC.set(arabic, english);
}
ENGLISH_BY_ARABIC.set(
  FALLBACK_MESSAGES.ar.unauthorized,
  FALLBACK_MESSAGES.en.unauthorized,
);

const ARABIC_FIELD_NAMES: Record<string, string> = {
  category: "التصنيف",
  city: "المدينة",
  "city state": "المدينة والمحافظة",
  confirm: "التأكيد",
  country: "الدولة",
  "current password": "كلمة المرور الحالية",
  "date of birth": "تاريخ الميلاد",
  description: "الوصف",
  email: "البريد الإلكتروني",
  "email address": "البريد الإلكتروني",
  firstname: "الاسم الأول",
  "first name": "الاسم الأول",
  fullname: "الاسم الكامل",
  "full name": "الاسم الكامل",
  lastname: "اسم العائلة",
  "last name": "اسم العائلة",
  membership: "نوع العضوية",
  message: "الرسالة",
  name: "الاسم",
  nationalid: "الرقم الوطني",
  "national id": "الرقم الوطني",
  password: "كلمة المرور",
  phone: "رقم الهاتف",
  phonenumber: "رقم الهاتف",
  "phone number": "رقم الهاتف",
  price: "السعر",
  pricesyp: "السعر",
  "price syp": "السعر",
  productid: "المنتج",
  quantity: "الكمية",
  state: "المحافظة",
  subject: "الموضوع",
  title: "العنوان",
  username: "اسم المستخدم",
};

const getLocale = (locale: string): "ar" | "en" =>
  locale.toLowerCase().startsWith("en") ? "en" : "ar";

const getArabicFieldName = (field: string): string => {
  const normalized = field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .trim()
    .toLowerCase();

  return ARABIC_FIELD_NAMES[normalized] ?? "هذا الحقل";
};

const localizeValidationMessage = (message: string): string | undefined => {
  if (/^(invalid input|expected .+, received .+)$/i.test(message)) {
    return FALLBACK_MESSAGES.ar.validation;
  }

  const requiredMatch = message.match(/^(.+?) is required$/i);
  if (requiredMatch) {
    const fieldName = getArabicFieldName(requiredMatch[1]);
    return fieldName === "هذا الحقل"
      ? "هذا الحقل مطلوب."
      : `حقل ${fieldName} مطلوب.`;
  }

  const selectMatch = message.match(/^please select (.+)$/i);
  if (selectMatch) {
    return `يرجى اختيار ${getArabicFieldName(selectMatch[1])}.`;
  }

  const minLengthMatch = message.match(
    /^(.+?) must be (?:at least|longer than or equal to) (\d+) characters?$/i,
  );
  if (minLengthMatch) {
    return `يجب ألا يقل طول ${getArabicFieldName(minLengthMatch[1])} عن ${minLengthMatch[2]} أحرف.`;
  }

  const maxLengthMatch = message.match(
    /^(.+?) must be (?:at most|shorter than or equal to) (\d+) characters?$/i,
  );
  if (maxLengthMatch) {
    return `يجب ألا يتجاوز طول ${getArabicFieldName(maxLengthMatch[1])} ${maxLengthMatch[2]} أحرف.`;
  }

  const invalidEmailMatch = message.match(/^(.+?) must be an? email$/i);
  if (invalidEmailMatch) {
    return "يرجى إدخال بريد إلكتروني صحيح.";
  }

  const unexpectedPropertyMatch = message.match(/^(.+?) should not exist$/i);
  if (unexpectedPropertyMatch) {
    return `الحقل ${getArabicFieldName(unexpectedPropertyMatch[1])} غير مسموح به.`;
  }

  return undefined;
};

export const getApiErrorFallbackMessage = (
  status: number,
  locale: string,
): string => {
  const messages = FALLBACK_MESSAGES[getLocale(locale)];

  if (status === 401) return messages.unauthorized;
  if (status === 403) return messages.forbidden;
  if (status === 404) return messages.notFound;
  if (status === 408) return messages.timeout;
  if (status === 429) return messages.tooMany;
  if (status >= 500) return messages.server;
  if (status === 400 || status === 422) return messages.validation;
  return messages.request;
};

export const getUnexpectedErrorMessage = (locale: string): string =>
  FALLBACK_MESSAGES[getLocale(locale)].unexpected;

export const getValidationErrorMessage = (locale: string): string =>
  FALLBACK_MESSAGES[getLocale(locale)].validation;

export const getNetworkErrorMessage = (locale: string): string =>
  FALLBACK_MESSAGES[getLocale(locale)].network;

export const localizeErrorMessage = (
  message: unknown,
  locale: string = "ar",
  fallback?: string,
): string => {
  const language = getLocale(locale);
  const fallbackMessage =
    fallback ?? FALLBACK_MESSAGES[language].unexpected;
  if (typeof message !== "string" || !message.trim()) return fallbackMessage;

  const normalized = message.trim().replace(/\s+/g, " ");
  if (language === "en") {
    const translated = ENGLISH_BY_ARABIC.get(normalized);
    if (translated) return translated;
    return /[\u0600-\u06ff]/u.test(normalized) ? fallbackMessage : normalized;
  }
  if (/[\u0600-\u06ff]/u.test(normalized)) return normalized;

  const translated =
    ARABIC_TRANSLATIONS[normalized] ?? localizeValidationMessage(normalized);
  if (translated) return translated;

  if (/failed to fetch|fetch failed|networkerror|load failed|econnrefused/i.test(normalized)) {
    return FALLBACK_MESSAGES.ar.network;
  }

  return fallbackMessage;
};
