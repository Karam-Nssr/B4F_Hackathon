import 'package:dio/dio.dart';

import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_error_mapper.dart';
import '../../domain/repositories/profile_repository.dart';

/// `GET /api/users/me` + `PATCH /api/users/me` (JWT + role `user`).
abstract class ProfileRemoteDataSource {
  Future<Map<String, dynamic>> getProfile();

  Future<Map<String, dynamic>> updateProfile(UpdateProfileParams params);
}

class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  final Dio client;

  ProfileRemoteDataSourceImpl({required this.client});

  @override
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await client.get(ApiEndpoints.userProfile);
      return _asMap(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  @override
  Future<Map<String, dynamic>> updateProfile(UpdateProfileParams params) async {
    try {
      final response = await client.patch(
        ApiEndpoints.userProfile,
        data: {
          'fullName': params.fullName,
          'email': params.email,
          'phone': params.phone,
          'nationalId': params.nationalId,
        },
      );
      return _asMap(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Map<String, dynamic> _asMap(dynamic data) {
    if (data is Map) return Map<String, dynamic>.from(data);
    throw const ServerException('استجابة غير متوقعة من الخادم');
  }
}

/// Offline mock — keeps the edited profile in memory for the session.
class ProfileRemoteDataSourceFake implements ProfileRemoteDataSource {
  Map<String, dynamic> _profile = {
    '_id': 'user_fake',
    'fullName': 'مستخدم تجريبي',
    'email': 'demo@instamall.sy',
    'phone': '09991234567',
    'nationalId': '12345678901',
    'role': 'user',
    'createdAt': '2026-11-01T08:00:00.000Z',
  };

  @override
  Future<Map<String, dynamic>> getProfile() async {
    await Future<void>.delayed(const Duration(milliseconds: 350));
    return Map<String, dynamic>.from(_profile);
  }

  @override
  Future<Map<String, dynamic>> updateProfile(UpdateProfileParams params) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (params.email != _profile['email'] &&
        params.email == 'taken@instamall.sy') {
      throw const ServerException('هذا البريد الإلكتروني مستخدم بالفعل');
    }
    _profile = {
      ..._profile,
      'fullName': params.fullName,
      'email': params.email,
      'phone': params.phone,
      'nationalId': params.nationalId,
    };
    return Map<String, dynamic>.from(_profile);
  }
}
