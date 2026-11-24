import 'dart:convert';

import 'package:hive/hive.dart';

import '../../../../core/error/exceptions.dart';

abstract class CartLocalDataSource {
  Future<List<Map<String, dynamic>>> readItems();

  Future<void> writeItems(List<Map<String, dynamic>> items);
}

class CartLocalDataSourceImpl implements CartLocalDataSource {
  final Box<String> box;

  static const _key = 'cart_items';

  CartLocalDataSourceImpl({required this.box});

  @override
  Future<List<Map<String, dynamic>>> readItems() async {
    try {
      final raw = box.get(_key);
      if (raw == null || raw.isEmpty) return const [];
      final decoded = jsonDecode(raw);
      if (decoded is! List) return const [];
      return decoded
          .whereType<Map>()
          .map((row) => Map<String, dynamic>.from(row))
          .toList();
    } catch (_) {
      return const [];
    }
  }

  @override
  Future<void> writeItems(List<Map<String, dynamic>> items) async {
    try {
      await box.put(_key, jsonEncode(items));
    } catch (_) {
      throw const CacheException('تعذر حفظ السلة على الجهاز');
    }
  }
}
