import '../../domain/entities/shop_entity.dart';

class ShopModel extends ShopEntity {
  const ShopModel({
    required super.id,
    required super.shopName,
    required super.category,
    super.description,
    super.imageUrl,
    super.isActive,
  });

  factory ShopModel.fromJson(Map<String, dynamic> json) {
    final active = json['isActive'] ?? json['is_active'];
    final image = json['imageUrl'] ?? json['image_url'] ?? json['image'] ?? json['logo'];

    return ShopModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      shopName: json['shopName']?.toString() ?? json['shop_name']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      imageUrl: image?.toString() ?? '',
      isActive: active is bool ? active : true,
    );
  }
}
