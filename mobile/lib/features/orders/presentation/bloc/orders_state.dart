import 'package:equatable/equatable.dart';

import '../../domain/entities/order_entity.dart';

abstract class OrdersState extends Equatable {
  const OrdersState();

  @override
  List<Object?> get props => [];
}

class OrdersInitial extends OrdersState {}

class OrdersLoading extends OrdersState {}

class OrdersLoaded extends OrdersState {
  final List<OrderEntity> orders;

  const OrdersLoaded(this.orders);

  @override
  List<Object?> get props => [orders];
}

class OrdersFailure extends OrdersState {
  final String message;

  const OrdersFailure(this.message);

  @override
  List<Object?> get props => [message];
}

class OrderDetailsLoading extends OrdersState {}

class OrderDetailsLoaded extends OrdersState {
  final OrderEntity order;
  final bool isCancelling;
  final String? message;
  final bool messageIsError;

  const OrderDetailsLoaded(
    this.order, {
    this.isCancelling = false,
    this.message,
    this.messageIsError = false,
  });

  OrderDetailsLoaded copyWith({
    OrderEntity? order,
    bool? isCancelling,
    String? message,
    bool? messageIsError,
    bool clearMessage = false,
  }) {
    return OrderDetailsLoaded(
      order ?? this.order,
      isCancelling: isCancelling ?? this.isCancelling,
      message: clearMessage ? null : message ?? this.message,
      messageIsError: messageIsError ?? this.messageIsError,
    );
  }

  @override
  List<Object?> get props => [order, isCancelling, message, messageIsError];
}

class OrderDetailsFailure extends OrdersState {
  final String message;

  const OrderDetailsFailure(this.message);

  @override
  List<Object?> get props => [message];
}
