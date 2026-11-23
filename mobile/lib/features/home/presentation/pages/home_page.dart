import 'dart:async';

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
  final _scrollController = ScrollController();
  Timer? _searchDebounce;
  String _selectedCategory = 'الكل';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    if (currentScroll >= (maxScroll * 0.85)) {
      context.read<HomeBloc>().add(HomeLoadMoreRequested());
    }
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchController.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _submitSearch(HomeBloc bloc, String value) {
    _searchDebounce?.cancel();
    bloc.add(HomeSearchChanged(query: value.trim()));
  }

  void _onSearchChanged(HomeBloc bloc, String value) {
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 450), () {
      if (!mounted) return;
      bloc.add(HomeSearchChanged(query: value.trim()));
    });
  }

  void _clearSearch(HomeBloc bloc) {
    _searchController.clear();
    _submitSearch(bloc, '');
  }

  void _selectCategory(HomeBloc bloc, String category) {
    setState(() => _selectedCategory = category);
    bloc.add(HomeCategorySelected(category: category));
  }

  void _addToCart(ProductEntity product) {
    context.read<CartBloc>().add(CartItemAdded(product));
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 1),
          backgroundColor: AppColors.navy,
          content: Row(
            children: const [
              Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Text('تمت الإضافة إلى السلة'),
            ],
          ),
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
            final homeBloc = context.read<HomeBloc>();
            final isDarkMode = Theme.of(context).brightness == Brightness.dark;

            return Scaffold(
              backgroundColor: isDarkMode
                  ? AppColors.darkBackground
                  : AppColors.background,
              body: Column(
                children: [
                  HomeHeader(
                    controller: _searchController,
                    onSearchSubmitted: (value) =>
                        _submitSearch(homeBloc, value),
                    onSearchChanged: (value) =>
                        _onSearchChanged(homeBloc, value),
                    onSearchCleared: () => _clearSearch(homeBloc),
                    cartCount: context.watch<CartBloc>().state.itemCount,
                    onCartTap: () => context.go('/cart'),
                  ),
                  Expanded(child: _buildBody(context, state)),
                ],
              ),
              bottomNavigationBar: AppBottomNavBar(
                currentIndex: 0,
                onTap: (index) {
                  if (index != 0) AppBottomNavBar.goToTab(context, index);
                },
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
    final hasMore = state is HomeLoaded && state.hasMore;
    final totalCount = state is HomeLoaded ? state.totalCount : products.length;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async => context.read<HomeBloc>().add(HomeLoadRequested()),
      child: SingleChildScrollView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const HeroBanner(),
            const SizedBox(height: 16),
            CategoryChips(
              selected: _selectedCategory,
              onSelected: (category) =>
                  _selectCategory(context.read<HomeBloc>(), category),
            ),
            const SizedBox(height: 20),
            if (!isError && !isEmpty) _sectionHeader(products.length, totalCount),
            const SizedBox(height: 12),
            if (isLoading && products.isEmpty)
              const SizedBox(
                height: 280,
                child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
              )
            else if (state is HomeFailure && products.isEmpty)
              _errorView(context, state.message)
            else if (state is HomeLoaded && products.isEmpty)
              const _EmptyView()
            else
              Column(
                children: [
                  if (isLoading)
                    const LinearProgressIndicator(
                      minHeight: 2,
                      color: AppColors.primary,
                      backgroundColor: AppColors.border,
                    ),
                  if (isLoading) const SizedBox(height: 8),
                  _grid(products),
                  if (hasMore) ...[
                    const SizedBox(height: 18),
                    _PaginationButton(
                      onPressed: () => context
                          .read<HomeBloc>()
                          .add(HomeLoadMoreRequested()),
                    ),
                  ],
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

  Widget _sectionHeader(int count, int total) {
    final countText = total > count
        ? 'عرض $count من أصل $total منتج'
        : Formatters.productsCount(count);

    return Row(
      children: [
        const Expanded(
          child: Text(
            'وصل حديثاً للشباب',
            style: TextStyle(
              fontSize: 16.5,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            countText,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
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
        childAspectRatio: 0.60,
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
              size: 48, color: AppColors.textMuted),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
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

class _PaginationButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _PaginationButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary, width: 1.3),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      icon: const Icon(Icons.arrow_downward_rounded, size: 18),
      label: const Text(
        'عرض المزيد من المنتجات',
        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
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
          Icon(Icons.search_off_rounded, size: 48, color: AppColors.textMuted),
          SizedBox(height: 12),
          Text(
            'لا توجد منتجات مطابقة',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 4),
          Text(
            'جرّب كلمة بحث أو تصنيفاً آخر',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
