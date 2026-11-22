import 'package:equatable/equatable.dart';

import '../../domain/entities/product_entity.dart';

abstract class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {
  /// Previous results (if any) so the grid stays visible while filtering.
  final List<ProductEntity> products;

  const HomeLoading([this.products = const []]);

  @override
  List<Object?> get props => [products];
}

class HomeLoaded extends HomeState {
  final List<ProductEntity> products;
  final String searchQuery;
  final String? selectedCategory;

  const HomeLoaded({
    required this.products,
    required this.searchQuery,
    required this.selectedCategory,
  });

  @override
  List<Object?> get props => [products, searchQuery, selectedCategory];
}

class HomeFailure extends HomeState {
  final String message;

  /// Last successful results, so a failed refresh doesn't wipe the screen.
  final List<ProductEntity> products;

  const HomeFailure(this.message, [this.products = const []]);

  @override
  List<Object?> get props => [message, products];
}
