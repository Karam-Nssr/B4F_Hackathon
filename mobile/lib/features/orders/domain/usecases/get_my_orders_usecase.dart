import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/order_entity.dart';
import '../repositories/orders_repository.dart';

class GetMyOrdersUseCase implements UseCase<List<OrderEntity>, NoParams> {
  final OrdersRepository repository;

  GetMyOrdersUseCase(this.repository);

  @override
  Future<Either<Failure, List<OrderEntity>>> call(NoParams params) {
    return repository.getMyOrders();
  }
}
