import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_event.dart';
import '../../../home/domain/entities/product_entity.dart';
import '../../../home/presentation/widgets/product_card.dart';
import '../bloc/stores_bloc.dart';
import '../bloc/stores_event.dart';
import '../bloc/stores_state.dart';

/// One shop: navy header (name / category / description) plus the grid of
/// the shop's active products.
class StoreDetailPage extends StatelessWidget {
  final String shopId;

  const StoreDetailPage({super.key, required this.shopId});

  void _addToCart(BuildContext context, ProductEntity product) {
    context.read<CartBloc>().add(CartItemAdded(product));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        duration: Duration(seconds: 1),
        content: Text('تمت الإضافة إلى السلة'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          sl<StoresBloc>()..add(StoreDetailLoadRequested(shopId: shopId)),
      child: BlocBuilder<StoresBloc, StoresState>(
        builder: (context, state) {
          final shop = state is StoreDetailLoaded ? state.shop : null;

          return Scaffold(
            backgroundColor: AppColors.background,
            body: Column(
              children: [
                _ShopHeader(
                  shopName: shop?.shopName,
                  category: shop?.category,
                  description: shop?.description,
                  onBack: () => context.pop(),
                ),
                Expanded(child: _buildBody(context, state)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildBody(BuildContext context, StoresState state) {
    if (state is StoreDetailLoading || state is StoresInitial) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state is StoreDetailFailure) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.wifi_off_rounded,
                size: 44, color: AppColors.textSecondary),
            const SizedBox(height: 12),
            Text(
              state.message,
              textAlign: TextAlign.center,
              style:
                  const TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: 200,
              child: AppButton(
                text: 'إعادة المحاولة',
                height: 44,
                onPressed: () => context
                    .read<StoresBloc>()
                    .add(StoreDetailLoadRequested(shopId: shopId)),
              ),
            ),
          ],
        ),
      );
    }
    if (state is StoreDetailLoaded) {
      final products = state.shop.products;
      if (products.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 48),
          child: Column(
            children: [
              Icon(Icons.inventory_2_outlined,
                  size: 44, color: AppColors.textSecondary),
              SizedBox(height: 12),
              Text(
                'لا توجد منتجات في هذا المتجر',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        );
      }

      return Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'منتجات المتجر',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                Text(
                  Formatters.productsCount(products.length),
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
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
                  onAddToCart: () => _addToCart(context, product),
                );
              },
            ),
          ),
        ],
      );
    }
    return const SizedBox.shrink();
  }
}

class _ShopHeader extends StatelessWidget {
  final String? shopName;
  final String? category;
  final String? description;
  final VoidCallback onBack;

  const _ShopHeader({
    this.shopName,
    this.category,
    this.description,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.navy,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 8, 16, 18),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IconButton(
                onPressed: onBack,
                icon: const Icon(Icons.arrow_back, color: Colors.white),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shopName ?? 'المتجر',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (category != null && category!.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          category!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                    if (description != null && description!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        description!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12.5,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
