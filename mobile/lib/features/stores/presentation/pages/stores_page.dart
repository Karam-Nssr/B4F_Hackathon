import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_page_header.dart';
import '../../../../core/widgets/app_status_views.dart';
import '../bloc/stores_bloc.dart';
import '../bloc/stores_event.dart';
import '../bloc/stores_state.dart';
import '../widgets/store_card.dart';

class StoresPage extends StatelessWidget {
  const StoresPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocProvider(
      create: (_) => sl<StoresBloc>()..add(StoresLoadRequested()),
      child: BlocBuilder<StoresBloc, StoresState>(
        builder: (context, state) {
          return Scaffold(
            backgroundColor: theme.scaffoldBackgroundColor,
            body: Column(
              children: [
                const AppPageHeader(
                  title: 'المتاجر',
                  subtitle: 'متاجر مستقلة تبيع مباشرة',
                  icon: Icons.storefront_rounded,
                ),
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
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    if (state is StoresFailure) {
      return AppErrorState(
        message: state.message,
        onRetry: () =>
            context.read<StoresBloc>().add(StoresLoadRequested()),
      );
    }
    if (state is StoresLoaded) {
      if (state.shops.isEmpty) {
        return const AppEmptyState(
          icon: Icons.storefront_outlined,
          title: 'لا توجد متاجر بعد',
          message: 'أول متجر سيظهر هنا قريباً',
        );
      }
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async =>
            context.read<StoresBloc>().add(StoresLoadRequested()),
        child: GridView.builder(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.64,
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
