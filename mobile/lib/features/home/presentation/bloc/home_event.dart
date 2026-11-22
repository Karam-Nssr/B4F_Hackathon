import 'package:equatable/equatable.dart';

abstract class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

/// Initial load / pull-to-refresh / retry.
class HomeLoadRequested extends HomeEvent {}

/// The user submitted a new search query.
class HomeSearchChanged extends HomeEvent {
  final String query;

  const HomeSearchChanged({required this.query});

  @override
  List<Object?> get props => [query];
}

/// A category chip was tapped (`'الكل'` clears the filter).
class HomeCategorySelected extends HomeEvent {
  final String category;

  const HomeCategorySelected({required this.category});

  @override
  List<Object?> get props => [category];
}
