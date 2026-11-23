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
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text(
                order.createdAt != null
                    ? _date.format(order.createdAt!)
                    : '—',
                style: const TextStyle(
                  fontSize: 11.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                Formatters.syp(order.totalAmountSyp),
                style: const TextStyle(
                  fontSize: 14.5,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          for (final (index, subOrder) in order.subOrders.indexed) ...[
            if (index > 0) ...[
              const SizedBox(height: 12),
              const Divider(height: 1, color: AppColors.border),
              const SizedBox(height: 12),
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const Icon(
              Icons.storefront_rounded,
              size: 15,
              color: AppColors.navy,
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                subOrder.shopName.isEmpty ? 'متجر' : subOrder.shopName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            OrderStatusChip(status: subOrder.status),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          'فاتورة: ${subOrder.invoiceNumber}',
          style: const TextStyle(
            fontSize: 11.5,
            color: AppColors.textSecondary,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 8),
        for (final item in subOrder.items)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    '${item.productTitle} × ${item.quantity}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                Text(
                  Formatters.syp(item.totalSyp),
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 6),
        Row(
          children: [
            const Expanded(
              child: Text(
                'مجموع المتجر',
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            Text(
              Formatters.syp(subOrder.subtotalSyp),
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        if (subOrder.status == 'PENDING') ...[
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.hourglass_top_rounded,
                  size: 14, color: AppColors.warning),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'بانتظار تأكيد المتجر خلال ${subOrder.confirmationWindowHours} ساعة',
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.warning,
                  ),
                ),
              ),
            ],
          ),
        ],
        const SizedBox(height: 8),
        // SAD §9: the verification data appears only in the buyer's own
        // order record — never on public screens.
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              const Icon(Icons.verified_user_outlined,
                  size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'الهاتف: ${order.customerPhone} — الرقم الوطني: '
                  '${order.customerNationalId}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
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
