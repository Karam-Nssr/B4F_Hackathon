class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  static const String _api = '/api';

  static const String register = '$_api/auth/register';

  static const String login = '$_api/auth/login';

  static const String products = '$_api/products';

  static const String shops = '$_api/shops';

  static String shopById(String id) => '$_api/shops/$id';

  static const String userProfile = '$_api/users/me';

  static const String userPhoto = '$_api/users/me/photo';

  static String mediaUrl(String relativePath) =>
      '$baseUrl${relativePath.startsWith('/') ? '' : '/'}$relativePath';

  static const String orders = '$_api/orders';

  static const String myOrders = '$_api/orders/my';

  static String orderById(String orderId) => '$myOrders/$orderId';

  static String cancelOrder(String orderId) => '$myOrders/$orderId/cancel';

  static String cancelSubOrder(String subOrderId) =>
      '$myOrders/sub-orders/$subOrderId/cancel';

  static const String shopOverview = '$_api/shop/overview';

  static const String shopProducts = '$_api/shop/products';

  static String shopProductById(String id) => '$_api/shop/products/$id';

  static const String shopOrders = '$_api/shop/orders';

  static String shopOrderStatus(String id) => '$_api/shop/orders/$id/status';

  static const String adminStats = '$_api/admin/stats';

  static const String adminUsers = '$_api/admin/users';

  static const String adminShops = '$_api/admin/shops';
}
