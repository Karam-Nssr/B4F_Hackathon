import 'package:equatable/equatable.dart';

abstract class StoresEvent extends Equatable {
  const StoresEvent();

  @override
  List<Object?> get props => [];
}

/// Load the shops directory.
class StoresLoadRequested extends StoresEvent {}

/// Load one shop with its products (store detail page).
class StoreDetailLoadRequested extends StoresEvent {
  final String shopId;

  const StoreDetailLoadRequested({required this.shopId});

  @override
  List<Object?> get props => [shopId];
}
