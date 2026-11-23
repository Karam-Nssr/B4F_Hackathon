import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// Arabic label + brand color for each backend order status
/// (SAD appendix A: PENDING → CONFIRMED → COMPLETED, CANCELLED possible).
class OrderStatusChip extends StatelessWidget {
  static const Map<String, String> labels = {
    'PENDING': 'قيد الانتظار',
    'CONFIRMED': 'مؤكد',
    'COMPLETED': 'مكتمل',
    'CANCELLED': 'ملغي',
  };

  static const Map<String, Color> _colors = {
    'PENDING': AppColors.warning,
    'CONFIRMED': AppColors.navy,
    'COMPLETED': AppColors.success,
    'CANCELLED': AppColors.error,
  };

  final String status;

  const OrderStatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final label = labels[status] ?? status;
    final color = _colors[status] ?? AppColors.textSecondary;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
