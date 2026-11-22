import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../features/auth/data/datasources/auth_local_datasource.dart';
import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/get_cached_user_usecase.dart';
import '../../features/auth/domain/usecases/login_usecase.dart';
import '../../features/auth/domain/usecases/logout_usecase.dart';
import '../../features/auth/domain/usecases/register_usecase.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/cart/data/datasources/cart_local_datasource.dart';
import '../../features/cart/data/datasources/orders_remote_datasource.dart';
import '../../features/cart/data/repositories/cart_repository_impl.dart';
import '../../features/cart/domain/repositories/cart_repository.dart';
import '../../features/cart/domain/usecases/checkout_usecase.dart';
import '../../features/cart/domain/usecases/get_cart_usecase.dart';
import '../../features/cart/domain/usecases/save_cart_usecase.dart';
import '../../features/cart/presentation/bloc/cart_bloc.dart';
import '../../features/home/data/datasources/home_remote_datasource.dart';
import '../../features/home/data/repositories/home_repository_impl.dart';
import '../../features/home/domain/repositories/home_repository.dart';
import '../../features/home/domain/usecases/get_products_usecase.dart';
import '../../features/home/domain/usecases/get_shops_usecase.dart';
import '../../features/home/presentation/bloc/home_bloc.dart';
import '../../features/stores/data/datasources/stores_remote_datasource.dart';
import '../../features/stores/data/repositories/stores_repository_impl.dart';
import '../../features/stores/domain/repositories/stores_repository.dart';
import '../../features/stores/domain/usecases/get_shop_detail_usecase.dart';
import '../../features/stores/domain/usecases/get_stores_usecase.dart';
import '../../features/stores/presentation/bloc/stores_bloc.dart';
import '../network/api_client.dart';

final sl = GetIt.instance;

/// The real API is used by default. To use the offline mock instead:
///   flutter run --dart-define=USE_FAKE_BACKEND=true
const bool useFakeBackend = bool.fromEnvironment(
  'USE_FAKE_BACKEND',
  defaultValue: false,
);

Future<void> initDependencies() async {
  // External
  sl.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(),
  );

  // Local storage — Hive backs the cart (opened once, app-wide).
  await Hive.initFlutter();
  final cartBox = await Hive.openBox<String>('instamall_cart');
  sl.registerLazySingleton<Box<String>>(() => cartBox);

  // Auth local data source (registered first: the HTTP client reads the token)
  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(storage: sl()),
  );

  // Network
  sl.registerLazySingleton<Dio>(
    () => ApiClient.create(
      tokenProvider: () => sl<AuthLocalDataSource>().getToken(),
    ),
  );

  // Auth remote data source
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => useFakeBackend
        ? AuthRemoteDataSourceFake()
        : AuthRemoteDataSourceImpl(client: sl()),
  );

  // Auth Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
    ),
  );

  // Auth Use Cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));
  sl.registerLazySingleton(() => GetCachedUserUseCase(sl()));

  // Auth Bloc (one instance, provided at the app root in main.dart)
  sl.registerFactory(
    () => AuthBloc(
      loginUseCase: sl(),
      registerUseCase: sl(),
      logoutUseCase: sl(),
      getCachedUserUseCase: sl(),
    ),
  );

  // ── Home (public browsing, SAD §7.1) ──────────────────────────────────
  sl.registerLazySingleton<HomeRemoteDataSource>(
    () => useFakeBackend
        ? HomeRemoteDataSourceFake()
        : HomeRemoteDataSourceImpl(client: sl()),
  );

  sl.registerLazySingleton<HomeRepository>(
    () => HomeRepositoryImpl(remoteDataSource: sl()),
  );

  sl.registerLazySingleton(() => GetProductsUseCase(sl()));
  sl.registerLazySingleton(() => GetShopsUseCase(sl()));

  // Home Bloc (created by the home page, disposed with it)
  sl.registerFactory(
    () => HomeBloc(
      getProductsUseCase: sl(),
      getShopsUseCase: sl(),
    ),
  );

  // ── Stores (public shops directory, SAD §7.1) ──────────────────────────
  sl.registerLazySingleton<StoresRemoteDataSource>(
    () => useFakeBackend
        ? StoresRemoteDataSourceFake()
        : StoresRemoteDataSourceImpl(client: sl()),
  );

  sl.registerLazySingleton<StoresRepository>(
    () => StoresRepositoryImpl(remoteDataSource: sl()),
  );

  sl.registerLazySingleton(() => GetStoresUseCase(sl()));
  sl.registerLazySingleton(() => GetShopDetailUseCase(sl()));

  // Stores Bloc (one per page: directory / detail)
  sl.registerFactory(
    () => StoresBloc(
      getStoresUseCase: sl(),
      getShopDetailUseCase: sl(),
    ),
  );

  // ── Cart (local Hive cart + POST /api/orders, SAD FR-05) ───────────────
  sl.registerLazySingleton<CartLocalDataSource>(
    () => CartLocalDataSourceImpl(box: sl()),
  );

  sl.registerLazySingleton<OrdersRemoteDataSource>(
    () => useFakeBackend
        ? OrdersRemoteDataSourceFake()
        : OrdersRemoteDataSourceImpl(client: sl()),
  );

  sl.registerLazySingleton<CartRepository>(
    () => CartRepositoryImpl(
      localDataSource: sl(),
      remoteDataSource: sl(),
    ),
  );

  sl.registerLazySingleton(() => GetCartUseCase(sl()));
  sl.registerLazySingleton(() => SaveCartUseCase(sl()));
  sl.registerLazySingleton(() => CheckoutUseCase(sl()));

  // Cart Bloc (one instance, provided at the app root in main.dart)
  sl.registerFactory(
    () => CartBloc(
      getCartUseCase: sl(),
      saveCartUseCase: sl(),
      checkoutUseCase: sl(),
    ),
  );
}
