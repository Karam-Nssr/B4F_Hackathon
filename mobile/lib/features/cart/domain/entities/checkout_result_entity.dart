import 'package:equatable/equatable.dart';

class CheckoutResultEntity extends Equatable {
  final String orderId;
  final num totalAmountSyp;

  final int shopsCount;

  const CheckoutResultEntity({
    required this.orderId,
    required this.totalAmountSyp,
    required this.shopsCount,
  });

  @override
  List<Object?> get props => [orderId, totalAmountSyp, shopsCount];
}
