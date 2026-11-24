import 'package:equatable/equatable.dart';

import '../../../home/domain/entities/product_entity.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();

  @override
  List<Object?> get props => [];
}

class CartLoadRequested extends CartEvent {}

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

class CartQuantityChanged extends CartEvent {
  final String productId;
  final int quantity;

  const CartQuantityChanged({required this.productId, required this.quantity});

  @override
  List<Object?> get props => [productId, quantity];
}

class CartCheckoutRequested extends CartEvent {}

class CartOrderAcknowledged extends CartEvent {}

class CartPaymentMethodChanged extends CartEvent {
  final String paymentOptionId;

  const CartPaymentMethodChanged({required this.paymentOptionId});

  @override
  List<Object?> get props => [paymentOptionId];
}
