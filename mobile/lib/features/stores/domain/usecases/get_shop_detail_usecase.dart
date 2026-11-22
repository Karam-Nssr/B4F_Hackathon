import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/shop_detail_entity.dart';
import '../repositories/stores_repository.dart';

/// A single shop page with its product grid.
class GetShopDetailUseCase
    implements UseCase<ShopDetailEntity, ShopDetailParams> {
  final StoresRepository repository;

  GetShopDetailUseCase(this.repository);

  @override
  Future<Either<Failure, ShopDetailEntity>> call(ShopDetailParams params) {
    return repository.getShopById(params.shopId);
  }
}

class ShopDetailParams extends Equatable {
  final String shopId;

  const ShopDetailParams({required this.shopId});

  @override
  List<Object?> get props => [shopId];
}
