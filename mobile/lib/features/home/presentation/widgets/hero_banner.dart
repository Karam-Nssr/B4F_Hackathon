import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// Navy gradient banner under the header (Figma M/Home hero card).
class HeroBanner extends StatelessWidget {
  const HeroBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.antiAlias,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
          colors: [AppColors.navyLight, AppColors.navy],
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -46,
            right: -30,
            child: _circle(110, Colors.white.withValues(alpha: 0.05)),
          ),
          Positioned(
            bottom: -56,
            left: -24,
            child: _circle(120, Colors.white.withValues(alpha: 0.04)),
          ),
          Column(
            children: const [
              Text(
                'ستايلك من متاجر سوريا بطلب واحد',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  height: 1.5,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'نقسّم طلبك لكل متجر تلقائياً',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white70, fontSize: 12.5),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _circle(double size, Color color) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}
