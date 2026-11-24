import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, UserEntity>> register({
    required String fullName,
    required String phone,
    required String nationalId,
    required String password,
    String email = '',
  });

  Future<Either<Failure, void>> logout();

  Future<Either<Failure, UserEntity?>> getCachedUser();
}
