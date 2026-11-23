import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/orders_bloc.dart';
import '../bloc/orders_event.dart';
import '../bloc/orders_state.dart';
import '../widgets/order_card.dart';

/// "طلباتي" tab (SAD FR-07 / §8): the signed-in user's orders, each card
/// split per shop with invoice number, status, totals in SYP and the
/// attached verification data. Requires login (backend is JWT-guarded).
class OrdersPage extends StatelessWidget {
  const OrdersPage({super.key});

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
                      const _OrdersHeader(),
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
      return _ErrorView(
        message: state.message,
        onRetry: () =>
            context.read<OrdersBloc>().add(OrdersLoadRequested()),
      );
    }
    if (state is OrdersLoaded) {
      if (state.orders.isEmpty) return const _EmptyView();
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async =>
            context.read<OrdersBloc>().add(OrdersLoadRequested()),
        child: ListView.separated(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          itemCount: state.orders.length,
          separatorBuilder: (_, _) => const SizedBox(height: 12),
          itemBuilder: (context, index) => OrderCard(order: state.orders[index]),
        ),
      );
    }
    return const SizedBox.shrink();
  }
}

class _OrdersHeader extends StatelessWidget {
  const _OrdersHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.navyGradient,
      ),
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
                    'طلباتي',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 3),
                  Text(
                    'تابع طلباتك وفواتير كل متجر',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
              const Spacer(),
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: AppColors.primary, width: 2),
                ),
                child: const Icon(
                  Icons.receipt_long_rounded,
                  color: Colors.white,
                  size: 22,
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
              onPressed: onRetry,
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
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
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
              Icons.receipt_long_outlined,
              size: 44,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 18),
          Text(
            'لا توجد طلبات بعد',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: theme.textTheme.titleLarge?.color,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'طلباتك ستظهر هنا بعد إتمام أول طلب',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13.5,
              color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: 210,
            child: AppButton(
              text: 'ابدأ التسوق',
              height: 46,
              icon: Icons.shopping_bag_outlined,
              onPressed: () => context.go('/home'),
            ),
          ),
        ],
      ),
    );
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
            const _OrdersHeader(),
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
                        color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
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
