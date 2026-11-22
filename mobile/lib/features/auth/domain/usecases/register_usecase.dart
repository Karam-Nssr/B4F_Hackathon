import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<UserEntity> call({
    required String fullName,
    required String phone,
    required String nationalId,
    required String email,
    required String password,
  }) {
    return repository.register(
      fullName: fullName,
      phone: phone,
      nationalId: nationalId,
      email: email,
      password: password,
    );
  }
}