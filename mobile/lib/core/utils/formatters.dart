import 'package:intl/intl.dart';

/// Money / number formatting shared by every screen that shows a price.
/// SAD FR-04: all amounts are Syrian pounds with thousands separators.
class Formatters {
  Formatters._();

  static final NumberFormat _grouped = NumberFormat('#,###', 'en_US');

  /// `95,000 ل.س` — grouped number followed by the currency mark.
  static String syp(num amount) => '${_grouped.format(amount)} ل.س';

  /// Grouped number without the currency (when the caller renders `ل.س`
  /// itself as a separate styled widget).
  static String number(num value) => _grouped.format(value);

  /// Arabic count label for a product list: `منتج واحد`, `منتجان`,
  /// `4 منتجات`, `20 منتجاً`.
  static String productsCount(int count) {
    if (count == 0) return 'لا منتجات';
    if (count == 1) return 'منتج واحد';
    if (count == 2) return 'منتجان';
    if (count <= 10) return '$count منتجات';
    return '$count منتجاً';
  }
}
