import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// Horizontal category filter (Figma M/Home chips row). `الكل` clears the
/// filter; the rest are passed as the `category` query parameter.
class CategoryChips extends StatelessWidget {
  static const List<String> categories = [
    'الكل',
    'ملابس',
    'هدايا',
    'إكسسوارات',
    'زينة',
    'ديكور',
    'مستلزمات منزلية',
  ];

  final String selected;
  final ValueChanged<String> onSelected;

  const CategoryChips({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final label = categories[index];
          final isSelected = label == selected;
          return InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => onSelected(label),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.navy : AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppColors.navy : AppColors.border,
                ),
              ),
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? Colors.white : AppColors.textPrimary,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
