import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_event.dart';
import '../../domain/entities/product_entity.dart';
import '../bloc/home_bloc.dart';
import '../bloc/home_event.dart';
import '../bloc/home_state.dart';
import '../widgets/category_chips.dart';
import '../widgets/hero_banner.dart';
import '../widgets/home_header.dart';
import '../widgets/product_card.dart';

/// Marketplace home (SAD FR-02 / Figma M/Home): header with search, hero
/// banner, category chips, product grid and the bottom navigation.
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'الكل';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _submitSearch(String value) {
    context.read<HomeBloc>().add(HomeSearchChanged(query: value.trim()));
  }

  void _clearSearch() {
    _searchController.clear();
    _submitSearch('');
  }

  void _selectCategory(String category) {
    setState(() => _selectedCategory = category);
    context.read<HomeBloc>().add(HomeCategorySelected(category: category));
  }

  /// Bottom navigation: stores and cart are built, the rest are not.
  void _onNavTap(int index) {
    switch (index) {
      case 0:
        return; // already home
      case 1:
        context.go('/stores');
      case 2:
        context.go('/cart');
      default:
        _comingSoonAction(AppBottomNavBar.labels[index]);
    }
  }

  void _comingSoonAction(String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$feature — قيد التطوير')),
    );
  }

  void _addToCart(ProductEntity product) {
    context.read<CartBloc>().add(CartItemAdded(product));
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        const SnackBar(
          duration: Duration(seconds: 1),
          content: Text('تمت الإضافة إلى السلة'),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<HomeBloc>()..add(HomeLoadRequested()),
      child: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthUnauthenticated) context.go('/login');
        },
        child: BlocBuilder<HomeBloc, HomeState>(
          builder: (context, state) {
            return Scaffold(
              backgroundColor: AppColors.background,
              body: Column(
                children: [
                  HomeHeader(
                    controller: _searchController,
                    onSearchSubmitted: _submitSearch,
                    onSearchCleared: _clearSearch,
                    cartCount: context.watch<CartBloc>().state.itemCount,
                    onCartTap: () => context.go('/cart'),
                  ),
                  Expanded(child: _buildBody(context, state)),
                ],
              ),
              bottomNavigationBar: AppBottomNavBar(
                currentIndex: 0,
                onTap: _onNavTap,
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, HomeState state) {
    final products = _productsOf(state);
    final isLoading = state is HomeLoading;
    final isError = state is HomeFailure && products.isEmpty;
    final isEmpty = state is HomeLoaded && products.isEmpty;

    return RefreshIndicator(
      onRefresh: () async => context.read<HomeBloc>().add(HomeLoadRequested()),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const HeroBanner(),
            const SizedBox(height: 16),
            CategoryChips(selected: _selectedCategory, onSelected: _selectCategory),
            const SizedBox(height: 20),
            if (!isError && !isEmpty) _sectionHeader(products.length),
            const SizedBox(height: 12),
            if (isLoading && products.isEmpty)
              const SizedBox(
                height: 280,
                child: Center(child: CircularProgressIndicator()),
              )
            else if (state is HomeFailure && products.isEmpty)
              _errorView(context, state.message)
            else if (state is HomeLoaded && products.isEmpty)
              const _EmptyView()
            else
              Column(
                children: [
                  if (isLoading) const LinearProgressIndicator(minHeight: 2),
                  if (isLoading) const SizedBox(height: 8),
                  _grid(products),
                ],
              ),
          ],
        ),
      ),
    );
  }

  List<ProductEntity> _productsOf(HomeState state) {
    if (state is HomeLoaded) return state.products;
    if (state is HomeLoading) return state.products;
    if (state is HomeFailure) return state.products;
    return const [];
  }

  Widget _sectionHeader(int count) {
    return Row(
      children: [
        const Expanded(
          child: Text(
            'وصل حديثاً للشباب',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        Text(
          Formatters.productsCount(count),
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _grid(List<ProductEntity> products) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.62,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return ProductCard(
          product: product,
          onAddToCart: () => _addToCart(product),
        );
      },
    );
  }

  Widget _errorView(BuildContext context, String message) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          const Icon(Icons.wifi_off_rounded,
              size: 44, color: AppColors.textSecondary),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: 200,
            child: AppButton(
              text: 'إعادة المحاولة',
              height: 44,
              onPressed: () =>
                  context.read<HomeBloc>().add(HomeLoadRequested()),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          Icon(Icons.search_off_rounded, size: 44, color: AppColors.textSecondary),
          SizedBox(height: 12),
          Text(
            'لا توجد منتجات مطابقة',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          SizedBox(height: 4),
          Text(
            'جرّب كلمة بحث أو تصنيفاً آخر',
            style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
