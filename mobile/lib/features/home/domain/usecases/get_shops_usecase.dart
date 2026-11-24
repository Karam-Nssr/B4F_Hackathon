import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/shop_entity.dart';
import '../repositories/home_repository.dart';

class GetShopsUseCase implements UseCase<List<ShopEntity>, NoParams> {
  final HomeRepository repository;

  GetShopsUseCase(this.repository);

  @override
  Future<Either<Failure, List<ShopEntity>>> call(NoParams params) {
    return repository.getShops();
  }
}
