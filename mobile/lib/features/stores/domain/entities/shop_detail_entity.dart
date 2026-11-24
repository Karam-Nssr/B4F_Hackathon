import 'package:equatable/equatable.dart';

import '../../../home/domain/entities/product_entity.dart';

class ShopDetailEntity extends Equatable {
  final String id;
  final String shopName;
  final String category;
  final String description;
  final String imageUrl;
  final bool isActive;
  final List<ProductEntity> products;

  const ShopDetailEntity({
    required this.id,
    required this.shopName,
    required this.category,
    this.description = '',
    this.imageUrl = '',
    this.isActive = true,
    this.products = const [],
  });

  @override
  List<Object?> get props => [
        id,
        shopName,
        category,
        description,
        imageUrl,
        isActive,
        products,
      ];
}
