import '../repositories/auth_repository.dart';

class GetSavedTokenUseCase {
  final AuthRepository repository;

  GetSavedTokenUseCase(this.repository);

  Future<String?> call() {
    return repository.getSavedToken();
  }
}