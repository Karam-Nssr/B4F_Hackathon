import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/product_entity.dart';
import '../repositories/home_repository.dart';

class GetProductsUseCase implements UseCase<List<ProductEntity>, ProductsParams> {
  final HomeRepository repository;

  GetProductsUseCase(this.repository);

  @override
  Future<Either<Failure, List<ProductEntity>>> call(ProductsParams params) {
    return repository.getProducts(
      search: params.search,
      category: params.category,
      minPriceSyp: params.minPriceSyp,
      maxPriceSyp: params.maxPriceSyp,
      shopId: params.shopId,
    );
  }
}

class ProductsParams extends Equatable {
  final String? search;
  final String? category;
  final num? minPriceSyp;
  final num? maxPriceSyp;
  final String? shopId;

  const ProductsParams({
    this.search,
    this.category,
    this.minPriceSyp,
    this.maxPriceSyp,
    this.shopId,
  });

  @override
  List<Object?> get props => [search, category, minPriceSyp, maxPriceSyp, shopId];
}
