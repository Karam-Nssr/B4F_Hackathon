/// All backend routes from the SAD (section 7), in one place.
///
/// Override the host at build time:
///   flutter run --dart-define=API_BASE_URL=https://api.instamall.sy
/// Backend runs on PORT=4000. 10.0.2.2 is the Android *emulator's* alias for
/// your PC's localhost. For a real phone use your PC's LAN IP
/// (e.g. http://192.168.1.10:4000); for iOS simulator use http://localhost:4000.
class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000',
  );

  static const String _api = '/api';

  // ── 7.1 Auth & public browsing (public) ────────────────────────────────
  /// POST – mobile registers `user` accounts only.
  /// body: role='user', fullName, phone, nationalId, password, email?
  static const String register = '$_api/auth/register';

  /// POST – body: phone, password → { token, user }
  static const String login = '$_api/auth/login';

  /// GET – active products; query: search, category, shopId, minPriceSyp, maxPriceSyp
  static const String products = '$_api/products';

  /// GET – list of shops
  static const String shops = '$_api/shops';

  /// GET – shop details + its products
  static String shopById(String id) => '$_api/shops/$id';

  // ── 7.2 User (role: user) ──────────────────────────────────────────────
  /// GET profile / PATCH (fullName, email, phone, nationalId)
  static const String userProfile = '$_api/users/me';

  /// POST: submit cart (server splits into shop sub-orders + invoices)
  /// body: { items: [{ productId, quantity }] }
  static const String orders = '$_api/orders';

  /// GET: order history with sub-orders and invoices
  static const String myOrders = '$_api/orders/my';

  // ── 7.3 Shop (role: shop) ──────────────────────────────────────────────
  /// GET – dashboard stats (products count, orders count, sales in SYP)
  static const String shopOverview = '$_api/shop/overview';

  /// GET list / POST create
  static const String shopProducts = '$_api/shop/products';

  /// PATCH update / DELETE remove
  static String shopProductById(String id) => '$_api/shop/products/$id';

  /// GET – this shop's sub-orders (with customer phone + national ID)
  static const String shopOrders = '$_api/shop/orders';

  /// PATCH – body: status (CONFIRMED | COMPLETED | CANCELLED)
  static String shopOrderStatus(String id) => '$_api/shop/orders/$id/status';

  // ── Admin (role: admin) ────────────────────────────────────────────────
  /// GET – totals: users, shops, orders
  static const String adminStats = '$_api/admin/stats';

  /// GET – all users
  static const String adminUsers = '$_api/admin/users';

  /// GET – all shops
  static const String adminShops = '$_api/admin/shops';
}
