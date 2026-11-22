import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/cart_item_entity.dart';
import '../repositories/cart_repository.dart';

/// Persists the cart after any change (add / remove / quantity).
class SaveCartUseCase implements UseCase<List<CartItemEntity>, SaveCartParams> {
  final CartRepository repository;

  SaveCartUseCase(this.repository);

  @override
  Future<Either<Failure, List<CartItemEntity>>> call(SaveCartParams params) {
    return repository.saveCart(params.items);
  }
}

class SaveCartParams extends Equatable {
  final List<CartItemEntity> items;

  const SaveCartParams({required this.items});

  @override
  List<Object?> get props => [items];
}
