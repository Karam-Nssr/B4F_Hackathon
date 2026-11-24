import '../../domain/entities/profile_entity.dart';

class ProfileModel extends ProfileEntity {
  const ProfileModel({
    required super.id,
    required super.fullName,
    required super.email,
    super.phone,
    super.nationalId,
    super.role,
    super.createdAt,
    super.photoUrl,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    final photoUrl = json['photoUrl']?.toString();
    return ProfileModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      nationalId: json['nationalId']?.toString() ?? '',
      role: json['role']?.toString() ?? 'user',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      photoUrl: photoUrl == null || photoUrl.isEmpty ? null : photoUrl,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'nationalId': nationalId,
    };
  }
}
