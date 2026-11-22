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

  /// Current filters — kept here so a refresh or a category change doesn't
  /// lose the active search.
  String _search = '';
  String? _category;

  HomeBloc({
    required this.getProductsUseCase,
    required this.getShopsUseCase,
  }) : super(HomeInitial()) {
    on<HomeLoadRequested>(_onLoad);
    on<HomeSearchChanged>(_onSearch);
    on<HomeCategorySelected>(_onCategory);
  }

  Future<void> _onLoad(
    HomeLoadRequested event,
    Emitter<HomeState> emit,
  ) => _fetch(emit);

  Future<void> _onSearch(
    HomeSearchChanged event,
    Emitter<HomeState> emit,
  ) async {
    _search = event.query;
    await _fetch(emit);
  }

  Future<void> _onCategory(
    HomeCategorySelected event,
    Emitter<HomeState> emit,
  ) async {
    _category = event.category == 'الكل' ? null : event.category;
    await _fetch(emit);
  }

  /// Loads the products and the shops in parallel, then attaches the shop
  /// name to each product so the card can show which store sells it.
  Future<void> _fetch(Emitter<HomeState> emit) async {
    final previous = state is HomeLoaded
        ? (state as HomeLoaded).products
        : state is HomeLoading
            ? (state as HomeLoading).products
            : state is HomeFailure
                ? (state as HomeFailure).products
                : const <ProductEntity>[];

    emit(HomeLoading(previous));

    // Both futures are started before awaiting, so the calls run in parallel.
    final productsFuture = getProductsUseCase(
      ProductsParams(search: _search.isEmpty ? null : _search, category: _category),
    );
    final shopsFuture = getShopsUseCase(const NoParams());
    final productsResult = await productsFuture;
    final shopsResult = await shopsFuture;

    // The shops feed is only used for labels — if it fails we still show
    // the products without shop names.
    final shopNames = shopsResult.fold(
      (_) => <String, String>{},
      (shops) => {for (final shop in shops) shop.id: shop.shopName},
    );

    productsResult.fold(
      (failure) => emit(HomeFailure(failure.message, previous)),
      (products) => emit(
        HomeLoaded(
          products: [
            for (final product in products)
              product.copyWith(shopName: shopNames[product.shopId] ?? product.shopName),
          ],
          searchQuery: _search,
          selectedCategory: _category,
        ),
      ),
    );
  }
}
