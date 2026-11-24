import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecase/usecase.dart';
import '../../domain/usecases/cancel_order_usecase.dart';
import '../../domain/usecases/cancel_sub_order_usecase.dart';
import '../../domain/usecases/get_my_orders_usecase.dart';
import '../../domain/usecases/get_order_details_usecase.dart';
import 'orders_event.dart';
import 'orders_state.dart';

class OrdersBloc extends Bloc<OrdersEvent, OrdersState> {
  final GetMyOrdersUseCase getMyOrdersUseCase;
  final GetOrderDetailsUseCase getOrderDetailsUseCase;
  final CancelSubOrderUseCase cancelSubOrderUseCase;
  final CancelOrderUseCase cancelOrderUseCase;

  OrdersBloc({
    required this.getMyOrdersUseCase,
    required this.getOrderDetailsUseCase,
    required this.cancelSubOrderUseCase,
    required this.cancelOrderUseCase,
  }) : super(OrdersInitial()) {
    on<OrdersLoadRequested>(_onLoad);
    on<OrderDetailsLoadRequested>(_onLoadDetails);
    on<SubOrderCancelRequested>(_onCancelSubOrder);
    on<OrderCancelRequested>(_onCancelOrder);
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

  Future<void> _onLoadDetails(
    OrderDetailsLoadRequested event,
    Emitter<OrdersState> emit,
  ) async {
    emit(OrderDetailsLoading());
    final result = await getOrderDetailsUseCase(
      OrderIdParams(orderId: event.orderId),
    );
    result.fold(
      (failure) => emit(OrderDetailsFailure(failure.message)),
      (order) => emit(OrderDetailsLoaded(order)),
    );
  }

  Future<void> _onCancelSubOrder(
    SubOrderCancelRequested event,
    Emitter<OrdersState> emit,
  ) async {
    final current = state;
    if (current is! OrderDetailsLoaded || current.isCancelling) return;

    emit(current.copyWith(isCancelling: true, clearMessage: true));
    final result = await cancelSubOrderUseCase(
      OrderIdParams(orderId: event.subOrderId),
    );
    result.fold(
      (failure) => emit(
        current.copyWith(
          isCancelling: false,
          message: failure.message,
          messageIsError: true,
        ),
      ),
      (order) => emit(
        OrderDetailsLoaded(
          order,
          message: 'تم إلغاء طلب المتجر',
          messageIsError: false,
        ),
      ),
    );
  }

  Future<void> _onCancelOrder(
    OrderCancelRequested event,
    Emitter<OrdersState> emit,
  ) async {
    final current = state;
    if (current is! OrderDetailsLoaded || current.isCancelling) return;

    emit(current.copyWith(isCancelling: true, clearMessage: true));
    final result = await cancelOrderUseCase(
      OrderIdParams(orderId: event.orderId),
    );
    result.fold(
      (failure) => emit(
        current.copyWith(
          isCancelling: false,
          message: failure.message,
          messageIsError: true,
        ),
      ),
      (order) => emit(
        OrderDetailsLoaded(
          order,
          message: 'تم إلغاء الطلب بالكامل',
          messageIsError: false,
        ),
      ),
    );
  }
}
