import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/endpoints/api_endpoints.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_page_header.dart';
import '../../../../core/widgets/app_status_views.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../auth/presentation/widgets/auth_text_field.dart';
import '../../domain/entities/profile_entity.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_event.dart';
import '../bloc/profile_state.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _nationalIdController = TextEditingController();
  bool _controllersFilled = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _nationalIdController.dispose();
    super.dispose();
  }

  void _fillControllers(ProfileEntity profile) {
    _nameController.text = profile.fullName;
    _emailController.text = profile.email;
    _phoneController.text = profile.phone;
    _nationalIdController.text = profile.nationalId;
    _controllersFilled = true;
  }

  void _save(ProfileBloc bloc) {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    bloc.add(
      ProfileUpdateRequested(
        fullName: _nameController.text,
        email: _emailController.text,
        phone: _phoneController.text,
        nationalId: _nationalIdController.text,
      ),
    );
  }

  Future<void> _confirmLogout(AuthBloc authBloc) async {
    final confirmed = await showConfirmDialog(
      context,
      title: 'تسجيل الخروج',
      message: 'هل تريد تسجيل الخروج من حسابك؟',
      confirmLabel: 'تسجيل الخروج',
      destructive: true,
    );
    if (confirmed) authBloc.add(AuthLogoutRequested());
  }

  Future<void> _pickPhoto(ProfileBloc bloc, ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: source,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 85,
    );
    if (picked == null) return;
    bloc.add(ProfilePhotoUploadRequested(filePath: picked.path));
  }

  Future<void> _photoOptions(ProfileBloc bloc) async {
    final choice = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        final theme = Theme.of(sheetContext);
        return Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 18, 16, 6),
                  child: Text(
                    'صورة الحساب',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: theme.textTheme.titleLarge?.color,
                    ),
                  ),
                ),
                ListTile(
                  leading: const Icon(
                    Icons.photo_camera_outlined,
                    color: AppColors.primary,
                  ),
                  title: const Text('التقاط صورة جديدة'),
                  onTap: () => Navigator.of(sheetContext).pop('camera'),
                ),
                ListTile(
                  leading: const Icon(
                    Icons.photo_library_outlined,
                    color: AppColors.primary,
                  ),
                  title: const Text('اختيار من المعرض'),
                  onTap: () => Navigator.of(sheetContext).pop('gallery'),
                ),
                if (bloc.state.profile?.photoUrl != null)
                  ListTile(
                    leading: const Icon(
                      Icons.delete_outline_rounded,
                      color: AppColors.error,
                    ),
                    title: const Text(
                      'حذف الصورة الحالية',
                      style: TextStyle(color: AppColors.error),
                    ),
                    onTap: () => Navigator.of(sheetContext).pop('delete'),
                  ),
              ],
            ),
          ),
        );
      },
    );

    if (!mounted || choice == null) return;
    switch (choice) {
      case 'camera':
        await _pickPhoto(bloc, ImageSource.camera);
      case 'gallery':
        await _pickPhoto(bloc, ImageSource.gallery);
      case 'delete':
        final confirmed = await showConfirmDialog(
          context,
          title: 'حذف صورة الحساب',
          message: 'هل تريد حذف صورتك الحالية؟ يمكنك رفع صورة أخرى لاحقاً.',
          confirmLabel: 'حذف',
          destructive: true,
        );
        if (confirmed) bloc.add(ProfilePhotoRemoveRequested());
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) context.go('/login');
      },
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, authState) {
          if (authState is! AuthAuthenticated) {
            return const _LoginRequiredView();
          }
          return BlocProvider(
            create: (_) => sl<ProfileBloc>()..add(ProfileLoadRequested()),
            child: BlocConsumer<ProfileBloc, ProfileState>(
              listenWhen: (prev, cur) =>
                  cur.message != null && cur.message != prev.message,
              listener: (context, state) {
                ScaffoldMessenger.of(context)
                  ..hideCurrentSnackBar()
                  ..showSnackBar(
                    SnackBar(
                      backgroundColor: state.messageIsError
                          ? AppColors.error
                          : AppColors.success,
                      content: Text(state.message!),
                    ),
                  );
              },
              builder: (context, state) {
                final profile = state.profile;
                if (profile != null && !_controllersFilled) {
                  _fillControllers(profile);
                }

                return Scaffold(
                  backgroundColor: theme.scaffoldBackgroundColor,
                  body: Column(
                    children: [
                      const AppPageHeader(
                        title: 'حسابي',
                        subtitle: 'بياناتك وصورتك وإعداداتك',
                        icon: Icons.person_outline_rounded,
                      ),
                      Expanded(child: _buildBody(context, state)),
                    ],
                  ),
                  bottomNavigationBar: AppBottomNavBar(
                    currentIndex: 4,
                    onTap: (index) {
                      if (index != 4) {
                        AppBottomNavBar.goToTab(context, index);
                      }
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildBody(BuildContext context, ProfileState state) {
    final profile = state.profile;
    if (profile == null) {
      if (state.isLoading) {
        return const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        );
      }
      return AppErrorState(
        message: state.message ?? 'تعذر تحميل بيانات الحساب',
        onRetry: () =>
            context.read<ProfileBloc>().add(ProfileLoadRequested()),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _ProfileCard(
            profile: profile,
            isUploading: state.isUploadingPhoto,
            onPhotoTap: () =>
                _photoOptions(context.read<ProfileBloc>()),
          ),
          const SizedBox(height: 14),
          _EditForm(
            formKey: _formKey,
            nameController: _nameController,
            emailController: _emailController,
            phoneController: _phoneController,
            nationalIdController: _nationalIdController,
            isSaving: state.isSaving,
            onSave: () => _save(context.read<ProfileBloc>()),
          ),
          const SizedBox(height: 14),
          _MenuCard(onOrdersTap: () => context.go('/orders')),
          const SizedBox(height: 14),
          const _ThemeSwitchCard(),
          const SizedBox(height: 14),
          _LogoutButton(
            onLogout: () => _confirmLogout(context.read<AuthBloc>()),
          ),
        ],
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final ProfileEntity profile;
  final bool isUploading;
  final VoidCallback onPhotoTap;

  const _ProfileCard({
    required this.profile,
    required this.isUploading,
    required this.onPhotoTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final initial = profile.fullName.trim().isEmpty
        ? 'م'
        : profile.fullName.trim()[0];
    final photoUrl = profile.photoUrl;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor.withValues(alpha: 0.6)),
        boxShadow: AppColors.softShadow,
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: isUploading ? null : onPhotoTap,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: photoUrl == null
                        ? AppColors.navyGradient
                        : null,
                    color: photoUrl == null ? null : AppColors.surfaceSubtle,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.4),
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.navy.withValues(alpha: 0.25),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: isUploading
                      ? const Center(
                          child: SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: AppColors.primary,
                              strokeWidth: 2.4,
                            ),
                          ),
                        )
                      : photoUrl != null
                          ? Image.network(
                              ApiEndpoints.mediaUrl(photoUrl),
                              fit: BoxFit.cover,
                              errorBuilder: (_, _, _) => Center(
                                child: Text(
                                  initial,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            )
                          : Center(
                              child: Text(
                                initial,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                ),
                Positioned(
                  bottom: -2,
                  right: -2,
                  child: Container(
                    padding: const EdgeInsets.all(5),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.camera_alt_rounded,
                      size: 13,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile.fullName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: theme.textTheme.titleMedium?.color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  profile.email,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 13,
                    color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  photoUrl == null ? 'اضغط لإضافة صورة' : 'اضغط لتغيير الصورة',
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EditForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController phoneController;
  final TextEditingController nationalIdController;
  final bool isSaving;
  final VoidCallback onSave;

  const _EditForm({
    required this.formKey,
    required this.nameController,
    required this.emailController,
    required this.phoneController,
    required this.nationalIdController,
    required this.isSaving,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor.withValues(alpha: 0.6)),
        boxShadow: AppColors.softShadow,
      ),
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(Icons.edit_note_rounded, color: AppColors.primary, size: 22),
                const SizedBox(width: 8),
                Text(
                  'تعديل البيانات الشخصية',
                  style: TextStyle(
                    fontSize: 15.5,
                    fontWeight: FontWeight.bold,
                    color: theme.textTheme.titleMedium?.color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            AuthTextField(
              controller: nameController,
              label: 'الاسم الكامل',
              prefixIcon: const Icon(
                Icons.person_outline_rounded,
                color: AppColors.textSecondary,
                size: 20,
              ),
              validator: (value) => Validators.required(value, 'الاسم الكامل'),
            ),
            const SizedBox(height: 14),
            AuthTextField(
              controller: emailController,
              label: 'البريد الإلكتروني',
              keyboardType: TextInputType.emailAddress,
              prefixIcon: const Icon(
                Icons.email_outlined,
                color: AppColors.textSecondary,
                size: 20,
              ),
              validator: Validators.email,
            ),
            const SizedBox(height: 14),
            AuthTextField(
              controller: phoneController,
              label: 'رقم الهاتف',
              keyboardType: TextInputType.phone,
              prefixIcon: const Icon(
                Icons.phone_outlined,
                color: AppColors.textSecondary,
                size: 20,
              ),
              validator: Validators.syrianPhone,
            ),
            const SizedBox(height: 14),
            AuthTextField(
              controller: nationalIdController,
              label: 'الرقم الوطني',
              keyboardType: TextInputType.number,
              prefixIcon: const Icon(
                Icons.badge_outlined,
                color: AppColors.textSecondary,
                size: 20,
              ),
              validator: Validators.nationalId,
            ),
            const SizedBox(height: 20),
            AppButton(
              text: 'حفظ التغييرات',
              icon: Icons.save_outlined,
              isLoading: isSaving,
              onPressed: onSave,
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  final VoidCallback onOrdersTap;

  const _MenuCard({required this.onOrdersTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: theme.cardColor,
      borderRadius: BorderRadius.circular(18),
      elevation: 0,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: theme.dividerColor.withValues(alpha: 0.6)),
          boxShadow: AppColors.softShadow,
        ),
        child: ListTile(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          onTap: onOrdersTap,
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.navy.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.receipt_long_rounded, color: AppColors.navy, size: 22),
          ),
          title: Text(
            'طلباتي',
            style: TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.bold,
              color: theme.textTheme.titleMedium?.color,
            ),
          ),
          subtitle: Text(
            'عرض الطلبات والفواتير ومتابعة حالتها',
            style: TextStyle(
              fontSize: 12,
              color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
            ),
          ),
          trailing: Icon(
            Icons.arrow_forward_ios_rounded,
            size: 16,
            color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.6),
          ),
        ),
      ),
    );
  }
}

class _ThemeSwitchCard extends StatelessWidget {
  const _ThemeSwitchCard();

  @override
  Widget build(BuildContext context) {
    final themeCubit = context.watch<ThemeCubit>();
    final isDark = themeCubit.state == ThemeMode.dark;
    final theme = Theme.of(context);

    return Material(
      color: theme.cardColor,
      borderRadius: BorderRadius.circular(18),
      elevation: 0,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: theme.dividerColor.withValues(alpha: 0.6)),
          boxShadow: AppColors.softShadow,
        ),
        child: SwitchListTile(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          value: isDark,
          onChanged: (_) => themeCubit.toggleTheme(),
          secondary: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.primary.withValues(alpha: 0.2)
                  : AppColors.navy.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
              color: isDark ? AppColors.primary : AppColors.navy,
              size: 22,
            ),
          ),
          title: Text(
            'الوضع الليلي (Dark Mode)',
            style: TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.bold,
              color: theme.textTheme.titleMedium?.color,
            ),
          ),
          subtitle: Text(
            isDark ? 'الوضع المظلم مفعّل' : 'الوضع الفاتح مفعّل',
            style: TextStyle(
              fontSize: 12,
              color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
            ),
          ),
        ),
      ),
    );
  }
}

