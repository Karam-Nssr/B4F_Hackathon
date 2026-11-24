import 'package:dio/dio.dart';

import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_error_mapper.dart';
import '../../domain/repositories/profile_repository.dart';

abstract class ProfileRemoteDataSource {
  Future<Map<String, dynamic>> getProfile();

  Future<Map<String, dynamic>> updateProfile(UpdateProfileParams params);

  Future<Map<String, dynamic>> uploadPhoto(String filePath);

  Future<Map<String, dynamic>> deletePhoto();
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

  @override
  Future<Map<String, dynamic>> uploadPhoto(String filePath) async {
    try {
      final form = FormData.fromMap({
        'photo': await MultipartFile.fromFile(filePath),
      });
      final response = await client.patch(
        ApiEndpoints.userPhoto,
        data: form,
      );
      return _asMap(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  @override
  Future<Map<String, dynamic>> deletePhoto() async {
    try {
      final response = await client.delete(ApiEndpoints.userPhoto);
      return _asMap(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}

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

  @override
  Future<Map<String, dynamic>> uploadPhoto(String filePath) async {
    await Future<void>.delayed(const Duration(milliseconds: 700));
    _profile = {..._profile, 'photoUrl': '/api/media/avatars/fake-photo.jpg'};
    return Map<String, dynamic>.from(_profile);
  }

  @override
  Future<Map<String, dynamic>> deletePhoto() async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    _profile = {..._profile, 'photoUrl': null};
    return Map<String, dynamic>.from(_profile);
  }
}
