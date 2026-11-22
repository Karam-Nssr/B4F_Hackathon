import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { MasterOrder } from './master-order.schema.js';
import { Shop } from '../../shops/schemas/shop.schema.js';

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ShopSubOrderDocument = HydratedDocument<ShopSubOrder>;

@Schema({ _id: false })
export class ShopOrderItem {
  @Prop({ required: true, trim: true })
  productTitle!: string;

  @Prop({ required: true, min: 0.01 })
  unitPriceSyp!: number;

  @Prop({ required: true, min: 1, validate: Number.isInteger })
  quantity!: number;
}

export const ShopOrderItemSchema = SchemaFactory.createForClass(ShopOrderItem);

@Schema({ collection: 'shop_sub_orders', timestamps: true })
export class ShopSubOrder {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MasterOrder.name,
    required: true,
  })
  masterOrderId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Shop.name, required: true })
  shopId!: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  invoiceNumber!: string;

  @Prop({ type: [ShopOrderItemSchema], required: true })
  items!: ShopOrderItem[];

  @Prop({ required: true, min: 0.01 })
  subtotalSyp!: number;

  @Prop({ required: true, trim: true })
  customerName!: string;

  @Prop({ required: true, trim: true })
  customerPhone!: string;

  @Prop({ required: true, trim: true })
  customerNationalId!: string;

  @Prop({
    type: String,
    required: true,
    enum: ORDER_STATUSES,
    default: 'PENDING',
  })
  status!: OrderStatus;

  @Prop({ required: true, default: 24, min: 1, max: 24 })
  confirmationWindowHours!: number;

  createdAt!: Date;
}

export const ShopSubOrderSchema = SchemaFactory.createForClass(ShopSubOrder);
