import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../endpoints/api_endpoints.dart';

/// Builds the app-wide [Dio] instance.
/// [tokenProvider] is called per request so the JWT is always the latest one.
class ApiClient {
  ApiClient._();

  static Dio create({required Future<String?> Function() tokenProvider}) {
    final dio = Dio(
      BaseOptions(
        baseUrl: ApiEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: const {'Accept': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await tokenProvider();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );

    if (kDebugMode) {
      // Shows URL, status and response in the console (request body is not
      // logged so passwords stay out of it).
      dio.interceptors.add(
        LogInterceptor(requestBody: false, responseBody: true),
      );
    }

    return dio;
  }
}
