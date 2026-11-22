import 'package:equatable/equatable.dart';

/// An active shop from `GET /api/shops` (SAD §6.2 — shops collection).
class ShopEntity extends Equatable {
  final String id;
  final String shopName;
  final String category;
  final String description;
  final bool isActive;

  const ShopEntity({
    required this.id,
    required this.shopName,
    required this.category,
    this.description = '',
    this.isActive = true,
  });

  @override
  List<Object?> get props => [id, shopName, category, description, isActive];
}
