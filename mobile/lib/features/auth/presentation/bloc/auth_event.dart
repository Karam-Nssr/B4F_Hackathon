import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginRequested({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class AuthRegisterRequested extends AuthEvent {
  final String fullName;
  final String phone;
  final String nationalId;
  final String password;
  final String email;

  const AuthRegisterRequested({
    required this.fullName,
    required this.phone,
    required this.nationalId,
    required this.password,
    this.email = '',
  });

  @override
  List<Object?> get props => [fullName, phone, nationalId, password, email];
}

class AuthLogoutRequested extends AuthEvent {}

/// Dispatched by the splash page: restores a cached session if one exists.
class AuthTokenCheckRequested extends AuthEvent {}
