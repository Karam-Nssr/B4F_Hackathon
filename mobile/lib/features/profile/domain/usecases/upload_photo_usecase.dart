import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/profile_entity.dart';
import '../repositories/profile_repository.dart';

class UploadPhotoUseCase implements UseCase<ProfileEntity, String> {
  final ProfileRepository repository;

  UploadPhotoUseCase(this.repository);

  @override
  Future<Either<Failure, ProfileEntity>> call(String params) {
    return repository.uploadPhoto(params);
  }
}

class DeletePhotoUseCase implements UseCase<ProfileEntity, NoParams> {
  final ProfileRepository repository;

  DeletePhotoUseCase(this.repository);

  @override
  Future<Either<Failure, ProfileEntity>> call(NoParams params) {
    return repository.deletePhoto();
  }
}
