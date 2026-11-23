import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecase/usecase.dart';
import '../../domain/usecases/get_my_orders_usecase.dart';
import 'orders_event.dart';
import 'orders_state.dart';

class OrdersBloc extends Bloc<OrdersEvent, OrdersState> {
  final GetMyOrdersUseCase getMyOrdersUseCase;

  OrdersBloc({required this.getMyOrdersUseCase}) : super(OrdersInitial()) {
    on<OrdersLoadRequested>(_onLoad);
  }

  Future<void> _onLoad(
    OrdersLoadRequested event,
    Emitter<OrdersState> emit,
  ) async {
    emit(OrdersLoading());
    final result = await getMyOrdersUseCase(const NoParams());
    result.fold(
      (failure) => emit(OrdersFailure(failure.message)),
      (orders) => emit(OrdersLoaded(orders)),
    );
  }
}
