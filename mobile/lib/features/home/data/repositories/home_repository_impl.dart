import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/product_entity.dart';
import '../../domain/entities/shop_entity.dart';
import '../../domain/repositories/home_repository.dart';
import '../datasources/home_remote_datasource.dart';
import '../models/product_model.dart';
import '../models/shop_model.dart';

class HomeRepositoryImpl implements HomeRepository {
  final HomeRemoteDataSource remoteDataSource;

  HomeRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<ProductEntity>>> getProducts({
    String? search,
    String? category,
    num? minPriceSyp,
    num? maxPriceSyp,
    String? shopId,
  }) {
    return _guard(() async {
      final rows = await remoteDataSource.getProducts(
        search: search,
        category: category,
        minPriceSyp: minPriceSyp,
        maxPriceSyp: maxPriceSyp,
        shopId: shopId,
      );
      return rows.map(ProductModel.fromJson).toList();
    });
  }

  @override
  Future<Either<Failure, List<ShopEntity>>> getShops() {
    return _guard(() async {
      final rows = await remoteDataSource.getShops();
      return rows.map(ShopModel.fromJson).toList();
    });
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
