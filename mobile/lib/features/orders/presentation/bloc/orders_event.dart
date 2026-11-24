import 'package:equatable/equatable.dart';

abstract class OrdersEvent extends Equatable {
  const OrdersEvent();

  @override
  List<Object?> get props => [];
}

class OrdersLoadRequested extends OrdersEvent {}

class OrderDetailsLoadRequested extends OrdersEvent {
  final String orderId;

  const OrderDetailsLoadRequested({required this.orderId});

  @override
  List<Object?> get props => [orderId];
}

class SubOrderCancelRequested extends OrdersEvent {
  final String subOrderId;

  const SubOrderCancelRequested({required this.subOrderId});

  @override
  List<Object?> get props => [subOrderId];
}

class OrderCancelRequested extends OrdersEvent {
  final String orderId;

  const OrderCancelRequested({required this.orderId});

  @override
  List<Object?> get props => [orderId];
}
