import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.fullName,
    required super.phone,
    required super.nationalId,
    required super.email,
    super.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      fullName: (json['fullName'] ?? json['full_name'])?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      nationalId: (json['nationalId'] ?? json['national_id'])?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'phone': phone,
      'nationalId': nationalId,
      'email': email,
      'role': role,
    };
  }
}
