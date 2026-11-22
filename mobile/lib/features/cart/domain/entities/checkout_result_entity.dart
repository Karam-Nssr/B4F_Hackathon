import 'package:equatable/equatable.dart';

/// Confirmation returned by `POST /api/orders` (SAD FR-05: the backend
/// splits the cart into one sub-order per shop).
class CheckoutResultEntity extends Equatable {
  final String orderId;
  final num totalAmountSyp;

  /// How many shops the order was split into.
  final int shopsCount;

  const CheckoutResultEntity({
    required this.orderId,
    required this.totalAmountSyp,
    required this.shopsCount,
  });

  @override
  List<Object?> get props => [orderId, totalAmountSyp, shopsCount];
}
