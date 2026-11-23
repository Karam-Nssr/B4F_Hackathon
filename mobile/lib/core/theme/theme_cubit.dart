import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ThemeCubit extends Cubit<ThemeMode> {
  static const String _key = 'app_theme_mode';
  final FlutterSecureStorage storage;

  ThemeCubit({required this.storage}) : super(ThemeMode.system) {
    _loadSavedTheme();
  }

  Future<void> _loadSavedTheme() async {
    try {
      final saved = await storage.read(key: _key);
      if (saved == 'dark') {
        emit(ThemeMode.dark);
      } else if (saved == 'light') {
        emit(ThemeMode.light);
      } else {
        emit(ThemeMode.system);
      }
    } catch (_) {
      emit(ThemeMode.system);
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    emit(mode);
    try {
      final value = mode == ThemeMode.dark
          ? 'dark'
          : mode == ThemeMode.light
              ? 'light'
              : 'system';
      await storage.write(key: _key, value: value);
    } catch (_) {}
  }

  Future<void> toggleTheme() async {
    if (state == ThemeMode.dark) {
      await setThemeMode(ThemeMode.light);
    } else {
      await setThemeMode(ThemeMode.dark);
    }
  }
}
