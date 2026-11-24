import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/orders_repository.dart';
import '../datasources/my_orders_remote_datasource.dart';
import '../models/order_model.dart';

class OrdersRepositoryImpl implements OrdersRepository {
  final MyOrdersRemoteDataSource remoteDataSource;

  OrdersRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<OrderEntity>>> getMyOrders() {
    return _guard(() async {
      final rows = await remoteDataSource.getMyOrders();
      return rows.map(OrderModel.fromJson).toList();
    });
  }

  @override
  Future<Either<Failure, OrderEntity>> getOrderById(String orderId) {
    return _guard(() async {
      final row = await remoteDataSource.getOrderById(orderId);
      return OrderModel.fromJson(row);
    });
  }

  @override
  Future<Either<Failure, OrderEntity>> cancelSubOrder(String subOrderId) {
    return _guard(() async {
      final row = await remoteDataSource.cancelSubOrder(subOrderId);
      return OrderModel.fromJson(row);
    });
  }

  @override
  Future<Either<Failure, OrderEntity>> cancelOrder(String orderId) {
    return _guard(() async {
      final row = await remoteDataSource.cancelOrder(orderId);
      return OrderModel.fromJson(row);
    });
  }

  Future<Either<Failure, T>> _guard<T>(Future<T> Function() action) async {
    try {
      return Right(await action());
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message));
    }
  }
}
