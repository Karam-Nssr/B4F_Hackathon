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
import '../../features/orders/data/datasources/my_orders_remote_datasource.dart';
import '../../features/orders/data/repositories/orders_repository_impl.dart';
import '../../features/orders/domain/repositories/orders_repository.dart';
import '../../features/orders/domain/usecases/cancel_order_usecase.dart';
import '../../features/orders/domain/usecases/cancel_sub_order_usecase.dart';
import '../../features/orders/domain/usecases/get_my_orders_usecase.dart';
import '../../features/orders/domain/usecases/get_order_details_usecase.dart';
import '../../features/orders/presentation/bloc/orders_bloc.dart';
import '../../features/profile/data/datasources/profile_remote_datasource.dart';
import '../../features/profile/data/repositories/profile_repository_impl.dart';
import '../../features/profile/domain/repositories/profile_repository.dart';
import '../../features/profile/domain/usecases/get_profile_usecase.dart';
import '../../features/profile/domain/usecases/update_profile_usecase.dart';
import '../../features/profile/domain/usecases/upload_photo_usecase.dart';
import '../../features/profile/presentation/bloc/profile_bloc.dart';
import '../../features/stores/data/datasources/stores_remote_datasource.dart';
import '../../features/stores/data/repositories/stores_repository_impl.dart';
import '../../features/stores/domain/repositories/stores_repository.dart';
import '../../features/stores/domain/usecases/get_shop_detail_usecase.dart';
import '../../features/stores/domain/usecases/get_stores_usecase.dart';
import '../../features/stores/presentation/bloc/stores_bloc.dart';
import '../network/api_client.dart';

import '../theme/theme_cubit.dart';

final sl = GetIt.instance;

const bool useFakeBackend = bool.fromEnvironment(
  'USE_FAKE_BACKEND',
  defaultValue: false,
);

Future<void> initDependencies() async {
  sl.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(),
  );

  sl.registerLazySingleton<ThemeCubit>(
    () => ThemeCubit(storage: sl()),
  );

  await Hive.initFlutter();
  final cartBox = await Hive.openBox<String>('instamall_cart');
  sl.registerLazySingleton<Box<String>>(() => cartBox);

  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(storage: sl()),
  );

  sl.registerLazySingleton<Dio>(
    () => ApiClient.create(
      tokenProvider: () => sl<AuthLocalDataSource>().getToken(),
    ),
  );

  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => useFakeBackend
        ? AuthRemoteDataSourceFake()
        : AuthRemoteDataSourceImpl(client: sl()),
  );

  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
    ),
  );

  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));
  sl.registerLazySingleton(() => GetCachedUserUseCase(sl()));

  sl.registerFactory(
    () => AuthBloc(
      loginUseCase: sl(),
      registerUseCase: sl(),
      logoutUseCase: sl(),
      getCachedUserUseCase: sl(),
    ),
  );

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

  sl.registerFactory(
    () => HomeBloc(
      getProductsUseCase: sl(),
      getShopsUseCase: sl(),
    ),
  );

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

  sl.registerFactory(
    () => StoresBloc(
      getStoresUseCase: sl(),
      getShopDetailUseCase: sl(),
    ),
  );

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

  sl.registerFactory(
    () => CartBloc(
      getCartUseCase: sl(),
      saveCartUseCase: sl(),
      checkoutUseCase: sl(),
    ),
  );

  sl.registerLazySingleton<MyOrdersRemoteDataSource>(
    () => useFakeBackend
        ? MyOrdersRemoteDataSourceFake()
        : MyOrdersRemoteDataSourceImpl(client: sl()),
  );

  sl.registerLazySingleton<OrdersRepository>(
    () => OrdersRepositoryImpl(remoteDataSource: sl()),
  );

  sl.registerLazySingleton(() => GetMyOrdersUseCase(sl()));
  sl.registerLazySingleton(() => GetOrderDetailsUseCase(sl()));
  sl.registerLazySingleton(() => CancelSubOrderUseCase(sl()));
  sl.registerLazySingleton(() => CancelOrderUseCase(sl()));

  sl.registerFactory(
    () => OrdersBloc(
      getMyOrdersUseCase: sl(),
      getOrderDetailsUseCase: sl(),
      cancelSubOrderUseCase: sl(),
      cancelOrderUseCase: sl(),
    ),
  );

  sl.registerLazySingleton<ProfileRemoteDataSource>(
    () => useFakeBackend
        ? ProfileRemoteDataSourceFake()
        : ProfileRemoteDataSourceImpl(client: sl()),
  );

  sl.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(remoteDataSource: sl()),
  );

  sl.registerLazySingleton(() => GetProfileUseCase(sl()));
  sl.registerLazySingleton(() => UpdateProfileUseCase(sl()));
  sl.registerLazySingleton(() => UploadPhotoUseCase(sl()));
  sl.registerLazySingleton(() => DeletePhotoUseCase(sl()));

  sl.registerFactory(
    () => ProfileBloc(
      getProfileUseCase: sl(),
      updateProfileUseCase: sl(),
      uploadPhotoUseCase: sl(),
      deletePhotoUseCase: sl(),
    ),
  );
}
