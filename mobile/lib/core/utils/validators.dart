/// Form validators + input normalisation shared by auth screens.
/// Rules follow SAD §6.3.
class Validators {
  Validators._();

  /// Converts Arabic-Indic (٠-٩) and Persian (۰-۹) digits to ASCII so the
  /// regexes work with Arabic keyboards.
  static String normalizeDigits(String input) {
    final buffer = StringBuffer();
    for (final unit in input.runes) {
      if (unit >= 0x0660 && unit <= 0x0669) {
        buffer.writeCharCode(unit - 0x0660 + 0x30);
      } else if (unit >= 0x06F0 && unit <= 0x06F9) {
        buffer.writeCharCode(unit - 0x06F0 + 0x30);
      } else {
        buffer.writeCharCode(unit);
      }
    }
    return buffer.toString();
  }

  /// Digits normalised and spaces / dashes / brackets removed.
  static String normalizePhone(String input) =>
      normalizeDigits(input).replaceAll(RegExp(r'[\s\-()]'), '');

  static String? required(String? value, String field) {
    if (value == null || value.trim().isEmpty) return '$field مطلوب';
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'البريد الإلكتروني مطلوب';
    }
    if (!RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$').hasMatch(value.trim())) {
      return 'البريد الإلكتروني غير صالح';
    }
    return null;
  }

  /// Empty is fine; otherwise must be a valid email.
  static String? optionalEmail(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    return email(value);
  }

  /// Syrian mobile: 09XXXXXXXX, +9639XXXXXXXX or 009639XXXXXXXX.
  static String? syrianPhone(String? value) {
    if (value == null || value.trim().isEmpty) return 'رقم الهاتف مطلوب';
    final phone = normalizePhone(value);
    if (!RegExp(r'^(?:09|\+9639|009639)\d{8}$').hasMatch(phone)) {
      return 'أدخل رقم هاتف سوري صحيح (مثل 09XXXXXXXX)';
    }
    return null;
  }

  /// National number: exactly 11 digits.
  static String? nationalId(String? value) {
    if (value == null || value.trim().isEmpty) return 'الرقم الوطني مطلوب';
    if (!RegExp(r'^\d{11}$').hasMatch(normalizeDigits(value.trim()))) {
      return 'الرقم الوطني يجب أن يتكون من 11 رقمًا';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'كلمة المرور مطلوبة';
    if (value.length < 8) return 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل';
    return null;
  }
}
