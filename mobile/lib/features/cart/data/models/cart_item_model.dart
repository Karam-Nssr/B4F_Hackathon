import '../../domain/entities/cart_item_entity.dart';

class CartItemModel extends CartItemEntity {
  const CartItemModel({
    required super.productId,
    required super.shopId,
    super.shopName,
    required super.title,
    super.imageUrl,
    required super.unitPriceSyp,
    super.quantity,
  });

  /// The cart is persisted as JSON in Hive, so both directions live here.
  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    final price = json['unitPriceSyp'] ?? json['priceSyp'];
    final quantity = json['quantity'];

    return CartItemModel(
      productId: json['productId']?.toString() ?? '',
      shopId: json['shopId']?.toString() ?? '',
      shopName: json['shopName']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      imageUrl: json['imageUrl']?.toString() ?? '',
      unitPriceSyp: price is num ? price : 0,
      quantity: quantity is num ? quantity.toInt() : 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'shopId': shopId,
      'shopName': shopName,
      'title': title,
      'imageUrl': imageUrl,
      'unitPriceSyp': unitPriceSyp,
      'quantity': quantity,
    };
  }
}
