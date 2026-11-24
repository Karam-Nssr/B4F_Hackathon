import 'package:equatable/equatable.dart';

abstract class ProfileEvent extends Equatable {
  const ProfileEvent();

  @override
  List<Object?> get props => [];
}

class ProfileLoadRequested extends ProfileEvent {}

class ProfileUpdateRequested extends ProfileEvent {
  final String fullName;
  final String email;
  final String phone;
  final String nationalId;

  const ProfileUpdateRequested({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.nationalId,
  });

  @override
  List<Object?> get props => [fullName, email, phone, nationalId];
}

class ProfilePhotoUploadRequested extends ProfileEvent {
  final String filePath;

  const ProfilePhotoUploadRequested({required this.filePath});

  @override
  List<Object?> get props => [filePath];
}

class ProfilePhotoRemoveRequested extends ProfileEvent {}
