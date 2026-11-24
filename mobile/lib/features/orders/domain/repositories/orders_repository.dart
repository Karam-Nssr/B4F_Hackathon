import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/order_entity.dart';

abstract class OrdersRepository {
  Future<Either<Failure, List<OrderEntity>>> getMyOrders();

  Future<Either<Failure, OrderEntity>> getOrderById(String orderId);

  Future<Either<Failure, OrderEntity>> cancelSubOrder(String subOrderId);

  Future<Either<Failure, OrderEntity>> cancelOrder(String orderId);
}
