import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/profile_entity.dart';

abstract class ProfileRepository {
  /// Current user's profile (`GET /api/users/me`).
  Future<Either<Failure, ProfileEntity>> getProfile();

  /// Updates the editable fields (`PATCH /api/users/me`) and returns the
  /// profile as saved by the server.
  Future<Either<Failure, ProfileEntity>> updateProfile(
    UpdateProfileParams params,
  );
}

/// The four fields of the SAD §8 profile form.
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
