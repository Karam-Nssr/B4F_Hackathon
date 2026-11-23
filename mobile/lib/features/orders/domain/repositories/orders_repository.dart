import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/order_entity.dart';

abstract class OrdersRepository {
  /// The signed-in user's orders with their sub-orders and invoices
  /// (`GET /api/orders/my`, SAD FR-07).
  Future<Either<Failure, List<OrderEntity>>> getMyOrders();
}
