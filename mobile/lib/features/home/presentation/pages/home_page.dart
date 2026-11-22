import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

/// Temporary landing page so `/home` resolves after login/register.
/// Replace with the real marketplace home.
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) context.go('/login');
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('InstaMall'),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () =>
                  context.read<AuthBloc>().add(AuthLogoutRequested()),
            ),
          ],
        ),
        body: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            final name = state is AuthAuthenticated ? state.user.fullName : '';
            return Center(child: Text('مرحباً $name'));
          },
        ),
      ),
    );
  }
}
