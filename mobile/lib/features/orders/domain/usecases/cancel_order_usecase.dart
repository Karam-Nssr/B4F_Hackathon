import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/order_entity.dart';
import '../repositories/orders_repository.dart';
import 'get_order_details_usecase.dart';

class CancelOrderUseCase implements UseCase<OrderEntity, OrderIdParams> {
  final OrdersRepository repository;

  CancelOrderUseCase(this.repository);

  @override
  Future<Either<Failure, OrderEntity>> call(OrderIdParams params) {
    return repository.cancelOrder(params.orderId);
  }
}
