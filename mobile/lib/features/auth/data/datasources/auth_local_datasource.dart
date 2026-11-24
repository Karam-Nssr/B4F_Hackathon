import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/error/exceptions.dart';
import '../models/user_model.dart';

abstract class AuthLocalDataSource {
  Future<void> saveToken(String token);
  Future<String?> getToken();
  Future<void> saveUser(UserModel user);
  Future<UserModel?> getCachedUser();

  Future<void> clearSession();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  static const _tokenKey = 'instamall_auth_token';
  static const _userKey = 'instamall_cached_user';

  final FlutterSecureStorage storage;

  AuthLocalDataSourceImpl({required this.storage});

  @override
  Future<void> saveToken(String token) async {
    try {
      await storage.write(key: _tokenKey, value: token);
    } catch (_) {
      throw const CacheException('تعذر حفظ جلسة الدخول على الجهاز');
    }
  }

  @override
  Future<String?> getToken() async {
    try {
      return await storage.read(key: _tokenKey);
    } catch (_) {
      throw const CacheException('تعذر قراءة جلسة الدخول من الجهاز');
    }
  }

  @override
  Future<void> saveUser(UserModel user) async {
    try {
      await storage.write(key: _userKey, value: jsonEncode(user.toJson()));
    } catch (_) {
      throw const CacheException('تعذر حفظ بيانات المستخدم على الجهاز');
    }
  }

  @override
  Future<UserModel?> getCachedUser() async {
    try {
      final raw = await storage.read(key: _userKey);
      if (raw == null || raw.isEmpty) return null;
      return UserModel.fromJson(
        Map<String, dynamic>.from(jsonDecode(raw) as Map),
      );
    } catch (_) {
      throw const CacheException('تعذر قراءة بيانات المستخدم من الجهاز');
    }
  }

  @override
  Future<void> clearSession() async {
    try {
      await storage.delete(key: _tokenKey);
      await storage.delete(key: _userKey);
    } catch (_) {
      throw const CacheException('تعذر حذف جلسة الدخول من الجهاز');
    }
  }
}
