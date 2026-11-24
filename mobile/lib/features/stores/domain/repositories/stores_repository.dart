import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../home/domain/entities/shop_entity.dart';
import '../entities/shop_detail_entity.dart';

abstract class StoresRepository {
  Future<Either<Failure, List<ShopEntity>>> getShops();

  Future<Either<Failure, ShopDetailEntity>> getShopById(String id);
}
