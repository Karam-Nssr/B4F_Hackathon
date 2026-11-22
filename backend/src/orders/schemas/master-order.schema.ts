import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema.js';

export type MasterOrderDocument = HydratedDocument<MasterOrder>;

@Schema({ collection: 'master_orders', timestamps: true })
export class MasterOrder {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, min: 0.01 })
  totalAmountSyp!: number;

  @Prop({ required: true, trim: true })
  customerPhone!: string;

  @Prop({ required: true, trim: true })
  customerNationalId!: string;
}

export const MasterOrderSchema = SchemaFactory.createForClass(MasterOrder);
