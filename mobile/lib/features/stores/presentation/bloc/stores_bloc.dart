import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecase/usecase.dart';
import '../../domain/usecases/get_shop_detail_usecase.dart';
import '../../domain/usecases/get_stores_usecase.dart';
import 'stores_event.dart';
import 'stores_state.dart';

class StoresBloc extends Bloc<StoresEvent, StoresState> {
  final GetStoresUseCase getStoresUseCase;
  final GetShopDetailUseCase getShopDetailUseCase;

  StoresBloc({
    required this.getStoresUseCase,
    required this.getShopDetailUseCase,
  }) : super(StoresInitial()) {
    on<StoresLoadRequested>(_onLoad);
    on<StoreDetailLoadRequested>(_onDetail);
  }

  Future<void> _onLoad(
    StoresLoadRequested event,
    Emitter<StoresState> emit,
  ) async {
    emit(StoresLoading());
    final result = await getStoresUseCase(const NoParams());
    result.fold(
      (failure) => emit(StoresFailure(failure.message)),
      (shops) => emit(StoresLoaded(shops)),
    );
  }

  Future<void> _onDetail(
    StoreDetailLoadRequested event,
    Emitter<StoresState> emit,
  ) async {
    emit(StoreDetailLoading());
    final result = await getShopDetailUseCase(
      ShopDetailParams(shopId: event.shopId),
    );
    result.fold(
      (failure) => emit(StoreDetailFailure(failure.message)),
      (shop) => emit(StoreDetailLoaded(shop)),
    );
  }
}
