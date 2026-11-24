import 'package:equatable/equatable.dart';

import '../../domain/entities/cart_item_entity.dart';
import '../../domain/entities/checkout_result_entity.dart';
import '../../domain/entities/payment_option.dart';

class CartState extends Equatable {
  final List<CartItemEntity> items;
  final bool isLoading;
  final bool isSubmitting;

  final String? message;

  final CheckoutResultEntity? lastOrder;

  final PaymentOption paymentOption;

  const CartState({
    this.items = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.message,
    this.lastOrder,
    this.paymentOption = PaymentOptions.defaultOption,
  });

  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  num get totalSyp => items.fold(0, (sum, item) => sum + item.totalSyp);

  CartState copyWith({
    List<CartItemEntity>? items,
    bool? isLoading,
    bool? isSubmitting,
    String? message,
    bool clearMessage = false,
    CheckoutResultEntity? lastOrder,
    bool clearOrder = false,
    PaymentOption? paymentOption,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      message: clearMessage ? null : message ?? this.message,
      lastOrder: clearOrder ? null : lastOrder ?? this.lastOrder,
      paymentOption: paymentOption ?? this.paymentOption,
    );
  }

  @override
  List<Object?> get props =>
      [items, isLoading, isSubmitting, message, lastOrder, paymentOption];
}
