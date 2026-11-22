import { IsIn } from 'class-validator';
import {
  ORDER_STATUSES,
  type OrderStatus,
} from '../schemas/shop-sub-order.schema.js';

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  status!: OrderStatus;
}
