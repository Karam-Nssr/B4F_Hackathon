import 'package:dio/dio.dart';

import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_error_mapper.dart';
import '../../../home/data/datasources/home_remote_datasource.dart';

abstract class StoresRemoteDataSource {
  Future<List<Map<String, dynamic>>> getShops();

  Future<Map<String, dynamic>> getShopById(String id);
}

/// Real implementation – the public shops endpoints (SAD §7.1).
class StoresRemoteDataSourceImpl implements StoresRemoteDataSource {
  final Dio client;

  StoresRemoteDataSourceImpl({required this.client});

  @override
  Future<List<Map<String, dynamic>>> getShops() async {
    try {
      final response = await client.get(ApiEndpoints.shops);
      return _asMaps(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  @override
  Future<Map<String, dynamic>> getShopById(String id) async {
    try {
      final response = await client.get(ApiEndpoints.shopById(id));
      final data = response.data;
      if (data is Map) return Map<String, dynamic>.from(data);
      throw const ServerException('استجابة غير متوقعة من الخادم');
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  List<Map<String, dynamic>> _asMaps(dynamic data) {
    if (data is List) {
      return data.whereType<Map>().map(Map<String, dynamic>.from).toList();
    }
    throw const ServerException('استجابة غير متوقعة من الخادم');
  }
}

/// Offline mock — reuses the home feature's fake feed so the demo data
/// (shops + products) stays identical across both screens.
class StoresRemoteDataSourceFake implements StoresRemoteDataSource {
  final HomeRemoteDataSource _catalog = HomeRemoteDataSourceFake();

  @override
  Future<List<Map<String, dynamic>>> getShops() => _catalog.getShops();

  @override
  Future<Map<String, dynamic>> getShopById(String id) async {
    final shops = await _catalog.getShops();
    final shop = shops.firstWhere(
      (row) => row['_id'] == id,
      orElse: () => throw const ServerException('المتجر غير موجود'),
    );
    final products = await _catalog.getProducts(shopId: id);
    return {...shop, 'products': products};
  }
}
