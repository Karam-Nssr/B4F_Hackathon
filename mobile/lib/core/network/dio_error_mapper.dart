import 'package:dio/dio.dart';

import '../error/exceptions.dart';

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

  final data = e.response?.data;
  String? message;
  if (data is Map && data['message'] != null) {
    final raw = data['message'];
    message = raw is List ? raw.join('\n') : raw.toString();
  }
  return ServerException(message ?? 'حدث خطأ في الخادم');
}
