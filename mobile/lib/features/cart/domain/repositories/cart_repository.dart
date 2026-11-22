import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/cart_item_entity.dart';
import '../entities/checkout_result_entity.dart';

abstract class CartRepository {
  /// The persisted cart (Hive), restored on app start.
  Future<Either<Failure, List<CartItemEntity>>> getCart();

  /// Persists the whole cart after any change and returns the saved list.
  Future<Either<Failure, List<CartItemEntity>>> saveCart(
    List<CartItemEntity> items,
  );

  /// Submits the cart as one order; the backend splits it into one
  /// sub-order per shop (SAD FR-05 / §7.2).
  Future<Either<Failure, CheckoutResultEntity>> checkout(
    List<CartItemEntity> items,
  );
}
