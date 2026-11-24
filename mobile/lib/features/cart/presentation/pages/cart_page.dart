import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_page_header.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../domain/entities/checkout_result_entity.dart';
import '../../domain/entities/payment_option.dart';
import '../bloc/cart_bloc.dart';
import '../bloc/cart_event.dart';
import '../bloc/cart_state.dart';
import '../widgets/cart_item_tile.dart';
import '../widgets/payment_method_sheet.dart';

class CartPage extends StatelessWidget {
  const CartPage({super.key});

  void _checkout(BuildContext context) {
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.navy,
          content: Text('سجّل الدخول أولاً لإتمام الطلب'),
        ),
      );
      context.push('/login');
      return;
    }
    context.read<CartBloc>().add(CartCheckoutRequested());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocListener<CartBloc, CartState>(
      listenWhen: (prev, cur) =>
          cur.lastOrder != null && cur.lastOrder != prev.lastOrder,
      listener: (context, state) async {
        final order = state.lastOrder!;
        await _showSuccessDialog(context, order, state.paymentOption);
        if (context.mounted) {
          context.read<CartBloc>().add(CartOrderAcknowledged());
        }
      },
      child: BlocConsumer<CartBloc, CartState>(
        listenWhen: (prev, cur) =>
            cur.message != null && cur.message != prev.message,
        listener: (context, state) {
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(
              SnackBar(
                backgroundColor: AppColors.navy,
                content: Text(state.message!),
              ),
            );
        },
        builder: (context, state) {
          return Scaffold(
            backgroundColor: theme.scaffoldBackgroundColor,
            body: Column(
              children: [
                _CartHeader(
                  itemCount: state.itemCount,
                  totalSyp: state.totalSyp,
                ),
                Expanded(child: _buildBody(context, state)),
              ],
            ),
            bottomNavigationBar: AppBottomNavBar(
              currentIndex: 2,
              onTap: (index) {
                if (index != 2) AppBottomNavBar.goToTab(context, index);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildBody(BuildContext context, CartState state) {
    if (state.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    if (state.items.isEmpty) {
      return const _EmptyCart();
    }

    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
            itemCount: state.items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final item = state.items[index];
              return CartItemTile(
                item: item,
                onIncrement: () => context.read<CartBloc>().add(
                      CartQuantityChanged(
                        productId: item.productId,
                        quantity: item.quantity + 1,
                      ),
                    ),
                onDecrement: () => context.read<CartBloc>().add(
                      CartQuantityChanged(
                        productId: item.productId,
                        quantity: item.quantity - 1,
                      ),
                    ),
                onRemove: () => context.read<CartBloc>().add(
                      CartItemRemoved(productId: item.productId),
                    ),
              );
            },
          ),
        ),
        _PaymentBar(
          option: state.paymentOption,
          onChanged: (id) => context
              .read<CartBloc>()
              .add(CartPaymentMethodChanged(paymentOptionId: id)),
        ),
        _CheckoutBar(
          totalSyp: state.totalSyp,
          isSubmitting: state.isSubmitting,
          onCheckout: () => _checkout(context),
        ),
      ],
    );
  }

  Future<void> _showSuccessDialog(
    BuildContext context,
    CheckoutResultEntity order,
    PaymentOption paymentOption,
  ) {
    final theme = Theme.of(context);

    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: theme.cardColor,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded,
                    color: AppColors.success, size: 48),
              ),
              const SizedBox(height: 16),
              Text(
                'تم إنشاء الطلب بنجاح',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: theme.textTheme.titleLarge?.color,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'قسّمنا طلبك إلى ${order.shopsCount} '
                '${order.shopsCount == 1 ? 'متجر' : 'متاجر'} تلقائياً',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13.5,
                  color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'الإجمالي: ${Formatters.syp(order.totalAmountSyp)}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
              if (order.orderId.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'رقم الطلب: ${order.orderId}',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.6),
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      paymentOption.timing == PaymentTiming.now
                          ? Icons.account_balance_wallet_outlined
                          : Icons.payments_outlined,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      paymentOption.label,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  text: 'تمام',
                  height: 48,
                  onPressed: () => Navigator.of(dialogContext).pop(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _CartHeader extends StatelessWidget {
  final int itemCount;
  final num totalSyp;

  const _CartHeader({required this.itemCount, required this.totalSyp});

  static String _countLabel(int count) {
    if (count == 1) return 'قطعة واحدة';
    if (count == 2) return 'قطعتان';
    if (count <= 10) return '$count قطع';
    return '$count قطعة';
  }

  @override
  Widget build(BuildContext context) {
    return AppPageHeader(
      title: 'سلة التسوق',
      subtitle: 'راجع منتجاتك قبل إتمام الطلب',
      icon: Icons.shopping_cart_outlined,
      trailing: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            _countLabel(itemCount),
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 3),
          Text(
            Formatters.syp(totalSyp),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentBar extends StatelessWidget {
  final PaymentOption option;
  final ValueChanged<String> onChanged;

  const _PaymentBar({required this.option, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: theme.cardColor,
      child: InkWell(
        onTap: () => showPaymentMethodSheet(
          context,
          selected: option,
          onSelected: onChanged,
        ),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: theme.dividerColor.withValues(alpha: 0.6)),
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  option.timing == PaymentTiming.now
                      ? Icons.account_balance_wallet_outlined
                      : Icons.payments_outlined,
                  size: 17,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'طريقة الدفع',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: theme.textTheme.bodyMedium?.color
                            ?.withValues(alpha: 0.65),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      option.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: theme.textTheme.titleMedium?.color,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color:
                    theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CheckoutBar extends StatelessWidget {
  final num totalSyp;
  final bool isSubmitting;
  final VoidCallback onCheckout;

  const _CheckoutBar({
    required this.totalSyp,
    required this.isSubmitting,
    required this.onCheckout,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        border: Border(
          top: BorderSide(color: theme.dividerColor.withValues(alpha: 0.6)),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Text(
                'الإجمالي الكلي',
                style: TextStyle(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w600,
                  color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.8),
                ),
              ),
              const Spacer(),
              Text(
                Formatters.syp(totalSyp),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          AppButton(
            text: 'إتمام الطلب',
            icon: Icons.lock_outline_rounded,
            isLoading: isSubmitting,
            onPressed: onCheckout,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shield_outlined,
                  size: 14, color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.6)),
              const SizedBox(width: 4),
              Text(
                'سيتم تقسيم الطلب لكل متجر تلقائياً',
                style: TextStyle(
                  fontSize: 11.5,
                  color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyCart extends StatelessWidget {
  const _EmptyCart();

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
              Icons.shopping_cart_outlined,
              size: 44,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 18),
          Text(
            'سلتك فارغة',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: theme.textTheme.titleLarge?.color,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'أضف منتجات من الصفحة الرئيسية أو المتاجر',
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
              icon: Icons.storefront_rounded,
              onPressed: () => context.go('/home'),
            ),
          ),
        ],
      ),
    );
  }
}
