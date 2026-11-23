import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema.js';

export type ShopDocument = HydratedDocument<Shop>;

@Schema({ collection: 'shops', timestamps: true })
export class Shop {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  shopName!: string;

  @Prop({ required: true, trim: true, maxlength: 80 })
  category!: string;

  @Prop({ trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ trim: true, maxlength: 2048 })
  imageUrl?: string;

  @Prop({ trim: true, maxlength: 160 })
  imageCredit?: string;

  @Prop({ trim: true, maxlength: 2048 })
  imageCreditUrl?: string;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
