import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../domain/entities/checkout_result_entity.dart';
import '../bloc/cart_bloc.dart';
import '../bloc/cart_event.dart';
import '../bloc/cart_state.dart';
import '../widgets/cart_item_tile.dart';

/// Cart tab: local cart lines, grand total in SYP and checkout through
/// `POST /api/orders` (SAD FR-05 — the backend splits it per shop).
class CartPage extends StatelessWidget {
  const CartPage({super.key});

  void _checkout(BuildContext context) {
    // The backend requires a JWT with role `user` — send guests to login.
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('سجّل الدخول أولاً لإتمام الطلب')),
      );
      context.push('/login');
      return;
    }
    context.read<CartBloc>().add(CartCheckoutRequested());
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<CartBloc, CartState>(
      // One-shot: the success dialog appears exactly once per order.
      listenWhen: (prev, cur) =>
          cur.lastOrder != null && cur.lastOrder != prev.lastOrder,
      listener: (context, state) async {
        final order = state.lastOrder!;
        await _showSuccessDialog(context, order);
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
            ..showSnackBar(SnackBar(content: Text(state.message!)));
        },
        builder: (context, state) {
          return Scaffold(
            backgroundColor: AppColors.background,
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
      return const Center(child: CircularProgressIndicator());
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
  ) {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: AppColors.success,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 34),
              ),
              const SizedBox(height: 16),
              const Text(
                'تم إنشاء الطلب بنجاح',
                style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'قسّمنا طلبك إلى ${order.shopsCount} '
                '${order.shopsCount == 1 ? 'متجر' : 'متاجر'} تلقائياً',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'الإجمالي: ${Formatters.syp(order.totalAmountSyp)}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              if (order.orderId.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  'رقم الطلب: ${order.orderId}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  text: 'تمام',
                  height: 46,
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
                    'سلة التسوق',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 3),
                  Text(
                    'راجع منتجاتك قبل إتمام الطلب',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
              const Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '$itemCount ${itemCount == 1 ? 'قطعة' : 'قطعة'}',
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
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(
          top: BorderSide(color: AppColors.border.withValues(alpha: 0.7)),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Text(
                'الإجمالي',
                style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
              ),
              const Spacer(),
              Text(
                Formatters.syp(totalSyp),
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          AppButton(
            text: 'إتمام الطلب',
            icon: Icons.lock_outline,
            isLoading: isSubmitting,
            onPressed: onCheckout,
          ),
          const SizedBox(height: 8),
          const Text(
            'سيتم تقسيم الطلب لكل متجر تلقائياً',
            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
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
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              color: AppColors.navy.withValues(alpha: 0.06),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.shopping_cart_outlined,
              size: 40,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'سلتك فارغة',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'أضف منتجات من الصفحة الرئيسية أو المتاجر',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 22),
          SizedBox(
            width: 210,
            child: AppButton(
              text: 'ابدأ التسوق',
              height: 46,
              onPressed: () => context.go('/home'),
            ),
          ),
        ],
      ),
    );
  }
}
