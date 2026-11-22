import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';

import '../../features/auth/data/datasources/auth_local_datasource.dart';
import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/get_cached_user_usecase.dart';
import '../../features/auth/domain/usecases/login_usecase.dart';
import '../../features/auth/domain/usecases/logout_usecase.dart';
import '../../features/auth/domain/usecases/register_usecase.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
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
}
