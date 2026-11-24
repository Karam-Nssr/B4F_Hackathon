import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/payment_option.dart';

class PaymentMethodTile extends StatelessWidget {
  final PaymentOption option;
  final bool isSelected;
  final VoidCallback onTap;

  const PaymentMethodTile({
    super.key,
    required this.option,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: isSelected
          ? AppColors.primary.withValues(alpha: 0.07)
          : theme.colorScheme.surfaceContainerHighest,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? AppColors.primary : Colors.transparent,
              width: 1.4,
            ),
          ),
          child: Row(
            children: [
              Icon(
                option.timing == PaymentTiming.now
                    ? Icons.account_balance_wallet_outlined
                    : Icons.payments_outlined,
                size: 21,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      option.label,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: theme.textTheme.titleMedium?.color,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      option.description,
                      style: TextStyle(
                        fontSize: 11.5,
                        color: theme.textTheme.bodyMedium?.color
                            ?.withValues(alpha: 0.65),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.border,
                    width: 1.6,
                  ),
                ),
                child: isSelected
                    ? const Center(
                        child: Icon(
                          Icons.check_rounded,
                          size: 14,
                          color: AppColors.primary,
                        ),
                      )
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> showPaymentMethodSheet(
  BuildContext context, {
  required PaymentOption selected,
  required ValueChanged<String> onSelected,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) {
      final theme = Theme.of(sheetContext);

      return Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(sheetContext).size.height * 0.8,
        ),
        decoration: BoxDecoration(
          color: theme.scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: theme.dividerColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'طريقة الدفع',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: theme.textTheme.titleLarge?.color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'اختر كيف تدفع قيمة طلبك',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12.5,
                    color: theme.textTheme.bodyMedium?.color
                        ?.withValues(alpha: 0.65),
                  ),
                ),
                const SizedBox(height: 18),
                const _SectionLabel(
                  icon: Icons.flash_on_rounded,
                  text: 'الدفع عند الطلب',
                ),
                const SizedBox(height: 10),
                for (final option in PaymentOptions.payNow) ...[
                  PaymentMethodTile(
                    option: option,
                    isSelected: option.id == selected.id,
                    onTap: () {
                      onSelected(option.id);
                      Navigator.of(sheetContext).pop();
                    },
                  ),
                  const SizedBox(height: 8),
                ],
                const SizedBox(height: 8),
                const _SectionLabel(
                  icon: Icons.local_shipping_outlined,
                  text: 'الدفع عند الاستلام',
                ),
                const SizedBox(height: 10),
                for (final option in PaymentOptions.onReceipt) ...[
                  PaymentMethodTile(
                    option: option,
                    isSelected: option.id == selected.id,
                    onTap: () {
                      onSelected(option.id);
                      Navigator.of(sheetContext).pop();
                    },
                  ),
                  const SizedBox(height: 8),
                ],
              ],
            ),
          ),
        ),
      );
    },
  );
}

class _SectionLabel extends StatelessWidget {
  final IconData icon;
  final String text;

  const _SectionLabel({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Icon(icon, size: 15, color: AppColors.primary),
        const SizedBox(width: 6),
        Text(
          text,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: theme.textTheme.titleMedium?.color,
          ),
        ),
      ],
    );
  }
}
