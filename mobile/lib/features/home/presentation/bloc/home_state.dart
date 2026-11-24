import 'package:equatable/equatable.dart';

import '../../domain/entities/product_entity.dart';

abstract class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {
  final List<ProductEntity> products;

  const HomeLoading([this.products = const []]);

  @override
  List<Object?> get props => [products];
}

class HomeLoaded extends HomeState {
  final List<ProductEntity> products;
  final String searchQuery;
  final String? selectedCategory;
  final bool hasMore;
  final int currentPage;
  final int totalCount;

  const HomeLoaded({
    required this.products,
    required this.searchQuery,
    required this.selectedCategory,
    this.hasMore = false,
    this.currentPage = 1,
    this.totalCount = 0,
  });

  @override
  List<Object?> get props => [
        products,
        searchQuery,
        selectedCategory,
        hasMore,
        currentPage,
        totalCount,
      ];
}

class HomeFailure extends HomeState {
  final String message;

  final List<ProductEntity> products;

  const HomeFailure(this.message, [this.products = const []]);

  @override
  List<Object?> get props => [message, products];
}
