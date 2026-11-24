import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

class ProductCategory {
  final String label;
  final String value;

  const ProductCategory({
    required this.label,
    required this.value,
  });
}

class CategoryChips extends StatelessWidget {
  static const List<ProductCategory> categories = [
    ProductCategory(label: 'الكل', value: ''),
    ProductCategory(label: 'مواد غذائية', value: 'Groceries'),
    ProductCategory(label: 'عناية شخصية', value: 'Personal Care'),
    ProductCategory(label: 'بهارات وتوابل', value: 'Spices'),
    ProductCategory(label: 'ملابس ومنسوجات', value: 'Clothing'),
    ProductCategory(label: 'ديكور', value: 'Home Decor'),
    ProductCategory(label: 'هدايا', value: 'Gifts'),
    ProductCategory(label: 'قهوة وشاي', value: 'Coffee & Tea'),
    ProductCategory(label: 'حلويات', value: 'Sweets & Bakery'),
    ProductCategory(label: 'خضار وفواكه', value: 'Fresh Produce'),
    ProductCategory(label: 'إكسسوارات', value: 'Accessories'),
    ProductCategory(label: 'مستلزمات منزلية', value: 'Household Supplies'),
    ProductCategory(label: 'زينة', value: 'Ornaments'),
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
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = category.value == selected;

          return InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => onSelected(category.value),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 8,
              ),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.navy : AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected
                      ? AppColors.navy
                      : AppColors.border,
                  width: isSelected ? 1.5 : 1.0,
                ),
                boxShadow: isSelected
                    ? [
                  BoxShadow(
                    color: AppColors.navy.withValues(alpha: 0.15),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
                    : [],
              ),
              child: Center(
                child: Text(
                  category.label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isSelected
                        ? FontWeight.bold
                        : FontWeight.w500,
                    color: isSelected
                        ? Colors.white
                        : AppColors.textPrimary,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}