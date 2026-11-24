import 'package:equatable/equatable.dart';

class OrderItemEntity extends Equatable {
  final String productTitle;
  final num unitPriceSyp;
  final int quantity;

  const OrderItemEntity({
    required this.productTitle,
    required this.unitPriceSyp,
    required this.quantity,
  });

  num get totalSyp => unitPriceSyp * quantity;

  @override
  List<Object?> get props => [productTitle, unitPriceSyp, quantity];
}

class SubOrderEntity extends Equatable {
  final String id;
  final String shopId;
  final String shopName;
  final String invoiceNumber;
  final List<OrderItemEntity> items;
  final num subtotalSyp;
  final String status;
  final int confirmationWindowHours;
  final DateTime? createdAt;

  const SubOrderEntity({
    required this.id,
    required this.shopId,
    this.shopName = '',
    required this.invoiceNumber,
    this.items = const [],
    required this.subtotalSyp,
    this.status = 'PENDING',
    this.confirmationWindowHours = 24,
    this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        shopId,
        shopName,
        invoiceNumber,
        items,
        subtotalSyp,
        status,
        confirmationWindowHours,
        createdAt,
      ];
}

class OrderEntity extends Equatable {
  final String id;
  final num totalAmountSyp;
  final String customerPhone;
  final String customerNationalId;
  final DateTime? createdAt;
  final List<SubOrderEntity> subOrders;

  const OrderEntity({
    required this.id,
    required this.totalAmountSyp,
    this.customerPhone = '',
    this.customerNationalId = '',
    this.createdAt,
    this.subOrders = const [],
  });

  @override
  List<Object?> get props => [
        id,
        totalAmountSyp,
        customerPhone,
        customerNationalId,
        createdAt,
        subOrders,
      ];
}
