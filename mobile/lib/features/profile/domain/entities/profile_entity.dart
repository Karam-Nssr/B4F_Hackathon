import 'package:equatable/equatable.dart';

class ProfileEntity extends Equatable {
  final String id;
  final String fullName;
  final String email;
  final String phone;
  final String nationalId;
  final String role;
  final DateTime? createdAt;
  final String? photoUrl;

  const ProfileEntity({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone = '',
    this.nationalId = '',
    this.role = 'user',
    this.createdAt,
    this.photoUrl,
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
        photoUrl,
      ];
}
