import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_card.dart';
import '../../domain/entities/order_entity.dart';
import 'order_status_chip.dart';

class OrderCard extends StatelessWidget {
  final OrderEntity order;
  final VoidCallback? onTap;

  const OrderCard({super.key, required this.order, this.onTap});

  static final DateFormat _date = DateFormat('yyyy/MM/dd HH:mm', 'en');

  static const Map<String, String> _overallLabels = {
    'ALL_PENDING': 'بانتظار المتاجر',
    'ALL_CONFIRMED': 'مؤكد من الجميع',
    'ALL_COMPLETED': 'مكتمل',
    'ALL_CANCELLED': 'ملغي',
    'MIXED': 'جزئي',
  };

  static const Map<String, Color> _overallColors = {
    'ALL_PENDING': AppColors.warning,
    'ALL_CONFIRMED': AppColors.navy,
    'ALL_COMPLETED': AppColors.success,
    'ALL_CANCELLED': AppColors.error,
    'MIXED': AppColors.primary,
  };

  String get _overallStatus {
    final statuses = order.subOrders.map((sub) => sub.status).toSet();
    if (statuses.length != 1) return 'MIXED';
    final only = statuses.first;
    switch (only) {
      case 'PENDING':
        return 'ALL_PENDING';
      case 'CONFIRMED':
        return 'ALL_CONFIRMED';
      case 'COMPLETED':
        return 'ALL_COMPLETED';
      case 'CANCELLED':
        return 'ALL_CANCELLED';
      default:
        return 'MIXED';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = _overallStatus;

    return AppCard(
      onTap: onTap,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: onTap,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(18),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.receipt_long_rounded,
                          size: 17,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 9),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'طلب واحد · ${order.subOrders.length} '
                              '${order.subOrders.length == 1 ? 'متجر' : 'متاجر'}',
                              style: TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.bold,
                                color: theme.textTheme.titleMedium?.color,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              order.createdAt != null
                                  ? _date.format(order.createdAt!)
                                  : '—',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: theme.textTheme.bodyMedium?.color
                                    ?.withValues(alpha: 0.65),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          Formatters.syp(order.totalAmountSyp),
                          style: const TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _overallColors[status],
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _overallLabels[status] ?? '',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: _overallColors[status],
                        ),
                      ),
                      const Spacer(),
                      Icon(
                        Icons.arrow_back_ios_new_rounded,
                        size: 13,
                        color: theme.textTheme.bodyMedium?.color
                            ?.withValues(alpha: 0.5),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'التفاصيل',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: theme.textTheme.bodyMedium?.color
                              ?.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                for (final (index, sub) in order.subOrders.indexed) ...[
                  if (index > 0)
                    Divider(height: 1, color: theme.dividerColor),
                  _SubOrderRow(subOrder: sub),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }
}

class _SubOrderRow extends StatelessWidget {
  final SubOrderEntity subOrder;

  const _SubOrderRow({required this.subOrder});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Icon(
            Icons.storefront_rounded,
            size: 15,
            color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.55),
          ),
          const SizedBox(width: 7),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subOrder.shopName.isEmpty ? 'متجر' : subOrder.shopName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: theme.textTheme.titleMedium?.color,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${subOrder.invoiceNumber} · '
                  '${Formatters.syp(subOrder.subtotalSyp)}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    color: theme.textTheme.bodyMedium?.color
                        ?.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          OrderStatusChip(status: subOrder.status),
        ],
      ),
    );
  }
}
