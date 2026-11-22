import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> login({
    required String phone,
    required String password,
  });

  Future<UserEntity> register({
    required String fullName,
    required String phone,
    required String nationalId,
    required String email,
    required String password,
  });

  Future<void> logout();

  Future<String?> getSavedToken();
}