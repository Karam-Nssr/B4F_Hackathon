import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/auth_header.dart';
import '../widgets/auth_text_field.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _nationalIdController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _nationalIdController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    context.read<AuthBloc>().add(
          AuthRegisterRequested(
            fullName: _fullNameController.text.trim(),
            phone: Validators.normalizePhone(_phoneController.text),
            nationalId:
                Validators.normalizeDigits(_nationalIdController.text.trim()),
            email: _emailController.text.trim(),
            password: _passwordController.text,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            context.go('/home');
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: AppColors.error,
                content: Text(state.message),
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return Column(
            children: [
              const AuthHeader(isLogin: false),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 460),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: theme.cardColor,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: theme.dividerColor.withValues(alpha: 0.6),
                          ),
                          boxShadow: AppColors.softShadow,
                        ),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                'إنشاء حساب جديد',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: theme.textTheme.titleMedium?.color,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'قم بتعبئة البيانات التالية للبدء بالتسوق',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                                ),
                              ),
                              const SizedBox(height: 20),
                              AuthTextField(
                                controller: _fullNameController,
                                label: 'الاسم الكامل',
                                hint: 'مثال: كريم الحلبي',
                                prefixIcon: const Icon(
                                  Icons.person_outline,
                                  color: AppColors.textSecondary,
                                  size: 20,
                                ),
                                validator: (v) =>
                                    Validators.required(v, 'الاسم الكامل'),
                              ),
                              const SizedBox(height: 16),
                              AuthTextField(
                                controller: _phoneController,
                                label: 'رقم الهاتف',
                                hint: '09xx xxx xxx',
                                keyboardType: TextInputType.phone,
                                textDirection: TextDirection.ltr,
                                prefixIcon: const Icon(
                                  Icons.phone_outlined,
                                  color: AppColors.textSecondary,
                                  size: 20,
                                ),
                                validator: Validators.syrianPhone,
                              ),
                              const SizedBox(height: 16),
                              AuthTextField(
                                controller: _nationalIdController,
                                label: 'الرقم الوطني (11 رقم)',
                                hint: '00000000000',
                                keyboardType: TextInputType.number,
                                textDirection: TextDirection.ltr,
                                prefixIcon: const Icon(
                                  Icons.badge_outlined,
                                  color: AppColors.textSecondary,
                                  size: 20,
                                ),
                                validator: Validators.nationalId,
                              ),
                              const SizedBox(height: 16),
                              AuthTextField(
                                controller: _emailController,
                                label: 'البريد الإلكتروني',
                                hint: 'name@email.com',
                                keyboardType: TextInputType.emailAddress,
                                textDirection: TextDirection.ltr,
                                prefixIcon: const Icon(
                                  Icons.email_outlined,
                                  color: AppColors.textSecondary,
                                  size: 20,
                                ),
                                validator: Validators.email,
                              ),
                              const SizedBox(height: 16),
                              AuthTextField(
                                controller: _passwordController,
                                label: 'كلمة المرور',
                                hint: '••••••••',
                                obscureText: _obscurePassword,
                                textDirection: TextDirection.ltr,
                                prefixIcon: const Icon(
                                  Icons.lock_outline,
                                  color: AppColors.textSecondary,
                                  size: 20,
                                ),
                                validator: Validators.password,
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                    color: AppColors.textSecondary,
                                    size: 20,
                                  ),
                                  onPressed: () => setState(
                                    () => _obscurePassword = !_obscurePassword,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 18),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.warning.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: AppColors.warning.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(
                                      Icons.info_outline_rounded,
                                      size: 18,
                                      color: AppColors.warning,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        'نحفظ بيانات الهوية مرة واحدة ونرفقها تلقائياً '
                                        'مع كل فاتورة ليتحقق المتجر من الطلب.',
                                        style: TextStyle(
                                          fontSize: 12,
                                          height: 1.5,
                                          color: theme.textTheme.bodyMedium?.color,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 20),
                              AppButton(
                                text: 'إنشاء الحساب والمتابعة',
                                isLoading: isLoading,
                                icon: Icons.person_add_outlined,
                                onPressed: _submit,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'الدفع والتسليم مباشرة بينك وبين المتجر بعد التأكيد',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 11.5,
                                  color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
