import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase implements UseCase<UserEntity, RegisterParams> {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  @override
  Future<Either<Failure, UserEntity>> call(RegisterParams params) {
    return repository.register(
      fullName: params.fullName,
      phone: params.phone,
      nationalId: params.nationalId,
      password: params.password,
      email: params.email,
    );
  }
}

class RegisterParams extends Equatable {
  final String fullName;
  final String phone;
  final String nationalId;
  final String password;
  final String email;

  const RegisterParams({
    required this.fullName,
    required this.phone,
    required this.nationalId,
    required this.password,
    this.email = '',
  });

  @override
  List<Object?> get props => [fullName, phone, nationalId, password, email];
}
