import 'package:equatable/equatable.dart';

import '../../domain/entities/profile_entity.dart';

class ProfileState extends Equatable {
  final ProfileEntity? profile;
  final bool isLoading;
  final bool isSaving;

  /// Transient feedback (snackbar), cleared by the next event.
  final String? message;
  final bool messageIsError;

  const ProfileState({
    this.profile,
    this.isLoading = false,
    this.isSaving = false,
    this.message,
    this.messageIsError = true,
  });

  ProfileState copyWith({
    ProfileEntity? profile,
    bool? isLoading,
    bool? isSaving,
    String? message,
    bool? messageIsError,
    bool clearMessage = false,
  }) {
    return ProfileState(
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      message: clearMessage ? null : message ?? this.message,
      messageIsError: messageIsError ?? this.messageIsError,
    );
  }

  @override
  List<Object?> get props =>
      [profile, isLoading, isSaving, message, messageIsError];
}
