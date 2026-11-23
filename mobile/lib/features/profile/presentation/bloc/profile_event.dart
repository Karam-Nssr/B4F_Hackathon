import 'package:equatable/equatable.dart';

abstract class ProfileEvent extends Equatable {
  const ProfileEvent();

  @override
  List<Object?> get props => [];
}

/// Initial load (and retry).
class ProfileLoadRequested extends ProfileEvent {}

/// The form's save button — all four SAD §8 fields are sent together.
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
