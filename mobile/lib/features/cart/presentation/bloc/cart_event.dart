import 'package:equatable/equatable.dart';

import '../../../home/domain/entities/product_entity.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();

  @override
  List<Object?> get props => [];
}

/// Restore the cart from local storage (dispatched once at app start).
class CartLoadRequested extends CartEvent {}

/// The red "+" button on a product card.
class CartItemAdded extends CartEvent {
  final ProductEntity product;

  const CartItemAdded(this.product);

  @override
  List<Object?> get props => [product];
}

class CartItemRemoved extends CartEvent {
  final String productId;

  const CartItemRemoved({required this.productId});

  @override
  List<Object?> get props => [productId];
}

/// Quantity stepper — `quantity <= 0` removes the line.
class CartQuantityChanged extends CartEvent {
  final String productId;
  final int quantity;

  const CartQuantityChanged({required this.productId, required this.quantity});

  @override
  List<Object?> get props => [productId, quantity];
}

/// Submit the cart to `POST /api/orders`.
class CartCheckoutRequested extends CartEvent {}

/// The success dialog was dismissed.
class CartOrderAcknowledged extends CartEvent {}
