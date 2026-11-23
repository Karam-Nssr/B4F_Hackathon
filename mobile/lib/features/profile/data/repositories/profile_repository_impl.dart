import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/profile_entity.dart';
import '../../domain/repositories/profile_repository.dart';
import '../datasources/profile_remote_datasource.dart';
import '../models/profile_model.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource remoteDataSource;

  ProfileRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, ProfileEntity>> getProfile() {
    return _guard(() async {
      final json = await remoteDataSource.getProfile();
      return ProfileModel.fromJson(json);
    });
  }

  @override
  Future<Either<Failure, ProfileEntity>> updateProfile(
    UpdateProfileParams params,
  ) {
    return _guard(() async {
      final json = await remoteDataSource.updateProfile(params);
      return ProfileModel.fromJson(json);
    });
  }

  /// Translates data-layer exceptions into domain [Failure]s.
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
