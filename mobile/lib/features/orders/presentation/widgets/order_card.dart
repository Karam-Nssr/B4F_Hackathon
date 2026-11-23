import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../domain/entities/order_entity.dart';
import 'order_status_chip.dart';

/// One master order: date + total, then a block per shop with its invoice,
/// items, status, subtotal and the attached verification data — exactly
/// what SAD §8 specifies for "طلباتي".
class OrderCard extends StatelessWidget {
  final OrderEntity order;

  const OrderCard({super.key, required this.order});

  static final DateFormat _date =
      DateFormat('yyyy/MM/dd HH:mm', 'en');

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor.withValues(alpha: 0.6)),
        boxShadow: AppColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Row(
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 14,
                    color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.6),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    order.createdAt != null
                        ? _date.format(order.createdAt!)
                        : '—',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  Formatters.syp(order.totalAmountSyp),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          for (final (index, subOrder) in order.subOrders.indexed) ...[
            if (index > 0) ...[
              const SizedBox(height: 14),
              Divider(height: 1, color: theme.dividerColor),
              const SizedBox(height: 14),
            ],
            _SubOrderSection(order: order, subOrder: subOrder),
          ],
        ],
      ),
    );
  }
}

class _SubOrderSection extends StatelessWidget {
  final OrderEntity order;
  final SubOrderEntity subOrder;

  const _SubOrderSection({required this.order, required this.subOrder});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Column(
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
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: theme.textTheme.titleMedium?.color,
                ),
              ),
            ),
            OrderStatusChip(status: subOrder.status),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            'فاتورة: ${subOrder.invoiceNumber}',
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
              color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
              letterSpacing: 0.2,
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
                    color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 8),
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
                const Icon(Icons.hourglass_top_rounded,
                    size: 15, color: AppColors.warning),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'بانتظار تأكيد المتجر خلال ${subOrder.confirmationWindowHours} ساعة',
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
        ],
        const SizedBox(height: 10),
        // SAD §9: the verification data appears only in the buyer's own
        // order record — never on public screens.
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: theme.dividerColor),
          ),
          child: Row(
            children: [
              Icon(Icons.verified_user_outlined,
                  size: 15, color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.6)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'الهاتف: ${order.customerPhone} — الرقم الوطني: '
                  '${order.customerNationalId}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11.5,
                    color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
