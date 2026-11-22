import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String fullName;
  final String phone;
  final String nationalId;
  final String email;

  /// 'user' | 'shop' | 'admin'
  final String role;

  const UserEntity({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.nationalId,
    required this.email,
    this.role = 'user',
  });

  @override
  List<Object?> get props => [id, fullName, phone, nationalId, email, role];
}
