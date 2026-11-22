import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
  });

  /// The mobile app only registers normal clients (role `user`).
  Future<Either<Failure, UserEntity>> register({
    required String fullName,
    required String phone,
    required String nationalId,
    required String password,
    String email = '',
  });

  Future<Either<Failure, void>> logout();

  /// The user from the cached session, or null if there is no saved session.
  Future<Either<Failure, UserEntity?>> getCachedUser();
}
