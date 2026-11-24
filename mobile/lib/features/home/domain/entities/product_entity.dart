import 'package:equatable/equatable.dart';

class ProductEntity extends Equatable {
  final String id;
  final String shopId;
  final String shopName;
  final String title;
  final String description;
  final String category;
  final num priceSyp;
  final String imageUrl;
  final bool isActive;
  final DateTime? createdAt;

  const ProductEntity({
    required this.id,
    required this.shopId,
    this.shopName = '',
    required this.title,
    required this.description,
    required this.category,
    required this.priceSyp,
    required this.imageUrl,
    this.isActive = true,
    this.createdAt,
  });

  ProductEntity copyWith({String? shopName}) {
    return ProductEntity(
      id: id,
      shopId: shopId,
      shopName: shopName ?? this.shopName,
      title: title,
      description: description,
      category: category,
      priceSyp: priceSyp,
      imageUrl: imageUrl,
      isActive: isActive,
      createdAt: createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        shopId,
        shopName,
        title,
        description,
        category,
        priceSyp,
        imageUrl,
        isActive,
        createdAt,
      ];
}
