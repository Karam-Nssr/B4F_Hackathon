import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_page_header.dart';
import '../../../../core/widgets/app_status_views.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../domain/entities/order_entity.dart';
import '../bloc/orders_bloc.dart';
import '../bloc/orders_event.dart';
import '../bloc/orders_state.dart';
import '../widgets/order_status_chip.dart';

class OrderDetailsPage extends StatelessWidget {
  final String orderId;

  const OrderDetailsPage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocProvider(
      create: (_) =>
          sl<OrdersBloc>()..add(OrderDetailsLoadRequested(orderId: orderId)),
      child: BlocListener<OrdersBloc, OrdersState>(
        listenWhen: (prev, cur) =>
            cur is OrderDetailsLoaded &&
            cur.message != null &&
            cur.message != (prev is OrderDetailsLoaded ? prev.message : null),
        listener: (context, state) {
          final loaded = state as OrderDetailsLoaded;
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(
              SnackBar(
                backgroundColor:
                    loaded.messageIsError ? AppColors.error : AppColors.success,
                content: Text(loaded.message!),
              ),
            );
        },
        child: BlocBuilder<OrdersBloc, OrdersState>(
          builder: (context, state) {
            final loaded = state is OrderDetailsLoaded ? state : null;

            return Scaffold(
              backgroundColor: theme.scaffoldBackgroundColor,
              body: Column(
                children: [
                  AppPageHeader(
                    title: 'تفاصيل الطلب',
                    subtitle: loaded == null
                        ? 'حالة كل متجر والفواتير'
                        : _headerSubtitle(loaded.order),
                    icon: Icons.receipt_long_rounded,
                    onBack: () => _close(context, changed: false),
                  ),
                  Expanded(child: _buildBody(context, state)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  static String _headerSubtitle(OrderEntity order) {
    final date = order.createdAt;
    if (date == null) return 'حالة كل متجر والفواتير';
    return DateFormat('yyyy/MM/dd HH:mm', 'en').format(date);
  }

  void _close(BuildContext context, {required bool changed}) {
    if (context.canPop()) {
      context.pop(changed);
    } else {
      context.go('/orders');
    }
  }

  Widget _buildBody(BuildContext context, OrdersState state) {
    if (state is OrderDetailsLoading || state is OrdersInitial) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    if (state is OrderDetailsFailure) {
      return AppErrorState(
        message: state.message,
        onRetry: () => context
            .read<OrdersBloc>()
            .add(OrderDetailsLoadRequested(orderId: orderId)),
      );
    }
    if (state is OrderDetailsLoaded) {
      return _OrderDetails(order: state.order, state: state);
    }
    return const SizedBox.shrink();
  }
}

class _OrderDetails extends StatelessWidget {
  final OrderEntity order;
  final OrderDetailsLoaded state;

  const _OrderDetails({required this.order, required this.state});

  bool get _allPending =>
      order.subOrders.isNotEmpty &&
      order.subOrders.every((sub) => sub.status == 'PENDING');

  Future<void> _cancelSubOrder(BuildContext context, SubOrderEntity sub) async {
    final confirmed = await showConfirmDialog(
      context,
      title: 'إلغاء طلب ${sub.shopName.isEmpty ? 'المتجر' : sub.shopName}',
      message: 'سيُلغى جزء هذا المتجر من طلبك. باقي المتاجر لا تتأثر.',
      confirmLabel: 'إلغاء الطلب',
      destructive: true,
    );
    if (!confirmed || !context.mounted) return;
    context
        .read<OrdersBloc>()
        .add(SubOrderCancelRequested(subOrderId: sub.id));
  }

  Future<void> _cancelWholeOrder(BuildContext context) async {
    final confirmed = await showConfirmDialog(
      context,
      title: 'إلغاء الطلب بالكامل',
      message: 'جميع متاجر هذا الطلب ما زالت بانتظار التأكيد، '
          'لذلك يمكنك إلغاء الطلب كاملاً.',
      confirmLabel: 'إلغاء الطلب كاملاً',
      destructive: true,
    );
    if (!confirmed || !context.mounted) return;
    context.read<OrdersBloc>().add(OrderCancelRequested(orderId: order.id));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.shopping_bag_outlined,
                            color: AppColors.primary,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'إجمالي الطلب',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  color: theme.textTheme.bodyMedium?.color
                                      ?.withValues(alpha: 0.7),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                Formatters.syp(order.totalAmountSyp),
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '${order.subOrders.length} '
                            '${order.subOrders.length == 1 ? 'متجر' : 'متاجر'}',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: theme.textTheme.bodyMedium?.color
                                  ?.withValues(alpha: 0.75),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.verified_user_outlined,
                            size: 15,
                            color: theme.textTheme.bodyMedium?.color
                                ?.withValues(alpha: 0.6),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'الهاتف: ${order.customerPhone} — '
                              'الرقم الوطني: ${order.customerNationalId}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 11.5,
                                color: theme.textTheme.bodyMedium?.color
                                    ?.withValues(alpha: 0.7),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              for (final (index, sub) in order.subOrders.indexed) ...[
                if (index > 0) const SizedBox(height: 12),
                _SubOrderCard(
                  subOrder: sub,
                  isCancelling: state.isCancelling,
                  onCancel: () => _cancelSubOrder(context, sub),
                ),
              ],
              const SizedBox(height: 20),
            ],
          ),
        ),
        if (_allPending)
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: BoxDecoration(
              color: theme.cardColor,
              border: Border(
                top: BorderSide(
                  color: theme.dividerColor.withValues(alpha: 0.6),
                ),
              ),
            ),
            child: AppButton(
              text: 'إلغاء الطلب كاملاً',
              icon: Icons.cancel_outlined,
              isLoading: state.isCancelling,
              onPressed: () => _cancelWholeOrder(context),
            ),
          ),
      ],
    );
  }
}

class _SubOrderCard extends StatelessWidget {
  final SubOrderEntity subOrder;
  final bool isCancelling;
  final VoidCallback onCancel;

  const _SubOrderCard({
    required this.subOrder,
    required this.isCancelling,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.primary.withValues(alpha: 0.2)
                      : AppColors.navy.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.storefront_rounded,
                  size: 16,
                  color: isDark ? AppColors.primary : AppColors.navy,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  subOrder.shopName.isEmpty ? 'متجر' : subOrder.shopName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.bold,
                    color: theme.textTheme.titleMedium?.color,
                  ),
                ),
              ),
              OrderStatusChip(status: subOrder.status),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              'فاتورة: ${subOrder.invoiceNumber}',
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.2,
                color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
              ),
            ),
          ),
          const SizedBox(height: 10),
          for (final item in subOrder.items)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      '${item.productTitle} × ${item.quantity}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13,
                        color: theme.textTheme.bodyLarge?.color,
                      ),
                    ),
                  ),
                  Text(
                    Formatters.syp(item.totalSyp),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: theme.textTheme.bodyMedium?.color
                          ?.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: Text(
                  'مجموع المتجر',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: theme.textTheme.titleMedium?.color,
                  ),
                ),
              ),
              Text(
                Formatters.syp(subOrder.subtotalSyp),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: theme.textTheme.titleMedium?.color,
                ),
              ),
            ],
          ),
          if (subOrder.status == 'PENDING') ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.hourglass_top_rounded,
                    size: 15,
                    color: AppColors.warning,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'بانتظار تأكيد المتجر خلال '
                      '${subOrder.confirmationWindowHours} ساعة',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.warning,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: isCancelling ? null : onCancel,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.error,
                side: const BorderSide(color: AppColors.error, width: 1.3),
                padding: const EdgeInsets.symmetric(vertical: 11),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.close_rounded, size: 18),
              label: const Text(
                'إلغاء هذا الجزء',
                style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
