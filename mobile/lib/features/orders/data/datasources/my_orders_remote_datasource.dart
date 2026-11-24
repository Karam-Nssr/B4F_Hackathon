import 'package:dio/dio.dart';

import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_error_mapper.dart';

abstract class MyOrdersRemoteDataSource {
  Future<List<Map<String, dynamic>>> getMyOrders();

  Future<Map<String, dynamic>> getOrderById(String orderId);

  Future<Map<String, dynamic>> cancelSubOrder(String subOrderId);

  Future<Map<String, dynamic>> cancelOrder(String orderId);
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

  @override
  Future<Map<String, dynamic>> getOrderById(String orderId) async {
    try {
      final response = await client.get(ApiEndpoints.orderById(orderId));
      return _asMap(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  @override
  Future<Map<String, dynamic>> cancelSubOrder(String subOrderId) async {
    try {
      final response = await client.patch(ApiEndpoints.cancelSubOrder(subOrderId));
      return _asMap(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  @override
  Future<Map<String, dynamic>> cancelOrder(String orderId) async {
    try {
      final response = await client.patch(ApiEndpoints.cancelOrder(orderId));
      return _asMap(response.data);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  Map<String, dynamic> _asMap(dynamic data) {
    if (data is Map) return Map<String, dynamic>.from(data);
    throw const ServerException('استجابة غير متوقعة من الخادم');
  }
}

class MyOrdersRemoteDataSourceFake implements MyOrdersRemoteDataSource {
  static const _pendingSubOrder = {
    '_id': 'so_pending',
    'shopId': {'_id': 'shop_kayan', 'shopName': 'كيان ستريت', 'category': 'ملابس'},
    'invoiceNumber': 'INV-FAKE-010',
    'items': [
      {'productTitle': 'هودي أوفرسايز', 'unitPriceSyp': 240000, 'quantity': 1},
    ],
    'subtotalSyp': 240000,
    'status': 'PENDING',
    'confirmationWindowHours': 24,
    'createdAt': '2026-11-22T10:30:00.000Z',
  };

  Map<String, dynamic> _order({
    required String id,
    required num total,
    required List<Map<String, dynamic>> subOrders,
    required String createdAt,
  }) {
    return {
      '_id': id,
      'totalAmountSyp': total,
      'customerPhone': '09991234567',
      'customerNationalId': '12345678901',
      'createdAt': createdAt,
      'shopSubOrders': subOrders,
    };
  }

  @override
  Future<List<Map<String, dynamic>>> getMyOrders() async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    return [
      _order(
        id: 'order_1',
        total: 335000,
        createdAt: '2026-11-20T10:30:00.000Z',
        subOrders: const [
          {
            '_id': 'so_1',
            'shopId': {'_id': 'shop_kayan', 'shopName': 'كيان ستريت', 'category': 'ملابس'},
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
            'shopId': {'_id': 'shop_hana', 'shopName': 'أزياء حنّا', 'category': 'إكسسوارات'},
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
      ),
      _order(
        id: 'order_2',
        total: 185000,
        createdAt: '2026-11-12T09:00:00.000Z',
        subOrders: const [
          {
            '_id': 'so_3',
            'shopId': {'_id': 'shop_lamsa', 'shopName': 'لمسة بيت', 'category': 'ديكور'},
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
      ),
    ];
  }

  @override
  Future<Map<String, dynamic>> getOrderById(String orderId) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    final all = await getMyOrders();
    return all.firstWhere(
      (row) => row['_id'] == orderId,
      orElse: () => _order(
        id: orderId,
        total: 240000,
        createdAt: '2026-11-22T10:30:00.000Z',
        subOrders: const [_pendingSubOrder],
      ),
    );
  }

  @override
  Future<Map<String, dynamic>> cancelSubOrder(String subOrderId) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    return _order(
      id: 'order_3',
      total: 240000,
      createdAt: '2026-11-22T10:30:00.000Z',
      subOrders: [
        {
          ..._pendingSubOrder,
          '_id': subOrderId,
          'status': 'CANCELLED',
        },
      ],
    );
  }

  @override
  Future<Map<String, dynamic>> cancelOrder(String orderId) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    return _order(
      id: orderId,
      total: 240000,
      createdAt: '2026-11-22T10:30:00.000Z',
      subOrders: [
        {..._pendingSubOrder, 'status': 'CANCELLED'},
      ],
    );
  }
}
