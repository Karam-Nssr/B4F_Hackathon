import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../home/data/models/shop_model.dart';
import '../../../home/domain/entities/shop_entity.dart';
import '../../domain/entities/shop_detail_entity.dart';
import '../../domain/repositories/stores_repository.dart';
import '../datasources/stores_remote_datasource.dart';
import '../models/shop_detail_model.dart';

class StoresRepositoryImpl implements StoresRepository {
  final StoresRemoteDataSource remoteDataSource;

  StoresRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<ShopEntity>>> getShops() {
    return _guard(() async {
      final rows = await remoteDataSource.getShops();
      return rows.map(ShopModel.fromJson).toList();
    });
  }

  @override
  Future<Either<Failure, ShopDetailEntity>> getShopById(String id) {
    return _guard(() async {
      final json = await remoteDataSource.getShopById(id);
      return ShopDetailModel.fromJson(json);
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
