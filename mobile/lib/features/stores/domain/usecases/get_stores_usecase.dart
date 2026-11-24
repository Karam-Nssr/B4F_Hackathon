import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../../../home/domain/entities/shop_entity.dart';
import '../repositories/stores_repository.dart';

class GetStoresUseCase implements UseCase<List<ShopEntity>, NoParams> {
  final StoresRepository repository;

  GetStoresUseCase(this.repository);

  @override
  Future<Either<Failure, List<ShopEntity>>> call(NoParams params) {
    return repository.getShops();
  }
}
