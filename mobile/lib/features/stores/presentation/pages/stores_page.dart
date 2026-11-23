import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_button.dart';
import '../bloc/stores_bloc.dart';
import '../bloc/stores_event.dart';
import '../bloc/stores_state.dart';
import '../widgets/store_card.dart';

/// Stores directory tab (SAD FR-02): every active shop, tappable to open
/// its detail page with the shop's products.
class StoresPage extends StatelessWidget {
  const StoresPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<StoresBloc>()..add(StoresLoadRequested()),
      child: BlocBuilder<StoresBloc, StoresState>(
        builder: (context, state) {
          return Scaffold(
            backgroundColor: AppColors.background,
            body: Column(
              children: [
                const _StoresHeader(),
                Expanded(child: _buildBody(context, state)),
              ],
            ),
            bottomNavigationBar: AppBottomNavBar(
              currentIndex: 1,
              onTap: (index) {
                if (index != 1) AppBottomNavBar.goToTab(context, index);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildBody(BuildContext context, StoresState state) {
    if (state is StoresLoading || state is StoresInitial) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state is StoresFailure) {
      return _ErrorView(
        message: state.message,
        onRetry: () =>
            context.read<StoresBloc>().add(StoresLoadRequested()),
      );
    }
    if (state is StoresLoaded) {
      if (state.shops.isEmpty) {
        return const _EmptyView();
      }
      return RefreshIndicator(
        onRefresh: () async =>
            context.read<StoresBloc>().add(StoresLoadRequested()),
        child: GridView.builder(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.66,
          ),
          itemCount: state.shops.length,
          itemBuilder: (context, index) {
            final shop = state.shops[index];
            return StoreCard(
              shop: shop,
              onTap: () => context.push('/stores/${shop.id}'),
            );
          },
        ),
      );
    }
    return const SizedBox.shrink();
  }
}

class _StoresHeader extends StatelessWidget {
  const _StoresHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.navy,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 18),
          child: Row(
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'المتاجر',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 3),
                  Text(
                    'متاجر مستقلة تبيع مباشرة',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
              const Spacer(),
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary, width: 2),
                ),
                child: const Icon(
                  Icons.storefront_rounded,
                  color: Colors.white,
                  size: 21,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
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
            child: AppButton(text: 'إعادة المحاولة', height: 44, onPressed: onRetry),
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
      padding: EdgeInsets.symmetric(vertical: 48),
      child: Column(
        children: [
          Icon(Icons.storefront_outlined,
              size: 44, color: AppColors.textSecondary),
          SizedBox(height: 12),
          Text(
            'لا توجد متاجر بعد',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          SizedBox(height: 4),
          Text(
            'أول متجر سيظهر هنا قريباً',
            style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
