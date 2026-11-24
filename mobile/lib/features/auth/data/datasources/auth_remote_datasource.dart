import 'package:dio/dio.dart';

import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/error/exceptions.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  });

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String phone,
    required String nationalId,
    required String password,
    String email,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio client;

  AuthRemoteDataSourceImpl({required this.client});

  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) {
    return _post(ApiEndpoints.login, {'email': email, 'password': password});
  }

  @override
  Future<Map<String, dynamic>> register({
    required String fullName,
    required String phone,
    required String nationalId,
    required String password,
    String email = '',
  }) {
    return _post(ApiEndpoints.register, {
      'role': 'user',
      'fullName': fullName,
      'phone': phone,
      'nationalId': nationalId,
      'password': password,
      if (email.isNotEmpty) 'email': email,
    });
  }

  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, dynamic> body,
  ) async {
    try {
      final response = await client.post(path, data: body);
      final data = response.data;
      if (data is Map<String, dynamic>) return data;
      throw const ServerException('استجابة غير متوقعة من الخادم');
    } on DioException catch (e) {
      throw _mapDioException(e);
    }
  }

  Exception _mapDioException(DioException e) {
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
}

class AuthRemoteDataSourceFake implements AuthRemoteDataSource {
  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    if (email.isEmpty || password.isEmpty) {
      throw const ServerException('يرجى تعبئة جميع الحقول');
    }

    return {
      'token': 'mock_access_token',
      'user': {
        'id': '1',
        'fullName': 'مستخدم InstaMall',
        'phone': '',
        'nationalId': '',
        'email': email,
        'role': 'user',
      },
    };
  }

  @override
  Future<Map<String, dynamic>> register({
    required String fullName,
    required String phone,
    required String nationalId,
    required String password,
    String email = '',
  }) async {
    if (fullName.isEmpty ||
        email.isEmpty ||
        phone.isEmpty ||
        nationalId.isEmpty ||
        password.isEmpty) {
      throw const ServerException('يرجى تعبئة جميع الحقول');
    }

    return {
      'token': 'mock_access_token',
      'user': {
        'id': '1',
        'fullName': fullName,
        'phone': phone,
        'nationalId': nationalId,
        'email': email,
        'role': 'user',
      },
    };
  }
}
