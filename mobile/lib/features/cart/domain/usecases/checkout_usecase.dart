import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/cart_item_entity.dart';
import '../entities/checkout_result_entity.dart';
import '../repositories/cart_repository.dart';

/// Submits the cart as an order (requires a logged-in user — the backend
/// guards `POST /api/orders` with JWT + role `user`).
class CheckoutUseCase
    implements UseCase<CheckoutResultEntity, CheckoutParams> {
  final CartRepository repository;

  CheckoutUseCase(this.repository);

  @override
  Future<Either<Failure, CheckoutResultEntity>> call(CheckoutParams params) {
    return repository.checkout(params.items);
  }
}

class CheckoutParams extends Equatable {
  final List<CartItemEntity> items;

  const CheckoutParams({required this.items});

  @override
  List<Object?> get props => [items];
}
