import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/User';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true }
});

export const User = mongoose.model<IUser>('User', userSchema);
