import '../../../home/data/models/product_model.dart';
import '../../../home/domain/entities/product_entity.dart';
import '../../domain/entities/shop_detail_entity.dart';

class ShopDetailModel extends ShopDetailEntity {
  const ShopDetailModel({
    required super.id,
    required super.shopName,
    required super.category,
    super.description,
    super.imageUrl,
    super.isActive,
    super.products,
  });

  factory ShopDetailModel.fromJson(Map<String, dynamic> json) {
    final active = json['isActive'] ?? json['is_active'];
    final image = json['imageUrl'] ?? json['image_url'] ?? json['image'] ?? json['logo'];
    final rawProducts = json['products'];

    return ShopDetailModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      shopName: json['shopName']?.toString() ?? json['shop_name']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      imageUrl: image?.toString() ?? '',
      isActive: active is bool ? active : true,
      products: rawProducts is List
          ? rawProducts
              .whereType<Map>()
              .map((row) => ProductModel.fromJson(Map<String, dynamic>.from(row)))
              .toList()
          : const <ProductEntity>[],
    );
  }
}
