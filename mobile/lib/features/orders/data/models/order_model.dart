import '../../domain/entities/order_entity.dart';

class OrderItemModel extends OrderItemEntity {
  const OrderItemModel({
    required super.productTitle,
    required super.unitPriceSyp,
    required super.quantity,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    final price = json['unitPriceSyp'];
    final quantity = json['quantity'];

    return OrderItemModel(
      productTitle: json['productTitle']?.toString() ?? '',
      unitPriceSyp: price is num ? price : 0,
      quantity: quantity is num ? quantity.toInt() : 0,
    );
  }
}

class SubOrderModel extends SubOrderEntity {
  const SubOrderModel({
    required super.id,
    required super.shopId,
    super.shopName,
    required super.invoiceNumber,
    super.items,
    required super.subtotalSyp,
    super.status,
    super.confirmationWindowHours,
    super.createdAt,
  });

  factory SubOrderModel.fromJson(Map<String, dynamic> json) {
    final rawShop = json['shopId'];
    final shop = rawShop is Map ? Map<String, dynamic>.from(rawShop) : null;
    final rawItems = json['items'];

    return SubOrderModel(
      id: json['_id']?.toString() ?? '',
      shopId: (shop?['_id'] ?? rawShop)?.toString() ?? '',
      shopName: (shop?['shopName'] ?? json['shopName'])?.toString() ?? '',
      invoiceNumber: json['invoiceNumber']?.toString() ?? '',
      items: rawItems is List
          ? rawItems
              .whereType<Map>()
              .map((row) => OrderItemModel.fromJson(Map<String, dynamic>.from(row)))
              .toList()
          : const [],
      subtotalSyp: json['subtotalSyp'] is num ? json['subtotalSyp'] as num : 0,
      status: json['status']?.toString() ?? 'PENDING',
      confirmationWindowHours: json['confirmationWindowHours'] is num
          ? (json['confirmationWindowHours'] as num).toInt()
          : 24,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}

class OrderModel extends OrderEntity {
  const OrderModel({
    required super.id,
    required super.totalAmountSyp,
    super.customerPhone,
    super.customerNationalId,
    super.createdAt,
    super.subOrders,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final rawSubOrders = json['shopSubOrders'];

    return OrderModel(
      id: json['_id']?.toString() ?? '',
      totalAmountSyp:
          json['totalAmountSyp'] is num ? json['totalAmountSyp'] as num : 0,
      customerPhone: json['customerPhone']?.toString() ?? '',
      customerNationalId: json['customerNationalId']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      subOrders: rawSubOrders is List
          ? rawSubOrders
              .whereType<Map>()
              .map((row) => SubOrderModel.fromJson(Map<String, dynamic>.from(row)))
              .toList()
          : const [],
    );
  }
}
