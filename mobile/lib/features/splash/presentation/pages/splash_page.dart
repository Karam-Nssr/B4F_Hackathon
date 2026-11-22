
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.navyLight,
              AppColors.navy,
            ],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    minHeight: constraints.maxHeight,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 32,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Lottie.asset(
                          'assets/lotties/Empty_Cart.json',
                          width: 200,
                          height: 200,
                          fit: BoxFit.contain,
                        ),
                        const SizedBox(height: 24),

                        const Text(
                          'InstaMall',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),

                        const Text(
                          'تسوّق من متاجر سوريا بطلب واحد',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),

                        const Text(
                          'تصفّح منتجات متاجر متعددة، واجمع كل ما تحتاجه '
                              'في تجربة تسوق واحدة سهلة ومميزة.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 15,
                            height: 1.7,
                          ),
                        ),
                        const SizedBox(height: 40),

                        Column(
                              children: [
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => context.push('/login'),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 16,
                                  ),
                                  backgroundColor: Colors.white,
                                  foregroundColor: AppColors.navy,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: const Text(
                                  'تسجيل الدخول',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: () => context.push('/register'),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 16,
                                  ),
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(
                                    color: Colors.white,
                                    width: 1.5,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: const Text(
                                  'إنشاء حساب جديد',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                              ],
                        ),

                        const SizedBox(height: 24),

                        const Text(
                          'اكتشف متاجر ومنتجات محلية في مكان واحد',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white60,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
