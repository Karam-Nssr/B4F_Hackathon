import 'package:equatable/equatable.dart';

enum PaymentTiming { now, onReceipt }

class PaymentOption extends Equatable {
  final String id;
  final String label;
  final String description;
  final PaymentTiming timing;

  const PaymentOption({
    required this.id,
    required this.label,
    required this.description,
    required this.timing,
  });

  @override
  List<Object?> get props => [id, label, description, timing];
}

class PaymentOptions {
  PaymentOptions._();

  static const defaultOption = PaymentOption(
    id: 'shamcash',
    label: 'شام كاش',
    description: 'محفظة إلكترونية — يُخصم المبلغ فوراً',
    timing: PaymentTiming.now,
  );

  static const payNow = [
    defaultOption,
    PaymentOption(
      id: 'al_haram',
      label: 'الهرم للحوالات المالية',
      description: 'تحويل فوري عبر شبكة الهرم',
      timing: PaymentTiming.now,
    ),
    PaymentOption(
      id: 'al_kadmous',
      label: 'القدموس للحوالات المالية',
      description: 'تحويل فوري عبر شبكة القدموس',
      timing: PaymentTiming.now,
    ),
  ];

  static const onReceipt = [
    PaymentOption(
      id: 'haram_transfer',
      label: 'الهرم للحوالات المالية',
      description: 'تدفع للهرم عند استلام الطلب',
      timing: PaymentTiming.onReceipt,
    ),
    PaymentOption(
      id: 'kadmous_transfer',
      label: 'القدموس للحوالات المالية',
      description: 'تدفع للقدموس عند استلام الطلب',
      timing: PaymentTiming.onReceipt,
    ),
  ];

  static const all = [...payNow, ...onReceipt];

  static PaymentOption byId(String id) =>
      all.firstWhere((option) => option.id == id, orElse: () => payNow.first);
}
