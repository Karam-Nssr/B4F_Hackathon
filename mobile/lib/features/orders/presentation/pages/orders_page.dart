import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_page_header.dart';
import '../../../../core/widgets/app_status_views.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/orders_bloc.dart';
import '../bloc/orders_event.dart';
import '../bloc/orders_state.dart';
import '../widgets/order_card.dart';

class OrdersPage extends StatelessWidget {
  const OrdersPage({super.key});

  Future<void> _openDetails(BuildContext context, String orderId) async {
    final changed = await context.push<bool>('/orders/$orderId');
    if (changed == true && context.mounted) {
      context.read<OrdersBloc>().add(OrdersLoadRequested());
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) context.go('/login');
      },
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, authState) {
          if (authState is! AuthAuthenticated) {
            return const _LoginRequiredView();
          }
          return BlocProvider(
            create: (_) => sl<OrdersBloc>()..add(OrdersLoadRequested()),
            child: BlocBuilder<OrdersBloc, OrdersState>(
              builder: (context, state) {
                return Scaffold(
                  backgroundColor: theme.scaffoldBackgroundColor,
                  body: Column(
                    children: [
                      const AppPageHeader(
                        title: 'طلباتي',
                        subtitle: 'طلب واحد يضم كل متاجرك في مكان واحد',
                        icon: Icons.receipt_long_rounded,
                      ),
                      Expanded(child: _buildBody(context, state)),
                    ],
                  ),
                  bottomNavigationBar: AppBottomNavBar(
                    currentIndex: 3,
                    onTap: (index) {
                      if (index != 3) {
                        AppBottomNavBar.goToTab(context, index);
                      }
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildBody(BuildContext context, OrdersState state) {
    if (state is OrdersLoading || state is OrdersInitial) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    if (state is OrdersFailure) {
      return AppErrorState(
        message: state.message,
        onRetry: () =>
            context.read<OrdersBloc>().add(OrdersLoadRequested()),
      );
    }
    if (state is OrdersLoaded) {
      if (state.orders.isEmpty) {
        return AppEmptyState(
          icon: Icons.receipt_long_outlined,
          title: 'لا توجد طلبات بعد',
          message: 'أول طلب لك سيظهر هنا بتفاصيله وفواتيره',
          actionLabel: 'ابدأ التسوق',
          onAction: () => context.go('/home'),
        );
      }
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async =>
            context.read<OrdersBloc>().add(OrdersLoadRequested()),
        child: ListView.separated(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          itemCount: state.orders.length,
          separatorBuilder: (_, _) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final order = state.orders[index];
            return OrderCard(
              order: order,
              onTap: () => _openDetails(context, order.id),
            );
          },
        ),
      );
    }
    return const SizedBox.shrink();
  }
}

class _LoginRequiredView extends StatelessWidget {
  const _LoginRequiredView();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            const AppPageHeader(
              title: 'طلباتي',
              subtitle: 'تابع طلباتك وفواتير كل متجر',
              icon: Icons.receipt_long_rounded,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        color: AppColors.navy.withValues(alpha: 0.06),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.lock_outline_rounded,
                        size: 42,
                        color: AppColors.navy,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'سجّل الدخول لعرض طلباتك',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: theme.textTheme.titleLarge?.color,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'نحتاج حسابك لعرض الطلبات والفواتير الخاصة بك',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13.5,
                        color: theme.textTheme.bodyMedium?.color
                            ?.withValues(alpha: 0.7),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: 210,
                      child: AppButton(
                        text: 'تسجيل الدخول',
                        height: 46,
                        icon: Icons.login_rounded,
                        onPressed: () => context.push('/login'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            AppBottomNavBar(
              currentIndex: 3,
              onTap: (index) {
                if (index != 3) AppBottomNavBar.goToTab(context, index);
              },
            ),
          ],
        ),
      ),
    );
  }
}
