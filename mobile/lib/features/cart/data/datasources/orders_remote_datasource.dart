import 'package:dio/dio.dart';

import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_error_mapper.dart';

abstract class OrdersRemoteDataSource {
  Future<Map<String, dynamic>> createOrder(
    List<Map<String, dynamic>> items,
  );
}

class OrdersRemoteDataSourceImpl implements OrdersRemoteDataSource {
  final Dio client;

  OrdersRemoteDataSourceImpl({required this.client});

  @override
  Future<Map<String, dynamic>> createOrder(
    List<Map<String, dynamic>> items,
  ) async {
    try {
      final response = await client.post(
        ApiEndpoints.orders,
        data: {'items': items},
      );
      final data = response.data;
      if (data is Map) return Map<String, dynamic>.from(data);
      throw const ServerException('استجابة غير متوقعة من الخادم');
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}

class OrdersRemoteDataSourceFake implements OrdersRemoteDataSource {
  @override
  Future<Map<String, dynamic>> createOrder(
    List<Map<String, dynamic>> items,
  ) async {
    await Future<void>.delayed(const Duration(milliseconds: 900));
    return {
      '_id': 'order_${DateTime.now().millisecondsSinceEpoch}',
      'totalAmountSyp': 0,
      'shopSubOrders': <Map<String, dynamic>>[],
    };
  }
}