class _LogoutButton extends StatelessWidget {
  final VoidCallback onLogout;

  const _LogoutButton({required this.onLogout});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onLogout,
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary, width: 1.5),
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      icon: const Icon(Icons.logout_rounded, size: 20),
      label: const Text(
        'تسجيل الخروج',
        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
      ),
    );
  }
}

class _LoginRequiredView extends StatelessWidget {
  const _LoginRequiredView();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            const AppPageHeader(
              title: 'حسابي',
              subtitle: 'إدارة بياناتك الشخصية',
              icon: Icons.person_outline_rounded,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        color: AppColors.navy.withValues(alpha: 0.06),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.lock_outline_rounded,
                        size: 42,
                        color: AppColors.navy,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'سجّل الدخول لعرض حسابك',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: theme.textTheme.titleLarge?.color,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'نحتاج حسابك لإدارة بياناتك الشخصية',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13.5,
                        color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: 210,
                      child: AppButton(
                        text: 'تسجيل الدخول',
                        height: 46,
                        icon: Icons.login_rounded,
                        onPressed: () => context.push('/login'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            AppBottomNavBar(
              currentIndex: 4,
              onTap: (index) {
                if (index != 4) AppBottomNavBar.goToTab(context, index);
              },
            ),
          ],
        ),
      ),
    );
  }
}
