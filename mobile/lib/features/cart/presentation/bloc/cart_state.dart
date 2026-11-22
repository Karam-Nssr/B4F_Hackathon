import 'package:equatable/equatable.dart';

import '../../domain/entities/cart_item_entity.dart';
import '../../domain/entities/checkout_result_entity.dart';

class CartState extends Equatable {
  final List<CartItemEntity> items;
  final bool isLoading;
  final bool isSubmitting;

  /// Transient error (shown as a snackbar, cleared by the next event).
  final String? message;

  /// Set after a successful checkout — drives the success dialog.
  final CheckoutResultEntity? lastOrder;

  const CartState({
    this.items = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.message,
    this.lastOrder,
  });

  /// Total units in the cart (the badge on the header pill).
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  /// Grand total in SYP (FR-04).
  num get totalSyp => items.fold(0, (sum, item) => sum + item.totalSyp);

  CartState copyWith({
    List<CartItemEntity>? items,
    bool? isLoading,
    bool? isSubmitting,
    String? message,
    bool clearMessage = false,
    CheckoutResultEntity? lastOrder,
    bool clearOrder = false,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      message: clearMessage ? null : message ?? this.message,
      lastOrder: clearOrder ? null : lastOrder ?? this.lastOrder,
    );
  }

  @override
  List<Object?> get props =>
      [items, isLoading, isSubmitting, message, lastOrder];
}
