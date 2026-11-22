import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/product_entity.dart';
import '../entities/shop_entity.dart';

abstract class HomeRepository {
  /// Active products, optionally filtered exactly like `GET /api/products`
  /// (search / category / shop / price range, SAD §7.1).
  Future<Either<Failure, List<ProductEntity>>> getProducts({
    String? search,
    String? category,
    num? minPriceSyp,
    num? maxPriceSyp,
    String? shopId,
  });

  /// Active shops — used to resolve each product's shop name.
  Future<Either<Failure, List<ShopEntity>>> getShops();
}
