import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../home/domain/entities/shop_entity.dart';
import '../entities/shop_detail_entity.dart';

abstract class StoresRepository {
  /// All active shops (`GET /api/shops`).
  Future<Either<Failure, List<ShopEntity>>> getShops();

  /// One shop with its products (`GET /api/shops/:id`).
  Future<Either<Failure, ShopDetailEntity>> getShopById(String id);
}
