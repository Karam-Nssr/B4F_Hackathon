import 'package:go_router/go_router.dart';

import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/cart/presentation/pages/cart_page.dart';
import '../features/home/presentation/pages/home_page.dart';
import '../features/orders/presentation/pages/order_details_page.dart';
import '../features/orders/presentation/pages/orders_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/splash/presentation/pages/splash_page.dart';
import '../features/stores/presentation/pages/store_detail_page.dart';
import '../features/stores/presentation/pages/stores_page.dart';

class AppRouter {
  AppRouter._();

  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (context, state) => const SplashPage()),
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(path: '/home', builder: (context, state) => const HomePage()),
      GoRoute(path: '/stores', builder: (context, state) => const StoresPage()),
      GoRoute(
        path: '/stores/:id',
        builder: (context, state) => StoreDetailPage(
          shopId: state.pathParameters['id'] ?? '',
        ),
      ),
      GoRoute(path: '/cart', builder: (context, state) => const CartPage()),
      GoRoute(path: '/orders', builder: (context, state) => const OrdersPage()),
      GoRoute(
        path: '/orders/:id',
        builder: (context, state) => OrderDetailsPage(
          orderId: state.pathParameters['id'] ?? '',
        ),
      ),
      GoRoute(path: '/profile', builder: (context, state) => const ProfilePage()),
    ],
  );
}
