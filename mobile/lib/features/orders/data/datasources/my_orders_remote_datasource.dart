import 'package:dio/dio.dart';

import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_error_mapper.dart';

/// The signed-in user's order history (`GET /api/orders/my` — JWT + role
/// `user`, SAD FR-07).
abstract class MyOrdersRemoteDataSource {
  Future<List<Map<String, dynamic>>> getMyOrders();
}

class MyOrdersRemoteDataSourceImpl implements MyOrdersRemoteDataSource {
  final Dio client;

  MyOrdersRemoteDataSourceImpl({required this.client});

  @override
  Future<List<Map<String, dynamic>>> getMyOrders() async {
    try {
      final response = await client.get(ApiEndpoints.myOrders);
      final data = response.data;
      if (data is List) {
        return data.whereType<Map>().map(Map<String, dynamic>.from).toList();
      }
      throw const ServerException('استجابة غير متوقعة من الخادم');
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}

/// Offline mock — one confirmed order and one pending order.
class MyOrdersRemoteDataSourceFake implements MyOrdersRemoteDataSource {
  @override
  Future<List<Map<String, dynamic>>> getMyOrders() async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    return [
      {
        '_id': 'order_1',
        'totalAmountSyp': 335000,
        'customerPhone': '09991234567',
        'customerNationalId': '12345678901',
        'createdAt': '2026-11-20T10:30:00.000Z',
        'shopSubOrders': [
          {
            '_id': 'so_1',
            'shopId': {
              '_id': 'shop_kayan',
              'shopName': 'كيان ستريت',
              'category': 'ملابس',
            },
            'invoiceNumber': 'INV-FAKE-001',
            'items': [
              {'productTitle': 'هودي أوفرسايز', 'unitPriceSyp': 240000, 'quantity': 1},
            ],
            'subtotalSyp': 240000,
            'status': 'CONFIRMED',
            'confirmationWindowHours': 24,
            'createdAt': '2026-11-20T10:30:00.000Z',
          },
          {
            '_id': 'so_2',
            'shopId': {
              '_id': 'shop_hana',
              'shopName': 'أزياء حنّا',
              'category': 'إكسسوارات',
            },
            'invoiceNumber': 'INV-FAKE-002',
            'items': [
              {'productTitle': 'توت باق كانفاس', 'unitPriceSyp': 95000, 'quantity': 1},
            ],
            'subtotalSyp': 95000,
            'status': 'PENDING',
            'confirmationWindowHours': 24,
            'createdAt': '2026-11-20T10:30:00.000Z',
          },
        ],
      },
      {
        '_id': 'order_2',
        'totalAmountSyp': 185000,
        'customerPhone': '09991234567',
        'customerNationalId': '12345678901',
        'createdAt': '2026-11-12T09:00:00.000Z',
        'shopSubOrders': [
          {
            '_id': 'so_3',
            'shopId': {
              '_id': 'shop_lamsa',
              'shopName': 'لمسة بيت',
              'category': 'ديكور',
            },
            'invoiceNumber': 'INV-FAKE-003',
            'items': [
              {'productTitle': 'أباجورة خشب جوز', 'unitPriceSyp': 185000, 'quantity': 1},
            ],
            'subtotalSyp': 185000,
            'status': 'COMPLETED',
            'confirmationWindowHours': 24,
            'createdAt': '2026-11-12T09:00:00.000Z',
          },
        ],
      },
    ];
  }
}
