import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final NumberFormat _grouped = NumberFormat('#,###', 'en_US');

  static String syp(num amount) => '${_grouped.format(amount)} ل.س';

  static String number(num value) => _grouped.format(value);

  static String productsCount(int count) {
    if (count == 0) return 'لا منتجات';
    if (count == 1) return 'منتج واحد';
    if (count == 2) return 'منتجان';
    if (count <= 10) return '$count منتجات';
    return '$count منتجاً';
  }
}
