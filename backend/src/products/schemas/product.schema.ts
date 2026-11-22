import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Shop } from '../../shops/schemas/shop.schema.js';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Shop.name, required: true })
  shopId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 160 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 4000 })
  description!: string;

  @Prop({ required: true, trim: true, maxlength: 80 })
  category!: string;

  @Prop({ required: true, min: 0.01 })
  priceSyp!: number;

  @Prop({ required: true, trim: true })
  imageUrl!: string;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
