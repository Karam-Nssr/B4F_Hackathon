import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/product_entity.dart';
import '../entities/shop_entity.dart';

abstract class HomeRepository {
  Future<Either<Failure, List<ProductEntity>>> getProducts({
    String? search,
    String? category,
    num? minPriceSyp,
    num? maxPriceSyp,
    String? shopId,
  });

  Future<Either<Failure, List<ShopEntity>>> getShops();
}
