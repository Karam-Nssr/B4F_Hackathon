import 'package:dio/dio.dart';

import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_error_mapper.dart';

abstract class HomeRemoteDataSource {
  Future<List<Map<String, dynamic>>> getProducts({
    String? search,
    String? category,
    num? minPriceSyp,
    num? maxPriceSyp,
    String? shopId,
  });

  Future<List<Map<String, dynamic>>> getShops();
}

class HomeRemoteDataSourceImpl implements HomeRemoteDataSource {
  final Dio client;

  HomeRemoteDataSourceImpl({required this.client});

  @override
  Future<List<Map<String, dynamic>>> getProducts({
    String? search,
    String? category,
    num? minPriceSyp,
    num? maxPriceSyp,
    String? shopId,
  }) async {
    try {
      final query = <String, dynamic>{};
      if (search != null && search.isNotEmpty) query['search'] = search;
      if (category != null && category.isNotEmpty) query['category'] = category;
      if (minPriceSyp != null) query['minPriceSyp'] = minPriceSyp;
      if (maxPriceSyp != null) query['maxPriceSyp'] = maxPriceSyp;
      if (shopId != null && shopId.isNotEmpty) query['shopId'] = shopId;

      final response = await client.get(
        ApiEndpoints.products,
        queryParameters: query,
      );
      return _asMaps(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getShops() async {
    try {
      final response = await client.get(ApiEndpoints.shops);
      return _asMaps(response.data);
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

class HomeRemoteDataSourceFake implements HomeRemoteDataSource {
  static const _shops = [
    {
      '_id': 'shop_kayan',
      'shopName': 'كيان ستريت',
      'category': 'ملابس',
      'description': 'هوديات وتيشيرتات قطنية أوفرسايز وتصاميم حصرية',
      'isActive': true,
    },
    {
      '_id': 'shop_lamsa',
      'shopName': 'لمسة بيت',
      'category': 'ديكور',
      'description': 'أثاث ديكور وإكسسوارات منزلية بلمسة عصرية',
      'isActive': true,
    },
    {
      '_id': 'shop_hana',
      'shopName': 'أزياء حنّا',
      'category': 'ملابس',
      'description': 'حقائب ومحافط جلدية عملية للجامعة',
      'isActive': true,
    },
    {
      '_id': 'shop_sham',
      'shopName': 'هداءات الشام',
      'category': 'هدايا',
      'description': 'بوكسات هدايا جاهزة للمناسبات',
      'isActive': true,
    },
  ];

  static const _products = [
    {
      '_id': 'p1',
      'shopId': 'shop_kayan',
      'title': 'هودي أوفرسايز',
      'description': 'هودي قطني أوفرسايز مريح بخياطة ممتازة',
      'category': 'ملابس',
      'priceSyp': 240000,
      'imageUrl': '',
      'isActive': true,
    },
    {
      '_id': 'p2',
      'shopId': 'shop_hana',
      'title': 'توت باق كانفاس',
      'description': 'حقيبة كانفاس عملية للاستخدام اليومي',
      'category': 'إكسسوارات',
      'priceSyp': 95000,
      'imageUrl': '',
      'isActive': true,
    },
    {
      '_id': 'p3',
      'shopId': 'shop_lamsa',
      'title': 'أباجورة خشب جوز',
      'description': 'أباجورة خشب جوز بإضاءة دافئة',
      'category': 'ديكور',
      'priceSyp': 185000,
      'imageUrl': '',
      'isActive': true,
    },
    {
      '_id': 'p4',
      'shopId': 'shop_sham',
      'title': 'بوكس هدية شاب',
      'description': 'بوكس هدية جاهز مع تغليف أنيق',
      'category': 'هدايا',
      'priceSyp': 145000,
      'imageUrl': '',
      'isActive': true,
    },
  ];

  @override
  Future<List<Map<String, dynamic>>> getProducts({
    String? search,
    String? category,
    num? minPriceSyp,
    num? maxPriceSyp,
    String? shopId,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));

    return _products.where((product) {
      if (category != null && category.isNotEmpty && product['category'] != category) {
        return false;
      }
      if (shopId != null && shopId.isNotEmpty && product['shopId'] != shopId) {
        return false;
      }
      if (minPriceSyp != null && (product['priceSyp'] as num) < minPriceSyp) {
        return false;
      }
      if (maxPriceSyp != null && (product['priceSyp'] as num) > maxPriceSyp) {
        return false;
      }
      if (search != null && search.isNotEmpty) {
        final haystack =
            '${product['title']} ${product['description']}'.toLowerCase();
        if (!haystack.contains(search.toLowerCase())) return false;
      }
      return true;
    }).map((product) => Map<String, dynamic>.from(product)).toList();
  }

  @override
  Future<List<Map<String, dynamic>>> getShops() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    return _shops.map((shop) => Map<String, dynamic>.from(shop)).toList();
  }
}
