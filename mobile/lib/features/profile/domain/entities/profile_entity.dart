import 'package:equatable/equatable.dart';

/// The signed-in user's profile (`GET /api/users/me`, SAD FR-07).
class ProfileEntity extends Equatable {
  final String id;
  final String fullName;
  final String email;
  final String phone;
  final String nationalId;

  /// 'user' | 'shop' | 'admin'
  final String role;
  final DateTime? createdAt;

  const ProfileEntity({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone = '',
    this.nationalId = '',
    this.role = 'user',
    this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        fullName,
        email,
        phone,
        nationalId,
        role,
        createdAt,
      ];
}
