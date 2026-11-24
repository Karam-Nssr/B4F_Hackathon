import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecase/usecase.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../domain/usecases/get_profile_usecase.dart';
import '../../domain/usecases/update_profile_usecase.dart';
import '../../domain/usecases/upload_photo_usecase.dart';
import 'profile_event.dart';
import 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final GetProfileUseCase getProfileUseCase;
  final UpdateProfileUseCase updateProfileUseCase;
  final UploadPhotoUseCase uploadPhotoUseCase;
  final DeletePhotoUseCase deletePhotoUseCase;

  ProfileBloc({
    required this.getProfileUseCase,
    required this.updateProfileUseCase,
    required this.uploadPhotoUseCase,
    required this.deletePhotoUseCase,
  }) : super(const ProfileState()) {
    on<ProfileLoadRequested>(_onLoad);
    on<ProfileUpdateRequested>(_onUpdate);
    on<ProfilePhotoUploadRequested>(_onUploadPhoto);
    on<ProfilePhotoRemoveRequested>(_onDeletePhoto);
  }

  Future<void> _onLoad(
    ProfileLoadRequested event,
    Emitter<ProfileState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearMessage: true));
    final result = await getProfileUseCase(const NoParams());
    result.fold(
      (failure) => emit(ProfileState(message: failure.message)),
      (profile) => emit(ProfileState(profile: profile)),
    );
  }

  Future<void> _onUpdate(
    ProfileUpdateRequested event,
    Emitter<ProfileState> emit,
  ) async {
    if (state.isSaving) return;
    emit(state.copyWith(isSaving: true, clearMessage: true));

    final result = await updateProfileUseCase(
      UpdateProfileParams(
        fullName: event.fullName.trim(),
        email: event.email.trim(),
        phone: event.phone.trim(),
        nationalId: event.nationalId.trim(),
      ),
    );

    result.fold(
      (failure) => emit(
        state.copyWith(
          isSaving: false,
          message: failure.message,
          messageIsError: true,
        ),
      ),
      (profile) => emit(
        state.copyWith(
          profile: profile,
          isSaving: false,
          message: 'تم حفظ التغييرات بنجاح',
          messageIsError: false,
        ),
      ),
    );
  }

  Future<void> _onUploadPhoto(
    ProfilePhotoUploadRequested event,
    Emitter<ProfileState> emit,
  ) async {
    if (state.isUploadingPhoto) return;
    emit(state.copyWith(isUploadingPhoto: true, clearMessage: true));

    final result = await uploadPhotoUseCase(event.filePath);
    result.fold(
      (failure) => emit(
        state.copyWith(
          isUploadingPhoto: false,
          message: failure.message,
          messageIsError: true,
        ),
      ),
      (profile) => emit(
        state.copyWith(
          profile: profile,
          isUploadingPhoto: false,
          message: 'تم تحديث صورة الحساب',
          messageIsError: false,
        ),
      ),
    );
  }

  Future<void> _onDeletePhoto(
    ProfilePhotoRemoveRequested event,
    Emitter<ProfileState> emit,
  ) async {
    if (state.isUploadingPhoto) return;
    emit(state.copyWith(isUploadingPhoto: true, clearMessage: true));

    final result = await deletePhotoUseCase(const NoParams());
    result.fold(
      (failure) => emit(
        state.copyWith(
          isUploadingPhoto: false,
          message: failure.message,
          messageIsError: true,
        ),
      ),
      (profile) => emit(
        state.copyWith(
          profile: profile,
          isUploadingPhoto: false,
          message: 'تم حذف صورة الحساب',
          messageIsError: false,
        ),
      ),
    );
  }
}
