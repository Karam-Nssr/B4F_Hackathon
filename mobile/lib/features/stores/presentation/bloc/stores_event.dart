import 'package:equatable/equatable.dart';

abstract class StoresEvent extends Equatable {
  const StoresEvent();

  @override
  List<Object?> get props => [];
}

class StoresLoadRequested extends StoresEvent {}

class StoreDetailLoadRequested extends StoresEvent {
  final String shopId;

  const StoreDetailLoadRequested({required this.shopId});

  @override
  List<Object?> get props => [shopId];
}
