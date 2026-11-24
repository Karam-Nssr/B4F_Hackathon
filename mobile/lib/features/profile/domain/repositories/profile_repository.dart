import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/profile_entity.dart';

abstract class ProfileRepository {
  Future<Either<Failure, ProfileEntity>> getProfile();

  Future<Either<Failure, ProfileEntity>> updateProfile(
    UpdateProfileParams params,
  );

  Future<Either<Failure, ProfileEntity>> uploadPhoto(String filePath);

  Future<Either<Failure, ProfileEntity>> deletePhoto();
}

class UpdateProfileParams {
  final String fullName;
  final String email;
  final String phone;
  final String nationalId;

  const UpdateProfileParams({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.nationalId,
  });
}
