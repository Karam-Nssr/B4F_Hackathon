import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/cart_item_entity.dart';
import '../../domain/entities/checkout_result_entity.dart';
import '../../domain/repositories/cart_repository.dart';
import '../datasources/cart_local_datasource.dart';
import '../datasources/orders_remote_datasource.dart';
import '../models/cart_item_model.dart';

class CartRepositoryImpl implements CartRepository {
  final CartLocalDataSource localDataSource;
  final OrdersRemoteDataSource remoteDataSource;

  CartRepositoryImpl({
    required this.localDataSource,
    required this.remoteDataSource,
  });

  @override
  Future<Either<Failure, List<CartItemEntity>>> getCart() {
    return _guard(() async {
      final rows = await localDataSource.readItems();
      return rows.map(CartItemModel.fromJson).toList();
    });
  }

  @override
  Future<Either<Failure, List<CartItemEntity>>> saveCart(
    List<CartItemEntity> items,
  ) {
    return _guard(() async {
      final rows = items
          .map(
            (item) => CartItemModel(
              productId: item.productId,
              shopId: item.shopId,
              shopName: item.shopName,
              title: item.title,
              imageUrl: item.imageUrl,
              unitPriceSyp: item.unitPriceSyp,
              quantity: item.quantity,
            ),
          )
          .toList();
      await localDataSource.writeItems(rows.map((row) => row.toJson()).toList());
      return items;
    });
  }

  @override
  Future<Either<Failure, CheckoutResultEntity>> checkout(
    List<CartItemEntity> items,
  ) {
    return _guard(() async {
      final payload = items
          .map(
            (item) => {
              'productId': item.productId,
              'quantity': item.quantity,
            },
          )
          .toList();

      final response = await remoteDataSource.createOrder(payload);

      // The totals are computed from the cart we submitted: it is what the
      // user confirmed, and it keeps the success screen working even if the
      // backend response shape changes.
      return CheckoutResultEntity(
        orderId: response['_id']?.toString() ?? '',
        totalAmountSyp: items.fold<num>(0, (sum, item) => sum + item.totalSyp),
        shopsCount: items.map((item) => item.shopId).toSet().length,
      );
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
