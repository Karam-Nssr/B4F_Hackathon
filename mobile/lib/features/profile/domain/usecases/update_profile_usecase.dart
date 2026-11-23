import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/profile_entity.dart';
import '../repositories/profile_repository.dart';

/// Saves the profile form (`PATCH /api/users/me`, SAD FR-07).
class UpdateProfileUseCase
    implements UseCase<ProfileEntity, UpdateProfileParams> {
  final ProfileRepository repository;

  UpdateProfileUseCase(this.repository);

  @override
  Future<Either<Failure, ProfileEntity>> call(UpdateProfileParams params) {
    return repository.updateProfile(params);
  }
}
