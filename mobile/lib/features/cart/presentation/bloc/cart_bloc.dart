import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecase/usecase.dart';
import '../../domain/entities/cart_item_entity.dart';
import '../../domain/usecases/checkout_usecase.dart';
import '../../domain/usecases/get_cart_usecase.dart';
import '../../domain/usecases/save_cart_usecase.dart';
import 'cart_event.dart';
import 'cart_state.dart';

/// App-level cart (provided once in main.dart): every screen reads the
/// same instance, so the badge, the grids and the cart page stay in sync.
class CartBloc extends Bloc<CartEvent, CartState> {
  final GetCartUseCase getCartUseCase;
  final SaveCartUseCase saveCartUseCase;
  final CheckoutUseCase checkoutUseCase;

  CartBloc({
    required this.getCartUseCase,
    required this.saveCartUseCase,
    required this.checkoutUseCase,
  }) : super(const CartState(isLoading: true)) {
    on<CartLoadRequested>(_onLoad);
    on<CartItemAdded>(_onAdd);
    on<CartItemRemoved>(_onRemove);
    on<CartQuantityChanged>(_onQuantity);
    on<CartCheckoutRequested>(_onCheckout);
    on<CartOrderAcknowledged>(_onAcknowledge);
  }

  Future<void> _onLoad(
    CartLoadRequested event,
    Emitter<CartState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearMessage: true));
    final result = await getCartUseCase(const NoParams());
    result.fold(
      (failure) => emit(CartState(message: failure.message)),
      (items) => emit(CartState(items: items)),
    );
  }

  Future<void> _onAdd(
    CartItemAdded event,
    Emitter<CartState> emit,
  ) async {
    final product = event.product;
    final alreadyInCart = state.items.any((item) => item.productId == product.id);

    final updated = alreadyInCart
        ? [
            for (final item in state.items)
              item.productId == product.id
                  ? item.copyWith(quantity: item.quantity + 1)
                  : item,
          ]
        : [...state.items, CartItemEntity.fromProduct(product)];

    await _persist(emit, updated);
  }

  Future<void> _onRemove(
    CartItemRemoved event,
    Emitter<CartState> emit,
  ) async {
    final updated = [
      for (final item in state.items)
        if (item.productId != event.productId) item,
    ];
    await _persist(emit, updated);
  }

  Future<void> _onQuantity(
    CartQuantityChanged event,
    Emitter<CartState> emit,
  ) async {
    if (event.quantity <= 0) {
      await _onRemove(
        CartItemRemoved(productId: event.productId),
        emit,
      );
      return;
    }

    final updated = [
      for (final item in state.items)
        item.productId == event.productId
            ? item.copyWith(quantity: event.quantity)
            : item,
    ];
    await _persist(emit, updated);
  }

  /// Optimistic update: the UI changes immediately, then the cart is
  /// written to Hive (a failure only surfaces as a message).
  Future<void> _persist(
    Emitter<CartState> emit,
    List<CartItemEntity> items,
  ) async {
    emit(state.copyWith(
      items: items,
      clearMessage: true,
      clearOrder: true,
    ));
    final result = await saveCartUseCase(SaveCartParams(items: items));
    result.fold(
      (failure) => emit(state.copyWith(message: failure.message)),
      (_) {},
    );
  }

  Future<void> _onCheckout(
    CartCheckoutRequested event,
    Emitter<CartState> emit,
  ) async {
    if (state.items.isEmpty || state.isSubmitting) return;

    emit(state.copyWith(isSubmitting: true, clearMessage: true));

    final result = await checkoutUseCase(CheckoutParams(items: state.items));
    await result.fold(
      (failure) async =>
          emit(state.copyWith(isSubmitting: false, message: failure.message)),
      (order) async {
        // The order is placed — empty the local cart.
        await saveCartUseCase(const SaveCartParams(items: []));
        emit(CartState(lastOrder: order));
      },
    );
  }

  Future<void> _onAcknowledge(
    CartOrderAcknowledged event,
    Emitter<CartState> emit,
  ) async {
    emit(state.copyWith(clearOrder: true, clearMessage: true));
  }
}
