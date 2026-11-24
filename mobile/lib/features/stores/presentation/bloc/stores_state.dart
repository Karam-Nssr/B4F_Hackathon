import 'package:equatable/equatable.dart';

import '../../../home/domain/entities/shop_entity.dart';
import '../../domain/entities/shop_detail_entity.dart';

abstract class StoresState extends Equatable {
  const StoresState();

  @override
  List<Object?> get props => [];
}

class StoresInitial extends StoresState {}

class StoresLoading extends StoresState {}

class StoresLoaded extends StoresState {
  final List<ShopEntity> shops;

  const StoresLoaded(this.shops);

  @override
  List<Object?> get props => [shops];
}

class StoresFailure extends StoresState {
  final String message;

  const StoresFailure(this.message);

  @override
  List<Object?> get props => [message];
}

class StoreDetailLoading extends StoresState {}

class StoreDetailLoaded extends StoresState {
  final ShopDetailEntity shop;

  const StoreDetailLoaded(this.shop);

  @override
  List<Object?> get props => [shop];
}

class StoreDetailFailure extends StoresState {
  final String message;

  const StoreDetailFailure(this.message);

  @override
  List<Object?> get props => [message];
}
