import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecase/usecase.dart';
import '../../domain/entities/product_entity.dart';
import '../../domain/usecases/get_products_usecase.dart';
import '../../domain/usecases/get_shops_usecase.dart';
import 'home_event.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final GetProductsUseCase getProductsUseCase;
  final GetShopsUseCase getShopsUseCase;

  static const int _pageSize = 6;

  String _search = '';

  String? _category;

  List<ProductEntity> _allProducts = [];

  int _currentPage = 1;

  HomeBloc({
    required this.getProductsUseCase,
    required this.getShopsUseCase,
  }) : super(HomeInitial()) {
    on<HomeLoadRequested>(_onLoad);
    on<HomeSearchChanged>(_onSearch);
    on<HomeCategorySelected>(_onCategory);
    on<HomeLoadMoreRequested>(_onLoadMore);
  }

  Future<void> _onLoad(
    HomeLoadRequested event,
    Emitter<HomeState> emit,
  ) async {
    _currentPage = 1;
    await _fetchBackend(emit);
  }

  Future<void> _onSearch(
    HomeSearchChanged event,
    Emitter<HomeState> emit,
  ) async {
    _search = event.query;
    _currentPage = 1;
    await _fetchBackend(emit);
  }

  void _onCategory(
    HomeCategorySelected event,
    Emitter<HomeState> emit,
  ) {
    _category = (event.category == 'الكل' || event.category.isEmpty)
        ? null
        : event.category;
    _currentPage = 1;
    _emitPaginatedState(emit);
  }

  void _onLoadMore(
    HomeLoadMoreRequested event,
    Emitter<HomeState> emit,
  ) {
    final filtered = _getFilteredProducts();
    if (_currentPage * _pageSize < filtered.length) {
      _currentPage++;
      _emitPaginatedState(emit);
    }
  }

  Future<void> _fetchBackend(Emitter<HomeState> emit) async {
    final previous = state is HomeLoaded
        ? (state as HomeLoaded).products
        : state is HomeLoading
            ? (state as HomeLoading).products
            : state is HomeFailure
                ? (state as HomeFailure).products
                : const <ProductEntity>[];

    emit(HomeLoading(previous));

    final productsFuture = getProductsUseCase(
      ProductsParams(search: _search.isEmpty ? null : _search),
    );
    final shopsFuture = getShopsUseCase(const NoParams());

    final productsResult = await productsFuture;
    final shopsResult = await shopsFuture;

    final shopNames = shopsResult.fold(
      (_) => <String, String>{},
      (shops) => {for (final shop in shops) shop.id: shop.shopName},
    );

    productsResult.fold(
      (failure) => emit(HomeFailure(failure.message, previous)),
      (products) {
        _allProducts = [
          for (final product in products)
            product.copyWith(
              shopName: shopNames[product.shopId] ?? product.shopName,
            ),
        ];
        _emitPaginatedState(emit);
      },
    );
  }

  List<ProductEntity> _getFilteredProducts() {
    if (_category == null || _category!.isEmpty) {
      return _allProducts;
    }
    final target = _category!.trim().toLowerCase();
    return _allProducts.where((p) {
      return p.category.trim().toLowerCase() == target;
    }).toList();
  }

  void _emitPaginatedState(Emitter<HomeState> emit) {
    final filtered = _getFilteredProducts();
    final limit = _currentPage * _pageSize;
    final visibleProducts = filtered.take(limit).toList();
    final hasMore = limit < filtered.length;

    emit(
      HomeLoaded(
        products: visibleProducts,
        searchQuery: _search,
        selectedCategory: _category,
        hasMore: hasMore,
        currentPage: _currentPage,
        totalCount: filtered.length,
      ),
    );
  }
}
