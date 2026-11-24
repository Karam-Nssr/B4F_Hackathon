import 'package:equatable/equatable.dart';

abstract class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

class HomeLoadRequested extends HomeEvent {}

class HomeSearchChanged extends HomeEvent {
  final String query;

  const HomeSearchChanged({required this.query});

  @override
  List<Object?> get props => [query];
}

class HomeCategorySelected extends HomeEvent {
  final String category;

  const HomeCategorySelected({required this.category});

  @override
  List<Object?> get props => [category];
}

class HomeLoadMoreRequested extends HomeEvent {}
