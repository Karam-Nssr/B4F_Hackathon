import 'package:equatable/equatable.dart';

abstract class OrdersEvent extends Equatable {
  const OrdersEvent();

  @override
  List<Object?> get props => [];
}

/// Initial load / pull-to-refresh / retry.
class OrdersLoadRequested extends OrdersEvent {}
