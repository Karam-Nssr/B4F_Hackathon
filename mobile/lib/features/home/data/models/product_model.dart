import '../../domain/entities/product_entity.dart';

class ProductModel extends ProductEntity {
  const ProductModel({
    required super.id,
    required super.shopId,
    super.shopName,
    required super.title,
    required super.description,
    required super.category,
    required super.priceSyp,
    required super.imageUrl,
    super.isActive,
    super.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final price = json['priceSyp'] ?? json['price_syp'];
    final active = json['isActive'] ?? json['is_active'];

    return ProductModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      shopId: json['shopId']?.toString() ?? '',
      shopName: json['shopName']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      priceSyp: price is num ? price : 0,
      imageUrl: json['imageUrl']?.toString() ?? json['image_url']?.toString() ?? '',
      isActive: active is bool ? active : true,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}
