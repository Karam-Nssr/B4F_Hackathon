import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';

/// Navy header with the title and the login / register tabs (Figma
/// M/Auth-Login and M/Auth-Register).
class AuthHeader extends StatelessWidget {
  final bool isLogin;

  const AuthHeader({super.key, required this.isLogin});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.navy,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'أهلاً بك في InstaMall',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'سلة موحدة وتسعير بالليرة السورية',
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  _tab(
                    label: 'تسجيل الدخول',
                    selected: isLogin,
                    onTap: () => context.go('/login'),
                  ),
                  const SizedBox(width: 10),
                  _tab(
                    label: 'حساب جديد',
                    selected: !isLogin,
                    onTap: () => context.go('/register'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tab({
    required String label,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: selected ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white54),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: selected ? AppColors.navy : Colors.white,
          ),
        ),
      ),
    );
  }
}
