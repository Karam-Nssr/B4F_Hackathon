import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/cart_item_entity.dart';
import '../entities/checkout_result_entity.dart';

abstract class CartRepository {
  Future<Either<Failure, List<CartItemEntity>>> getCart();

  Future<Either<Failure, List<CartItemEntity>>> saveCart(
    List<CartItemEntity> items,
  );

  Future<Either<Failure, CheckoutResultEntity>> checkout(
    List<CartItemEntity> items,
  );
}
