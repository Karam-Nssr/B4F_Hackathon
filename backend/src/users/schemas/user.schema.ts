import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const USER_ROLES = ['user', 'shop', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, trim: true, maxlength: 120 })
  fullName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ type: String, required: true, enum: USER_ROLES, default: 'user' })
  role!: UserRole;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  nationalId?: string;

  /** Where the profile photo lives on the avatars disk (see `src/storage/storage.config.ts`). */
  @Prop({ trim: true })
  photoKey?: string;

  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
