import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/order_entity.dart';
import '../repositories/orders_repository.dart';

class OrderIdParams {
  final String orderId;

  const OrderIdParams({required this.orderId});
}

class GetOrderDetailsUseCase implements UseCase<OrderEntity, OrderIdParams> {
  final OrdersRepository repository;

  GetOrderDetailsUseCase(this.repository);

  @override
  Future<Either<Failure, OrderEntity>> call(OrderIdParams params) {
    return repository.getOrderById(params.orderId);
  }
}
