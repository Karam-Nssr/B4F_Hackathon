import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
  }) {
    return _guard(() async {
      final response = await remoteDataSource.login(
        email: email,
        password: password,
      );
      return _saveSession(response);
    });
  }

  @override
  Future<Either<Failure, UserEntity>> register({
    required String fullName,
    required String phone,
    required String nationalId,
    required String password,
    String email = '',
  }) {
    return _guard(() async {
      final response = await remoteDataSource.register(
        fullName: fullName,
        phone: phone,
        nationalId: nationalId,
        password: password,
        email: email,
      );
      return _saveSession(response);
    });
  }

  @override
  Future<Either<Failure, void>> logout() {
    return _guard<void>(() => localDataSource.clearSession());
  }

  @override
  Future<Either<Failure, UserEntity?>> getCachedUser() {
    return _guard<UserEntity?>(() async {
      final token = await localDataSource.getToken();
      if (token == null || token.isEmpty) return null;
      return localDataSource.getCachedUser();
    });
  }

  Future<UserEntity> _saveSession(Map<String, dynamic> response) async {
    final token =
        (response['token'] ?? response['accessToken'] ?? response['access_token'])
            ?.toString();
    final rawUser = response['user'];

    if (token == null || token.isEmpty || rawUser is! Map) {
      throw const ServerException('لم يتم استلام بيانات الجلسة من الخادم');
    }

    final user = UserModel.fromJson(Map<String, dynamic>.from(rawUser));

    if (user.role != 'user') {
      throw const ServerException(
        'هذا الحساب غير مخصص لتطبيق الموبايل، يرجى استخدام لوحة التحكم على الويب',
      );
    }

    await localDataSource.saveToken(token);
    await localDataSource.saveUser(user);
    return user;
  }

  Future<Either<Failure, T>> _guard<T>(Future<T> Function() action) async {
    try {
      return Right(await action());
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message));
    }
  }
}
