import 'package:dio/dio.dart';

import '../error/exceptions.dart';

/// Translates a [DioException] into the data-layer exception the
/// repositories understand. Shared by every remote data source so error
/// handling stays identical across features.
Exception mapDioException(DioException e) {
  switch (e.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.connectionError:
      return const NetworkException('تعذر الاتصال بالخادم، تحقق من الإنترنت');
    default:
      break;
  }

  // NestJS errors look like { statusCode, message: string | string[], error }
  final data = e.response?.data;
  String? message;
  if (data is Map && data['message'] != null) {
    final raw = data['message'];
    message = raw is List ? raw.join('\n') : raw.toString();
  }
  return ServerException(message ?? 'حدث خطأ في الخادم');
}
