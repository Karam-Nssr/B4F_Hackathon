import 'package:equatable/equatable.dart';

import '../../../home/domain/entities/product_entity.dart';

/// One line of the local cart: a snapshot of the product as it was added
/// (title/price can change on the server, the cart keeps what the user saw).
class CartItemEntity extends Equatable {
  final String productId;
  final String shopId;
  final String shopName;
  final String title;
  final String imageUrl;
  final num unitPriceSyp;
  final int quantity;

  const CartItemEntity({
    required this.productId,
    required this.shopId,
    this.shopName = '',
    required this.title,
    this.imageUrl = '',
    required this.unitPriceSyp,
    this.quantity = 1,
  });

  /// Builds a cart line from a product tile (home / store grid).
  factory CartItemEntity.fromProduct(ProductEntity product) {
    return CartItemEntity(
      productId: product.id,
      shopId: product.shopId,
      shopName: product.shopName,
      title: product.title,
      imageUrl: product.imageUrl,
      unitPriceSyp: product.priceSyp,
    );
  }

  num get totalSyp => unitPriceSyp * quantity;

  CartItemEntity copyWith({int? quantity}) {
    return CartItemEntity(
      productId: productId,
      shopId: shopId,
      shopName: shopName,
      title: title,
      imageUrl: imageUrl,
      unitPriceSyp: unitPriceSyp,
      quantity: quantity ?? this.quantity,
    );
  }

  @override
  List<Object?> get props => [
        productId,
        shopId,
        shopName,
        title,
        imageUrl,
        unitPriceSyp,
        quantity,
      ];
}
