import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/profile_entity.dart';
import '../repositories/profile_repository.dart';

/// Loads the profile for the "حسابي" tab.
class GetProfileUseCase implements UseCase<ProfileEntity, NoParams> {
  final ProfileRepository repository;

  GetProfileUseCase(this.repository);

  @override
  Future<Either<Failure, ProfileEntity>> call(NoParams params) {
    return repository.getProfile();
  }
}
