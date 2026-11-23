import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/injection_container.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_bottom_nav_bar.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../auth/presentation/widgets/auth_text_field.dart';
import '../../domain/entities/profile_entity.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_event.dart';
import '../bloc/profile_state.dart';

/// "حسابي" tab (SAD FR-07 / §8): profile summary, the edit form for the
/// full name / email / phone / national ID, a shortcut to "طلباتي" and
/// logout. Requires login (backend is JWT-guarded).
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
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'تسجيل الخروج',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: const Text(
          'هل تريد تسجيل الخروج من حسابك؟',
          style: TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text(
              'إلغاء',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text(
              'تسجيل الخروج',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
    if (confirmed == true) authBloc.add(AuthLogoutRequested());
  }

  @override
  Widget build(BuildContext context) {
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
                  backgroundColor: AppColors.background,
                  body: Column(
                    children: [
                      const _ProfileHeader(),
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
        return const Center(child: CircularProgressIndicator());
      }
      return _ErrorView(
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
          _ProfileCard(profile: profile),
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
          _LogoutButton(
            onLogout: () => _confirmLogout(context.read<AuthBloc>()),
          ),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.navy,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 18),
          child: Row(
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'حسابي',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 3),
                  Text(
                    'إدارة بياناتك الشخصية',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
              const Spacer(),
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary, width: 2),
                ),
                child: const Icon(
                  Icons.person_outline,
                  color: Colors.white,
                  size: 21,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final ProfileEntity profile;

  const _ProfileCard({required this.profile});

  @override
  Widget build(BuildContext context) {
    final initial = profile.fullName.trim().isEmpty
        ? 'م'
        : profile.fullName.trim()[0];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
      ),
      child: Row(
        children: [
          Container(
            width: 58,
            height: 58,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: AppColors.navy,
              shape: BoxShape.circle,
            ),
            child: Text(
              initial,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
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
                  style: const TextStyle(
                    fontSize: 16.5,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  profile.email,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondary,
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
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
      ),
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'تعديل البيانات',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 14),
            AuthTextField(
              controller: nameController,
              label: 'الاسم الكامل',
              validator: (value) => Validators.required(value, 'الاسم الكامل'),
            ),
            const SizedBox(height: 12),
            AuthTextField(
              controller: emailController,
              label: 'البريد الإلكتروني',
              keyboardType: TextInputType.emailAddress,
              validator: Validators.email,
            ),
            const SizedBox(height: 12),
            AuthTextField(
              controller: phoneController,
              label: 'رقم الهاتف',
              keyboardType: TextInputType.phone,
              validator: Validators.syrianPhone,
            ),
            const SizedBox(height: 12),
            AuthTextField(
              controller: nationalIdController,
              label: 'الرقم الوطني',
              keyboardType: TextInputType.number,
              validator: Validators.nationalId,
            ),
            const SizedBox(height: 18),
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
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        onTap: onOrdersTap,
        leading: const CircleAvatar(
          radius: 18,
          backgroundColor: AppColors.navy,
          child: Icon(Icons.receipt_long_outlined, color: Colors.white, size: 18),
        ),
        title: const Text(
          'طلباتي',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: const Text(
          'عرض الطلبات والفواتير',
          style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
        ),
        trailing: const Icon(
          Icons.chevron_right,
          color: AppColors.textSecondary,
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
        side: const BorderSide(color: AppColors.primary, width: 1.3),
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      icon: const Icon(Icons.logout_rounded, size: 19),
      label: const Text(
        'تسجيل الخروج',
        style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.wifi_off_rounded,
              size: 44, color: AppColors.textSecondary),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style:
                const TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: 200,
            child: AppButton(
              text: 'إعادة المحاولة',
              height: 44,
              onPressed: onRetry,
            ),
          ),
        ],
      ),
    );
  }
}

class _LoginRequiredView extends StatelessWidget {
  const _LoginRequiredView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const _ProfileHeader(),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: AppColors.navy.withValues(alpha: 0.06),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.lock_outline,
                        size: 38,
                        color: AppColors.navy,
                      ),
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'سجّل الدخول لعرض حسابك',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'نحتاج حسابك لإدارة بياناتك الشخصية',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 22),
                    SizedBox(
                      width: 210,
                      child: AppButton(
                        text: 'تسجيل الدخول',
                        height: 46,
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
